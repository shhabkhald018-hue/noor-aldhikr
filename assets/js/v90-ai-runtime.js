'use strict';
(()=>{
  const DEFAULTS={memoryTurns:8,maxEvidence:5,answerStyle:'balanced',generationEnabled:false,modelPolicy:'auto',enabledModels:['8B','4B','1.7B','0.6B'],allowedSourceTypes:['quran','sunnah','scholar','book','owner','academy','other'],maxNewTokens:220};
  const STORAGE='noor-v90-conversation';
  let settings={...DEFAULTS},memory=null,model=null,retriever=null,rag=null,route=null,currentAbort=null;
  function client(){return window.supabaseClient||null}
  function saveMemory(){try{localStorage.setItem(STORAGE,JSON.stringify(memory?.history?.()||[]))}catch(_){}}
  function restoreMemory(){try{return JSON.parse(localStorage.getItem(STORAGE)||'[]')}catch{return[]}}
  async function loadSettings(){
    const sb=client();if(!sb)return settings;
    try{const keys=['v90_memory_turns','v90_max_evidence','v90_answer_style','v90_generation_enabled','v90_model_policy','v90_enabled_models','v90_allowed_source_types','v90_max_new_tokens'];const {data,error}=await sb.from('app_settings').select('key,value').in('key',keys);if(!error){for(const r of data||[]){const v=r.value;if(r.key==='v90_memory_turns')settings.memoryTurns=+v||8;if(r.key==='v90_max_evidence')settings.maxEvidence=+v||5;if(r.key==='v90_answer_style')settings.answerStyle=String(v||'balanced');if(r.key==='v90_generation_enabled')settings.generationEnabled=!['false','0','off'].includes(String(v).toLowerCase());if(r.key==='v90_model_policy')settings.modelPolicy=String(v||'auto');if(r.key==='v90_enabled_models')settings.enabledModels=Array.isArray(v)?v:String(v||'').split(',').filter(Boolean);if(r.key==='v90_allowed_source_types')settings.allowedSourceTypes=Array.isArray(v)?v:String(v||'').split(',').filter(Boolean);if(r.key==='v90_max_new_tokens')settings.maxNewTokens=+v||220;}}
    }catch(_){ }
    memory?.setMaxTurns?.(settings.memoryTurns);return settings;
  }
  function ensure(){
    if(memory&&model&&retriever&&rag&&route)return;
    if(!window.NOOR_V90_CONVERSATION_FACTORY||!window.NOOR_V90_MODEL_ROUTER_FACTORY||!window.NOOR_V90_EVIDENCE||!window.NOOR_V90_RAG_FACTORY||!window.NOOR_V89_RETRIEVER_FACTORY||!window.NOOR_AI_CORE)throw new Error('V90_ENGINE_NOT_READY');
    memory=window.NOOR_V90_CONVERSATION_FACTORY.create({maxTurns:settings.memoryTurns});for(const t of restoreMemory())memory.addTurn(t.role,t.content,t.meta||{});
    const candidates=window.NOOR_V90_MODEL_ROUTER_FACTORY.DEFAULT_CANDIDATES.map(c=>({...c,enabled:settings.enabledModels.includes(c.size)}));
    model=window.NOOR_V90_MODEL_ROUTER_FACTORY.create({candidates,engineFactory:cfg=>window.NOOR_V89_LLM_FACTORY.create({env:window,model:cfg.model,maxNewTokens:settings.maxNewTokens})});
    retriever=window.NOOR_V89_RETRIEVER_FACTORY.create({core:window.NOOR_AI_CORE,loadEntries:async()=>window.NOOR_AI_DEBUG?.loadKnowledge?window.NOOR_AI_DEBUG.loadKnowledge():[],fetcher:window.fetch?.bind(window)});
    rag=window.NOOR_V90_RAG_FACTORY.create({retriever,model,evidence:window.NOOR_V90_EVIDENCE});
    const local={ask:(q,o={})=>rag.ask(q,o)};
    route=window.NOOR_V911_AI_ROUTER_FACTORY?.createRouter?window.NOOR_V911_AI_ROUTER_FACTORY.createRouter({local}):local;
  }
  async function ask(question,ctx={}){ensure();const raw=String(question||'').trim();if(!raw)return {answer:'اكتب سؤالك أولًا.',sources:[]};const resolved=memory.resolveQuestion(raw);const history=memory.history().slice(-settings.memoryTurns);memory.addTurn('user',raw);const out=await route.ask(resolved,{ctx,history,mode:'assistant',settings:{...settings,allowedSourceTypes:settings.allowedSourceTypes}});memory.addTurn('assistant',out.answer,{sources:out.sources||[]});saveMemory();return {...out,resolvedQuestion:resolved};}
  async function streamAsk(question,ctx={},onChunk=()=>{}){
    ensure();stop();currentAbort=new AbortController();
    const raw=String(question||'').trim();if(!raw)return {answer:'اكتب سؤالك أولًا.',sources:[]};
    const resolved=memory.resolveQuestion(raw),history=memory.history().slice(-settings.memoryTurns);memory.addTurn('user',raw);
    let streamed=false;
    try{
      const out=route.streamAsk?await route.streamAsk(resolved,{ctx,history,mode:'assistant',settings:{...settings,allowedSourceTypes:settings.allowedSourceTypes},signal:currentAbort.signal,onDelta:(chunk,full)=>{streamed=true;onChunk(chunk,full)}}):await route.ask(resolved,{ctx,history,mode:'assistant',settings:{...settings,allowedSourceTypes:settings.allowedSourceTypes}});
      if(!streamed&&out?.answer)await window.NOOR_V90_STREAM.streamText(out.answer,{signal:currentAbort.signal,onChunk,chunkSize:14,delay:8});
      memory.addTurn('assistant',out.answer,{sources:out.sources||[],mode:out.mode||'knowledge-local'});saveMemory();
      return {...out,resolvedQuestion:resolved};
    }finally{currentAbort=null}
  }
  function stop(){if(currentAbort){currentAbort.abort();currentAbort=null}}
  function newConversation(){stop();ensure();memory.clear();saveMemory();}
  async function action(type,ctx={}){ensure();const h=memory.history();const last=[...h].reverse().find(x=>x.role==='assistant');if(!last)return null;const prompts={short:'اختصر الإجابة السابقة مع الحفاظ على المعنى والدليل.',detailed:'اشرح الإجابة السابقة بتفصيل أوضح اعتمادًا على نفس الموضوع والأدلة.',evidence:'هات الدليل والمصادر فقط بوضوح.'};return ask(prompts[type]||type,ctx)}
  async function enableLocal(size){ensure();const preferred=settings.modelPolicy==='manual'?size:(size||model.select()?.size);return model.loadSelected({explicitOptIn:true,preferredSize:preferred})}
  function disableLocal(){ensure();model.unload()}
  async function retrieve(q,ctx={}){ensure();const resolved=memory.resolveQuestion(q);const ret=await retriever.ask(resolved,ctx);return window.NOOR_V90_EVIDENCE.rankEvidence(ret.hits||[],{...settings,allowedSourceTypes:settings.allowedSourceTypes})}
  function status(){ensure();return {settings:{...settings},memoryTurns:memory.history().length,model:model.status()}}
  async function boot(){try{await loadSettings();memory=null;model=null;retriever=null;rag=null;route=null;ensure();window.NOOR_V90_AI={ask,streamAsk,stop,newConversation,action,enableLocal,disableLocal,retrieve,status,reloadSettings:loadSettings};window.NOOR_FREE_AI_ASK=ask;window.dispatchEvent(new CustomEvent('noor:v90-ready'))}catch(e){setTimeout(boot,160)}}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,220));
})();
