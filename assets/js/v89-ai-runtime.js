'use strict';
(()=>{
  const OPTIN_KEY='noor-v89-local-ai-optin';
  const USAGE_KEY='noor-v89-ai-usage';
  const LOCKED_MODEL={status:()=>({state:'locked',supported:false,loaded:false}),isSupported:()=>false,subscribe(fn){try{fn(this.status())}catch(_){}return()=>{}},unload(){},async generate(){throw new Error('LOCAL_GENERATION_LOCKED_FOR_CONTENT_REVIEW')}};
  let settings={generationEnabled:false,localModelEnabled:false};
  let engine=LOCKED_MODEL,retriever=null,rag=null,memoryUsage={};
  const listeners=new Set();
  function client(){try{return window.NOOR_GET_SUPABASE_CLIENT?.()||window.supabaseClient||null}catch(e){return null}}
  function bool(v,d=true){if(v===undefined||v===null||v==='')return d;return !['false','0','off','no'].includes(String(v).toLowerCase())}
  function optIn(){try{return localStorage.getItem(OPTIN_KEY)==='1'}catch{return false}}
  function setOptIn(v){try{if(v)localStorage.setItem(OPTIN_KEY,'1');else localStorage.removeItem(OPTIN_KEY)}catch{}}
  function emit(){const s=status();for(const fn of listeners){try{fn(s)}catch(_){}}try{window.dispatchEvent(new CustomEvent('noor:v89-ai-status',{detail:s}))}catch(_){}return s}
  function status(){return {assistantEnabled:window.NOOR_AI_ENABLED!==false,generationEnabled:settings.generationEnabled,localModelEnabled:settings.localModelEnabled,optIn:optIn(),llm:engine?.status?.()||{state:'idle',supported:!!window.navigator?.gpu},mode:(settings.generationEnabled&&settings.localModelEnabled&&optIn()&&engine?.isSupported?.())?'local-ai':'retrieval'}}
  function limit(){const lim=Math.max(1,Math.min(Number(window.NOOR_RUNTIME?.ai?.max_daily_per_user||200),500));const day=new Date().toISOString().slice(0,10);let obj={};try{obj=JSON.parse(localStorage.getItem(USAGE_KEY)||'{}')}catch{obj=memoryUsage||{}}if(obj.day!==day)obj={day,count:0};if(obj.count>=lim)return {ok:false,remaining:0};obj.count++;memoryUsage=obj;try{localStorage.setItem(USAGE_KEY,JSON.stringify(obj))}catch{}return {ok:true,remaining:Math.max(0,lim-obj.count)}}
  async function loadSettings(){const sb=client();if(sb){try{const request=sb.from('app_settings').select('key,value').in('key',['v89_generation_enabled','v89_local_model_enabled']);await (window.noorWithTimeout?window.noorWithTimeout(request,12000):request)}catch(_){}}settings.generationEnabled=false;settings.localModelEnabled=false;emit();return settings}
  function ensure(){
    if(retriever&&rag)return;
    if(!window.NOOR_V89_RETRIEVER_FACTORY||!window.NOOR_V89_RAG_FACTORY||!window.NOOR_AI_CORE)throw new Error('V89_ENGINE_NOT_READY');
    engine=LOCKED_MODEL;
    retriever=window.NOOR_V89_RETRIEVER_FACTORY.create({core:window.NOOR_AI_CORE,loadEntries:async()=>{if(!window.NOOR_AI_DEBUG?.loadKnowledge)return[];return window.NOOR_AI_DEBUG.loadKnowledge()},fetcher:window.fetch?.bind(window)});
    rag=window.NOOR_V89_RAG_FACTORY.create({retriever,llm:engine,enabled:()=>window.NOOR_AI_ENABLED!==false,generationEnabled:()=>settings.generationEnabled&&settings.localModelEnabled&&optIn()});
  }
  async function ask(question,ctx={}){ensure();if(window.NOOR_AI_ENABLED===false)throw new Error('AI_DISABLED');const usage=limit();if(!usage.ok)return {mode:'limit',answer:'وصلت للحد اليومي الذي حدده مالك الموقع لهذا الجهاز. يمكنك المحاولة غدًا.',source:'',sources:[],note:'الحد تنظيمي للمساعد المجاني.'};const out=await rag.ask(question,ctx);out.remaining=usage.remaining;out.note=out.mode==='local-ai'?`صيغت الإجابة محليًا من المصادر المسترجعة • متبقي اليوم: ${usage.remaining}`:`بحث معرفي موثّق • متبقي اليوم: ${usage.remaining}`;return out}
  async function enableLocal(){setOptIn(false);settings.generationEnabled=false;settings.localModelEnabled=false;emit();throw new Error('LOCAL_GENERATION_LOCKED_FOR_CONTENT_REVIEW')}
  function disableLocal(){setOptIn(false);emit();return status()}
  async function retrieve(question,ctx={}){ensure();return retriever.ask(question,ctx)}
  function subscribe(fn){listeners.add(fn);try{fn(status())}catch(_){}return()=>listeners.delete(fn)}
  async function boot(){
    // Preserve the V88.3 retrieval answer function before V89 replaces the public ask API.
    if(window.NOOR_FREE_AI_ASK&&!window.NOOR_V883_ASK)window.NOOR_V883_ASK=window.NOOR_FREE_AI_ASK;
    try{ensure()}catch(e){setTimeout(boot,120);return}
    await loadSettings();
    window.NOOR_V89_AI={ask,enableLocal,disableLocal,retrieve,status,subscribe,reloadSettings:loadSettings,llm:engine};
    window.NOOR_FREE_AI_ASK=ask;
    emit();
  }
  window.addEventListener('noor:ai-ready',()=>loadSettings());
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,80));
})();
