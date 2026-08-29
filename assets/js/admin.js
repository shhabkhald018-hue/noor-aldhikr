'use strict';

let adminUser=null;
let cloudContent=[];
let builtInLibrary=[];
let mergedLibrary=[];
let allProfiles=[];
let allReports=[];
let selectedReport=null;
let allAnnouncements=[];

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[ch]));
const fmtDate=value=>value?new Date(value).toLocaleString('ar-EG',{dateStyle:'medium',timeStyle:'short'}):'—';
const categoryLabels={morning:'الصباح',evening:'المساء',sleep:'النوم',wake:'الاستيقاظ',after_prayer:'بعد الصلاة',home:'المنزل',mosque:'المسجد',food:'الطعام',travel:'السفر',distress:'الهم والكرب',ruqyah:'الرقية الشرعية',general:'أذكار عامة',virtue:'فضل الذكر'};
const roleLabels={user:'مستخدم',editor:'محرر',admin:'مدير',owner:'المالك'};

function showPortalError(message){
  const box=qs('#portalError');
  if(box)box.textContent=message||'';
}

async function checkAdmin(){
  if(!validConfig()){
    showPortalError('أكمل بيانات المشروع الجديد في config.js أولاً.');
    return;
  }
  try{
    const {data,error}=await supabaseClient.auth.getSession();
    if(error)throw error;
    adminUser=data.session?.user||null;
    if(!adminUser)return;
    const {data:ok,error:permissionError}=await supabaseClient.rpc('is_current_user_admin');
    if(permissionError||!ok){
      await supabaseClient.auth.signOut();
      showPortalError('هذا الحساب لا يملك صلاحية البوابة الخاصة.');
      return;
    }
    qs('#portalGate')?.classList.add('hidden');
    qs('#portalApp')?.classList.remove('hidden');
    await loadDashboard();
  }catch(error){
    showPortalError(error?.message||'تعذر فتح بوابة المالك.');
  }
}

qs('#portalLogin')?.addEventListener('submit',async event=>{
  event.preventDefault();
  showPortalError('');
  const submit=event.currentTarget.querySelector('button[type="submit"]');
  if(submit){submit.disabled=true;submit.textContent='جاري تسجيل الدخول…';}
  try{
    const {error}=await supabaseClient.auth.signInWithPassword({
      email:qs('#pEmail').value.trim().toLowerCase(),
      password:qs('#pPassword').value
    });
    if(error)throw error;
    await checkAdmin();
  }catch(error){
    showPortalError(error?.message==='Invalid login credentials'?'البريد الإلكتروني أو كلمة المرور غير صحيحة.':error?.message);
  }finally{
    if(submit){submit.disabled=false;submit.textContent='تسجيل الدخول';}
  }
});

async function loadDashboard(){
  await loadSummary();
  await Promise.allSettled([
    loadUsers(),
    loadContent(),
    loadReports(),
    loadSettings(),
    loadAnnouncements()
  ]);
  await loadAdhkarLibrary();
  window.dispatchEvent(new CustomEvent('noor:admin-ready',{detail:{user:adminUser}}));
}

async function loadSummary(){
  const {data,error}=await supabaseClient.rpc('get_admin_dashboard_summary');
  if(error){console.warn(error.message);return;}
  const summary=data?.[0]||{};
  if(qs('#memberCount'))qs('#memberCount').textContent=summary.total_members||0;
  if(qs('#visitCount'))qs('#visitCount').textContent=summary.total_visits||0;
  if(qs('#reportCount'))qs('#reportCount').textContent=summary.open_reports||0;
  if(qs('#contentCount'))qs('#contentCount').textContent=summary.active_adhkar||0;
}

/* المستخدمون المسجلون */
async function loadUsers(){
  const {data,error}=await supabaseClient.from('profiles')
    .select('id,email,display_name,role,active,created_at,last_seen_at')
    .order('created_at',{ascending:false});
  if(error){
    toast('تعذر تحميل المستخدمين: '+error.message);
    return;
  }
  allProfiles=data||[];
  renderUsers();
}

