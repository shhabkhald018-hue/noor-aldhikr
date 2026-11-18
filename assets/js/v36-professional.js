(function(){
'use strict';
const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>String(v||'').toLowerCase().normalize('NFKD').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[^\u0600-\u06ff\s]/g,' ').replace(/\s+/g,' ').trim();

function readHistory(){try{return JSON.parse(localStorage.getItem('noor_dreams_v36')||'[]')}catch(e){return []}}
function writeHistory(rows){try{localStorage.setItem('noor_dreams_v36',JSON.stringify(rows.slice(0,30)))}catch(e){}}
function saveHistory(type,text,result){const rows=readHistory();rows.unshift({type,text:text.slice(0,260),result,date:new Date().toLocaleString('ar-SA')});writeHistory(rows);renderHistory()}

function enhanceDreams(){
 const shell=$('#dreams .dreams-shell');
 const warning=$('#dreams .dreams-warning');
 if(!shell||!warning||$('#dreamProfessional'))return;
 const dictionary=Array.isArray(window.NoorDreamDictionary)?window.NoorDreamDictionary:[];
 const block=document.createElement('section');
 block.id='dreamProfessional';
 block.className='dream-professional card';
 block.innerHTML=`<div class="dream-professional-head"><div><span class="eyebrow">أداة مساعدة جديدة</span><h2>اختر طريقة التعامل مع الرؤيا</h2><p>الموسوعة الكاملة باقية كما هي، وهذه الأدوات تساعدك على تنظيم السياق والمتابعة دون ادعاء معرفة الغيب أو تقديم تشخيص.</p></div><span class="dream-count">${dictionary.length} رمزًا في الموسوعة</span></div>
 <div class="v36-mode-grid">
  <button data-v36-mode="encyclopedia"><span>01</span><b>البحث في الموسوعة</b><small>انتقل إلى الرموز والتصنيفات الكاملة.</small></button>
  <button data-v36-mode="normal"><span>02</span><b>تحليل سياق رؤيا عادية</b><small>اكتشاف الرموز وتنظيم الظروف المحيطة.</small></button>
  <button data-v36-mode="patient"><span>03</span><b>متابعة رؤى أثناء الرقية</b><small>سجل الاتجاه والتكرار دون تشخيص قطعي.</small></button>
 </div><div id="v36DreamWizard" class="v36-wizard hidden"></div><div id="v36DreamHistory" class="v36-history"></div>`;
 warning.insertAdjacentElement('afterend',block);
 $$('[data-v36-mode]',block).forEach(btn=>btn.addEventListener('click',()=>openDreamMode(btn.dataset.v36Mode)));
 renderHistory();
}

function openDreamMode(mode){
 const wizard=$('#v36DreamWizard'); if(!wizard)return;
 wizard.classList.remove('hidden');
 if(mode==='encyclopedia'){
  $('#dreamSearch')?.scrollIntoView({behavior:'smooth',block:'start'});
  $('#dreamSearch')?.focus();
  wizard.classList.add('hidden'); return;
 }
 if(mode==='normal'){
  wizard.innerHTML=`<div class="v36-wizard-head"><div><small>المسار الأول</small><h3>تحليل سياق رؤيا عادية</h3></div><button data-close-v36>إغلاق</button></div>
  <label>اكتب الرؤيا بترتيب أحداثها<textarea id="v36NormalText" rows="7" placeholder="اكتب الأشخاص والأماكن والأحداث والشعور بوضوح..."></textarea></label>
  <div class="v36-form-grid"><label>الحالة الاجتماعية<select id="v36Status"><option>غير محدد</option><option>أعزب</option><option>متزوج</option><option>مطلق</option><option>أرمل</option></select></label><label>وقت الرؤيا<select id="v36Time"><option>غير محدد</option><option>قبل الفجر</option><option>بعد الفجر</option><option>قيلولة</option><option>بداية الليل</option></select></label><label>الشعور الغالب<select id="v36Feeling"><option>هادئ</option><option>خائف</option><option>حزين</option><option>فرح</option><option>مندهش</option></select></label><label>هل تكررت؟<select id="v36Repeat"><option>لا</option><option>نعم</option></select></label></div>
  <label>هل كنت منشغلًا بموضوعها قبل النوم؟<select id="v36Busy"><option>لا</option><option>نعم</option></select></label><button class="btn primary" id="v36AnalyzeNormal">تحليل إرشادي</button><div id="v36NormalResult"></div>`;
  $('#v36AnalyzeNormal').onclick=analyzeNormal;
 }else{
  wizard.innerHTML=`<div class="v36-wizard-head"><div><small>المسار الثاني</small><h3>متابعة رؤى أثناء الرقية</h3></div><button data-close-v36>إغلاق</button></div>
  <div class="v36-safety-note"><b>هذه المتابعة لا تثبت الإصابة.</b><span>الرؤى وحدها ليست دليلًا طبيًا أو شرعيًا قاطعًا، ويجب تقييم الأعراض الشديدة لدى مختص.</span></div>
  <label>صف الرؤى والرموز المتكررة<textarea id="v36PatientText" rows="7" placeholder="اكتب ما تكرر، وما حدث قبل النوم وبعد الاستيقاظ..."></textarea></label>
  <div class="v36-form-grid"><label>التكرار<select id="v36PRepeat"><option value="0">مرة واحدة</option><option value="1">عدة مرات</option><option value="2">شبه يومي</option></select></label><label>علاقتها بوقت الرقية<select id="v36PRuq"><option value="0">لا علاقة واضحة</option><option value="1">تظهر أحيانًا بعدها</option><option value="2">تظهر غالبًا بعدها</option></select></label><label>عند الاستيقاظ<select id="v36PWake"><option value="0">لا شيء ملحوظ</option><option value="1">فزع أو تعب مؤقت</option><option value="2">أعراض شديدة أو مستمرة</option></select></label><label>تأثيرها نهارًا<select id="v36PDay"><option value="0">لا تؤثر</option><option value="1">قلق محدود</option><option value="2">تعطل النوم أو الحياة اليومية</option></select></label></div>
  <button class="btn primary" id="v36AnalyzePatient">إنشاء متابعة</button><div id="v36PatientResult"></div>`;
  $('#v36AnalyzePatient').onclick=analyzePatient;
 }
 $('[data-close-v36]',wizard).onclick=()=>wizard.classList.add('hidden');
 wizard.scrollIntoView({behavior:'smooth',block:'start'});
}

function analyzeNormal(){
 const text=$('#v36NormalText')?.value.trim()||'';
 const result=$('#v36NormalResult'); if(!result)return;
 if(text.length<12){result.innerHTML='<div class="notice">اكتب تفاصيل أكثر حتى يمكن اكتشاف الرموز والسياق.</div>';return}
 const normalized=normalize(text);
 const dictionary=Array.isArray(window.NoorDreamDictionary)?window.NoorDreamDictionary:[];
 const found=dictionary.filter(row=>{const base=normalize(row.symbol);const candidates=[base,base.replace(/^ال/,'')].concat(base.split(/\s+(?:و|او)\s+|[\/،,-]/).map(x=>x.replace(/^ال/,'').trim())).filter(x=>x.length>=3);return candidates.some(x=>normalized.includes(x))}).slice(0,12);
 const busy=$('#v36Busy').value==='نعم', repeated=$('#v36Repeat').value==='نعم', feeling=$('#v36Feeling').value;
 let classification=busy?'حديث نفس محتمل بسبب الانشغال السابق':'رؤيا تحتاج إلى قراءة سياقية متأنية';
 if(!busy&&feeling==='خائف') classification='حلم مكروه أو رؤيا مزعجة؛ اتبع الأدب النبوي ولا تُفزع نفسك';
 if(repeated&&!busy) classification+='، وتكرارها يستحق التسجيل والمقارنة دون جزم';
 result.innerHTML=`<article class="v36-result"><span class="result-label">قراءة إرشادية</span><h3>${esc(classification)}</h3><p><b>السياق المسجل:</b> ${esc($('#v36Status').value)} · ${esc($('#v36Time').value)} · الشعور: ${esc(feeling)}.</p><h4>الرموز المطابقة في الموسوعة</h4>${found.length?`<div class="v36-symbol-grid">${found.map(row=>`<article><span>${esc(row.category)}</span><h5>${esc(row.symbol)}</h5><p>${esc(row.meaning)}</p></article>`).join('')}</div>`:'<p>لم يظهر تطابق لفظي مباشر مع رموز الموسوعة. قد يكون معنى الرؤيا مرتبطًا بالقصة والعلاقات بين الأحداث لا بكلمة منفردة.</p>'}<div class="v36-safety-note"><b>النتيجة غير قطعية.</b><span>لا تستخدمها للتنبؤ أو اتهام أحد أو اتخاذ قرار طبي أو مالي أو أسري.</span></div></article>`;
 saveHistory('رؤيا عادية',text,classification);
}

function analyzePatient(){
 const text=$('#v36PatientText')?.value.trim()||'';
 const result=$('#v36PatientResult'); if(!result)return;
 if(text.length<12){result.innerHTML='<div class="notice">اكتب وصفًا أوضح للرؤى المتكررة.</div>';return}
 const score=Number($('#v36PRepeat').value)+Number($('#v36PRuq').value)+Number($('#v36PWake').value)+Number($('#v36PDay').value);
 let level='منخفض',message='لا يظهر اتجاه قوي من هذه المرة. استمر في التسجيل دون مراقبة مفرطة.';
 if(score>=3){level='متوسط';message='يوجد تكرار أو ارتباط زمني يستحق المتابعة المنظمة لمدة 14 يومًا، لكنه لا يثبت سببًا محددًا.'}
 if(score>=6){level='مرتفع من ناحية الإزعاج';message='الرؤى تؤثر بوضوح على النوم أو الحياة اليومية. استمر في الأذكار والرقية المباحة، واطلب تقييمًا طبيًا أو نفسيًا عند استمرار الأعراض أو شدتها.'}
 result.innerHTML=`<article class="v36-result"><span class="result-label">مستوى المتابعة: ${level}</span><h3>${esc(message)}</h3><div class="v36-followup-grid"><div><b>مدة المتابعة</b><span>14 يومًا</span></div><div><b>ما يُسجّل</b><span>الوقت، الرمز، الرقية، الشعور، النوم</span></div><div><b>المعيار</b><span>الاتجاه العام لا ليلة واحدة</span></div></div><div class="v36-safety-note"><b>اطلب مساعدة عاجلة</b><span>عند فقدان الوعي، التشنجات، إيذاء النفس، سماع أصوات، اضطراب شديد، أو أعراض جسدية مستمرة.</span></div></article>`;
 saveHistory('متابعة أثناء الرقية',text,`${level}: ${message}`);
}

function renderHistory(){
 const box=$('#v36DreamHistory'); if(!box)return;
 const rows=readHistory();
 box.innerHTML=rows.length?`<div class="v36-history-head"><h3>سجل التحليلات والمتابعات</h3><button id="v36ClearHistory">مسح الكل</button></div>${rows.map((row,i)=>`<article><div><b>${esc(row.type)}</b><span>${esc(row.date)}</span></div><p>${esc(row.text)}</p><small>${esc(row.result)}</small><button data-v36-delete="${i}">حذف</button></article>`).join('')}`:'';
 $$('[data-v36-delete]',box).forEach(btn=>btn.onclick=()=>{const next=readHistory();next.splice(Number(btn.dataset.v36Delete),1);writeHistory(next);renderHistory()});
 const clear=$('#v36ClearHistory'); if(clear)clear.onclick=()=>{if(confirm('مسح سجل التحليلات والمتابعات؟')){writeHistory([]);renderHistory()}};
}

function addOfflineRuqyah(){
 const grid=$('#ruqyahHub .ruqyah-main-grid');
 if(!grid||$('[data-rq-open="basicReading"]'))return;
 const card=document.createElement('button');
 card.className='ruqyah-program-card offline-core-feature'; card.dataset.rqOpen='basicReading'; card.type='button';
 card.innerHTML='<span class="rq-card-icon">📥</span><div><small>يعمل دون اتصال</small><h3>القراءة الأساسية المحفوظة</h3><p>الفاتحة وآية الكرسي وآخر البقرة والمعوذات بنصوصها كاملة، مع بقاء البرنامج الجامع الموسع.</p></div><span class="rq-arrow">←</span>';
 grid.appendChild(card);
}

document.addEventListener('DOMContentLoaded',()=>{enhanceDreams();addOfflineRuqyah()});
})();
