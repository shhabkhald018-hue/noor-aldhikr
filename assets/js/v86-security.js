'use strict';
(()=>{
  const cfg=()=>window.NOOR_CONFIG||{};
  let client=null;
  function valid(){
    if(typeof window.NOOR_VALID_SUPABASE_CONFIG==='function')return window.NOOR_VALID_SUPABASE_CONFIG();
    const c=cfg(),url=String(c.supabaseUrl||''),key=String(c.publishableKey||'');
    return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)
      && /^sb_publishable_[A-Za-z0-9_-]+$/.test(key)
      && !/PASTE_/i.test(key);
  }
  function sb(){
    if(window.NOOR_GET_SUPABASE_CLIENT)return window.NOOR_GET_SUPABASE_CLIENT();
    if(window.supabaseClient)return window.supabaseClient;
    if(client)return client;
    if(!window.supabase?.createClient||!valid())return null;
    client=window.supabase.createClient(String(cfg().supabaseUrl).replace(/\/$/,''),cfg().publishableKey,{
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storage:window.localStorage,storageKey:'noor-aldhikr-auth-v92'}
    });
    window.supabaseClient=client;
    return client;
  }
  function timed(promise,ms=12000){
    if(window.noorWithTimeout)return window.noorWithTimeout(promise,ms);
    let timer;
    return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('NOOR_TIMEOUT')),ms)})]).finally(()=>clearTimeout(timer));
  }
  async function profile(){
    const c=sb(); if(!c)return null;
    const {data:{session},error:sessionError}=await timed(c.auth.getSession());
    if(sessionError)throw sessionError;
    const user=session?.user||null;
    if(!user)return null;
    const {data,error}=await timed(c.from('profiles').select('id,role,active,display_name,email').eq('id',user.id).maybeSingle());
    if(error)throw error;
    return data||null;
  }
  async function enforceActive(){
    try{
      const c=sb(); if(!c)return;
      const p=await profile();
      if(p&&p.active===false){
        try{await timed(c.auth.signOut())}catch(error){console.warn('V86 sign-out:',error)}
        localStorage.setItem('noor_account_notice','هذا الحساب موقوف من إدارة نور الذكر.');
        location.href=location.pathname.replace(/[^/]*$/,'')+'index.html?account=disabled';
      }
    }catch(e){console.warn('V86 active-account check:',e)}
  }
  async function resolveOwnerPreview(){
    window.NOOR_V86_OWNER_PREVIEW=false;
    if(!new URLSearchParams(location.search).has('ownerPreview'))return false;
    try{
      const c=sb(); if(!c)return false;
      const p=await profile();
      if(!p||p.active===false)return false;
      const {data,error}=await timed(c.rpc('is_owner'));
      if(error||data!==true)return false;
      window.NOOR_V86_OWNER_PREVIEW=true;return true;
    }catch(e){console.warn('V86 owner preview:',e);return false}
  }
  window.NOOR_V86_SECURITY={client:sb,profile,enforceActive,resolveOwnerPreview};
  document.addEventListener('DOMContentLoaded',()=>{resolveOwnerPreview().finally(enforceActive)});
})();
