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

function getAuthClient(){
  return window.NOOR_GET_SUPABASE_CLIENT?.() || window.supabaseClient || null;
}

function updateAuthControls(){
  const button=qs('#logoutBtn');
  if(!button)return;
  const signedIn=!!currentUser;
  button.textContent=signedIn?'خروج':'دخول';
  button.setAttribute('aria-label',signedIn?'تسجيل الخروج':'فتح تسجيل الدخول');
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
  if(low.includes('email not confirmed')) return 'تم إنشاء الحساب، لكن البريد يحتاج إلى تأكيد. افتح رسالة التأكيد في بريدك ثم ارجع وسجّل الدخول.';
  if(low.includes('user already registered') || low.includes('already registered')) return 'هذا البريد مسجل بالفعل. اختر تسجيل الدخول بدل إنشاء حساب.';
  if(low.includes('password should be at least')) return 'كلمة المرور يجب ألا تقل عن 8 أحرف.';
  if(low.includes('signup is disabled')) return 'إنشاء الحسابات متوقف حاليًا من إعدادات المشروع.';
  if(low.includes('rate limit')) return 'تمت محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم أعد المحاولة.';
  if(low.includes('network') || low.includes('fetch') || low.includes('noor_timeout')) return 'تعذر الوصول إلى Supabase أو انتهت مهلة الاتصال. افحص الشبكة أو DNS ثم أعد المحاولة.';
  if(low.includes('redirect') && low.includes('not allowed')) return 'رابط الرجوع بعد تأكيد البريد غير مسموح به في إعدادات Supabase.';
  if(raw)console.warn('Auth technical detail:',raw);
  return 'تعذر إتمام العملية الآن. حاول مرة أخرى بعد قليل.';
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
  const client=getAuthClient();
  if(!currentUser || !client || !navigator.onLine) return;
  try{
    const displayName = currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || '';
    // إنشاء الصف يتم في قاعدة البيانات من خلال trigger/RPC آمن. لا يرسل المتصفح role أو active أو email.
    const ensure=await client.rpc('ensure_my_profile',{p_display_name:displayName.slice(0,60)});
    if(ensure.error && !/function .* does not exist|PGRST202/i.test(ensure.error.message||'')){
      console.warn('تعذر ضمان الملف الشخصي:',ensure.error.message);
    }
    const {error}=await client.from('profiles').update({
      display_name:displayName.slice(0,60),
      last_seen_at:new Date().toISOString()
    }).eq('id',currentUser.id);
    if(error) console.warn('تعذر تحديث الملف الشخصي:',error.message);
  }catch(error){
    console.warn('تعذر مزامنة الملف الشخصي:',error);
  }
}

async function applySession(session){
  currentUser=session?.user||null;
  window.currentUser=currentUser;
  // التصفح العام لا يتطلب حسابًا. نافذة الدخول تُفتح فقط بطلب المستخدم.
  setAuthGate(false);
  updateAuthControls();
  if(currentUser){
    setTimeout(syncProfile,0);
    window.dispatchEvent(new CustomEvent('noor:user-ready',{detail:{user:currentUser}}));
  }
}

async function initAuth(){
  qsa('[data-auth-mode]').forEach(btn=>btn.addEventListener('click',()=>setAuthMode(btn.dataset.authMode)));
  setAuthMode(qs('#authMode')?.value || 'signin');

  const client=getAuthClient();
  setAuthGate(false);
  updateAuthControls();
  if(!validConfig() || !client){
    setAuthGate(false);
    const notice=qs('#dbNotice');if(notice){notice.classList.remove('hidden');notice.textContent='المزايا السحابية غير جاهزة حاليًا. يمكنك تصفح المحتوى العام.'}
    return;
  }

  if(window.noorProbeSupabase){
    const probe=await window.noorProbeSupabase(8000);
    if(!probe.ok){
      // لا نحجب نموذج الدخول بسبب اختبار health؛ طلب Auth الفعلي قد يعطي تشخيصًا أدق.
      const notice=qs('#dbNotice');if(notice){notice.classList.remove('hidden');notice.textContent=probe.message+' سيظل المحتوى العام متاحًا، ويمكنك محاولة تسجيل الدخول لاختبار Auth مباشرة.'}
    }
  }

  try{
    const {data,error}=await (window.noorWithTimeout?window.noorWithTimeout(client.auth.getSession(),12000):client.auth.getSession());
    if(error) console.warn('تعذر استعادة جلسة الدخول:',error.message);
    await applySession(data?.session||null);
  }catch(error){
    console.warn('خطأ أثناء استعادة جلسة الدخول:',error);
    setAuthGate(false);
    updateAuthControls();
  }

  if(authSubscription) authSubscription.unsubscribe();
  const {data}=client.auth.onAuthStateChange((event,session)=>{
    currentUser=session?.user||null;
    window.currentUser=currentUser;
    setAuthGate(false);
    updateAuthControls();
    if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'||event==='INITIAL_SESSION'){
      setTimeout(syncProfile,0);
      if(currentUser) window.dispatchEvent(new CustomEvent('noor:user-ready',{detail:{user:currentUser}}));
    }
  });
  authSubscription=data?.subscription||null;
}

