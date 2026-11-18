'use strict';
(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const S={creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة النبوية',hadith:'الحديث'};
 const j=(k,d={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
 const academy=()=>window.NOOR_ACADEMY||{};
 function localSnapshot(){
  const A=academy(),p=j('noor_academy_progress'),exam=j('noor_academy_combined_v47'),activity=j('noor_student_activity_v48');
  let total=0,done=0;const subjects=[];
  Object.entries(S).forEach(([id,name])=>{const t=A[id]?.paths?.length||0,d=(p[id]?.done||[]).length,b=+(p[id]?.best||0);total+=t;done+=d;subjects.push({id,name,t,d,b,pc:Math.round(d/Math.max(1,t)*100)})});
  const xp=done*25+Math.round((exam.score||0)*10),level=Math.floor(xp/500)+1;
  const dates=activity.dates||[];let streak=0,cur=new Date();cur.setHours(0,0,0,0);for(let i=0;i<365;i++){const key=cur.toISOString().slice(0,10);if(dates.includes(key))streak++;else if(i>0)break;cur.setDate(cur.getDate()-1)}
  const lastQuran=j('m54_last',j('m54_last_page_context',{page:+localStorage.getItem('m54_page')||1}));
  return {A,p,exam,total,done,subjects,xp,level,streak,overall:Math.round(done/Math.max(1,total)*100),lastQuran};
 }
 function markVisit(){const a=j('noor_student_activity_v48'),d=new Date().toISOString().slice(0,10);a.dates=[...new Set([...(a.dates||[]),d])].slice(-365);localStorage.setItem('noor_student_activity_v48',JSON.stringify(a))}
 async function cloudSnapshot(){
  const c=window.NOOR_V86_SECURITY?.client?.();if(!c)return null;
  try{
   const {data:{session}}=await c.auth.getSession();if(!session?.user)return null;
   const [profileRes,progressRes,attemptRes]=await Promise.all([
    c.from('profiles').select('display_name,active').eq('id',session.user.id).maybeSingle(),
    c.from('learning_progress').select('subject,lesson_key,completed,completed_at').eq('user_id',session.user.id).eq('completed',true),
    c.from('exam_attempts').select('scope,difficulty,score,total,percent,created_at').eq('user_id',session.user.id).order('created_at',{ascending:false}).limit(8)
   ]);
   if(profileRes.data?.active===false)return null;
   return {name:profileRes.data?.display_name||session.user.user_metadata?.display_name||'',progress:progressRes.data||[],attempts:attemptRes.data||[]};
  }catch(e){console.warn('Student cloud dashboard:',e);return null}
 }
 function merge(local,cloud){
  if(!cloud)return {...local,cloud:false,name:'',attempts:[]};
  const sets=Object.fromEntries(Object.keys(S).map(k=>[k,new Set(local.p[k]?.done||[])]));
  for(const r of cloud.progress||[]){const i=Number(r.lesson_key);if(sets[r.subject]&&Number.isFinite(i))sets[r.subject].add(i)}
  const subjects=local.subjects.map(x=>{const d=sets[x.id].size,latest=(cloud.attempts||[]).find(a=>a.scope===x.id),b=Math.max(x.b,+latest?.percent||0);return {...x,d,b,pc:Math.round(d/Math.max(1,x.t)*100)}});
  const done=subjects.reduce((n,x)=>n+x.d,0),total=subjects.reduce((n,x)=>n+x.t,0),examCloud=(cloud.attempts||[]).find(a=>a.scope==='all')||cloud.attempts?.[0];
  return {...local,cloud:true,name:cloud.name,subjects,done,total,overall:Math.round(done/Math.max(1,total)*100),exam:examCloud?{percent:+examCloud.percent,score:+examCloud.score,total:+examCloud.total}:local.exam,attempts:cloud.attempts||[],xp:done*25+Math.round((examCloud?.score||local.exam.score||0)*10),level:Math.floor((done*25+Math.round((examCloud?.score||local.exam.score||0)*10))/500)+1};
 }
 function render(data){
  const h=document.getElementById('studentDashboard');if(!h||!window.NOOR_ACADEMY)return false;
  const weakest=[...data.subjects].sort((a,b)=>(a.pc+a.b)-(b.pc+b.b))[0]||data.subjects[0];
  const eligible=data.overall===100&&(data.exam.percent||0)>=80,last=data.lastQuran||{page:1},qHref=`mushaf.html?page=${last.page||1}${last.s?`&surah=${last.s}`:''}${last.a?`&ayah=${last.a}`:''}`;
  const recent=(data.attempts||[]).slice(0,5);
  h.innerHTML=`<section class="student-hero"><div><span>${data.cloud?'<span class="student-cloud-badge">متزامن مع الحساب</span>':'تقدمك على هذا الجهاز'}</span><h1>${data.name?`مرحبًا، ${esc(data.name)}`:'لوحة الطالب'}</h1><p>تابع القرآن والدروس والاختبارات من مكان واحد، وارجع إلى آخر موضع توقفت عنده.</p></div><div class="student-ring" style="--p:${data.overall}"><b>${data.overall}%</b><small>إنجاز المنهج</small></div></section>
  <section class="student-kpis"><article><b>${data.done}/${data.total}</b><span>درس مكتمل</span></article><article><b>${data.exam.percent!=null?data.exam.percent+'%':'—'}</b><span>آخر نتيجة</span></article><article><b>${data.level}</b><span>المستوى</span></article><article><b>${data.streak}</b><span>سلسلة أيام التعلم</span></article></section>
  <section class="student-continue"><article class="student-continue-card"><span class="icon">📖</span><small>تابع من حيث توقفت</small><h3>ورد القرآن · صفحة ${last.page||1}</h3><p class="muted">ارجع مباشرة إلى آخر موضع قراءة محفوظ.</p><a class="btn primary" href="${qHref}">متابعة القرآن</a></article><article class="student-continue-card"><span class="icon">🎓</span><small>المراجعة المقترحة</small><h3>${esc(weakest?.name||'العقيدة')}</h3><p class="muted">الأقل حاليًا وفق إنجاز الدروس ونتائج الاختبارات.</p><button class="btn primary" data-go="${weakest?.id||'creed'}">متابعة المادة</button></article></section>
  <section class="student-grid"><div class="student-card"><h2>تقدم المواد</h2>${data.subjects.map(x=>`<div class="subject-progress"><div><b>${esc(x.name)}</b><span>${x.d}/${x.t} · أفضل اختبار ${x.b}%</span></div><progress max="100" value="${x.pc}"></progress><small>${x.pc}%</small></div>`).join('')}</div>
  <div class="student-card"><h2>ملخص الاختبارات</h2>${data.exam.percent!=null?`<p class="student-score"><b>${data.exam.percent}%</b> · ${data.exam.score}/${data.exam.total}</p>`:'<p class="muted">لم تسجل محاولة بعد.</p>'}<a class="btn" href="exams.html">فتح الاختبارات الشرعية</a><hr><h3>النقاط</h3><p><b>${data.xp}</b> XP</p></div></section>
  <section class="student-card student-recent"><div class="noor-section-title"><div><small>النشاط</small><h2>آخر المحاولات</h2></div></div>${recent.length?recent.map(x=>`<div class="student-recent-row"><span>${esc(S[x.scope]||'اختبار شامل')} · ${esc(x.difficulty||'كل المستويات')}</span><b>${x.percent}%</b></div>`).join(''):'<p class="muted">لا توجد محاولات سحابية حديثة بعد.</p>'}</section>
  <section class="student-card certificate-card"><div><span>شهادة الإتمام</span><h2>${eligible?'أصبحت مؤهلًا لشهادة الإتمام':'أكمل المسار للحصول على الشهادة'}</h2><p>الشرط الافتراضي: إكمال المسار والحصول على النسبة المطلوبة في الاختبار النهائي. الشهادة تعليمية داخل نور الذكر.</p></div><button class="btn primary" id="studentCertificate" ${eligible?'':'disabled'}>عرض الشهادة</button></section>`;
  h.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>window.navTo?.(b.dataset.go));const c=h.querySelector('#studentCertificate');if(c&&!c.disabled)c.onclick=()=>showCert(data);return true;
 }
 function showCert(d){const w=window.open('','_blank');if(!w)return;const date=new Intl.DateTimeFormat('ar-SA',{dateStyle:'long'}).format(new Date());w.document.write(`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>شهادة إتمام - نور الذكر</title><style>:root{--g:#176B52;--gold:#B99754}body{font-family:Tahoma,Arial;background:#F4F1E8;padding:40px}.c{max-width:900px;margin:auto;background:#FFFDF8;border:8px double var(--gold);padding:70px;text-align:center;color:#17271F}h1{color:var(--g);font-size:42px}.seal{font-size:60px;color:var(--gold)}.note{margin-top:45px;color:#64736C;font-size:14px}@media print{button{display:none}}</style><div class="c"><div class="seal">۞</div><h1>شهادة إتمام تعليمية</h1><p>تشهد منصة نور الذكر بإتمام المسار التعليمي في</p><h2>العقيدة · الفقه · السيرة النبوية · الحديث</h2><p>نسبة إتمام الدروس: <b>${d.overall}%</b> · نتيجة الاختبار النهائي: <b>${d.exam.percent}%</b></p><p>${date}</p><button onclick="print()">طباعة / حفظ PDF</button><p class="note">هذه شهادة إتمام تعليمية صادرة من الموقع وليست اعتمادًا أكاديميًا رسميًا.</p></div>`);w.document.close()}
 async function init(){markVisit();if(!render(localSnapshot())){let n=0,t=setInterval(()=>{if(render(localSnapshot())||++n>40)clearInterval(t)},150);return}const cloud=await cloudSnapshot();if(cloud)render(merge(localSnapshot(),cloud))}
 document.addEventListener('DOMContentLoaded',()=>setTimeout(init,120));setTimeout(init,650);
})();
