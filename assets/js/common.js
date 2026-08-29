
const CFG=window.NOOR_CONFIG||{};
const qs=(s,p=document)=>p.querySelector(s), qsa=(s,p=document)=>[...p.querySelectorAll(s)];
function toast(msg){const t=qs('#toast');t.textContent=msg;t.style.display='block';clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.style.display='none',2600)}
function store(k,v){try{localStorage.setItem('noor_'+k,JSON.stringify(v))}catch(e){}}function load(k,d=null){try{return JSON.parse(localStorage.getItem('noor_'+k))??d}catch{return d}}
function setTheme(t){document.documentElement.dataset.theme=t;store('theme',t)}setTheme(load('theme','light'));
qs('#themeBtn')?.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
window.addEventListener('online',()=>updateOnline());window.addEventListener('offline',()=>updateOnline());function updateOnline(){const e=qs('#onlineState');if(e)e.textContent=navigator.onLine?'متصل':'بدون إنترنت'}updateOnline();
function validConfig(){return /^https:\/\/.+\.supabase\.co$/.test(CFG.supabaseUrl||'') && CFG.publishableKey && !CFG.publishableKey.includes('PASTE_')}

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

let supabaseClient=null;
if(validConfig()&&window.supabase){
  try{
    supabaseClient=window.supabase.createClient(CFG.supabaseUrl,CFG.publishableKey,{
      auth:{
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:true,
        storage:window.localStorage
      }
    });
  }catch(e){console.error('تعذر إنشاء اتصال Supabase:',e)}
}
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
qsa('.nav button').forEach(b=>b.onclick=()=>navTo(b.dataset.page));
