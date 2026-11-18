'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V89_LLM_FACTORY=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const DEFAULT_MODEL='onnx-community/Qwen2.5-0.5B-Instruct';
  const DEFAULT_CDN='https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
  function create(options={}){
    const env=options.env||globalThis;
    const cfg={model:options.model||DEFAULT_MODEL,dtypes:options.dtypes||['q4f16','q4'],cdn:options.cdn||DEFAULT_CDN,maxNewTokens:Math.min(Math.max(+options.maxNewTokens||180,64),220)};
    let generator=null,loading=null,state='idle',error='',dtype='',progress=0,progressText='';
    const listeners=new Set();
    function snapshot(){return {state,error,dtype,progress,progressText,model:cfg.model,supported:isSupported(),device:'webgpu'}}
    function emit(){const s=snapshot();for(const fn of listeners){try{fn(s)}catch(_){}}return s}
    function set(patch){if('state'in patch)state=patch.state;if('error'in patch)error=patch.error||'';if('dtype'in patch)dtype=patch.dtype||'';if('progress'in patch)progress=patch.progress||0;if('progressText'in patch)progressText=patch.progressText||'';emit()}
    function isSupported(){return !!env?.navigator?.gpu}
    async function defaultPipelineLoader(){const mod=await import(cfg.cdn);if(!mod?.pipeline)throw new Error('TRANSFORMERS_PIPELINE_UNAVAILABLE');return mod.pipeline}
    function progressCb(p){
      const pct=Number.isFinite(p?.progress)?Math.max(0,Math.min(100,p.progress)):progress;
      const label=p?.file?`تحميل ${String(p.file).split('/').pop()}`:(p?.status||'تحميل النموذج');
      set({progress:pct,progressText:label});
    }
    async function load(){
      if(generator)return generator;
      if(loading)return loading;
      if(!isSupported()){set({state:'unsupported',error:'WEBGPU_UNAVAILABLE'});throw new Error('WEBGPU_UNAVAILABLE')}
      loading=(async()=>{
        set({state:'loading',error:'',progress:0,progressText:'جاري تهيئة محرك الذكاء المحلي…'});
        const pipeline=await (options.pipelineLoader?options.pipelineLoader():defaultPipelineLoader());
        let last=null;
        for(const dt of cfg.dtypes){
          try{
            set({dtype:dt,progressText:`جاري تحميل النموذج المحلي (${dt})…`});
            generator=await pipeline('text-generation',cfg.model,{device:'webgpu',dtype:dt,progress_callback:progressCb});
            set({state:'ready',dtype:dt,progress:100,progressText:'النموذج المحلي جاهز'});
            return generator;
          }catch(e){last=e;generator=null}
        }
        throw last||new Error('MODEL_LOAD_FAILED');
      })().catch(e=>{set({state:'error',error:String(e?.message||e),progressText:'تعذر تحميل النموذج المحلي'});throw e}).finally(()=>{loading=null});
      return loading;
    }
    async function generate(messages,genOptions={}){
      const gen=await load();
      set({state:'generating',error:'',progressText:'جاري صياغة الإجابة محليًا…'});
      try{
        const out=await gen(messages,{max_new_tokens:Math.min(Math.max(+genOptions.max_new_tokens||cfg.maxNewTokens,32),220),temperature:Math.min(Math.max(+genOptions.temperature||0.15,0),0.4),do_sample:genOptions.do_sample??false,repetition_penalty:1.08});
        let text='';
        const gt=out?.[0]?.generated_text;
        if(Array.isArray(gt))text=String(gt.at(-1)?.content||'').trim();
        else text=String(gt||'').trim();
        if(!text)throw new Error('EMPTY_GENERATION');
        set({state:'ready',progressText:'النموذج المحلي جاهز'});
        return text;
      }catch(e){set({state:'error',error:String(e?.message||e),progressText:'فشل التوليد المحلي'});throw e}
    }
    function reset(){generator=null;loading=null;state=isSupported()?'idle':'unsupported';error='';dtype='';progress=0;progressText='';emit()}
    function subscribe(fn){listeners.add(fn);try{fn(snapshot())}catch(_){}return()=>listeners.delete(fn)}
    if(!isSupported())state='unsupported';
    return {isSupported,status:snapshot,load,generate,reset,subscribe,config:{...cfg}};
  }
  return {create,DEFAULT_MODEL,DEFAULT_CDN};
});
