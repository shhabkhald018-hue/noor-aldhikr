'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V90_CONVERSATION_FACTORY=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const FOLLOWUP=/^(?:طيب|طب|ليه|لماذا|ازاي|إزاي|كيف|هات الدليل|الدليل|اشرح(?:\s+أكتر|\s+اكثر)?|فصل|فصّل|اختصر|يعني ايه|يعني إيه)[؟?!\s.،]*$/i;
  function create(options={}){
    let maxTurns=Math.max(1,Math.min(Number(options.maxTurns)||8,30));
    let turns=[];
    function trim(){if(turns.length>maxTurns)turns=turns.slice(-maxTurns)}
    function addTurn(role,content,meta={}){
      const text=String(content||'').trim();
      if(!text)return history();
      turns.push({role:String(role||'user'),content:text,ts:Date.now(),meta:{...meta}});trim();return history();
    }
    function history(){return turns.map(t=>({...t,meta:{...t.meta}}))}
    function clear(){turns=[]}
    function setMaxTurns(n){maxTurns=Math.max(1,Math.min(Number(n)||8,30));trim();return maxTurns}
    function lastUserTopic(){
      for(let i=turns.length-1;i>=0;i--){
        const t=turns[i];
        if(t.role==='user'&&!FOLLOWUP.test(t.content)&&t.content.length>2)return t.content;
      }
      return '';
    }
    function lastAssistant(){for(let i=turns.length-1;i>=0;i--)if(turns[i].role==='assistant')return turns[i].content;return ''}
    function resolveQuestion(question){
      const q=String(question||'').trim();
      if(!q)return '';
      const isFollow=FOLLOWUP.test(q)||/^(?:طيب|طب|ليه|الدليل|هات\s+الدليل|هات\s+الأدلة|اشرح|فصل|فصّل|اختصر)(?:\s|[؟?!.,،]|$)/i.test(q);
      if(!isFollow)return q;
      const topic=lastUserTopic();
      if(!topic)return q;
      // Retrieval must never index prior assistant wording; an incorrect answer could otherwise reinforce itself.
      return `السؤال الأصلي: ${topic}\nسؤال المتابعة: ${q}`;
    }
    return {addTurn,history,clear,setMaxTurns,resolveQuestion,lastUserTopic};
  }
  return {create};
});