function renderUsers(){
  const term=(qs('#userSearch')?.value||'').trim().toLowerCase();
  const rows=allProfiles.filter(user=>!term||`${user.email||''} ${user.display_name||''} ${user.role||''}`.toLowerCase().includes(term));
  const count=qs('#usersVisibleCount');
  if(count)count.textContent=`${rows.length} مستخدم`;
  const body=qs('#userRows');
  if(!body)return;
  body.innerHTML=rows.map(user=>`<tr>
    <td><strong>${esc(user.email||'بدون بريد')}</strong></td>
    <td>${esc(user.display_name||'—')}</td>
    <td><span class="owner-role role-${esc(user.role||'user')}">${esc(roleLabels[user.role]||user.role||'مستخدم')}</span></td>
    <td><span class="status-chip ${user.active?'status-active':'status-inactive'}">${user.active?'مفعّل':'موقوف'}</span></td>
    <td>${fmtDate(user.created_at)}</td>
    <td>${fmtDate(user.last_seen_at)}</td>
  </tr>`).join('')||'<tr><td colspan="6" class="muted">لا توجد نتائج مطابقة.</td></tr>';
}
qs('#userSearch')?.addEventListener('input',renderUsers);
qs('#reloadUsers')?.addEventListener('click',loadUsers);

/* الأذكار المضافة من المالك */
async function loadContent(){
  const {data,error}=await supabaseClient.from('adhkar_content').select('*').order('sort_order');
  if(error){toast(error.message);return;}
  cloudContent=data||[];
  const body=qs('#contentRows');
  if(body){
    body.innerHTML=cloudContent.map(item=>`<tr>
      <td>${esc(item.title)}</td><td>${esc(categoryLabels[item.category]||item.category)}</td><td>${item.repeat_count}</td>
      <td>${esc(item.source||'—')}</td><td>${item.active?'ظاهر':'مخفي'}</td>
      <td><button class="btn" type="button" onclick="editContent('${item.id}')">تعديل</button> <button class="btn danger" type="button" onclick="deleteContent('${item.id}')">حذف</button></td>
    </tr>`).join('')||'<tr><td colspan="6" class="muted">لا توجد أذكار سحابية مضافة بعد.</td></tr>';
  }
}

window.editContent=id=>{
  const item=cloudContent.find(row=>row.id===id);
  if(!item)return;
  qs('#cId').value=item.id;
  qs('#cTitle').value=item.title;
  qs('#cText').value=item.text;
  qs('#cCat').value=item.category;
  qs('#cRepeat').value=item.repeat_count;
  qs('#cSource').value=item.source||'';
  qs('#cBenefit').value=item.benefit||'';
  qs('#contentSubmit').textContent='حفظ التعديل';
  qs('#contentCancel').classList.remove('hidden');
  qs('#contentForm')?.scrollIntoView({behavior:'smooth',block:'start'});
};

function resetContentForm(){
  qs('#contentForm')?.reset();
  if(qs('#cId'))qs('#cId').value='';
  if(qs('#cRepeat'))qs('#cRepeat').value=1;
  if(qs('#contentSubmit'))qs('#contentSubmit').textContent='حفظ الذكر';
  qs('#contentCancel')?.classList.add('hidden');
}
qs('#contentCancel')?.addEventListener('click',resetContentForm);

qs('#contentForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const id=qs('#cId').value;
  const row={
    title:qs('#cTitle').value.trim(),
    text:qs('#cText').value.trim(),
    category:qs('#cCat').value,
    repeat_count:+qs('#cRepeat').value||1,
    source:qs('#cSource').value.trim(),
    benefit:qs('#cBenefit').value.trim(),
    active:true,
    updated_by:adminUser?.id||null,
    updated_at:new Date().toISOString()
  };
  if(!id)row.created_by=adminUser?.id||null;
  const query=id?supabaseClient.from('adhkar_content').update(row).eq('id',id):supabaseClient.from('adhkar_content').insert(row);
  const {error}=await query;
  if(error){toast(error.message);return;}
  resetContentForm();
  await loadContent();
  await loadAdhkarLibrary();
  await loadSummary();
  toast(id?'تم تعديل الذكر':'تمت إضافة الذكر');
});

