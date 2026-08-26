'use strict';

let currentUser = null;
window.currentUser = null;
let authSubscription = null;

function setAuthGate(isVisible){
  const gate = qs('#authGate');
  if(!gate) return;
  gate.classList.toggle('hidden', !isVisible);
  gate.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function setAuthLoading(loading, label){
  const submit = qs('#authSubmit');
  if(!submit) return;
  submit.disabled = loading;
  submit.classList.toggle('is-loading', loading);
  submit.textContent = loading ? (label || 'جاري التنفيذ…') : (qs('#authMode')?.value === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول');
}

function showAuthResult(message, type='success', showActions=false){
  const box = qs('#authResult');
  if(box){
    box.textContent = message;
    box.className = `auth-result ${type}`;
  }
}

function clearAuthMessages(){
  const errorBox = qs('#authError');
  if(errorBox) errorBox.textContent = '';
  qs('#authResult')?.classList.add('hidden');
}

function authErrorArabic(error){
  const raw = String(error?.message || error || '').trim();
  const low = raw.toLowerCase();
  if(low.includes('invalid login credentials')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  if(low.includes('email not confirmed')) return 'تم إنشاء الحساب، لكن تأكيد البريد ما زال مفعّلًا في إعدادات Supabase. يجب على إدارة الموقع إيقاف Confirm email حتى يتم الدخول مباشرة.';
  if(low.includes('user already registered') || low.includes('already registered')) return 'هذا البريد مسجل بالفعل. اختر تسجيل الدخول بدل إنشاء حساب.';
  if(low.includes('password should be at least')) return 'كلمة المرور يجب ألا تقل عن 8 أحرف.';
  if(low.includes('signup is disabled')) return 'إنشاء الحسابات متوقف حاليًا من إعدادات المشروع.';
  if(low.includes('rate limit')) return 'تمت محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم أعد المحاولة.';
  if(low.includes('network') || low.includes('fetch')) return 'تعذر الاتصال بالخادم. تحقق من الإنترنت ثم أعد المحاولة.';
  if(low.includes('redirect') && low.includes('not allowed')) return 'رابط الرجوع بعد تأكيد البريد غير مسموح به في إعدادات Supabase.';
  return raw || 'تعذر إتمام العملية.';
}

function setAuthMode(mode){
  const select = qs('#authMode');
  if(!select) return;
  select.value = mode;
  qsa('[data-auth-mode]').forEach(btn => btn.classList.toggle('active', btn.dataset.authMode === mode));
  qs('#authNameField')?.classList.toggle('hidden', mode !== 'signup');
  qs('#forgotPassword')?.classList.toggle('hidden', mode === 'signup');
  const password = qs('#authPassword');
  if(password) password.autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  const submit = qs('#authSubmit');
  if(submit) submit.textContent = mode === 'signup' ? 'إنشاء الحساب' : 'تسجيل الدخول';
  clearAuthMessages();
}

async function syncProfile(){
  if(!currentUser || !supabaseClient || !navigator.onLine) return;
  try{
    const displayName = currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || '';
    const {error}=await supabaseClient.from('profiles').upsert({
      id:currentUser.id,
      email:currentUser.email,
      display_name:displayName,
      last_seen_at:new Date().toISOString()
    },{onConflict:'id'});
    if(error) console.warn('تعذر تحديث الملف الشخصي:',error.message);
  }catch(error){
    console.warn('تعذر مزامنة الملف الشخصي:',error);
  }
}

async function applySession(session){
  currentUser=session?.user||null;
  window.currentUser=currentUser;
  setAuthGate(!currentUser);
  if(currentUser){
    setTimeout(syncProfile,0);
    window.dispatchEvent(new CustomEvent('noor:user-ready',{detail:{user:currentUser}}));
  }
}

async function initAuth(){
  qsa('[data-auth-mode]').forEach(btn=>btn.addEventListener('click',()=>setAuthMode(btn.dataset.authMode)));
  setAuthMode(qs('#authMode')?.value || 'signin');

  if(!validConfig() || !supabaseClient){
    setAuthGate(false);
    qs('#dbNotice')?.classList.remove('hidden');
    return;
  }

  try{
    const {data,error}=await supabaseClient.auth.getSession();
    if(error) console.warn('تعذر استعادة جلسة الدخول:',error.message);
    await applySession(data?.session||null);
  }catch(error){
    console.warn('خطأ أثناء استعادة جلسة الدخول:',error);
    setAuthGate(true);
  }

  if(authSubscription) authSubscription.unsubscribe();
  const {data}=supabaseClient.auth.onAuthStateChange((event,session)=>{
    currentUser=session?.user||null;
    window.currentUser=currentUser;
    setAuthGate(!currentUser);
    if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='INITIAL_SESSION'){
      setTimeout(syncProfile,0);
      if(currentUser) window.dispatchEvent(new CustomEvent('noor:user-ready',{detail:{user:currentUser}}));
    }
  });
  authSubscription=data?.subscription||null;
}

qs('#authForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!supabaseClient) return;
  clearAuthMessages();
  const email=qs('#authEmail')?.value.trim().toLowerCase();
  const password=qs('#authPassword')?.value||'';
  const mode=qs('#authMode')?.value || 'signin';
  const errorBox=qs('#authError');
  if(!email || !password){
    if(errorBox) errorBox.textContent='اكتب البريد الإلكتروني وكلمة المرور.';
    return;
  }
  if(password.length<8){
    if(errorBox) errorBox.textContent='كلمة المرور يجب ألا تقل عن 8 أحرف.';
    return;
  }

  try{
    setAuthLoading(true, mode==='signup'?'جاري إنشاء الحساب…':'جاري تسجيل الدخول…');
    if(mode==='signup'){
      const displayName=(qs('#authDisplayName')?.value.trim() || email.split('@')[0]).slice(0,60);
      const result=await supabaseClient.auth.signUp({email,password,options:{data:{display_name:displayName}}});
      if(result.error) throw result.error;
      const noIdentity=Array.isArray(result.data?.user?.identities) && result.data.user.identities.length===0;
      if(noIdentity){showAuthResult('هذا البريد مسجل بالفعل. اختر تسجيل الدخول أو استخدم نسيت كلمة المرور.','warning');return;}
      if(result.data?.session){await applySession(result.data.session);toast('تم إنشاء الحساب وتسجيل الدخول مباشرة');return;}
      const login=await supabaseClient.auth.signInWithPassword({email,password});
      if(login.error) throw login.error;
      if(login.data?.session){await applySession(login.data.session);toast('تم إنشاء الحساب وتسجيل الدخول مباشرة');return;}
      throw new Error('تعذر بدء جلسة الدخول بعد إنشاء الحساب.');
    }

    const result=await supabaseClient.auth.signInWithPassword({email,password});
    if(result.error) throw result.error;
    if(result.data?.session){
      await applySession(result.data.session);
      toast('تم تسجيل الدخول بنجاح');
    }
  }catch(error){
    if(errorBox) errorBox.textContent=authErrorArabic(error);
  }finally{
    setAuthLoading(false);
  }
});

qs('#forgotPassword')?.addEventListener('click',async()=>{
  const email=qs('#authEmail')?.value.trim().toLowerCase();
  if(!email) return toast('اكتب البريد أولًا');
  try{
    const redirectTo=new URL('reset-password.html',location.href).href;
    const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo});
    if(error) throw error;
    showAuthResult('تم إرسال رابط استعادة كلمة المرور إلى بريدك.','success',false);
  }catch(error){
    const box=qs('#authError');
    if(box) box.textContent=authErrorArabic(error);
  }
});

qs('#logoutBtn')?.addEventListener('click',async()=>{
  if(!supabaseClient) return;
  await supabaseClient.auth.signOut();
  currentUser=null;
  window.currentUser=null;
  setAuthGate(true);
  setAuthMode('signin');
});

initAuth();
