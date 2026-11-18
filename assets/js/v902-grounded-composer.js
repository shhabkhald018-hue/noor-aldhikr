'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V902_GROUNDED_COMPOSER=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const NO_ANSWER='لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.';
  function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
  function uniqueEvidence(rows,max=4){
    const seen=new Set(),out=[];
    for(const e of rows||[]){
      const answer=clean(e.answer||e.text);if(!answer)continue;
      const key=answer.slice(0,180);if(seen.has(key))continue;seen.add(key);out.push(e);if(out.length>=max)break;
    }
    return out;
  }
  function label(e,i){return clean(e.title||e.category||`دليل ${i+1}`)}
  function compose(question,evidence=[],options={}){
    const rows=uniqueEvidence(evidence,Math.max(1,Math.min(Number(options.maxEvidence)||4,6)));
    if(!rows.length)return NO_ANSWER;
    const style=String(options.answerStyle||'balanced');
    const first=clean(rows[0].answer||rows[0].text);
    if(style==='short')return `**الخلاصة**\n${first}`;
    const additions=rows.slice(1).map((e,i)=>`- **${label(e,i+1)}:** ${clean(e.answer||e.text)}`).join('\n');
    if(style==='detailed'){
      const all=rows.map((e,i)=>`- **${label(e,i)}:** ${clean(e.answer||e.text)}`).join('\n');
      return `**الخلاصة**\n${first}\n\n**الشرح**\n${additions||'المادة المتاحة تدعم الخلاصة السابقة، ولا توجد تفاصيل إضافية موثوقة كافية حاليًا.'}\n\n**الأدلة المرتبطة بالسؤال**\n${all}`;
    }
    return `**الخلاصة**\n${first}${additions?`\n\n**شرح من الأدلة المرتبطة**\n${additions}`:''}`;
  }
  return {compose,uniqueEvidence,NO_ANSWER};
});