window.deleteContent=async id=>{
  if(!confirm('حذف هذا الذكر السحابي؟ لن يُحذف أي ذكر من المكتبة الأساسية.'))return;
  const {error}=await supabaseClient.from('adhkar_content').delete().eq('id',id);
  if(error){toast(error.message);return;}
  await loadContent();
  await loadAdhkarLibrary();
  await loadSummary();
};

/* مكتبة جميع الأذكار */
async function loadAdhkarLibrary(){
  try{
    const response=await fetch('assets/data/adhkar-library.json?v=40.12',{cache:'no-store'});
    if(!response.ok)throw new Error('تعذر فتح ملف مكتبة الأذكار');
    const payload=await response.json();
    builtInLibrary=Array.isArray(payload.items)?payload.items:[];
    const categorySelect=qs('#libraryAdminCategory');
    if(categorySelect&&categorySelect.options.length===1){
      Object.entries(payload.categories||categoryLabels).forEach(([key,label])=>categorySelect.add(new Option(label,key)));
    }
    renderAllAdhkar();
  }catch(error){
    console.warn(error);
    const box=qs('#allAdhkarRows');
    if(box)box.innerHTML='<div class="notice">تعذر تحميل المكتبة الأساسية، لكن الأذكار السحابية ما زالت محفوظة.</div>';
  }
}

function renderAllAdhkar(){
  const builtin=builtInLibrary.map(item=>({...item,origin:'builtin',key:`builtin:${item.id}`}));
  const cloud=cloudContent.map(item=>({
    id:item.id,cat:item.category,title:item.title,text:item.text,target:item.repeat_count,
    source:item.source||'',benefit:item.benefit||'',active:item.active,origin:'cloud',key:`cloud:${item.id}`
  }));
  mergedLibrary=[...builtin,...cloud];
  const visibleTotal=builtin.length+cloud.filter(item=>item.active!==false).length;
  if(qs('#contentCount'))qs('#contentCount').textContent=visibleTotal;
  const term=(qs('#libraryAdminSearch')?.value||'').trim().toLowerCase();
  const category=qs('#libraryAdminCategory')?.value||'';
  const origin=qs('#libraryAdminOrigin')?.value||'';
  const rows=mergedLibrary.filter(item=>(!category||item.cat===category)&&(!origin||item.origin===origin)&&(!term||`${item.title} ${item.text} ${item.source} ${item.benefit}`.toLowerCase().includes(term)));
  const count=qs('#libraryTotalCount');
  if(count)count.textContent=`${rows.length} من ${mergedLibrary.length} ذكر`;
  const box=qs('#allAdhkarRows');
  if(!box)return;
  box.innerHTML=rows.map(item=>`<article class="admin-library-item">
    <div class="row between"><div><span class="dhikr-category">${esc(categoryLabels[item.cat]||item.cat)}</span><h3>${esc(item.title)}</h3></div><span class="origin-chip origin-${item.origin}">${item.origin==='builtin'?'أساسي':'إضافة المالك'}</span></div>
    <p class="admin-library-text">${esc(item.text)}</p>
    ${item.source?`<p class="small"><strong>المصدر:</strong> ${esc(item.source)}</p>`:''}
    ${item.benefit?`<p class="small library-benefit"><strong>الفضل:</strong> ${esc(item.benefit)}</p>`:''}
    <div class="row"><span class="muted small">التكرار: ${Number(item.target)||1}</span>
      <button class="btn" type="button" data-copy-library="${esc(item.key)}">${item.origin==='cloud'?'فتح للتعديل':'نسخ إلى نموذج الإضافة'}</button>
    </div>
  </article>`).join('')||'<div class="muted">لا توجد نتائج مطابقة.</div>';
  box.querySelectorAll('[data-copy-library]').forEach(button=>button.addEventListener('click',()=>copyLibraryItem(button.dataset.copyLibrary)));
}

