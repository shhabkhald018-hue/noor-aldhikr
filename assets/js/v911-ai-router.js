'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V911_AI_ROUTER_FACTORY=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function createRouter({local}={}){
    if(!local?.ask)throw new Error('LOCAL_AI_REQUIRED');
    async function runLocal(question,opts={}){
      const localOut=await local.ask(question,{ctx:opts.ctx||{},history:opts.history||[],settings:opts.settings||{}});
      return {...localOut,mode:localOut?.mode||'knowledge-local',externalProvider:false};
    }
    async function ask(question,{ctx={},history=[],settings={}}={}){
      return runLocal(question,{ctx,history,settings});
    }
    async function streamAsk(question,{ctx={},history=[],settings={},signal}={}){
      if(signal?.aborted)throw new DOMException('Aborted','AbortError');
      return runLocal(question,{ctx,history,settings});
    }
    return {ask,streamAsk,mode:'local-knowledge-only'};
  }
  return {createRouter};
});
