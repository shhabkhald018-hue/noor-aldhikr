
'use strict';
(()=>{
 const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let sb=null, modules=[], texts=[], blocks=[], ai=null, ui=null;
 const msg=(t,ok=true)=>{const m=$('#v81StudioMsg');if(m){m.textContent=t;m.className=ok?'ok':'error'}};

 async function loadAll(){
   sb=window.supabaseClient;if(!sb)return;
   msg('جاري تحميل مركز التحكم…',true);
   const rs=await Promise.all([
     sb.from('site_modules').select('*').order('sort_order'),
     sb.from('site_texts').select('*').order('text_key'),
     sb.from('custom_blocks').select('*').order('area_key').order('sort_order'),
     sb.from('ai_settings').select('*').eq('id',true).maybeSingle(),
     sb.from('ui_settings').select('*').eq('id',true).maybeSingle()
   ]);
   const err=rs.find(x=>x.error)?.error;if(err){msg(err.message,false);return}
   modules=rs[0].data||[];texts=rs[1].data||[];blocks=rs[2].data||[];ai=rs[3].data||{};ui=rs[4].data||{};
   render();
   msg('تم تحميل إعدادات الموقع.',true);
 }
 function renderModules(){
   const h=$('#v81Modules');h.innerHTML='';
   modules.forEach(m=>{
     const d=document.createElement('div');d.className='v81-module';d.dataset.key=m.module_key;
     d.innerHTML=`<div><b>${esc(m.label)}</b><small style="display:block" class="muted">${esc(m.module_key)}</small></div>
       <label class="v81-toggle"><input data-f="enabled" type="checkbox" ${m.enabled?'checked':''}> تشغيل</label>
       <label class="v81-toggle"><input data-f="nav_visible" type="checkbox" ${m.nav_visible?'checked':''}> القائمة</label>
       <input data-f="sort_order" type="number" value="${Number(m.sort_order)||0}" aria-label="الترتيب">
       <input data-f="label" value="${esc(m.label)}" aria-label="اسم القسم" style="grid-column:1/-1">`;
     h.appendChild(d);
   });
 }
 function renderTexts(){
   const h=$('#v81Texts');h.innerHTML='';
   texts.forEach(t=>{
     const d=document.createElement('div');d.className='field';
     d.innerHTML=`<label>${esc(t.text_key)}</label><textarea data-key="${esc(t.text_key)}" rows="2">${esc(t.value)}</textarea>`;
     h.appendChild(d);
   });
 }
 function renderBlocks(){
   const h=$('#v81Blocks');h.innerHTML='';
   blocks.forEach(b=>{
     const d=document.createElement('div');d.className='v81-block';d.dataset.id=b.id;
     d.innerHTML=`<b>${esc(b.title)}</b> <span class="badge">${esc(b.area_key)}</span>
       <p class="muted">${esc(b.body)}</p>
       <div class="v81-row"><button class="btn danger" data-del>حذف</button><label class="v81-toggle"><input data-active type="checkbox" ${b.active?'checked':''}> نشط</label></div>`;
     d.querySelector('[data-del]').onclick=()=>deleteBlock(b.id);
     d.querySelector('[data-active]').onchange=e=>toggleBlock(b.id,e.target.checked);
     h.appendChild(d);
   });
 }
 function render(){
   renderModules();renderTexts();renderBlocks();
   $('#v81AiEnabled').checked=!!ai.enabled;$('#v81AiName').value=ai.assistant_name||'';$('#v81AiFn').value=ai.function_name||'noor-ai';
   $('#v81AiModel').value=ai.model_label||'default';$('#v81AiTemp').value=ai.temperature??0.25;$('#v81AiMax').value=ai.max_input_chars||3000;
   $('#v81AiDaily').value=ai.max_daily_per_user||30;$('#v81AiPrompt').value=ai.system_prompt||'';$('#v81AiSafety').value=ai.safety_notice||'';
   $('#v81AiQuick').value=Array.isArray(ai.quick_prompts)?ai.quick_prompts.join('\n'):'';
   $('#v81Accent').value=ui.accent||'#2f735e';$('#v81Accent2').value=ui.accent2||'#b89a5a';$('#v81Light').value=ui.light_bg||'#f3f2ee';$('#v81Dark').value=ui.dark_bg||'#0f1211';
   $('#v81Radius').value=ui.radius||18;$('#v81Compact').checked=!!ui.compact;$('#v81Maintenance').checked=!!ui.maintenance_mode;$('#v81MaintenanceMsg').value=ui.maintenance_message||'';
 }
 async function saveModules(){
   const rows=[...document.querySelectorAll('#v81Modules .v81-module')].map(d=>({
     module_key:d.dataset.key,
     enabled:d.querySelector('[data-f=enabled]').checked,
     nav_visible:d.querySelector('[data-f=nav_visible]').checked,
     sort_order:+d.querySelector('[data-f=sort_order]').value||0,
     label:d.querySelector('[data-f=label]').value.trim(),
     updated_by:window.NOOR_OWNER_ID||null
   }));
   const {error}=await sb.from('site_modules').upsert(rows);if(error)throw error;
 }
 async function saveTexts(){
   const rows=[...document.querySelectorAll('#v81Texts textarea')].map(x=>({text_key:x.dataset.key,value:x.value,public:true,updated_by:window.NOOR_OWNER_ID||null}));
   const {error}=await sb.from('site_texts').upsert(rows);if(error)throw error;
 }
 async function saveAi(){
   const row={id:true,enabled:$('#v81AiEnabled').checked,assistant_name:$('#v81AiName').value.trim(),function_name:$('#v81AiFn').value.trim()||'noor-ai',
     model_label:$('#v81AiModel').value.trim()||'default',temperature:+$('#v81AiTemp').value||0,max_input_chars:+$('#v81AiMax').value||3000,
     max_daily_per_user:+$('#v81AiDaily').value||30,system_prompt:$('#v81AiPrompt').value,safety_notice:$('#v81AiSafety').value,
     quick_prompts:$('#v81AiQuick').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,8),updated_by:window.NOOR_OWNER_ID||null};
   const {error}=await sb.from('ai_settings').upsert(row);if(error)throw error;
 }
 async function saveUi(){
   const color=id=>$('#'+id).value;
   const row={id:true,accent:color('v81Accent'),accent2:color('v81Accent2'),light_bg:color('v81Light'),dark_bg:color('v81Dark'),
     radius:+$('#v81Radius').value||18,compact:$('#v81Compact').checked,maintenance_mode:$('#v81Maintenance').checked,
     maintenance_message:$('#v81MaintenanceMsg').value,updated_by:window.NOOR_OWNER_ID||null};
   const {error}=await sb.from('ui_settings').upsert(row);if(error)throw error;
 }
 async function addBlock(e){
   e.preventDefault();
   const row={area_key:$('#v81BlockArea').value,title:$('#v81BlockTitle').value.trim(),body:$('#v81BlockBody').value.trim(),
     button_label:$('#v81BlockBtn').value.trim(),button_url:$('#v81BlockUrl').value.trim(),style_key:$('#v81BlockStyle').value,
     sort_order:+$('#v81BlockOrder').value||100,active:true,updated_by:window.NOOR_OWNER_ID||null};
   const {error}=await sb.from('custom_blocks').insert(row);if(error){msg(error.message,false);return}
   e.target.reset();await loadAll();
 }
 async function deleteBlock(id){if(!confirm('حذف هذا البلوك نهائيًا؟'))return;const {error}=await sb.from('custom_blocks').delete().eq('id',id);if(error)msg(error.message,false);else loadAll()}
 async function toggleBlock(id,active){const {error}=await sb.from('custom_blocks').update({active,updated_by:window.NOOR_OWNER_ID||null}).eq('id',id);if(error)msg(error.message,false)}
 async function saveAll(){
   try{msg('جاري الحفظ…');await Promise.all([saveModules(),saveTexts(),saveAi(),saveUi()]);msg('تم نشر إعدادات V81 للمستخدمين بنجاح.');window.NOOR_RUNTIME_RELOAD?.()}catch(e){msg(e.message,false)}
 }
 function mount(){
   const panel=$('#ownerStudio');if(!panel||panel.dataset.ready)return;
   panel.dataset.ready='1';
   panel.innerHTML=`<div class="cardx">
     <div class="toolbar"><div><h2>مركز التحكم والتطوير V81</h2><p class="muted">غيّر تشغيل الأقسام والنصوص والتصميم والذكاء الاصطناعي بدون تعديل ملفات الموقع.</p></div>
     <div class="actions"><button class="btn ghost" id="v81Preview">معاينة المستخدم</button><button class="btn primary" id="v81SaveAll">حفظ ونشر الكل</button></div></div>
     <div id="v81StudioMsg" class="ok"></div>
     <div class="v81-code-note"><b>حد أمان مهم:</b> لوحة المالك تتحكم في الوظائف والإعدادات والمحتوى المسجّل في النظام. تعديل كود JavaScript نفسه أو إضافة تكامل برمجي جديد تمامًا يحتاج إصدار برمجي، لأن السماح بتحرير كود تنفيذي من المتصفح سيحوّل أي اختراق لحساب المالك إلى اختراق كامل للموقع.</div>
   </div>
   <div class="cardx"><h2>الأقسام والمزايا</h2><p class="muted">تشغيل/إيقاف، إظهار القائمة، الاسم، والترتيب.</p><div id="v81Modules"></div></div>
   <div class="cardx"><h2>النصوص الرئيسية</h2><div id="v81Texts"></div></div>
   <div class="cardx"><h2>إضافة محتوى جديد للمستخدم</h2><p class="muted">أضف بطاقة جديدة لأي منطقة بدون برمجة.</p>
     <form id="v81BlockForm"><div class="v81-studio-grid">
       <div class="field"><label>مكان الظهور</label><select id="v81BlockArea"><option value="home">الرئيسية</option><option value="studentDashboard">لوحة الطالب</option><option value="adhkar">الأذكار</option><option value="ruqyah">الرقية</option><option value="support">الدعم</option></select></div>
       <div class="field"><label>العنوان</label><input id="v81BlockTitle" required></div>
       <div class="field"><label>النص</label><textarea id="v81BlockBody" rows="3"></textarea></div>
       <div class="field"><label>نص الزر</label><input id="v81BlockBtn"></div>
       <div class="field"><label>رابط الزر</label><input id="v81BlockUrl" placeholder="https://... أو exams.html"></div>
       <div class="field"><label>الشكل</label><select id="v81BlockStyle"><option value="default">عادي</option><option value="highlight">مميز</option><option value="notice">تنبيه</option></select></div>
       <div class="field"><label>الترتيب</label><input id="v81BlockOrder" type="number" value="100"></div>
     </div><button class="btn primary">إضافة ونشر</button></form><div id="v81Blocks"></div>
   </div>
   <div class="cardx"><h2>الذكاء الاصطناعي</h2>
     <div class="v81-studio-grid">
       <label class="v81-toggle"><input id="v81AiEnabled" type="checkbox"> تشغيل المساعد الذكي</label>
       <div class="field"><label>اسم المساعد</label><input id="v81AiName"></div>
       <div class="field"><label>اسم Edge Function</label><input id="v81AiFn"></div>
       <div class="field"><label>اسم/معرّف النموذج</label><input id="v81AiModel"></div>
       <div class="field"><label>Temperature</label><input id="v81AiTemp" type="number" min="0" max="1" step=".05"></div>
       <div class="field"><label>أقصى طول للسؤال</label><input id="v81AiMax" type="number" min="200" max="12000"></div>
       <div class="field"><label>الحد اليومي للمستخدم</label><input id="v81AiDaily" type="number" min="1" max="500"></div>
       <div class="field" style="grid-column:1/-1"><label>تعليمات النظام للمساعد</label><textarea id="v81AiPrompt" rows="8"></textarea></div>
       <div class="field" style="grid-column:1/-1"><label>رسالة الأمان</label><textarea id="v81AiSafety" rows="3"></textarea></div>
       <div class="field" style="grid-column:1/-1"><label>الأسئلة السريعة — سؤال في كل سطر</label><textarea id="v81AiQuick" rows="6"></textarea></div>
     </div>
     <div class="v81-code-note">مفاتيح مزود الذكاء الاصطناعي السرية لا تُحفظ هنا. تُحفظ كـ Supabase Edge Function Secrets حتى لا يستطيع أي مستخدم أو متصفح استخراجها.</div>
   </div>
   <div class="cardx"><h2>التصميم ووضع الصيانة</h2><div class="v81-studio-grid">
     <div class="field"><label>اللون الأساسي</label><input id="v81Accent" type="color"></div><div class="field"><label>اللون الثانوي</label><input id="v81Accent2" type="color"></div>
     <div class="field"><label>خلفية الوضع الفاتح</label><input id="v81Light" type="color"></div><div class="field"><label>خلفية الوضع الداكن</label><input id="v81Dark" type="color"></div>
     <div class="field"><label>درجة انحناء البطاقات</label><input id="v81Radius" type="number" min="6" max="36"></div>
     <label class="v81-toggle"><input id="v81Compact" type="checkbox"> واجهة مضغوطة</label>
     <label class="v81-toggle"><input id="v81Maintenance" type="checkbox"> وضع الصيانة</label>
     <div class="field" style="grid-column:1/-1"><label>رسالة الصيانة</label><textarea id="v81MaintenanceMsg" rows="3"></textarea></div>
   </div></div>`;
   $('#v81SaveAll').onclick=saveAll;$('#v81Preview').onclick=()=>window.open('index.html?ownerPreview=1','_blank');$('#v81BlockForm').onsubmit=addBlock;
   loadAll();
 }
 function start(){if(mount())return;let n=0,t=setInterval(()=>{if(mount()||++n>80)clearInterval(t)},120)}
 document.addEventListener('DOMContentLoaded',start);window.addEventListener('noor:admin-ready',start);
})();