function copyLibraryItem(key){
  const item=mergedLibrary.find(row=>row.key===key);
  if(!item)return;
  if(item.origin==='cloud'){
    editContent(item.id);
    return;
  }
  qs('#cId').value='';
  qs('#cTitle').value=item.title||'';
  qs('#cText').value=item.text||'';
  qs('#cCat').value=item.cat||'general';
  qs('#cRepeat').value=Number(item.target)||1;
  qs('#cSource').value=item.source||'';
  qs('#cBenefit').value=item.benefit||'';
  qs('#contentSubmit').textContent='حفظ نسخة سحابية';
  qs('#contentCancel').classList.remove('hidden');
  qs('#contentForm')?.scrollIntoView({behavior:'smooth',block:'start'});
  toast('تم نسخ الذكر إلى نموذج الإضافة دون تغيير الأصل');
}
['libraryAdminSearch','libraryAdminCategory','libraryAdminOrigin'].forEach(id=>qs('#'+id)?.addEventListener('input',renderAllAdhkar));

/* إعلانات صفحة المستخدمين */
function toLocalInput(value){
  if(!value)return'';
  const date=new Date(value);
  const offset=date.getTimezoneOffset()*60000;
  return new Date(date.getTime()-offset).toISOString().slice(0,16);
}
function toIsoOrNull(value){return value?new Date(value).toISOString():null;}

async function loadAnnouncements(){
  const {data,error}=await supabaseClient.from('announcements').select('*').order('created_at',{ascending:false});
  if(error){toast('تعذر تحميل الإعلانات: '+error.message);return;}
  allAnnouncements=data||[];
  renderAnnouncements();
}

function announcementState(item){
  const now=Date.now();
  if(!item.active)return'متوقف';
  if(item.starts_at&&new Date(item.starts_at).getTime()>now)return'مجدول';
  if(item.ends_at&&new Date(item.ends_at).getTime()<now)return'منتهي';
  return'ظاهر الآن';
}

function renderAnnouncements(){
  const box=qs('#announcementRows');
  if(!box)return;
  box.innerHTML=allAnnouncements.map(item=>`<article class="announcement-admin-card">
    <div class="row between"><div><h3>${esc(item.title)}</h3><span class="status-chip">${announcementState(item)}</span></div><div class="row"><button class="btn" type="button" onclick="editAnnouncement('${item.id}')">تعديل</button><button class="btn danger" type="button" onclick="deleteAnnouncement('${item.id}')">حذف</button></div></div>
    <p>${esc(item.body)}</p>
    <p class="muted small">البداية: ${fmtDate(item.starts_at)} · النهاية: ${fmtDate(item.ends_at)} · أُنشئ: ${fmtDate(item.created_at)}</p>
  </article>`).join('')||'<div class="muted">لا توجد إعلانات بعد.</div>';
}

function resetAnnouncementForm(){
  qs('#announcementForm')?.reset();
  if(qs('#announcementId'))qs('#announcementId').value='';
  if(qs('#announcementActive'))qs('#announcementActive').checked=true;
  if(qs('#announcementSubmit'))qs('#announcementSubmit').textContent='نشر الإعلان';
  qs('#announcementCancel')?.classList.add('hidden');
}

