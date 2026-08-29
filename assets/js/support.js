
const SUPPORT_TYPE_LABELS={
 issue:'بلاغ مشكلة',add_dhikr:'اقتراح إضافة ذكر',edit_dhikr:'اقتراح تعديل ذكر'
};
const SUPPORT_STATUS_LABELS={
 open:'جديد',reviewing:'قيد المراجعة',needs_info:'يحتاج معلومات',approved:'مقبول',
 rejected:'غير معتمد',resolved:'تم الحل',published:'تم النشر'
};

function switchSupportTab(name){
  qsa('[data-support-tab]').forEach(b=>{
    b.classList.toggle('primary',b.dataset.supportTab===name);
    b.classList.toggle('active',b.dataset.supportTab===name);
  });
  const ids={issue:'supportIssue',add:'supportAdd',edit:'supportEdit',my:'supportMy'};
  Object.entries(ids).forEach(([k,id])=>qs('#'+id)?.classList.toggle('hidden',k!==name));
  if(name==='my')loadMyReports();
}
qsa('[data-support-tab]').forEach(b=>b.onclick=()=>switchSupportTab(b.dataset.supportTab));

function supportDeviceInfo(){
  return {
    user_agent:navigator.userAgent,
    language:navigator.language,
    platform:navigator.userAgentData?.platform||navigator.platform||'',
    viewport:`${innerWidth}x${innerHeight}`,
    online:navigator.onLine,
    app_version:window.ADHKAR_VERSION||'16.0.0',
    page:location.pathname,
    recorded_at:new Date().toISOString()
  };
}
async function currentUserId(){
  if(!supabaseClient)return null;
  const {data}=await supabaseClient.auth.getUser();
  return data.user?.id||null;
}
function makeLocalRequest(row){
  const rows=load('pending_support_requests',[]);
  const local={...row,id:'local_'+Date.now(),status:'waiting_sync',created_at:new Date().toISOString()};
  rows.unshift(local);store('pending_support_requests',rows);return local;
}
async function sendSupportRequest(payload){
  const uid=await currentUserId();
  const row={
    user_id:uid,
    request_type:payload.request_type,
    subject:payload.subject.trim(),
    details:payload.details.trim(),
    status:'open',
    priority:payload.priority||'normal',
    category:payload.category||'',
    dhikr_id:payload.dhikr_id||null,
    dhikr_title:payload.dhikr_title||'',
    proposed_text:payload.proposed_text||'',
    proposed_source:payload.proposed_source||'',
    proposed_repeat:payload.proposed_repeat||null,
    metadata:payload.metadata||{}
  };
  if(!supabaseClient||!navigator.onLine){
    makeLocalRequest(row);
    toast('تم حفظ الطلب على جهازك وسيظهر ضمن الطلبات المحلية');
    return {local:true};
  }
  const {error}=await supabaseClient.from('reports').insert(row);
  if(error){
    console.error(error);
    makeLocalRequest(row);
    toast('تعذر الإرسال الآن؛ تم حفظ الطلب محليًا');
    return {local:true,error};
  }
  toast('تم إرسال طلبك بنجاح');
  return {local:false};
}
async function syncPendingSupport(){
  if(!supabaseClient||!navigator.onLine)return;
  const rows=load('pending_support_requests',[]);
  if(!rows.length)return;
  const uid=await currentUserId();
  const remaining=[];
  for(const x of rows){
    const row={...x,user_id:uid,status:'open'};
    delete row.id;delete row.created_at;
    const {error}=await supabaseClient.from('reports').insert(row);
    if(error)remaining.push(x);
  }
  store('pending_support_requests',remaining);
  if(rows.length!==remaining.length)toast('تمت مزامنة الطلبات المحفوظة');
}
window.addEventListener('online',syncPendingSupport);
setTimeout(syncPendingSupport,1200);

qs('#issueForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const meta=qs('#includeDeviceInfo').checked?supportDeviceInfo():{};
  await sendSupportRequest({
    request_type:'issue',
    subject:qs('#issueSubject').value,
    details:qs('#issueDetails').value,
    priority:qs('#issuePriority').value,
    category:qs('#issueType').value,
    dhikr_id:qs('#issueDhikrId').value||null,
    dhikr_title:qs('#issueDhikrTitle').value,
    metadata:meta
  });
  e.target.reset();qs('#includeDeviceInfo').checked=true;
  qs('#linkedDhikrIssue').classList.add('hidden');
  qs('#issueDhikrId').value='';qs('#issueDhikrTitle').value='';
});
qs('#addSuggestionForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  await sendSupportRequest({
    request_type:'add_dhikr',
    subject:`إضافة ذكر: ${qs('#suggestTitle').value}`,
    details:qs('#suggestReason').value||'اقتراح إضافة ذكر جديد',
    category:qs('#suggestCategory').value,
    proposed_text:qs('#suggestText').value,
    proposed_source:qs('#suggestSource').value,
    proposed_repeat:+qs('#suggestRepeat').value||1,
    metadata:{suggested_title:qs('#suggestTitle').value}
  });
  e.target.reset();qs('#suggestRepeat').value=1;
});
qs('#editSuggestionForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  await sendSupportRequest({
    request_type:'edit_dhikr',
    subject:`تعديل ذكر: ${qs('#editDhikrTitle').value}`,
    details:`نوع التعديل: ${qs('#editType').value}\nالسبب: ${qs('#editReason').value}`,
    dhikr_id:qs('#editDhikrId').value||null,
    dhikr_title:qs('#editDhikrTitle').value,
    proposed_text:qs('#editProposed').value,
    proposed_source:qs('#editSource').value,
    metadata:{edit_type:qs('#editType').value}
  });
  e.target.reset();qs('#linkedDhikrEdit').classList.add('hidden');
});

