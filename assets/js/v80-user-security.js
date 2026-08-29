
'use strict';
(()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=s=>document.querySelector(s);

  function validClient(){ return !!window.supabaseClient; }

  async function readProfile(){
    if(!window.currentUser || !validClient()) return null;
    const {data,error}=await window.supabaseClient
      .from('profiles')
      .select('email,display_name,role,active,last_seen_at,created_at')
      .eq('id',window.currentUser.id)
      .maybeSingle();
    if(error){ console.warn('V80 profile security read:',error.message); return null; }
    return data;
  }

  async function mount(){
    const host=document.getElementById('studentDashboard');
    if(!host || !window.currentUser || host.querySelector('#v80UserSecurity')) return;
    const p=await readProfile();
    const email=p?.email || window.currentUser.email || '';
    const role=p?.role || 'user';
    const active=p?.active !== false;
    const card=document.createElement('section');
    card.id='v80UserSecurity';
    card.className='student-card v80-security-card';
    card.innerHTML=`
      <div>
        <span>V80 · أمان الحساب</span>
        <h2>مركز أمان حسابك</h2>
        <p class="muted">إدارة الجلسة وكلمة المرور وحالة الحساب بدون كشف أي مفاتيح سرية.</p>
      </div>
      <div class="v80-security-grid">
        <div class="v80-security-item"><b>البريد</b><small>${esc(email)}</small></div>
        <div class="v80-security-item"><b>نوع الحساب</b><small>${role==='owner'?'مالك':'مستخدم'}</small></div>
        <div class="v80-security-item"><b>حالة الحساب</b><small class="${active?'v80-secure-ok':'v80-secure-danger'}">${active?'نشط':'موقوف'}</small></div>
        <div class="v80-security-item"><b>حماية البيانات</b><small class="v80-secure-ok">RLS على الخادم</small></div>
      </div>
      <div class="v80-security-actions">
        <button class="btn" id="v80ResetPassword" type="button">إرسال رابط تغيير كلمة المرور</button>
        <button class="btn danger" id="v80GlobalLogout" type="button">تسجيل الخروج من جميع الأجهزة</button>
      </div>
      <div id="v80UserSecurityMsg" class="muted" style="margin-top:10px"></div>
    `;
    host.appendChild(card);

    card.querySelector('#v80ResetPassword')?.addEventListener('click',async()=>{
      const m=card.querySelector('#v80UserSecurityMsg');
      try{
        const redirectTo=new URL('reset-password.html',location.href).href;
        const {error}=await window.supabaseClient.auth.resetPasswordForEmail(email,{redirectTo});
        if(error) throw error;
        m.textContent='تم إرسال رابط تغيير كلمة المرور إلى بريدك.';
        m.className='v80-secure-ok';
      }catch(e){
        m.textContent='تعذر إرسال الرابط الآن.';
        m.className='v80-secure-danger';
      }
    });

    card.querySelector('#v80GlobalLogout')?.addEventListener('click',async()=>{
      if(!confirm('سيتم تسجيل خروج الحساب من كل الجلسات المتاحة. متابعة؟')) return;
      const m=card.querySelector('#v80UserSecurityMsg');
      try{
        const {error}=await window.supabaseClient.auth.signOut({scope:'global'});
        if(error) throw error;
        location.reload();
      }catch(e){
        m.textContent='تعذر إنهاء كل الجلسات. جرّب تسجيل الخروج العادي.';
        m.className='v80-secure-danger';
      }
    });
  }

  window.addEventListener('noor:user-ready',()=>setTimeout(mount,350));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,900));
})();