window.editAnnouncement=id=>{
  const item=allAnnouncements.find(row=>row.id===id);
  if(!item)return;
  qs('#announcementId').value=item.id;
  qs('#announcementTitle').value=item.title;
  qs('#announcementBody').value=item.body;
  qs('#announcementStarts').value=toLocalInput(item.starts_at);
  qs('#announcementEnds').value=toLocalInput(item.ends_at);
  qs('#announcementActive').checked=Boolean(item.active);
  qs('#announcementSubmit').textContent='حفظ تعديل الإعلان';
  qs('#announcementCancel').classList.remove('hidden');
  qs('#announcementForm')?.scrollIntoView({behavior:'smooth',block:'center'});
};
window.deleteAnnouncement=async id=>{
  if(!confirm('حذف هذا الإعلان نهائيًا؟'))return;
  const {error}=await supabaseClient.from('announcements').delete().eq('id',id);
  if(error){toast(error.message);return;}
  await loadAnnouncements();
  toast('تم حذف الإعلان');
};
qs('#announcementCancel')?.addEventListener('click',resetAnnouncementForm);
qs('#reloadAnnouncements')?.addEventListener('click',loadAnnouncements);
qs('#announcementForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const id=qs('#announcementId').value;
  const startsAt=toIsoOrNull(qs('#announcementStarts').value);
  const endsAt=toIsoOrNull(qs('#announcementEnds').value);
  if(startsAt&&endsAt&&new Date(endsAt)<=new Date(startsAt)){
    toast('نهاية الإعلان يجب أن تكون بعد البداية');
    return;
  }
  const row={
    title:qs('#announcementTitle').value.trim(),
    body:qs('#announcementBody').value.trim(),
    active:qs('#announcementActive').checked,
    starts_at:startsAt,
    ends_at:endsAt
  };
  if(!id)row.created_by=adminUser?.id||null;
  const query=id?supabaseClient.from('announcements').update(row).eq('id',id):supabaseClient.from('announcements').insert(row);
  const {error}=await query;
  if(error){toast(error.message);return;}
  resetAnnouncementForm();
  await loadAnnouncements();
  toast(id?'تم تعديل الإعلان':'تم نشر الإعلان');
});

