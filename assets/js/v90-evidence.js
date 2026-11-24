'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V90_EVIDENCE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const TRUST={primary:40,verified:25,curated:18,academy:12,review:-100};
  const TYPE={quran:18,sunnah:16,hadith:15,scholar:10,book:8,owner:7,academy:5,other:0};
  function inferTrust(h){return h.trust_tier||((h.origin==='academy')?'academy':(h.origin==='canonical'?'curated':'verified'))}
  function inferType(h){
    if(h.source_type)return h.source_type;
    const s=`${h.category||''} ${h.source||''}`;
    if(/القرآن|سورة|آية/.test(s))return 'quran';
    if(/السنة|البخاري|مسلم|حديث/.test(s))return 'sunnah';
    if(h.origin==='academy')return 'academy';
    return 'other';
  }
  function reviewedEvidence(h){
    if(!h)return false;
    if(h.origin==='fallback')return true;
    const trustedTier=h.origin==='local'
      ?['primary','verified','curated'].includes(String(h.trust_tier||''))
      :['primary','verified'].includes(String(h.trust_tier||''));
    const reviewed=trustedTier
      && h.review_status==='published'
      && !!String(h.reviewed_at||'').trim();
    return reviewed&&(!['academy','local'].includes(h.origin)||!!String(h.reviewed_by||'').trim());
  }
  function rankEvidence(hits,settings={}){
    const maxEvidence=Math.max(1,Math.min(Number(settings.maxEvidence)||5,10));
    const allowReview=!!settings.allowReview;
    const allowed=Array.isArray(settings.allowedSourceTypes)&&settings.allowedSourceTypes.length?new Set(settings.allowedSourceTypes):null;
    return (hits||[]).map((h,i)=>{
      const trust_tier=inferTrust(h),source_type=inferType(h);
      const base=Number(h.confidence||h.score||0);
      const priority=Math.max(0,Math.min(Number(h.priority)||0,1000))/100;
      const evidenceScore=base+(TRUST[trust_tier]??0)+(TYPE[source_type]??0)+priority-i*0.001;
      return {...h,trust_tier,source_type,evidenceScore:+evidenceScore.toFixed(3)};
    }).filter(h=>reviewedEvidence(h)&&(allowReview||h.trust_tier!=='review')&&(!allowed||allowed.has(h.source_type))).filter(h=>String(h.source||h.source_text||'').trim()&&String(h.answer||h.text||'').trim()).sort((a,b)=>b.evidenceScore-a.evidenceScore).slice(0,maxEvidence);
  }
  function evidenceText(evidence){return (evidence||[]).map(e=>`${e.source||e.source_text||''} ${e.answer||e.text||''}`).join(' ')}
  function guardAnswer(text,evidence=[]){
    const t=String(text||''),src=evidenceText(evidence);const claims=[];
    if(/(?:رواه|صحيح)\s+البخاري|البخاري\s+رقم/i.test(t)&&!/البخاري/i.test(src))claims.push('UNSUPPORTED_BUKHARI');
    if(/(?:رواه|صحيح)\s+مسلم|مسلم\s+رقم/i.test(t)&&!/مسلم/i.test(src))claims.push('UNSUPPORTED_MUSLIM');
    for(const m of t.matchAll(/(?:الآية|اية|آية)\s*(\d{1,3})/g))if(!new RegExp(`(?:الآية|اية|آية)[\\s،,:-]*${m[1]}(?:\\D|$)`).test(src))claims.push(`UNSUPPORTED_AYAH_${m[1]}`);
    return {ok:claims.length===0,claims};
  }
  return {rankEvidence,guardAnswer,reviewedEvidence};
});