qs('#authForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const client=getAuthClient();
  if(!client){
    const box=qs('#authError');
    if(box)box.textContent='تسجيل الدخول غير متاح الآن، لكن يمكنك متابعة تصفح المحتوى العام.';
    return;
  }
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
      const emailRedirectTo=new URL('index.html',location.href).href;
      const request=client.auth.signUp({email,password,options:{emailRedirectTo,data:{display_name:displayName}}});
      const result=await (window.noorWithTimeout?window.noorWithTimeout(request,18000):request);
      if(result.error) throw result.error;
      const noIdentity=Array.isArray(result.data?.user?.identities) && result.data.user.identities.length===0;
      if(noIdentity){showAuthResult('هذا البريد مسجل بالفعل. اختر تسجيل الدخول أو استخدم نسيت كلمة المرور.','warning');return;}
      if(result.data?.session){await applySession(result.data.session);toast('تم إنشاء الحساب وتسجيل الدخول مباشرة');return;}
      const passwordInput=qs('#authPassword');
      if(passwordInput)passwordInput.value='';
      setAuthMode('signin');
      showAuthResult('تم إنشاء الحساب. أرسلنا رابط التأكيد إلى بريدك؛ افتحه ثم عد وسجّل الدخول.','success');
      setAuthGate(true);
      return;
    }

    const result=await (window.noorWithTimeout?window.noorWithTimeout(client.auth.signInWithPassword({email,password}),18000):client.auth.signInWithPassword({email,password}));
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
  const client=getAuthClient();
  if(!client)return toast('استعادة كلمة المرور غير متاحة الآن');
  const email=qs('#authEmail')?.value.trim().toLowerCase();
  if(!email) return toast('اكتب البريد أولًا');
  try{
    const redirectTo=new URL('reset-password.html',location.href).href;
    const {error}=await (window.noorWithTimeout?window.noorWithTimeout(client.auth.resetPasswordForEmail(email,{redirectTo}),18000):client.auth.resetPasswordForEmail(email,{redirectTo}));
    if(error) throw error;
    showAuthResult('تم إرسال رابط استعادة كلمة المرور إلى بريدك.','success',false);
  }catch(error){
    const box=qs('#authError');
    if(box) box.textContent=authErrorArabic(error);
  }
});

qs('#logoutBtn')?.addEventListener('click',async()=>{
  const client=getAuthClient();
  if(!currentUser){
    if(!client)return toast('تسجيل الدخول غير متاح الآن');
    setAuthGate(true);
    setAuthMode('signin');
    setTimeout(()=>qs('#authEmail')?.focus(),50);
    return;
  }
  if(client){
    try{await (window.noorWithTimeout?window.noorWithTimeout(client.auth.signOut(),12000):client.auth.signOut())}
    catch(error){console.warn('تعذر إكمال تسجيل الخروج عبر الشبكة:',error)}
  }
  currentUser=null;
  window.currentUser=null;
  setAuthGate(false);
  updateAuthControls();
  setAuthMode('signin');
});

qs('#authGate')?.addEventListener('click',event=>{
  if(event.target===event.currentTarget)setAuthGate(false);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape')setAuthGate(false);
});

initAuth();