/* البلاغات والاقتراحات */
const reportTypeLabels={issue:'بلاغ مشكلة',add_dhikr:'اقتراح إضافة ذكر',edit_dhikr:'اقتراح تعديل ذكر'};
const reportStatusLabels={open:'جديد',reviewing:'قيد المراجعة',needs_info:'يحتاج معلومات',approved:'مقبول',rejected:'غير معتمد',resolved:'تم الحل',published:'تم النشر'};
async function loadReports(){
  const {data,error}=await supabaseClient.from('reports').select('*').order('created_at',{ascending:false}).limit(300);
  if(error){toast(error.message);return;}
  allReports=data||[];
  renderAdminReports();
}
function renderAdminReports(){
  const term=(qs('#reportSearch')?.value||'').trim().toLowerCase();
  const type=qs('#reportTypeFilter')?.value||'';
  const status=qs('#reportStatusFilter')?.value||'';
  const rows=allReports.filter(item=>(!type||item.request_type===type)&&(!status||item.status===status)&&(!term||`${item.subject||''} ${item.details||''} ${item.dhikr_title||''} ${item.proposed_text||''}`.toLowerCase().includes(term)));
  const box=qs('#reportRows');
  if(!box)return;
  box.innerHTML=rows.map(item=>`<article class="admin-report-card" onclick="openReport('${item.id}')">
    <div class="row between"><strong>${esc(item.subject||'طلب دون عنوان')}</strong><span class="status-chip status-${esc(item.status)}">${esc(reportStatusLabels[item.status]||item.status)}</span></div>
    <div class="muted small">${esc(reportTypeLabels[item.request_type]||'بلاغ')} · ${fmtDate(item.created_at)} · الأولوية: ${esc(item.priority||'normal')}</div>
    <p>${esc((item.details||'').slice(0,220))}${(item.details||'').length>220?'…':''}</p>
  </article>`).join('')||'<div class="muted">لا توجد نتائج.</div>';
}
function closeReportModal(){
  const modal=qs('#reportModal');
  modal?.classList.add('hidden');
  modal?.classList.remove('show');
}
window.openReport=id=>{
  selectedReport=allReports.find(item=>item.id===id);
  if(!selectedReport)return;
  const item=selectedReport;
  qs('#manageReportId').value=item.id;
  qs('#manageStatus').value=item.status||'open';
  qs('#manageNotes').value=item.admin_notes||'';
  qs('#manageReply').value=item.admin_reply||'';
  qs('#reportDetail').innerHTML=`<div class="report-detail-grid">
    <div><strong>النوع:</strong> ${esc(reportTypeLabels[item.request_type]||item.request_type||'—')}</div>
    <div><strong>الأولوية:</strong> ${esc(item.priority||'normal')}</div>
    <div><strong>القسم:</strong> ${esc(item.category||'—')}</div>
    <div><strong>الذكر المرتبط:</strong> ${esc(item.dhikr_title||'—')}</div>
    <div style="grid-column:1/-1"><strong>الموضوع:</strong> ${esc(item.subject||'')}</div>
    <div style="grid-column:1/-1"><strong>التفاصيل:</strong><div class="detail-box">${esc(item.details||'')}</div></div>
    ${item.proposed_text?`<div style="grid-column:1/-1"><strong>النص المقترح:</strong><div class="detail-box dhikr-text">${esc(item.proposed_text)}</div></div>`:''}
    ${item.proposed_source?`<div style="grid-column:1/-1"><strong>المصدر المقترح:</strong> ${esc(item.proposed_source)}</div>`:''}
    ${item.proposed_repeat?`<div><strong>التكرار:</strong> ${Number(item.proposed_repeat)}</div>`:''}
  </div>`;
  qs('#createDhikrFromSuggestion')?.classList.toggle('hidden',item.request_type!=='add_dhikr');
  const modal=qs('#reportModal');
  modal?.classList.remove('hidden');
  modal?.classList.add('show');
};
qs('#closeReportModal')?.addEventListener('click',closeReportModal);
qs('#reportManageForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  const id=qs('#manageReportId').value;
  const status=qs('#manageStatus').value;
  const {error}=await supabaseClient.from('reports').update({
    status,
    admin_notes:qs('#manageNotes').value.trim(),
    admin_reply:qs('#manageReply').value.trim(),
    updated_at:new Date().toISOString(),
    resolved_at:['resolved','published','rejected'].includes(status)?new Date().toISOString():null
  }).eq('id',id);
  if(error){toast(error.message);return;}
  toast('تم حفظ المتابعة');
  closeReportModal();
  await loadReports();
  await loadSummary();
});
qs('#createDhikrFromSuggestion')?.addEventListener('click',()=>{
  if(!selectedReport)return;
  qs('#cTitle').value=selectedReport.metadata?.suggested_title||selectedReport.subject?.replace(/^إضافة ذكر:\s*/,'')||'';
  qs('#cText').value=selectedReport.proposed_text||'';
  qs('#cCat').value=selectedReport.category||'general';
  qs('#cRepeat').value=selectedReport.proposed_repeat||1;
  qs('#cSource').value=selectedReport.proposed_source||'';
  qs('#cBenefit').value='';
  closeReportModal();
  qs('#contentForm')?.scrollIntoView({behavior:'smooth',block:'start'});
  toast('تم نقل الاقتراح إلى نموذج إضافة الذكر للمراجعة');
});
['reportSearch','reportTypeFilter','reportStatusFilter'].forEach(id=>qs('#'+id)?.addEventListener('input',renderAdminReports));
qs('#reloadReports')?.addEventListener('click',loadReports);

/* الإعدادات الحالية */
async function loadSettings(){
  const {data,error}=await supabaseClient.from('app_settings').select('*');
  if(error){console.warn(error.message);return;}
  (data||[]).forEach(item=>{
    const element=qs(`[data-setting="${item.key}"]`);
    if(element)element.value=item.value||'';
  });
}
qs('#settingsForm')?.addEventListener('submit',async event=>{
  event.preventDefault();
  for(const element of qsa('[data-setting]')){
    const {error}=await supabaseClient.from('app_settings').upsert({
      key:element.dataset.setting,
      value:element.value,
      updated_by:adminUser?.id||null,
      updated_at:new Date().toISOString()
    },{onConflict:'key'});
    if(error){toast(error.message);return;}
  }
  toast('تم حفظ الإعدادات');
});

qs('#portalLogout')?.addEventListener('click',()=>supabaseClient.auth.signOut().then(()=>location.reload()));
checkAdmin();
