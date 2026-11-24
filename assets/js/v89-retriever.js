'use strict';
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.NOOR_V89_RETRIEVER_FACTORY=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const NO_ANSWER='لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.';
 function src(e){return String(e.source_text||e.source||'').trim()}
 function reviewed(e){
  if(!e||e.trust_tier==='review'||!src(e))return false;
  if(e.origin==='fallback')return true;
  const trustedTier=e.origin==='local'
   ?['primary','verified','curated'].includes(String(e.trust_tier||''))
   :['primary','verified'].includes(String(e.trust_tier||''));
  return trustedTier&&e.review_status==='published'&&!!String(e.reviewed_at||'').trim()&&(!['academy','local'].includes(e.origin)||!!String(e.reviewed_by||'').trim());
 }
 function uniqHits(rows){const seen=new Set(),out=[];for(const r of rows){const k=`${r.title}|${r.source}`;if(!r.answer||!r.source||seen.has(k))continue;seen.add(k);out.push(r)}return out}
 function create({core,loadEntries,fetcher}={}){
  if(!core?.score||!loadEntries)throw new Error('RETRIEVER_DEPENDENCIES_REQUIRED');
  async function ask(question,ctx={}){
   const q=String(question||'').trim();if(!q)return {found:false,hits:[],answer:'',source:'',confidence:0};
   const entries=await loadEntries();
   const scored=(entries||[]).filter(reviewed).map(e=>({e,s:Number(core.score(e,q,ctx))||0,quality:core.matchQuality?core.matchQuality(e,q):{ok:true,strong:true,coverage:1}})).sort((a,b)=>b.s-a.s);
   const qualified=scored.filter(x=>x.quality.ok&&x.s>=6.2);
   const first=qualified[0],second=qualified[1];
   const sameTopic=first&&second&&((first.e.knowledge_key&&first.e.knowledge_key===second.e.knowledge_key)||(core.norm?.(first.e.title)===core.norm?.(second.e.title)));
   const ambiguous=!!(first&&!first.quality.strong&&second&&!sameTopic&&(first.s-second.s)<1.5);
   const related=scored.filter(x=>x.quality.ok&&x.s>=3.5).slice(0,3).map(x=>String(x.e.title||'').trim()).filter(Boolean);
   if(!first||ambiguous)return {found:false,hits:[],answer:NO_ANSWER,source:'',confidence:first?.s||scored[0]?.s||0,related,ambiguous};
   const ranked=qualified.slice(0,5).map(({e,s,quality})=>({title:e.title||e.category||'',answer:String(e.answer||'').trim(),source:src(e),category:e.category||'',origin:e.origin||'retrieval',confidence:+s.toFixed(2),trust_tier:e.trust_tier||'',source_type:e.source_type||'',source_label:e.source_label||'',review_status:e.review_status||'',reviewed_at:e.reviewed_at||'',reviewed_by:e.reviewed_by||null,priority:Number(e.priority)||0,knowledge_key:e.knowledge_key||'',keywords:e.keywords||[],matchCoverage:quality.coverage,strongMatch:!!quality.strong}));
   const hits=uniqHits(ranked).sort((a,b)=>(b.confidence||0)-(a.confidence||0)).slice(0,5);
   const top=hits[0];if(!top)return {found:false,hits:[],answer:NO_ANSWER,source:'',confidence:0,related};
   return {found:true,hits,answer:top.answer,source:top.source,title:top.title,category:top.category,origin:top.origin,confidence:top.confidence,related:hits.slice(1,4).map(x=>x.title).filter(Boolean)};
  }
  return {ask};
 }
 return {create,NO_ANSWER,reviewed};
});
