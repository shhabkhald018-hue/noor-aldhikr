'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V89_RAG_FACTORY=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const NO_ANSWER='لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.';
  function uniq(xs){return [...new Set((xs||[]).map(x=>String(x||'').trim()).filter(Boolean))]}
  function asHits(ret){
    if(Array.isArray(ret?.hits)&&ret.hits.length)return ret.hits;
    if(ret?.found&&ret.answer)return [{title:ret.title||'',answer:ret.answer,source:ret.source||'',category:ret.category||'',confidence:Number(ret.confidence)||0,origin:ret.origin||'retrieval'}];
    return [];
  }
  function sourceOf(h){return String(h.source||h.source_text||'').trim()}
  function trustedHit(h){
    if(!h||!sourceOf(h)||!String(h.answer||h.text||'').trim()||h.trust_tier==='review')return false;
    if(h.origin==='fallback')return true;
    const trustedTier=h.origin==='local'
      ?['primary','verified','curated'].includes(String(h.trust_tier||''))
      :['primary','verified'].includes(String(h.trust_tier||''));
    return trustedTier&&h.review_status==='published'&&!!String(h.reviewed_at||'').trim()&&(!['academy','local'].includes(h.origin)||!!String(h.reviewed_by||'').trim());
  }
  function coherentHits(rows=[]){
    if(!rows.length)return[];
    const top=rows[0],topConfidence=Math.max(Number(top.confidence)||0,1),topCategory=String(top.category||'');
    return [top,...rows.slice(1).filter(row=>{
      if(top.knowledge_key&&row.knowledge_key===top.knowledge_key)return true;
      return !!row.strongMatch&&Number(row.matchCoverage||0)>=.84&&String(row.category||'')===topCategory&&Number(row.confidence||0)>=topConfidence*.55;
    })].slice(0,4);
  }
  function buildContext(hits,maxChars=5200){
    let used=0;const chunks=[];
    for(let i=0;i<hits.length&&chunks.length<5;i++){
      const h=hits[i],src=sourceOf(h),body=String(h.answer||h.text||'').trim();if(!body||!src)continue;
      const chunk=`[مرجع ${chunks.length+1}]\nالعنوان: ${h.title||h.category||'مصدر موثوق'}\nالنص: ${body}\nالمصدر: ${src}`;
      if(used+chunk.length>maxChars&&chunks.length)break;chunks.push(chunk);used+=chunk.length;
    }
    return chunks.join('\n\n');
  }
  function safetyFor(question,ctx={}){
    const text=`${question||''} ${ctx.page||''} ${ctx.title||''}`;
    const rules=[];
    if(/رقي|عين|حسد|سحر|مس|اعراض|أعراض/i.test(text))rules.push('لا تجزم بسبب غيبي، ولا تعتبر الأعراض وحدها دليلًا على عين أو سحر أو مس، ولا تستبدل التقييم الطبي بالرقية.');
    if(/رؤ|حلم|منام|كابوس/i.test(text))rules.push('لا تجعل الرؤيا اتهامًا لشخص، ولا تجزم بتحققها أو بأنها تكشف الغيب.');
    if(/فتو|حكم|حلال|حرام|يجوز|فقه/i.test(text))rules.push('إذا كانت المسألة خلافية فقل إنها خلافية وانسب ما تذكره إلى المرجع الموجود في السياق، ولا تنشئ فتوى قطعية بلا نص مسترجع.');
    return rules.join('\n');
  }
  function buildGroundedPrompt(question,hits,ctx={}){
    const context=buildContext(hits);
    const extra=safetyFor(question,ctx);
    const system=`أنت مساعد نور الذكر الشرعي المحلي. مهمتك صياغة إجابة عربية واضحة اعتمادًا حصريًا على السياق الموثوق المرفق.\nقواعد إلزامية:\n- لا تضف آية أو حديثًا أو قول عالم غير موجود في السياق.\n- لا تنسب رأيًا إلى عالم غير مذكور.\n- لا تخترع رقم سورة أو آية أو حديث أو كتاب.\n- إذا كان السياق لا يكفي، قل: المادة الموثوقة المتاحة لا تكفي للإجابة بثقة.\n- اجعل الجواب مختصرًا ثم وضّح الدليل، ولا تكرر قائمة المصادر لأن الواجهة ستعرضها منفصلة.\n${extra}`;
    const user=`سؤال المستخدم: ${String(question||'').trim()}\n\nالسياق الموثوق:\n${context}`;
    return [{role:'system',content:system},{role:'user',content:user}];
  }
  function guardGenerated(text,sources=[]){
    const t=String(text||'');const src=uniq(sources).join(' ');
    const claims=[];
    if(/(?:صحيح|رواه)\s+البخاري|البخاري\s+رقم/i.test(t)&&!/البخاري/i.test(src))claims.push('UNSUPPORTED_BUKHARI');
    if(/(?:صحيح|رواه)\s+مسلم|مسلم\s+رقم/i.test(t)&&!/مسلم/i.test(src))claims.push('UNSUPPORTED_MUSLIM');
    const nums=[...t.matchAll(/(?:الآية|اية|آية)\s*(\d{1,3})/g)].map(m=>m[1]);
    for(const n of nums)if(!new RegExp(`(?:الآية|اية|آية|،)\s*${n}(?:\D|$)`).test(src))claims.push(`UNSUPPORTED_AYAH_${n}`);
    return {ok:claims.length===0,claims};
  }
  function create({retriever,llm,enabled=()=>true,generationEnabled=()=>false}={}){
    if(!retriever?.ask)throw new Error('RETRIEVER_REQUIRED');
    async function ask(question,ctx={}){
      if(!enabled())throw new Error('AI_DISABLED');
      const ret=await retriever.ask(question,ctx);
      const hits=coherentHits(asHits(ret).filter(trustedHit));
      if(!hits.length)return {mode:'knowledge-fallback',answer:NO_ANSWER,source:'',sources:[],related:ret?.related||[],found:false,confidence:Number(ret?.confidence)||0};
      const sources=uniq(hits.map(sourceOf));
      const fallbackAnswer=String(ret?.answer||hits[0]?.answer||'').trim();
      if(!generationEnabled()||!llm?.isSupported?.())return {mode:'fallback',answer:fallbackAnswer,source:sources.join(' • '),sources,related:ret?.related||[],found:true,confidence:Number(ret?.confidence||hits[0]?.confidence)||0};
      try{
        const messages=buildGroundedPrompt(question,hits,ctx);
        const generated=await llm.generate(messages,{max_new_tokens:180,temperature:0.15,do_sample:false});
        const guard=guardGenerated(generated,sources);
        if(!guard.ok)return {mode:'fallback',answer:fallbackAnswer,source:sources.join(' • '),sources,related:ret?.related||[],found:true,confidence:Number(ret?.confidence||hits[0]?.confidence)||0,guardRejected:true,guardClaims:guard.claims};
        return {mode:'local-ai',answer:String(generated).trim(),source:sources.join(' • '),sources,related:ret?.related||[],found:true,confidence:Number(ret?.confidence||hits[0]?.confidence)||0,model:llm.status?.().model||''};
      }catch(e){return {mode:'fallback',answer:fallbackAnswer,source:sources.join(' • '),sources,related:ret?.related||[],found:true,confidence:Number(ret?.confidence||hits[0]?.confidence)||0,localAiError:String(e?.message||e)}}
    }
    return {ask,buildGroundedPrompt};
  }
  return {create,buildGroundedPrompt,buildContext,safetyFor,guardGenerated,coherentHits,trustedHit,NO_ANSWER};
});
