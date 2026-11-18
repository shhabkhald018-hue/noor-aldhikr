'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V90_MODEL_ROUTER_FACTORY=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DEFAULT_CANDIDATES=[
    {size:'8B',model:'onnx-community/Qwen3-8B-ONNX',minMemory:12,enabled:true},
    {size:'4B',model:'onnx-community/Qwen3-4B-ONNX',minMemory:8,enabled:true},
    {size:'1.7B',model:'onnx-community/Qwen3-1.7B-ONNX',minMemory:4,enabled:true},
    {size:'0.6B',model:'onnx-community/Qwen3-0.6B-ONNX',minMemory:2,enabled:true}
  ];
  function create(options={}){
    const deviceMemory=Number(options.deviceMemory??globalThis?.navigator?.deviceMemory??4)||4;
    const candidates=(options.candidates||DEFAULT_CANDIDATES).map(x=>({...x}));
    let selected=null,engine=null,loaded=false;
    const engineFactory=options.engineFactory||((cfg)=>{
      if(!globalThis.NOOR_V89_LLM_FACTORY?.create)throw new Error('LLM_FACTORY_UNAVAILABLE');
      return globalThis.NOOR_V89_LLM_FACTORY.create({env:globalThis,model:cfg.model,maxNewTokens:options.maxNewTokens||220});
    });
    function allowed(c){return c.enabled!==false&&deviceMemory>=Number(c.minMemory||0)}
    function select(preferredSize){
      selected=preferredSize?candidates.find(c=>c.size===preferredSize&&allowed(c)):candidates.find(allowed);
      selected=selected||candidates.filter(c=>c.enabled!==false).at(-1)||null;
      return selected?{...selected}:null;
    }
    async function loadSelected({explicitOptIn=false,preferredSize}={}){
      if(!explicitOptIn)throw new Error('EXPLICIT_OPT_IN_REQUIRED');
      if(preferredSize){const exact=candidates.find(c=>c.size===preferredSize&&c.enabled!==false);if(!exact)throw new Error('NO_MODEL_CANDIDATE');if(!allowed(exact))throw new Error('MODEL_NOT_ALLOWED_ON_DEVICE');}
      const cfg=select(preferredSize);if(!cfg)throw new Error('NO_MODEL_CANDIDATE');
      engine=engineFactory(cfg);if(!engine?.load)throw new Error('MODEL_ENGINE_INVALID');
      await engine.load();loaded=true;return status();
    }
    async function generate(messages,opts={}){if(!loaded||!engine?.generate)throw new Error('MODEL_NOT_LOADED');return engine.generate(messages,opts)}
    function status(){return {deviceMemory,selected:selected?{...selected}:null,loaded,engine:engine?.status?.()||null,candidates:candidates.map(c=>({...c}))}}
    function unload(){try{engine?.reset?.()}catch(_){}engine=null;loaded=false;selected=null}
    return {candidates:()=>candidates.map(c=>({...c})),select,loadSelected,generate,status,unload};
  }
  return {create,DEFAULT_CANDIDATES};
});
