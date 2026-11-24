'use strict';
(function(root,factory){
  const defaultComposer=(typeof module==='object'&&module.exports)?require('./v902-grounded-composer.js'):(root&&root.NOOR_V902_GROUNDED_COMPOSER);
  const api=factory(defaultComposer);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V90_RAG_FACTORY=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(defaultComposer){
  const NO_ANSWER='لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.';
  function sourceObj(h){return {title:h.title||h.category||'مصدر موثوق',source:h.source||h.source_text||'',source_type:h.source_type||'other',trust_tier:h.trust_tier||'verified',confidence:Number(h.confidence||0),evidenceScore:Number(h.evidenceScore||0),origin:h.origin||'retrieval'}}
  function coherentEvidence(rows=[]){
    if(!rows.length)return[];
    const top=rows[0],topConfidence=Math.max(Number(top.confidence)||0,1),topCategory=String(top.category||'');
    return [top,...rows.slice(1).filter(row=>{
      if(top.knowledge_key&&row.knowledge_key===top.knowledge_key)return true;
      return !!row.strongMatch&&Number(row.matchCoverage||0)>=.84&&String(row.category||'')===topCategory&&Number(row.confidence||0)>=topConfidence*.55;
    })].slice(0,4);
  }
  function buildContext(evidence,maxChars=6500){
    let used=0;const parts=[];
    for(const e of evidence){
      const block=`[دليل ${parts.length+1}]\nالعنوان: ${e.title||e.category||'مصدر'}\nالنص: ${e.answer||e.text||''}\nالمرجع: ${e.source||e.source_text||''}`;
      if(parts.length&&used+block.length>maxChars)break;parts.push(block);used+=block.length;
    }
    return parts.join('\n\n');
  }
  function buildHistory(history=[]){
    const rows=(Array.isArray(history)?history:[]).slice(-6).map(t=>{const role=t?.role==='assistant'?'المساعد':'المستخدم';const content=String(t?.content||'').trim().slice(0,700);return content?`${role}: ${content}`:''}).filter(Boolean);
    return rows.join('\n');
  }
  function buildPrompt(question,evidence,{answerStyle='balanced'}={},history=[]){
    const style=answerStyle==='short'?'أجب بإيجاز شديد.':answerStyle==='detailed'?'اشرح بتفصيل منظم مع نقاط عند الحاجة.':'ابدأ بخلاصة واضحة ثم شرح مناسب.';
    const prior=buildHistory(history);
    return [
      {role:'system',content:`أنت مساعد نور الذكر الشرعي. أجب اعتمادًا حصريًا على الأدلة المرفقة. سياق المحادثة السابقة يساعدك على فهم المقصود فقط ولا يُعد مصدرًا شرعيًا. لا تخترع آية أو حديثًا أو رقمًا أو قول عالم. إذا لم تكف الأدلة فصرّح بذلك. ${style} لا تكرر قائمة المصادر؛ الواجهة ستعرضها.`},
      {role:'user',content:`${prior?`سياق المحادثة السابقة:\n${prior}\n\n`:''}السؤال الحالي: ${String(question||'').trim()}\n\nالأدلة الموثوقة:\n${buildContext(evidence)}`}
    ];
  }
  function create({retriever,model,evidence,composer=defaultComposer}={}){
    if(!retriever?.ask)throw new Error('RETRIEVER_REQUIRED');
    if(!evidence?.rankEvidence||!evidence?.guardAnswer)throw new Error('EVIDENCE_ENGINE_REQUIRED');
    async function ask(question,{settings={},ctx={},history=[]}={}){
      const ret=await retriever.ask(question,ctx);
      const ranked=coherentEvidence(evidence.rankEvidence(ret?.hits||[],settings));
      if(!ranked.length)return {mode:'knowledge-fallback',answer:NO_ANSWER,sources:[],evidence:[],related:ret?.related||[],found:false,confidence:0};
      // Retrieval-only fallback must be the exact reviewed answer. Do not
      // synthesize, merge, or paraphrase religious claims outside generation.
      const fallback=String(ranked[0].answer||ranked[0].text||ret?.answer||'').trim();
      const sources=ranked.map(sourceObj);
      const loaded=!!model?.status?.().loaded;
      if(!loaded||settings.generationEnabled===false)return {mode:'knowledge-fallback',answer:fallback,sources,evidence:ranked,found:true,confidence:ranked[0].evidenceScore||ranked[0].confidence||0};
      try{
        const generated=String(await model.generate(buildPrompt(question,ranked,settings,history),{max_new_tokens:Number(settings.maxNewTokens)||220,temperature:0.12,do_sample:false})||'').trim();
        if(!generated)throw new Error('EMPTY_GENERATION');
        const guard=evidence.guardAnswer(generated,ranked);
        if(!guard.ok)return {mode:'knowledge-fallback',answer:fallback,sources,evidence:ranked,found:true,confidence:ranked[0].evidenceScore||0,guardRejected:true,guardClaims:guard.claims};
        return {mode:'local-ai',answer:generated,sources,evidence:ranked,found:true,confidence:ranked[0].evidenceScore||0,model:model.status?.().selected?.model||''};
      }catch(err){return {mode:'knowledge-fallback',answer:fallback,sources,evidence:ranked,found:true,confidence:ranked[0].evidenceScore||0,localAiError:String(err?.message||err)}}
    }
    return {ask,buildPrompt,buildContext,buildHistory};
  }
  return {create,buildPrompt,buildContext,buildHistory,coherentEvidence,NO_ANSWER};
});
