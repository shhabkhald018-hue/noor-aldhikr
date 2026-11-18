
const CFG=window.NOOR_CONFIG||{};
const qs=(s,p=document)=>p.querySelector(s), qsa=(s,p=document)=>[...p.querySelectorAll(s)];
function toast(msg){const t=qs('#toast');t.textContent=msg;t.style.display='block';clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.style.display='none',2600)}
function store(k,v){try{localStorage.setItem('noor_'+k,JSON.stringify(v))}catch(e){}}function load(k,d=null){try{return JSON.parse(localStorage.getItem('noor_'+k))??d}catch{return d}}
function setTheme(t){t=t==='dark'?'dark':'light';document.documentElement.dataset.theme=t;try{localStorage.setItem('noor_theme_mode_v882',t)}catch(e){}}
try{setTheme(localStorage.getItem('noor_theme_mode_v882')==='dark'?'dark':'light')}catch(e){setTheme('light')}
// V88.3: theme button binding is owned exclusively by v25-ui.js to prevent double toggles.
window.addEventListener('online',()=>updateOnline());window.addEventListener('offline',()=>updateOnline());function updateOnline(){const e=qs('#onlineState');if(e)e.textContent=navigator.onLine?'إنترنت متاح':'بدون إنترنت'}updateOnline();
function validConfig(){
  const url=String(CFG.supabaseUrl||'').trim();
  const key=String(CFG.publishableKey||'').trim();
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)
    && /^sb_publishable_[A-Za-z0-9_-]+$/.test(key)
    && !/PASTE_/i.test(key);
}
window.NOOR_VALID_SUPABASE_CONFIG=validConfig;

function noorWithTimeout(promise,ms=12000,label='NOOR_TIMEOUT'){
  let timer;
  const guard=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label)),ms)});
  return Promise.race([promise,guard]).finally(()=>clearTimeout(timer));
}
window.noorWithTimeout=noorWithTimeout;
async function noorProbeSupabase(ms=8000){
  if(!validConfig())return {ok:false,stage:'config',message:'إعدادات Supabase غير مكتملة.'};
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),ms);
  try{
    // اختبار وصول فقط بدون apikey حتى لا يتحول CORS/preflight إلى تشخيص DNS خاطئ.
    await fetch((CFG.supabaseUrl||'').replace(/\/$/,'')+'/auth/v1/health',{method:'GET',mode:'no-cors',cache:'no-store',signal:ctrl.signal});
    clearTimeout(timer);
    return {ok:true,message:'تم الوصول إلى نطاق Supabase.'};
  }catch(error){
    clearTimeout(timer);
    return {ok:false,stage:error?.name==='AbortError'?'timeout':'network',message:error?.name==='AbortError'?'انتهت مهلة الوصول إلى Supabase.':'تعذر الوصول إلى نطاق Supabase؛ افحص الشبكة أو DNS.',error};
  }
}
window.noorProbeSupabase=noorProbeSupabase;

let supabaseClient=window.supabaseClient||null;
function getSharedSupabaseClient(){
  if(window.supabaseClient){
    supabaseClient=window.supabaseClient;
    return supabaseClient;
  }
  if(!validConfig()||!window.supabase?.createClient)return null;
  try{
    supabaseClient=window.supabase.createClient(String(CFG.supabaseUrl).replace(/\/$/,''),CFG.publishableKey,{
      auth:{
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:true,
        storage:window.localStorage,
        storageKey:'noor-aldhikr-auth-v92'
      }
    });
    window.supabaseClient=supabaseClient;
    window.dispatchEvent(new CustomEvent('noor:supabase-ready',{detail:{client:supabaseClient}}));
    return supabaseClient;
  }catch(error){
    console.error('تعذر إنشاء اتصال Supabase:',error);
    return null;
  }
}
window.NOOR_GET_SUPABASE_CLIENT=getSharedSupabaseClient;
getSharedSupabaseClient();
function navTo(id){
  qsa('.page').forEach(x=>x.classList.toggle('active',x.id===id));
  qsa('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===id));
  document.body.classList.toggle('home-view',id==='home');
  document.body.classList.toggle('inner-view',id!=='home');
  if(id==='adhkar' && window.showAdhkarCategories) window.showAdhkarCategories();
  scrollTo({top:0,behavior:'smooth'});
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
}
window.navTo=navTo;
document.body.classList.add('home-view');
qsa('.nav [data-page]').forEach(b=>b.onclick=()=>navTo(b.dataset.page));