window.openDhikrReport=id=>{
  const x=window.getDhikrById?.(id);
  if(!x){toast('تعذر فتح نموذج الإبلاغ، أعد تحميل الصفحة');return;}
  navTo('support');switchSupportTab('issue');
  qs('#issueDhikrId').value=x.id;qs('#issueDhikrTitle').value=x.title;
  qs('#issueSubject').value=`مشكلة في ذكر: ${x.title}`;
  const link=qs('#linkedDhikrIssue');link.textContent=`الذكر المرتبط: ${x.title}`;link.classList.remove('hidden');
  qs('#issueDetails').focus();
};
window.openDhikrEdit=id=>{
  const x=window.getDhikrById?.(id);
  if(!x){toast('تعذر فتح نموذج التعديل، أعد تحميل الصفحة');return;}
  navTo('support');switchSupportTab('edit');
  qs('#editDhikrId').value=x.id;qs('#editDhikrTitle').value=x.title;
  qs('#editProposed').value=x.text;
  const link=qs('#linkedDhikrEdit');link.textContent=`الذكر الحالي: ${x.title}`;link.classList.remove('hidden');
  qs('#editProposed').focus();
};

async function loadMyReports(){
  const box=qs('#myReportsList');if(!box)return;
  box.innerHTML='<div class="muted">جارٍ التحميل...</div>';
  const local=load('pending_support_requests',[]);
  let cloud=[];
  if(supabaseClient){
    const uid=await currentUserId();
    if(uid){
      const {data}=await supabaseClient.from('reports').select('*').eq('user_id',uid).order('created_at',{ascending:false}).limit(100);
      cloud=data||[];
    }
  }
  const all=[...local,...cloud].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  box.innerHTML=all.map(x=>`<article class="request-card">
    <div class="row between"><strong>${esc(x.subject||'طلب')}</strong><span class="status-chip status-${esc(x.status||'open')}">${esc(SUPPORT_STATUS_LABELS[x.status]||'بانتظار المزامنة')}</span></div>
    <div class="muted small">${esc(SUPPORT_TYPE_LABELS[x.request_type]||'طلب دعم')} · ${new Date(x.created_at).toLocaleString('ar')}</div>
    <p>${esc(x.details||'')}</p>
    ${x.admin_reply?`<div class="admin-reply"><strong>رد الإدارة:</strong> ${esc(x.admin_reply)}</div>`:''}
  </article>`).join('')||'<div class="muted">لا توجد طلبات حتى الآن.</div>';
}
qs('#refreshMyReports')?.addEventListener('click',loadMyReports);

// Voice settings
function loadVoiceOptions(){
  if(!('speechSynthesis' in window))return;
  const select=qs('#voiceSelect');if(!select)return;
  const voices=speechSynthesis.getVoices().filter(v=>/^ar(-|_)/i.test(v.lang)||/Arabic/i.test(v.name));
  const saved=load('voice_settings',{rate:.85,pitch:1,voiceURI:''});
  select.innerHTML='<option value="">اختيار تلقائي</option>'+voices.map(v=>`<option value="${esc(v.voiceURI)}">${esc(v.name)} — ${esc(v.lang)}</option>`).join('');
  select.value=saved.voiceURI||'';
}
function saveVoiceSettings(){
  const settings={
    voiceURI:qs('#voiceSelect')?.value||'',
    rate:+qs('#voiceRate')?.value||.85,
    pitch:+qs('#voicePitch')?.value||1
  };
  store('voice_settings',settings);
  if(qs('#voiceRateValue'))qs('#voiceRateValue').textContent=settings.rate;
  if(qs('#voicePitchValue'))qs('#voicePitchValue').textContent=settings.pitch;
}
if('speechSynthesis' in window){
  speechSynthesis.onvoiceschanged=loadVoiceOptions;setTimeout(loadVoiceOptions,300);
}
['voiceSelect','voiceRate','voicePitch'].forEach(id=>qs('#'+id)?.addEventListener('input',saveVoiceSettings));
const savedVoice=load('voice_settings',{rate:.85,pitch:1,voiceURI:''});
if(qs('#voiceRate'))qs('#voiceRate').value=savedVoice.rate;
if(qs('#voicePitch'))qs('#voicePitch').value=savedVoice.pitch;
saveVoiceSettings();
qs('#testVoice')?.addEventListener('click',()=>{
  if(!('speechSynthesis' in window)){toast('القراءة الصوتية غير مدعومة');return;}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ');
  const s=load('voice_settings',{rate:.85,pitch:1,voiceURI:''});
  u.lang='ar-SA';u.rate=+s.rate;u.pitch=+s.pitch;
  const v=speechSynthesis.getVoices().find(x=>x.voiceURI===s.voiceURI);if(v)u.voice=v;
  speechSynthesis.speak(u);
});
qs('#stopAllAudio')?.addEventListener('click',()=>speechSynthesis?.cancel());
