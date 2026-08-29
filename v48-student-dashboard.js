
'use strict';
(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const S={creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة النبوية',hadith:'الحديث'};
 const j=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
 const academy=()=>window.NOOR_ACADEMY||{};
 function getData(){
  const A=academy(),p=j('noor_academy_progress'),exam=j('noor_academy_combined_v47'),activity=j('noor_student_activity_v48');
  let total=0,done=0,bestSum=0,subjects=[];
  Object.entries(S).forEach(([id,name])=>{let t=A[id]?.paths?.length||0,d=(p[id]?.done||[]).length,b=+(p[id]?.best||0);total+=t;done+=d;bestSum+=b;subjects.push({id,name,t,d,b,pc:Math.round(d/Math.max(1,t)*100)})});
  const xp=done*25 + Math.round((exam.score||0)*10), level=Math.floor(xp/500)+1;
  const dates=activity.dates||[]; let streak=0,cur=new Date();cur.setHours(0,0,0,0);
  for(let i=0;i<365;i++){let key=cur.toISOString().slice(0,10);if(dates.includes(key))streak++;else if(i>0)break;cur.setDate(cur.getDate()-1)}
  return {A,p,exam,total,done,subjects,xp,level,streak,overall:Math.round(done/Math.max(1,total)*100)};
 }
 function markVisit(){let a=j('noor_student_activity_v48'),d=new Date().toISOString().slice(0,10);a.dates=[...new Set([...(a.dates||[]),d])].slice(-365);localStorage.setItem('noor_student_activity_v48',JSON.stringify(a))}
 function render(){
  const h=document.getElementById('studentDashboard');if(!h||!window.NOOR_ACADEMY)return false;markVisit();const d=getData();
  const weakest=[...d.subjects].sort((a,b)=>(a.pc+a.b)-(b.pc+b.b))[0];
  const eligible=d.overall===100 && (d.exam.percent||0)>=80;
  h.innerHTML=`<section class="student-hero"><div><span>V48 · مسارك التعليمي</span><h1>لوحة الطالب</h1><p>تابع دروسك واختباراتك وتقدمك في العقيدة والفقه والسيرة والحديث من مكان واحد.</p></div><div class="student-ring" style="--p:${d.overall}"><b>${d.overall}%</b><small>إنجاز المنهج</small></div></section>
  <section class="student-kpis"><article><b>${d.done}/${d.total}</b><span>درس مكتمل</span></article><article><b>${d.xp}</b><span>نقطة XP</span></article><article><b>${d.level}</b><span>المستوى</span></article><article><b>${d.streak}</b><span>سلسلة أيام التعلم</span></article></section>
  <section class="student-grid"><div class="student-card"><h2>تقدم المواد</h2>${d.subjects.map(x=>`<div class="subject-progress"><div><b>${esc(x.name)}</b><span>${x.d}/${x.t} · أفضل اختبار ${x.b}%</span></div><progress max="100" value="${x.pc}"></progress><small>${x.pc}%</small></div>`).join('')}</div>
  <div class="student-card"><h2>توصية المراجعة</h2><div class="student-focus"><strong>${esc(weakest.name)}</strong><p>هذه المادة هي الأقل حاليًا وفق إنجاز الدروس ونتائج الاختبارات المحفوظة على جهازك.</p><button class="btn primary" data-go="${weakest.id}">راجع المادة</button></div><hr><h3>آخر اختبار شامل</h3>${d.exam.percent!=null?`<p class="student-score"><b>${d.exam.percent}%</b> · ${d.exam.score}/${d.exam.total}</p>`:'<p class="muted">لم تسجل محاولة شاملة بعد.</p>'}<button class="btn" data-go="academyExams">اذهب للاختبارات</button></div></section>
  <section class="student-card certificate-card"><div><span>شهادة الإتمام</span><h2>${eligible?'أصبحت مؤهلًا لشهادة الإتمام':'أكمل المسار للحصول على الشهادة'}</h2><p>الشرط: إكمال 100% من الدروس والحصول على 80% أو أكثر في الاختبار النهائي. الشهادة تعليمية داخل نور الذكر وليست اعتمادًا أكاديميًا أو شرعيًا رسميًا.</p></div><button class="btn primary" id="studentCertificate" ${eligible?'':'disabled'}>عرض شهادة الإتمام</button></section>
  <section class="student-card"><h2>سجل التقييم الحالي</h2><p>أفضل نتائج المواد: ${d.subjects.map(x=>`${esc(x.name)} ${x.b}%`).join(' · ')}</p><p class="muted">يُحفظ التقدم محليًا على هذا الجهاز حاليًا؛ مزامنة الحسابات يمكن ربطها لاحقًا بقاعدة البيانات.</p></section>`;
  h.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{document.querySelector(`[data-page="${b.dataset.go}"]`)?.click()});
  const c=h.querySelector('#studentCertificate');if(c&&!c.disabled)c.onclick=()=>showCert(d);return true;
 }
 function showCert(d){
  const w=window.open('','_blank'); if(!w)return;
  const date=new Intl.DateTimeFormat('ar-SA',{dateStyle:'long'}).format(new Date());
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>شهادة إتمام - نور الذكر</title><style>body{font-family:Tahoma,Arial;background:#f5f1e6;padding:40px}.c{max-width:900px;margin:auto;background:white;border:10px double #176b52;padding:70px;text-align:center}h1{color:#176b52;font-size:42px}h2{font-size:28px}.seal{font-size:60px}.note{margin-top:45px;color:#666;font-size:14px}@media print{button{display:none}}</style><div class="c"><div class="seal">۞</div><h1>شهادة إتمام تعليمية</h1><p>تشهد منصة نور الذكر بإتمام المسار التعليمي في</p><h2>العقيدة · الفقه · السيرة النبوية · الحديث</h2><p>نسبة إتمام الدروس: <b>${d.overall}%</b> · نتيجة الاختبار النهائي: <b>${d.exam.percent}%</b></p><p>${date}</p><button onclick="print()">طباعة / حفظ PDF</button><p class="note">هذه شهادة إتمام تعليمية صادرة من الموقع، وليست مؤهلًا أكاديميًا أو إجازة علمية أو اعتمادًا شرعيًا رسميًا.</p></div>`);
  w.document.close();
 }
 function init(){if(render())return;let n=0,t=setInterval(()=>{if(render()||++n>40)clearInterval(t)},150)}
 document.addEventListener('DOMContentLoaded',init);setTimeout(init,400);
})();
