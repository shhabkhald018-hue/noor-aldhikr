'use strict';
(() => {
  const $=id=>document.getElementById(id); let sb=null,selectedUser=null,profileCache=[],ownerUserId='',connectionState='idle';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const msg=(id,text,type='error')=>{const x=$(id);if(!x)return;x.textContent=text||'';x.className=type};
  function explain(error){
    const raw=error?.message||String(error||'خطأ غير معروف');
    if(/NOOR_TIMEOUT|timed out|timeout|AbortError/i.test(raw)) return 'انتهت مهلة الاتصال بـ Supabase. جرّب إعادة الاختبار؛ وإذا تكرر ذلك افحص الشبكة أو DNS.';
    if(/PGRST205|42P01|schema cache|does not exist/i.test(raw)) return 'قاعدة البيانات ينقصها جدول أو دالة مطلوبة. استخدم تشخيص V82.0 ثم راجع حالة Supabase.';
    if(/Invalid login credentials/i.test(raw)) return 'البريد أو كلمة المرور غير صحيحة، أو الحساب غير موجود في Supabase Auth.';
    if(/Email not confirmed/i.test(raw)) return 'يجب تأكيد البريد الإلكتروني أولًا من إعدادات Supabase Auth أو رسالة التأكيد.';
    if(/Invalid API key|apikey|JWT/i.test(raw)) return 'تم الوصول إلى Supabase لكن مفتاح Publishable Key غير صحيح أو لا يخص هذا المشروع.';
    if(/Failed to fetch|NetworkError|fetch/i.test(raw)) return 'تعذر الوصول إلى نطاق Supabase. تأكد أولًا من أن رابط المشروع مطابق تمامًا للرابط الحقيقي في Supabase، ثم افحص الشبكة/DNS.';
    if(/permission|row-level|RLS|42501/i.test(raw)) return 'الاتصال ناجح لكن RLS/الصلاحيات تمنع العملية. قاعدة V82.0 مهيأة لتسمح للمالك النشط فقط.';
    return raw;
  }
  function timeout(promise,ms=15000,label='NOOR_TIMEOUT'){
    let timer;
    const guard=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label)),ms)});
    return Promise.race([promise,guard]).finally(()=>clearTimeout(timer));
  }
  function setDiag(text,type='muted'){
    const el=$('portalDiag');if(!el)return;el.textContent=text;el.className=type;
  }
  function validPortalConfig(){
    const cfg=window.NOOR_CONFIG||{};
    try{const u=new URL(cfg.supabaseUrl||'');return u.protocol==='https:'&&u.hostname.endsWith('.supabase.co')&&/^sb_publishable_/.test(cfg.publishableKey||'')}catch{return false}
  }
  async function probeSupabase(){
    const cfg=window.NOOR_CONFIG||{};
    if(!validPortalConfig()) return {ok:false,stage:'config',message:'إعدادات Supabase في config.js غير صحيحة أو غير مكتملة.'};
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),9000);
    try{
      const response=await fetch(cfg.supabaseUrl.replace(/\/$/,'')+'/auth/v1/health',{method:'GET',headers:{apikey:cfg.publishableKey},cache:'no-store',signal:ctrl.signal});
      clearTimeout(timer);
      if(response.status===401||response.status===403) return {ok:false,stage:'key',message:'وصلنا إلى Supabase لكن Publishable Key مرفوض.'};
      return {ok:true,stage:'network',status:response.status,message:'تم الوصول إلى نطاق Supabase بنجاح.'};
    }catch(error){
      clearTimeout(timer);
      if(error?.name==='AbortError') return {ok:false,stage:'timeout',message:'انتهت مهلة الوصول إلى Supabase. افحص الشبكة أو DNS.'};
      return {ok:false,stage:'network',message:'تعذر الوصول إلى نطاق Supabase. تأكد أن عنوان المشروع صحيح ثم افحص الشبكة/DNS.',error};
    }
  }
  function initClient(){
    if(!validPortalConfig()) throw new Error('إعدادات Supabase غير مكتملة أو غير صحيحة في assets/js/config.js.');
    if(!window.supabase?.createClient) throw new Error('تعذر تحميل مكتبة Supabase JS من CDN. افحص الاتصال بـ jsDelivr أو unpkg.');
    const cfg=window.NOOR_CONFIG;
    sb=window.supabase.createClient(cfg.supabaseUrl,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage}});
    window.supabaseClient=sb;
  }
  async function getOwner(){
    const {data:{user},error:uerr}=await timeout(sb.auth.getUser(),15000);
    if(uerr) throw uerr;
    if(!user)return {ok:false,reason:'لا توجد جلسة دخول.'};
    const {data:isOwner,error:ownerErr}=await timeout(sb.rpc('is_owner'),15000);
    if(ownerErr){return {ok:false,user,reason:'تعذر التحقق الآمن من صلاحية المالك: '+explain(ownerErr)};}else if(isOwner!==true){
      return {ok:false,user,reason:'تم تسجيل الدخول لكن الحساب لا يملك صلاحية Owner أو أنه غير نشط.'};
    }
    const {data:p,error:profileErr}=await timeout(sb.from('profiles').select('email,display_name,role,active').eq('id',user.id).maybeSingle(),15000);
    return {ok:true,user,profile:p||null,warning:profileErr?explain(profileErr):''};
  }
  async function boot(){
    msg('loginMsg','جاري التحقق من صلاحية المالك…','ok');
    try{
      const o=await getOwner();
      if(!o.ok){msg('loginMsg',o.reason);return;}
      $('ownerEmail').textContent=o.user.email||'';
      ownerUserId=o.user.id;window.NOOR_OWNER_ID=o.user.id;window.adminUser=o.user;
      $('gate').hidden=true;$('app').hidden=false;
      msg('loginMsg','');setDiag('✓ تم تسجيل دخول المالك والتحقق من الصلاحية.','ok');
      window.dispatchEvent(new CustomEvent('noor:admin-ready',{detail:{user:o.user,profile:o.profile}}));
      try{await timeout(refreshAll(o.warning),20000,'NOOR_TIMEOUT_REFRESH')}catch(err){
        const h=$('health');if(h){h.className='error';h.textContent='تم فتح لوحة المالك، لكن تحميل بعض بيانات اللوحة تأخر أو فشل: '+explain(err)}
      }
    }catch(err){msg('loginMsg',explain(err));}
  }
  async function safe(label,promise,fallback=[]){
    try{const {data,error}=await timeout(promise,15000,'NOOR_TIMEOUT_'+label);if(error)throw error;return {label,data:data??fallback,error:null}}catch(error){return {label,data:fallback,error}}
  }
  async function refreshAll(initialWarning=''){
    const results=await Promise.all([
      safe('profiles',sb.from('profiles').select('id,email,display_name,role,active,created_at,last_seen_at').order('created_at',{ascending:false})),
      safe('adhkar_content',sb.from('adhkar_content').select('id,title,category,active,reviewed,created_at').order('created_at',{ascending:false})),
      safe('announcements',sb.from('announcements').select('id,title,body,active,created_at').order('created_at',{ascending:false})),
      safe('app_settings',sb.from('app_settings').select('key,value,public'))
    ]);
    const [u,d,a,set]=results;profileCache=u.data||[];
    $('sUsers').textContent=u.error?'!':profileCache.length;$('sDhikr').textContent=d.error?'!':(d.data||[]).filter(x=>x.active).length;$('sAds').textContent=a.error?'!':(a.data||[]).filter(x=>x.active).length;
    const unread=await safe('unread',sb.rpc('get_owner_unread_private_count'),0);$('sUnread').textContent=unread.error?'!':String(unread.data||0);
    renderUsers();renderDhikr(d.data||[]);renderAds(a.data||[]);applySettings(set.data||[]);
    const errors=[...results,unread].filter(x=>x.error);
    if(errors.length){$('health').className='error';$('health').innerHTML=`هناك ${errors.length} مشكلة في ربط قاعدة البيانات:<ul>${errors.map(x=>`<li><b>${esc(x.label)}:</b> ${esc(explain(x.error))}</li>`).join('')}</ul><p><b>التشخيص:</b> قاعدة V82.0 مهيأة بالفعل. استخدم زر التشخيص لتحديد الجدول أو RPC الذي فشل.</p>`;}
    else{$('health').className='ok';$('health').textContent=initialWarning?`الدخول صحيح، مع تنبيه: ${initialWarning}`:'✓ Supabase Auth والجداول وRLS وRPC تعمل بشكل صحيح.';}
  }
  async function loadUsers(){const r=await safe('profiles',sb.from('profiles').select('id,email,display_name,role,active,created_at,last_seen_at').order('created_at',{ascending:false}));if(r.error){$('usersTable').textContent=explain(r.error);return}profileCache=r.data||[];renderUsers()}
  function renderUsers(){const h=$('usersTable');if(!h)return;h.innerHTML=profileCache.length?`<table class="tbl"><tr><th>البريد</th><th>الاسم</th><th>الدور</th><th>الحالة</th><th>آخر نشاط</th><th>حفظ</th></tr>${profileCache.map(x=>`<tr data-user-row="${x.id}"><td>${esc(x.email)}</td><td><input class="owner-user-name" value="${esc(x.display_name||'')}" maxlength="80"></td><td><select class="owner-user-role" ${x.id===ownerUserId?'disabled':''}><option value="user" ${x.role==='user'?'selected':''}>مستخدم</option><option value="owner" ${x.role==='owner'?'selected':''}>مالك</option></select></td><td><label><input class="owner-user-active" type="checkbox" ${x.active?'checked':''} ${x.id===ownerUserId?'disabled':''}> ${x.active?'نشط':'موقوف'}</label></td><td>${x.last_seen_at?new Date(x.last_seen_at).toLocaleString('ar-SA'):'—'}</td><td><button class="btn primary" data-user-save="${x.id}">حفظ</button></td></tr>`).join('')}</table>`:'<div class="empty">لا توجد حسابات.</div>';h.querySelectorAll('[data-user-save]').forEach(b=>b.onclick=()=>saveUser(b.dataset.userSave))}
  async function saveUser(id){const row=document.querySelector(`[data-user-row="${id}"]`),cur=profileCache.find(x=>x.id===id);if(!row||!cur)return;const update={display_name:row.querySelector('.owner-user-name').value.trim()};if(id!==ownerUserId){update.role=row.querySelector('.owner-user-role').value;update.active=row.querySelector('.owner-user-active').checked}const {error}=await sb.from('profiles').update(update).eq('id',id);if(error)return alert(explain(error));await loadUsers();alert('تم تحديث المستخدم')}
  async function loadDhikr(){const r=await safe('adhkar',sb.from('adhkar_content').select('*').order('created_at',{ascending:false}));if(r.error){$('dhikrTable').textContent=explain(r.error);return}renderDhikr(r.data||[])}
  function renderDhikr(data){const h=$('dhikrTable');if(!h)return;h.innerHTML=data.length?`<table class="tbl"><tr><th>العنوان</th><th>القسم</th><th>مراجعة</th><th>الحالة</th><th>إجراءات</th></tr>${data.map(x=>`<tr><td>${esc(x.title)}</td><td>${esc(x.category)}</td><td>${x.reviewed?'تمت':'تحتاج مراجعة'}</td><td>${x.active?'نشط':'متوقف'}</td><td><button class="btn ghost" data-dhikr-edit="${x.id}">تعديل</button> <button class="btn ghost" data-dhikr-toggle="${x.id}" data-active="${x.active?'1':'0'}">${x.active?'إيقاف':'تفعيل'}</button> <button class="btn danger" data-dhikr-delete="${x.id}">حذف</button></td></tr>`).join('')}</table>`:'<div class="empty">لا يوجد محتوى سحابي بعد.</div>';h.querySelectorAll('[data-dhikr-edit]').forEach(b=>b.onclick=()=>editDhikr(b.dataset.dhikrEdit));h.querySelectorAll('[data-dhikr-toggle]').forEach(b=>b.onclick=()=>toggleDhikr(b.dataset.dhikrToggle,b.dataset.active==='1'));h.querySelectorAll('[data-dhikr-delete]').forEach(b=>b.onclick=()=>deleteDhikr(b.dataset.dhikrDelete))}
  async function editDhikr(id){const {data,error}=await sb.from('adhkar_content').select('*').eq('id',id).single();if(error)return alert(explain(error));const title=prompt('العنوان',data.title);if(title===null)return;const category=prompt('القسم',data.category);if(category===null)return;const text=prompt('النص',data.text);if(text===null)return;const source=prompt('المصدر',data.source||'');if(source===null)return;const {error:e}=await sb.from('adhkar_content').update({title:title.trim(),category:category.trim(),text:text.trim(),source:source.trim(),reviewed:true,updated_at:new Date().toISOString()}).eq('id',id);if(e)return alert(explain(e));await loadDhikr()}
  async function toggleDhikr(id,active){const {error}=await sb.from('adhkar_content').update({active:!active,updated_at:new Date().toISOString()}).eq('id',id);if(error)return alert(explain(error));await loadDhikr()}
  async function deleteDhikr(id){if(!confirm('حذف هذا الذكر نهائيًا؟'))return;const {error}=await sb.from('adhkar_content').delete().eq('id',id);if(error)return alert(explain(error));await loadDhikr()}
  function renderAds(data){const h=$('adTable');if(!h)return;h.innerHTML=data.length?`<table class="tbl"><tr><th>العنوان</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th></tr>${data.map(x=>`<tr><td>${esc(x.title)}</td><td>${x.active?'نشط':'متوقف'}</td><td>${x.created_at?new Date(x.created_at).toLocaleString('ar-SA'):'—'}</td><td><button class="btn ghost" data-ad-edit="${x.id}">تعديل</button> <button class="btn ghost" data-ad-toggle="${x.id}" data-active="${x.active?'1':'0'}">${x.active?'إيقاف':'تفعيل'}</button> <button class="btn danger" data-ad-delete="${x.id}">حذف</button></td></tr>`).join('')}</table>`:'<div class="empty">لا توجد إعلانات.</div>';h.querySelectorAll('[data-ad-edit]').forEach(b=>b.onclick=()=>editAd(b.dataset.adEdit));h.querySelectorAll('[data-ad-toggle]').forEach(b=>b.onclick=()=>toggleAd(b.dataset.adToggle,b.dataset.active==='1'));h.querySelectorAll('[data-ad-delete]').forEach(b=>b.onclick=()=>deleteAd(b.dataset.adDelete))}
  async function editAd(id){const {data,error}=await sb.from('announcements').select('*').eq('id',id).single();if(error)return alert(explain(error));const title=prompt('عنوان الإعلان',data.title);if(title===null)return;const body=prompt('نص الإعلان',data.body);if(body===null)return;const {error:e}=await sb.from('announcements').update({title:title.trim(),body:body.trim(),updated_at:new Date().toISOString()}).eq('id',id);if(e)return alert(explain(e));await refreshAll()}
  async function toggleAd(id,active){const {error}=await sb.from('announcements').update({active:!active,updated_at:new Date().toISOString()}).eq('id',id);if(error)return alert(explain(error));await refreshAll()}
  async function deleteAd(id){if(!confirm('حذف الإعلان نهائيًا؟'))return;const {error}=await sb.from('announcements').delete().eq('id',id);if(error)return alert(explain(error));await refreshAll()}
  function applySettings(data){const m=Object.fromEntries(data.map(x=>[x.key,x.value]));$('homeMessage').value=m.home_message||'';$('announcement').value=m.announcement||''}
  async function loadConversations(){const r=await safe('private_messages',sb.from('private_messages').select('id,user_id,sender_id,sender_role,body,created_at,read_by_owner_at,read_by_user_at').order('created_at',{ascending:false}));if(r.error){$('conversationUsers').innerHTML=`<div class="error" style="padding:14px">${esc(explain(r.error))}</div>`;return}const ids=[...new Set(r.data.map(x=>x.user_id))];const people=profileCache.filter(x=>ids.includes(x.id));$('conversationUsers').innerHTML=people.length?people.map(x=>`<div class="user ${selectedUser===x.id?'sel':''}" data-user="${x.id}"><b>${esc(x.display_name||x.email||'مستخدم')}</b><div class="muted">${esc(x.email)}</div></div>`).join(''):'<div class="empty">لا توجد محادثات بعد.</div>';$('conversationUsers').querySelectorAll('[data-user]').forEach(x=>x.onclick=()=>selectUser(x.dataset.user));window._msgs=r.data}
  async function selectUser(id){selectedUser=id;await loadConversations();const p=profileCache.find(x=>x.id===id);$('chatHead').innerHTML='<b>'+esc(p?.display_name||'مستخدم')+'</b><div class="muted">'+esc(p?.email||'')+'</div>';const msgs=(window._msgs||[]).filter(x=>x.user_id===id).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));$('messagesList').innerHTML=msgs.length?msgs.map(x=>`<div class="bubble ${x.sender_role==='owner'?'mine':'theirs'}">${esc(x.body)}<div class="muted" style="font-size:11px;margin-top:5px">${new Date(x.created_at).toLocaleString('ar-SA')}</div></div>`).join(''):'<div class="empty">لا توجد رسائل.</div>';await sb.rpc('mark_owner_private_messages_read',{target_user_id:id})}
  function bind(){
    $('login').addEventListener('submit',async ev=>{ev.preventDefault();msg('loginMsg','جاري تسجيل الدخول…','ok');try{if(connectionState==='down'){const p=await probeSupabase();if(!p.ok)throw new Error(p.message);connectionState='up';setDiag('✓ اتصال Supabase متاح.','ok')}const {error}=await timeout(sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value}),18000);if(error)throw error;await boot()}catch(err){msg('loginMsg',explain(err))}});
    $('logout').onclick=async()=>{await sb.auth.signOut();location.reload()};
    document.querySelectorAll('.side button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.side button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.panel').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(b.dataset.tab).classList.add('active')});
    $('dhikrForm').onsubmit=async ev=>{ev.preventDefault();const {data:{user}}=await sb.auth.getUser();const {error}=await sb.from('adhkar_content').insert({title:$('dTitle').value,text:$('dText').value,category:$('dCat').value,source:$('dSource').value,created_by:user.id});msg('dMsg',error?explain(error):'تمت الإضافة بنجاح',error?'error':'ok');if(!error){ev.target.reset();await loadDhikr();await refreshAll()}};
    $('adForm').onsubmit=async ev=>{ev.preventDefault();const {data:{user}}=await sb.auth.getUser();const {error}=await sb.from('announcements').insert({title:$('aTitle').value,body:$('aBody').value,created_by:user.id});msg('aMsg',error?explain(error):'تم نشر الإعلان',error?'error':'ok');if(!error){ev.target.reset();await refreshAll()}};
    $('replyForm').onsubmit=async ev=>{ev.preventDefault();if(!selectedUser){alert('اختر مستخدمًا أولًا');return}const {error}=await sb.rpc('send_owner_private_message',{target_user_id:selectedUser,message_text:$('reply').value});if(error)alert(explain(error));else{$('reply').value='';await selectUser(selectedUser);await refreshAll()}};
    $('settingsForm').onsubmit=async ev=>{ev.preventDefault();const rows=[{key:'home_message',value:$('homeMessage').value,public:true},{key:'announcement',value:$('announcement').value,public:true}];const {error}=await sb.from('app_settings').upsert(rows);msg('setMsg',error?explain(error):'تم حفظ الإعدادات',error?'error':'ok')};
    window.loadUsers=loadUsers;window.loadConversations=loadConversations;window.selectUser=selectUser;
  }
  async function checkConnectionAndPrepare(){
    setDiag('جاري فحص نطاق Supabase…','muted');
    const probe=await probeSupabase();
    if(!probe.ok){connectionState='down';setDiag('✗ '+probe.message,'error');return false;}
    connectionState='up';setDiag('✓ '+probe.message,'ok');return true;
  }
  async function init(){
    try{
      initClient();bind();
      $('portalRetry')?.addEventListener('click',async()=>{
        const ok=await checkConnectionAndPrepare();
        if(ok){try{const {data:{session}}=await timeout(sb.auth.getSession(),12000);if(session)await boot()}catch(err){msg('loginMsg',explain(err))}}
      });
      const reachable=await checkConnectionAndPrepare();
      if(!reachable)return;
      const {data:{session},error}=await timeout(sb.auth.getSession(),12000);
      if(error)throw error;
      if(session)await boot();
    }catch(err){msg('loginMsg',explain(err));setDiag(explain(err),'error');}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  async function loadLearningV49(){
    if(!$('lStudents'))return;
    const st=await safe('learning_stats',sb.rpc('owner_learning_stats'),{});
    if(st.error){$('learningTable').textContent=explain(st.error);return}
    const x=st.data||{};$('lStudents').textContent=x.students??0;$('lDone').textContent=x.completed_lessons??0;$('lAttempts').textContent=x.exam_attempts??0;$('lAvg').textContent=(x.avg_exam??0)+'%';
    const r=await safe('exam_attempts',sb.from('exam_attempts').select('user_id,scope,score,total,percent,created_at').order('created_at',{ascending:false}).limit(50));
    $('learningTable').innerHTML=r.error?esc(explain(r.error)):(r.data?.length?'<table class="tbl"><tr><th>المستخدم</th><th>الاختبار</th><th>النتيجة</th><th>التاريخ</th></tr>'+r.data.map(a=>`<tr><td>${esc(profileCache.find(p=>p.id===a.user_id)?.email||a.user_id)}</td><td>${esc(a.scope)}</td><td>${a.score}/${a.total} · ${a.percent}%</td><td>${new Date(a.created_at).toLocaleString('ar-SA')}</td></tr>`).join('')+'</table>':'<div class="empty">لا توجد محاولات بعد.</div>');
  }
  async function loadCmsV49(){
    if(!$('cmsLessons'))return;const r=await safe('academy_lessons',sb.from('academy_lessons').select('id,subject,title,active,created_at').order('created_at',{ascending:false}).limit(50));
    $('cmsLessons').innerHTML=r.error?esc(explain(r.error)):(r.data?.length?'<table class="tbl"><tr><th>المادة</th><th>الدرس</th><th>الحالة</th><th></th></tr>'+r.data.map(a=>`<tr><td>${esc(a.subject)}</td><td>${esc(a.title)}</td><td>${a.active?'منشور':'موقوف'}</td><td><button class="btn danger cmsDel" data-id="${a.id}">حذف</button></td></tr>`).join('')+'</table>':'<div class="empty">لا توجد دروس CMS بعد.</div>');
    $('cmsLessons').querySelectorAll('.cmsDel').forEach(b=>b.onclick=async()=>{if(!confirm('حذف الدرس؟'))return;const {error}=await sb.from('academy_lessons').delete().eq('id',b.dataset.id);if(error)alert(explain(error));else loadCmsV49()});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('refreshLearning')?.addEventListener('click',loadLearningV49);
    $('lessonCmsForm')?.addEventListener('submit',async ev=>{ev.preventDefault();const row={subject:$('cmsSubject').value,title:$('cmsTitle').value.trim(),summary:$('cmsSummary').value.trim(),body:$('cmsBody').value.trim(),reference_text:$('cmsRef').value.trim(),active:true};const {error}=await sb.from('academy_lessons').insert(row);msg('cmsMsg',error?explain(error):'تمت إضافة الدرس.',error?'error':'ok');if(!error){ev.target.reset();loadCmsV49()}});
    document.querySelectorAll('[data-tab="learning"]').forEach(b=>b.addEventListener('click',loadLearningV49));
    document.querySelectorAll('[data-tab="academyCms"]').forEach(b=>b.addEventListener('click',loadCmsV49));
  });

  const V817_SUBJECTS={creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة النبوية',hadith:'الحديث'};
  const V817_STATUS={draft:'مسودة',review:'قيد المراجعة',approved:'تمت المراجعة',published:'منشور'};
  let v50Lessons=[],v50Questions=[];

  function v50ResetLesson(){
    $('v50LessonForm')?.reset();if($('v50LessonId'))$('v50LessonId').value='';if($('v50LessonCancel'))$('v50LessonCancel').hidden=true;msg('v50LessonMsg','');
  }
  function v50ResetQuestion(){
    $('v50QuestionForm')?.reset();if($('v50QuestionId'))$('v50QuestionId').value='';if($('v50QuestionCancel'))$('v50QuestionCancel').hidden=true;msg('v50QuestionMsg','');
  }
  async function v50SetState(kind,id,status){
    const {error}=await sb.rpc('set_content_review_state',{p_kind:kind,p_id:id,p_status:status});
    if(error)throw error;
  }
  async function v50LoadCms(){
    if(!$('v50LessonsTable'))return;
    const [lr,qr]=await Promise.all([
      safe('academy_lessons',sb.from('academy_lessons').select('id,subject,title,summary,body,reference_text,review_status,active,sort_order,created_at,updated_at').order('updated_at',{ascending:false}).limit(200)),
      safe('academy_questions',sb.from('academy_questions').select('id,subject,lesson_id,question,options,correct_index,explanation,difficulty,review_status,active,created_at,updated_at').order('updated_at',{ascending:false}).limit(300))
    ]);
    v50Lessons=lr.data||[];v50Questions=qr.data||[];
    v50RenderLessons(lr.error);v50RenderQuestions(qr.error);v50FillLessonSelect();
  }
  function v50StatusBadge(s){return `<span class="badge">${esc(V817_STATUS[s]||s||'—')}</span>`}
  function v50RenderLessons(error){
    const h=$('v50LessonsTable');if(!h)return;if(error){h.textContent=explain(error);return}
    h.innerHTML=v50Lessons.length?`<table class="tbl"><tr><th>المادة</th><th>الدرس</th><th>الحالة</th><th>الإجراءات</th></tr>${v50Lessons.map(x=>`<tr><td>${esc(V817_SUBJECTS[x.subject]||x.subject)}</td><td><b>${esc(x.title)}</b><br><small class="muted">${esc((x.summary||'').slice(0,90))}</small></td><td>${v50StatusBadge(x.review_status)}</td><td><button class="btn ghost v50EditLesson" data-id="${x.id}">تعديل</button> <button class="btn danger v50DeleteLesson" data-id="${x.id}">حذف</button></td></tr>`).join('')}</table>`:'<div class="empty">لا توجد دروس مضافة في قاعدة البيانات.</div>';
    h.querySelectorAll('.v50EditLesson').forEach(b=>b.onclick=()=>v50EditLesson(b.dataset.id));
    h.querySelectorAll('.v50DeleteLesson').forEach(b=>b.onclick=()=>v50DeleteLesson(b.dataset.id));
  }
  function v50RenderQuestions(error){
    const h=$('v50QuestionsTable');if(!h)return;if(error){h.textContent=explain(error);return}
    h.innerHTML=v50Questions.length?`<table class="tbl"><tr><th>المادة</th><th>السؤال</th><th>المستوى</th><th>الحالة</th><th>الإجراءات</th></tr>${v50Questions.map(x=>`<tr><td>${esc(V817_SUBJECTS[x.subject]||x.subject)}</td><td><b>${esc(x.question)}</b></td><td>${esc(x.difficulty)}</td><td>${v50StatusBadge(x.review_status)}</td><td><button class="btn ghost v50EditQuestion" data-id="${x.id}">تعديل</button> <button class="btn danger v50DeleteQuestion" data-id="${x.id}">حذف</button></td></tr>`).join('')}</table>`:'<div class="empty">لا توجد أسئلة مضافة في قاعدة البيانات.</div>';
    h.querySelectorAll('.v50EditQuestion').forEach(b=>b.onclick=()=>v50EditQuestion(b.dataset.id));
    h.querySelectorAll('.v50DeleteQuestion').forEach(b=>b.onclick=()=>v50DeleteQuestion(b.dataset.id));
  }
  function v50FillLessonSelect(){
    const s=$('v50QuestionLesson');if(!s)return;const current=s.value;
    s.innerHTML='<option value="">بدون ربط</option>'+v50Lessons.map(x=>`<option value="${x.id}">${esc(V817_SUBJECTS[x.subject]||x.subject)} — ${esc(x.title)}</option>`).join('');
    if([...s.options].some(o=>o.value===current))s.value=current;
  }
  function v50EditLesson(id){
    const x=v50Lessons.find(a=>a.id===id);if(!x)return;
    $('v50LessonId').value=x.id;$('v50LessonSubject').value=x.subject;$('v50LessonStatus').value=x.review_status||'draft';$('v50LessonTitle').value=x.title||'';$('v50LessonSummary').value=x.summary||'';$('v50LessonBody').value=x.body||'';$('v50LessonRef').value=x.reference_text||'';$('v50LessonCancel').hidden=false;
    $('v50LessonForm').scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function v50DeleteLesson(id){
    if(!confirm('سيتم حذف الدرس. إذا كانت أسئلة مرتبطة به فسيتم فقط فك الارتباط وفق إعداد قاعدة البيانات. هل تريد المتابعة؟'))return;
    const {error}=await sb.from('academy_lessons').delete().eq('id',id);if(error)return alert(explain(error));v50ResetLesson();await v50LoadCms();
  }
  async function v50SaveLesson(ev){
    ev.preventDefault();const id=$('v50LessonId').value,status=$('v50LessonStatus').value;
    const row={subject:$('v50LessonSubject').value,title:$('v50LessonTitle').value.trim(),summary:$('v50LessonSummary').value.trim(),body:$('v50LessonBody').value.trim(),reference_text:$('v50LessonRef').value.trim(),active:true};
    msg('v50LessonMsg','جاري الحفظ…','ok');
    try{
      let savedId=id;
      if(id){const {error}=await sb.from('academy_lessons').update({...row,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error}
      else{const {data,error}=await sb.from('academy_lessons').insert({...row,review_status:'draft'}).select('id').single();if(error)throw error;savedId=data.id}
      await v50SetState('lesson',savedId,status);msg('v50LessonMsg','تم حفظ الدرس وحالة المراجعة.','ok');v50ResetLesson();await v50LoadCms();
    }catch(error){msg('v50LessonMsg',explain(error),'error')}
  }
  function v50EditQuestion(id){
    const x=v50Questions.find(a=>a.id===id);if(!x)return;
    const opts=Array.isArray(x.options)?x.options:[];
    $('v50QuestionId').value=x.id;$('v50QuestionSubject').value=x.subject;$('v50QuestionDifficulty').value=x.difficulty||'متوسط';$('v50QuestionStatus').value=x.review_status||'draft';$('v50QuestionLesson').value=x.lesson_id||'';$('v50QuestionText').value=x.question||'';
    [0,1,2,3].forEach(i=>{$(`v50Opt${i}`).value=opts[i]||''});$('v50Correct').value=String(x.correct_index??0);$('v50Explanation').value=x.explanation||'';$('v50QuestionCancel').hidden=false;
    $('v50QuestionForm').scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function v50DeleteQuestion(id){
    if(!confirm('حذف السؤال نهائيًا؟'))return;const {error}=await sb.from('academy_questions').delete().eq('id',id);if(error)return alert(explain(error));v50ResetQuestion();await v50LoadCms();
  }
  async function v50SaveQuestion(ev){
    ev.preventDefault();const id=$('v50QuestionId').value,status=$('v50QuestionStatus').value;
    const options=[0,1,2,3].map(i=>$(`v50Opt${i}`).value.trim());
    if(new Set(options.map(x=>x.toLocaleLowerCase('ar'))).size!==4){msg('v50QuestionMsg','الاختيارات الأربعة يجب أن تكون مختلفة.','error');return}
    const row={subject:$('v50QuestionSubject').value,lesson_id:$('v50QuestionLesson').value||null,question:$('v50QuestionText').value.trim(),options,correct_index:+$('v50Correct').value,explanation:$('v50Explanation').value.trim(),difficulty:$('v50QuestionDifficulty').value,active:true};
    msg('v50QuestionMsg','جاري الحفظ…','ok');
    try{
      let savedId=id;
      if(id){const {error}=await sb.from('academy_questions').update({...row,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error}
      else{const {data,error}=await sb.from('academy_questions').insert({...row,review_status:'draft'}).select('id').single();if(error)throw error;savedId=data.id}
      await v50SetState('question',savedId,status);msg('v50QuestionMsg','تم حفظ السؤال وحالة المراجعة.','ok');v50ResetQuestion();await v50LoadCms();
    }catch(error){msg('v50QuestionMsg',explain(error),'error')}
  }
  async function v50RlsCheck(){
    const h=$('v50RlsResult');if(!h)return;h.className='muted';h.textContent='جاري تشغيل تشخيص V82.0…';
    const primary=await safe('owner_portal_diagnostics',sb.rpc('owner_portal_diagnostics'),null);
    if(!primary.error){h.className='ok';h.textContent='✓ تشخيص V82.0 ناجح: '+JSON.stringify(primary.data);return;}
    const fallback=await safe('owner_rls_diagnostics',sb.rpc('owner_rls_diagnostics'),null);
    if(fallback.error){h.className='error';h.textContent=explain(primary.error)+' | '+explain(fallback.error);return}
    h.className='ok';h.textContent='✓ تشخيص RLS القديم ناجح: '+JSON.stringify(fallback.data);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    $('v50LessonForm')?.addEventListener('submit',v50SaveLesson);
    $('v50QuestionForm')?.addEventListener('submit',v50SaveQuestion);
    $('v50LessonCancel')?.addEventListener('click',v50ResetLesson);
    $('v50QuestionCancel')?.addEventListener('click',v50ResetQuestion);
    $('v50ReloadCms')?.addEventListener('click',v50LoadCms);
    $('v50RlsCheck')?.addEventListener('click',v50RlsCheck);
    document.querySelectorAll('[data-tab="academyCms"]').forEach(b=>b.addEventListener('click',v50LoadCms));
    document.querySelectorAll('[data-cms-mode]').forEach(b=>b.addEventListener('click',()=>{
      const lessons=b.dataset.cmsMode==='lessons';$('v50LessonsPane').hidden=!lessons;$('v50QuestionsPane').hidden=lessons;
      document.querySelectorAll('[data-cms-mode]').forEach(x=>{x.classList.toggle('primary',x===b);x.classList.toggle('ghost',x!==b)});
    }));
  });
})();
