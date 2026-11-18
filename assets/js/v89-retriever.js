'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NOOR_V89_RETRIEVER_FACTORY=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const QURAN_API='https://api.alquran.cloud/v1';
 const NO_ANSWER='لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.';
 const BAD_TERMS=new Set('حكم كيف ماذا ما هل اريد أريد عن من في الى إلى على هذا هذه ذلك الذي التي شيء'.split(/\s+/));
 function src(e){return String(e.source_text||e.source||'').trim()}
 function cleanToken(t){return String(t||'').replace(/[^\u0600-\u06ff0-9a-z]/gi,'').trim()}
 function bestTerm(core,q){return (core.tokens?.(q)||[]).map(cleanToken).filter(x=>x.length>=3&&!BAD_TERMS.has(x)).sort((a,b)=>b.length-a.length)[0]||''}
 function uniqHits(rows){const seen=new Set(),out=[];for(const r of rows){const k=`${r.title}|${r.source}`;if(!r.answer||!r.source||seen.has(k))continue;seen.add(k);out.push(r)}return out}
 async function quranHits(core,q,fetcher,timeoutMs=4500){
  if(!fetcher)return[];const term=bestTerm(core,q);if(!term)return[];
  try{
   const ac=typeof AbortController!=='undefined'?new AbortController():null;let timer=null;if(ac)timer=setTimeout(()=>ac.abort(),timeoutMs);
   const res=await fetcher(`${QURAN_API}/search/${encodeURIComponent(term)}/all/ar`,ac?{signal:ac.signal}:{ });if(timer)clearTimeout(timer);if(!res?.ok)return[];const json=await res.json();const matches=Array.isArray(json?.data?.matches)?json.data.matches:[];
   const qt=new Set(core.tokens?.(q)||[]);return matches.map(m=>{const toks=core.tokens?.(m.text)||[];let overlap=0;for(const t of toks)if(qt.has(t))overlap++;return {title:`سورة ${m.surah?.name||m.surah?.englishName||m.surah?.number||''} — الآية ${m.numberInSurah||''}`,answer:String(m.text||'').trim(),source:`القرآن الكريم — سورة ${String(m.surah?.name||'').replace(/^سُورَةُ\s*/,'').trim()||m.surah?.number||''}، الآية ${m.numberInSurah||''}`,category:'القرآن',origin:'quran',trust_tier:'primary',source_type:'quran',priority:1000,confidence:8+overlap,score:8+overlap}}).filter(x=>x.answer).sort((a,b)=>b.score-a.score).slice(0,2)
  }catch(e){return[]}
 }
 function create({core,loadEntries,fetcher}={}){
  if(!core?.score||!loadEntries)throw new Error('RETRIEVER_DEPENDENCIES_REQUIRED');
  async function ask(question,ctx={}){
   const q=String(question||'').trim();if(!q)return {found:false,hits:[],answer:'',source:'',confidence:0};
   const entries=await loadEntries();
   const scored=(entries||[]).map(e=>({e,s:Number(core.score(e,q,ctx))||0})).filter(x=>src(x.e)).sort((a,b)=>b.s-a.s);
   const related=scored.filter(x=>x.s>0).slice(0,3).map(x=>String(x.e.title||'').trim()).filter(Boolean);
   const ranked=scored.filter(x=>x.s>=4.2).slice(0,5).map(({e,s})=>({title:e.title||e.category||'',answer:String(e.answer||'').trim(),source:src(e),category:e.category||'',origin:e.origin||'retrieval',confidence:+s.toFixed(2),trust_tier:e.trust_tier||'',source_type:e.source_type||'',source_label:e.source_label||'',priority:Number(e.priority)||0}));
   const qhits=await quranHits(core,q,fetcher||((typeof fetch==='function')?fetch:null));
   const hits=uniqHits([...ranked,...qhits]).sort((a,b)=>(b.confidence||0)-(a.confidence||0)).slice(0,5);
   const top=hits[0];if(!top)return {found:false,hits:[],answer:NO_ANSWER,source:'',confidence:0,related};
   return {found:true,hits,answer:top.answer,source:top.source,title:top.title,category:top.category,origin:top.origin,confidence:top.confidence,related:hits.slice(1,4).map(x=>x.title).filter(Boolean)};
  }
  return {ask};
 }
 return {create,quranHits,bestTerm,NO_ANSWER};
});
