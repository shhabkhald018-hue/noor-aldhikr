'use strict';
(()=>{
  function client(){try{return window.NOOR_GET_SUPABASE_CLIENT?.()||window.supabaseClient||null}catch(e){return null}}
  function timed(promise,ms=12000){if(window.noorWithTimeout)return window.noorWithTimeout(promise,ms);let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('NOOR_TIMEOUT')),ms)})]).finally(()=>clearTimeout(timer))}
  function emit(detail){try{window.dispatchEvent(new CustomEvent('noor:ai-ready',{detail}))}catch(e){}}
  async function load(){
    if(typeof window.NOOR_AI_ENABLED!=='boolean')window.NOOR_AI_ENABLED=true;
    const sb=client();if(!sb){emit({enabled:window.NOOR_AI_ENABLED,offline:true,ai:window.NOOR_RUNTIME?.ai||null});return}
    try{
      const [m,a]=await Promise.allSettled([
        timed(sb.from('site_modules').select('module_key,enabled').eq('module_key','aiAssistant').maybeSingle()),
        timed(sb.from('ai_settings').select('*').eq('id',true).maybeSingle())
      ]);
      const mod=m.status==='fulfilled'&&!m.value.error?m.value.data:null;
      const ai=a.status==='fulfilled'&&!a.value.error?a.value.data:null;
      window.NOOR_RUNTIME=window.NOOR_RUNTIME||{};
      if(ai)window.NOOR_RUNTIME.ai=ai;
      if(mod||ai)window.NOOR_AI_ENABLED=(mod?.enabled!==false)&&(ai?.enabled!==false);
      emit({enabled:window.NOOR_AI_ENABLED,offline:false,ai:ai||window.NOOR_RUNTIME.ai||null});
    }catch(e){emit({enabled:window.NOOR_AI_ENABLED,offline:true,ai:window.NOOR_RUNTIME?.ai||null})}
  }
  window.NOOR_AI_RUNTIME_RELOAD=load;
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,40));
})();
