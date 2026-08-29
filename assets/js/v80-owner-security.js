
'use strict';
(()=>{
  let idleTimer=null;
  const idleMs=()=>Math.max(10,Number(window.NOOR_CONFIG?.ownerIdleMinutes||30))*60*1000;

  async function forceOwnerLogout(){
    try{ await window.supabaseClient?.auth?.signOut(); }catch(e){}
    location.reload();
  }
  function resetIdle(){
    clearTimeout(idleTimer);
    idleTimer=setTimeout(forceOwnerLogout,idleMs());
  }
  ['click','keydown','mousemove','touchstart','scroll'].forEach(evt=>
    window.addEventListener(evt,resetIdle,{passive:true})
  );

  async function mount(){
    const host=document.querySelector('#overview .cardx');
    if(!host || document.getElementById('v80OwnerSecurity')) return;
    const card=document.createElement('div');
    card.id='v80OwnerSecurity';
    card.className='v80-security-card';
    card.innerHTML=`
      <h2>مركز أمان المالك V80</h2>
      <div class="v80-security-grid">
        <div class="v80-security-item"><b>التحقق من المالك</b><small class="v80-secure-ok">RPC + RLS من قاعدة البيانات</small></div>
        <div class="v80-security-item"><b>جلسة الإدارة</b><small>إغلاق تلقائي بعد ${Math.round(idleMs()/60000)} دقيقة خمول</small></div>
        <div class="v80-security-item"><b>تغيير الدور</b><small class="v80-secure-ok">محمي من المستخدم العادي</small></div>
        <div class="v80-security-item"><b>آخر مالك</b><small class="v80-secure-ok">محمي من الإلغاء بالخطأ</small></div>
        <div class="v80-security-item"><b>سجل الإدارة</b><small class="v80-secure-ok">Security Audit داخل قاعدة البيانات</small></div>
      </div>
      <p class="muted" style="margin-top:12px">لا توجد أي Service Role أو مفاتيح سرية داخل ملفات GitHub. المفتاح المنشور هو Publishable فقط.</p>
    `;
    host.appendChild(card);
    resetIdle();
  }

  window.addEventListener('noor:admin-ready',mount);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,900));
})();
