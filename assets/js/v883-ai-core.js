'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.NOOR_AI_CORE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const STOP=new Set('في من على الى إلى عن ما ماذا هل هو هي هذا هذه ذلك التي الذي الذين مع عند بعد قبل ثم او أو و يا لو اذا إذا انا أنا انت أنت نحن لكم لك لي لنا كل اي أي كيف متى اين أين لماذا فقط جدا جداً قد تم يكون تكون كان كانت حكم سؤال اريد أريد يجوز يمكن ممكن كم مرة مرات شيء شي شيئا شيئًا اقول أقول افعل أفعل اعرف أعرف يعني شرح اشرح الدليل سبب بسبب'.split(/\s+/).map(norm));
  const WEAK=new Set('عدد اعداد أعداد مره مرة مرات شيء شي شيئا شيئًا موضوع طريقه طريقة'.split(/\s+/).map(norm));
  const SUBJECTS={creed:{label:'العقيدة',route:'creed'},fiqh:{label:'الفقه',route:'fiqh'},seerah:{label:'السيرة',route:'seerah'},hadith:{label:'الحديث',route:'hadith'}};
  function norm(v){return String(v??'').toLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ة/g,'ه').replace(/[^\u0600-\u06ff0-9a-z\s]/gi,' ').replace(/\s+/g,' ').trim()}
  function tokens(v){return norm(v).split(' ').filter(x=>x.length>1&&!STOP.has(x))}
  function searchToken(v){
    let t=norm(v);
    if(t.length>5&&/^[وف]ال/.test(t))t=t.slice(1);
    if(t.length>5&&/^[بك]ال/.test(t))t=t.slice(1);
    if(t.length>4&&t.startsWith('ال'))t=t.slice(2);
    return t;
  }
  function matchTokens(v){return [...new Set(tokens(v).map(searchToken).filter(x=>x.length>1&&!STOP.has(x)))]}
  function keywordArray(v){if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean);return String(v||'').split(/[،,\n]/).map(x=>x.trim()).filter(Boolean)}
  function canonicalEntries(rows=[]){return rows.filter(x=>x&&x.active!==false&&x.answer&&String(x.source_text||x.source||'').trim()&&x.review_status==='published'&&String(x.reviewed_at||'').trim()&&String(x.reviewed_by||'').trim()&&['primary','verified','curated'].includes(String(x.trust_tier||''))).map((x,i)=>({
    id:x.knowledge_key||x.canonicalId||x.id||`local-${i}`,knowledge_key:x.knowledge_key||x.canonicalId||'',category:x.category||'عام',title:x.title||x.question||'',answer:x.answer||'',source_text:x.source_text||x.source||'',source_type:x.source_type||'other',source_label:x.source_label||'',trust_tier:x.trust_tier||'curated',review_status:x.review_status,reviewed_at:x.reviewed_at,reviewed_by:x.reviewed_by||null,keywords:keywordArray(x.keywords),aliases:Array.isArray(x.aliases)?x.aliases:[],priority:Number(x.priority)||500,route:x.route||'',origin:'local',active:true
  }))}
  function cloudEntries(rows=[]){return rows.filter(x=>x&&x.active!==false&&x.answer&&String(x.source_text||'').trim()&&x.review_status==='published'&&['primary','verified'].includes(String(x.trust_tier||''))&&String(x.reviewed_at||'').trim()).map((x,i)=>({
    id:x.id||x.knowledge_key||`cloud-${i}`,knowledge_key:x.knowledge_key||'',category:x.category||'عام',title:x.title||x.question||'',answer:x.answer||'',source_text:x.source_text||'',source_type:x.source_type||'owner',source_label:x.source_label||'',trust_tier:x.trust_tier,review_status:x.review_status,reviewed_at:x.reviewed_at,reviewed_by:x.reviewed_by||null,keywords:keywordArray(x.keywords),aliases:[],priority:(Number(x.priority)||100)+(x.trust_tier==='primary'?120:0),route:x.route||'',origin:'cloud',active:true
  }))}
  function academyEntries(lessons={}){const out=[];for(const [subject,rows] of Object.entries(lessons||{})){const meta=SUBJECTS[subject];if(!meta||!Array.isArray(rows))continue;for(const row of rows){if(!row?.title||!row?.summary||row.active===false||row.review_status!=='published'||!String(row.reference_text||'').trim()||!String(row.reviewed_at||'').trim()||!String(row.reviewed_by||'').trim())continue;const rowKey=row.id||row.sort_order||out.length;out.push({id:`academy:${subject}:${rowKey}`,knowledge_key:`academy:${subject}:${rowKey}`,category:meta.label,title:row.title,answer:row.summary,source_text:row.reference_text,source_type:'academy',source_label:row.source_label||'أكاديمية نور الذكر',trust_tier:'verified',review_status:row.review_status,reviewed_at:row.reviewed_at,reviewed_by:row.reviewed_by,keywords:[row.title,row.summary],aliases:[],priority:260,route:meta.route,origin:'academy',active:true})}}return out}
  function fallbackEntries(rows=[]){return rows.filter(x=>x&&x.answer&&String(x.source_text||x.source||'').trim()).map((x,i)=>({...x,id:x.id||`fallback-${i}`,source_text:x.source_text||x.source||'',keywords:keywordArray(x.keywords),aliases:Array.isArray(x.aliases)?x.aliases:[],priority:Number(x.priority)||20,origin:'fallback',active:true}))}
  function buildEntries({cloud=[],canonical=[],lessons={},fallback=[]}={}){return [...cloudEntries(cloud),...canonicalEntries(canonical),...academyEntries(lessons),...fallbackEntries(fallback)]}
  function phraseScore(haystack,needle,exact=16,contains=8){if(!needle)return 0;if(haystack===needle)return exact;if(haystack.includes(needle)||needle.includes(haystack))return contains;return 0}
  function tokenOverlap(a,b){if(!a.length||!b.length)return 0;const bs=new Set(b);let n=0;for(const t of a)if(bs.has(t))n++;return n}
  function editDistance(a,b,limit=3){
    a=norm(a);b=norm(b);if(a===b)return 0;if(!a||!b)return Math.max(a.length,b.length);if(Math.abs(a.length-b.length)>limit)return limit+1;
    let prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      const row=[i];let best=row[0];
      for(let j=1;j<=b.length;j++){const cost=a[i-1]===b[j-1]?0:1;row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+cost);best=Math.min(best,row[j])}
      if(best>limit)return limit+1;prev=row;
    }
    return prev[b.length];
  }
  function fuzzySimilarity(a,b){
    a=norm(a);b=norm(b);if(!a||!b)return 0;if(a===b)return 1;
    const longest=Math.max(a.length,b.length);if(longest<3)return 0;
    const distance=editDistance(a,b,Math.min(3,Math.ceil(longest*.34)));
    return distance>3?0:Math.max(0,1-distance/longest);
  }
  function fuzzyTokenOverlap(a,b){
    if(!a.length||!b.length)return 0;let total=0;
    for(const left of a){let best=0;for(const right of b)best=Math.max(best,fuzzySimilarity(left,right));if(best>=.66)total+=best}
    return total;
  }
  function matchQuality(entry,question){
    const nq=norm(question),title=norm(entry?.title),qTokens=matchTokens(question),titleTokens=matchTokens(entry?.title);
    const phrases=[...(entry?.keywords||[]),...(entry?.aliases||[])].map(norm).filter(Boolean);
    const candidateTokens=matchTokens(`${entry?.title||''} ${phrases.join(' ')}`);
    const exactTitle=!!nq&&title===nq;
    const exactKeyword=phrases.some(p=>p===nq);
    const phraseMatch=qTokens.length>=2&&phrases.concat(title).some(p=>matchTokens(p).length>=2&&p.length>=4&&(p.includes(nq)||nq.includes(p)));
    let matched=0;
    for(const qt of qTokens){
      let best=0;
      for(const ct of candidateTokens){
        if(qt===ct){best=1;break}
        best=Math.max(best,fuzzySimilarity(qt,ct));
      }
      if(best>=.72)matched++;
    }
    const coverage=qTokens.length?matched/qTokens.length:0;
    const singleTitle=qTokens.length===1&&titleTokens.length===1&&qTokens[0]===titleTokens[0];
    const singleKeyword=qTokens.length===1&&phrases.some(p=>matchTokens(p).length===1&&matchTokens(p)[0]===qTokens[0]);
    const strong=exactTitle||exactKeyword||phraseMatch||singleTitle||singleKeyword||(matched>=2&&coverage>=.84);
    const ok=qTokens.length===1?(singleTitle||singleKeyword||exactTitle||exactKeyword):(qTokens.length>=2&&(strong||(matched>=2&&coverage>=.67)));
    return {ok,strong,coverage:+coverage.toFixed(3),matched,total:qTokens.length,exactTitle,exactKeyword,phraseMatch};
  }
  function score(entry,question,ctx={}){
    const nq=norm(question),qt=tokens(question),title=norm(entry.title),ans=norm(entry.answer),cat=norm(entry.category),route=norm(entry.route),ctxText=norm(`${ctx.page||''} ${ctx.title||''}`);
    let s=phraseScore(title,nq,24,11);
    for(const alias of entry.aliases||[]){const na=norm(alias);s=Math.max(s,phraseScore(na,nq,23,12));const ov=tokenOverlap(qt,tokens(alias));s=Math.max(s,ov*3.2+(ov>=2?2:0))}
    for(const k0 of entry.keywords||[]){const k=norm(k0);if(!k)continue;const kt=tokens(k),single=kt.length===1,weak=single&&WEAK.has(kt[0]);if(single){if(qt.includes(kt[0]))s+=weak?0.5:3.2}else if(nq.includes(k)||k.includes(nq))s+=7;const ov=tokenOverlap(qt,kt);s+=ov*(weak?0.35:(single?1.25:2.4))}
    const titleTokens=tokens(title),titleOverlap=tokenOverlap(qt,titleTokens);s+=titleOverlap*3.4;if(titleOverlap>=2)s+=2;
    if(!titleOverlap){const fuzzyTitle=fuzzyTokenOverlap(qt,titleTokens);s+=fuzzyTitle*2.4;if(fuzzyTitle>=1.35)s+=1.2}
    const ansOverlap=tokenOverlap(qt,tokens(ans));s+=Math.min(ansOverlap,4)*0.55;
    if(cat&&(ctxText.includes(cat)||cat.includes(ctxText)))s+=1.6;
    if(route&&ctxText.includes(route))s+=1.8;
    if(s>0){s+=Math.min(Math.max(Number(entry.priority)||0,0),1000)/1000;if(entry.origin==='cloud')s+=1.8;else if(entry.origin==='local')s+=.7;else if(entry.origin==='academy')s+=.35}
    return s;
  }
  function sameTopic(a,b){const ak=String(a.knowledge_key||''),bk=String(b.knowledge_key||'');if(ak&&bk&&ak===bk)return true;const at=norm(a.title),bt=norm(b.title);return !!at&&at===bt}
  function answer(question,ctx={},entries=[],options={}){
    const q=String(question||'').trim();if(!q)return {found:false,answer:'',source:'',title:'',category:'',origin:'none',confidence:0,related:[]};
    const threshold=Number.isFinite(options.threshold)?options.threshold:6.2;
    const scored=entries.map(row=>({row,score:score(row,q,ctx),quality:matchQuality(row,q)})).sort((a,b)=>b.score-a.score);
    const qualified=scored.filter(x=>x.quality.ok&&x.score>=threshold);
    const top=qualified[0],second=qualified[1];
    const ambiguous=!!(top&&!top.quality.strong&&second&&!sameTopic(top.row,second.row)&&(top.score-second.score)<1.5);
    if(!top||ambiguous){const related=scored.filter(x=>x.quality.ok&&x.score>=Math.max(2.5,threshold*.55)).slice(0,3).map(x=>String(x.row.title||'').trim()).filter(Boolean);return {found:false,answer:'',source:'',title:'',category:'',origin:'none',confidence:top?.score||scored[0]?.score||0,related,ambiguous};}
    // If a local result wins, allow a sufficiently matching cloud override for the same topic/title.
    let best=top;
    if(best.row.origin!=='cloud'){
      const cloud=qualified.find(x=>x.row.origin==='cloud'&&sameTopic(x.row,best.row));
      if(cloud)best=cloud;
    }
    const bestCat=norm(best.row.category),relatedMin=Math.max(threshold+1,best.score*.35);const related=qualified.filter(x=>x.row!==best.row&&norm(x.row.category)===bestCat&&x.score>=relatedMin&&!sameTopic(x.row,best.row)).slice(0,3).map(x=>x.row.title).filter(Boolean);
    return {found:true,answer:String(best.row.answer||'').trim(),source:String(best.row.source_text||'').trim(),title:String(best.row.title||'').trim(),category:String(best.row.category||'').trim(),origin:best.row.origin||'unknown',confidence:+best.score.toFixed(2),related};
  }
  return {norm,tokens,matchTokens,matchQuality,buildEntries,canonicalEntries,cloudEntries,academyEntries,score,answer,editDistance,fuzzySimilarity,fuzzyTokenOverlap};
});
