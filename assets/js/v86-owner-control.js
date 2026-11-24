'use strict';
(()=>{
 const cfg=window.NOOR_CONFIG||{}; let c=null;
 const db=()=>c||(c=window.NOOR_GET_SUPABASE_CLIENT?.()||window.supabaseClient||null);
 async function owner(){const x=db();if(!x)return false;try{const {data}=await x.rpc('is_owner');return data===true}catch{return false}}
 async function count(table){const x=db();const {count,error}=await x.from(table).select('*',{count:'exact',head:true});if(error)throw error;return count||0}
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function fetchJson(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw new Error(`تعذر قراءة ${path}`);return r.json()}
 async function seedAcademy(status){
   const x=db();if(!x||!await owner())throw new Error('owner_required');
   status.textContent='جاري قراءة بنك V92 المحلي…';
   const [qb,lb]=await Promise.all([fetchJson('assets/data/v86-questions.json?v=89.0'),fetchJson('assets/data/v86-lessons.json?v=89.0')]);
   const {data:eq,error:eqe}=await x.from('academy_questions').select('subject,question');if(eqe)throw eqe;
   const qseen=new Set((eq||[]).map(r=>`${r.subject}\u0000${r.question}`));
   const qrows=[]; const dmap={easy:'أساسي',medium:'متوسط',hard:'متقدم'};
    for(const [subject,arr] of Object.entries(qb))for(const q of arr){const key=`${subject}\u0000${q.q}`;if(qseen.has(key))continue;if(!Array.isArray(q.opts)||q.opts.length!==4)continue;qseen.add(key);qrows.push({subject,question:q.q,options:q.opts,correct_index:Number(q.correct),explanation:q.why||'',reference_text:'',review_notes:'مستورد من البنك المحلي؛ يحتاج مراجعة بشرية ومرجعًا دقيقًا قبل النشر.',difficulty:dmap[q.level]||'متوسط',active:false,review_status:'draft'})}
   for(let i=0;i<qrows.length;i+=50){status.textContent=`إضافة الأسئلة ${Math.min(i+50,qrows.length)}/${qrows.length}…`;const {error}=await x.from('academy_questions').insert(qrows.slice(i,i+50));if(error)throw error;await sleep(30)}
   const {data:el,error:ele}=await x.from('academy_lessons').select('subject,title');if(ele)throw ele;
   const lseen=new Set((el||[]).map(r=>`${r.subject}\u0000${r.title}`)); const lrows=[];
    for(const [subject,arr] of Object.entries(lb))for(const l of arr){const key=`${subject}\u0000${l.title}`;if(lseen.has(key))continue;lseen.add(key);lrows.push({subject,title:l.title,summary:l.summary||'',body:l.summary||'',reference_text:l.reference_text||'',review_notes:'مستورد من البنك المحلي؛ يحتاج مراجعة بشرية قبل النشر.',sort_order:Number(l.sort_order)||0,active:false,review_status:'draft'})}
   for(let i=0;i<lrows.length;i+=50){status.textContent=`إضافة الدروس ${Math.min(i+50,lrows.length)}/${lrows.length}…`;const {error}=await x.from('academy_lessons').insert(lrows.slice(i,i+50));if(error)throw error;await sleep(30)}
    const counts={};for(const subject of ['creed','fiqh','seerah','hadith']){const {count,error}=await x.from('academy_questions').select('*',{count:'exact',head:true}).eq('subject',subject);if(error)throw error;counts[subject]=count||0}
    const lessonTargets={creed:67,fiqh:87,seerah:71,hadith:85},lessonCounts={};for(const subject of Object.keys(lessonTargets)){const {count,error}=await x.from('academy_lessons').select('*',{count:'exact',head:true}).eq('subject',subject);if(error)throw error;lessonCounts[subject]=count||0}
   const complete=Object.values(counts).every(n=>n>=150)&&Object.entries(lessonTargets).every(([subject,n])=>(lessonCounts[subject]||0)>=n);
   if(!complete)throw new Error(`البنك غير مكتمل: أسئلة ${JSON.stringify(counts)} · دروس ${JSON.stringify(lessonCounts)}`);
    const {error:se}=await x.from('app_settings').upsert([{key:'academy_v921_drafts_ready',value:'true',public:true,updated_at:new Date().toISOString()}]);if(se)throw se;
    status.textContent=`اكتمل استيراد المسودات: ${Object.values(counts).reduce((a,b)=>a+b,0)} سؤال و${Object.values(lessonCounts).reduce((a,b)=>a+b,0)} درس. لن يظهر شيء للعامة قبل المراجعة والنشر الفردي.`;status.className='ok';
   return counts;
 }
 async function render(){
   const mount=document.getElementById('v86AdvancedStudio')||document.getElementById('advancedStudio'); if(!mount)return;
   mount.innerHTML='<div class="cardx"><h2>مركز القيادة V92</h2><p class="muted">جاري فحص النظام وقاعدة البيانات…</p></div>';
   if(!await owner()){mount.innerHTML='<div class="cardx"><h2>مركز القيادة V92</h2><p class="error">هذه الأدوات متاحة للمالك فقط.</p></div>';return}
   const tables=['profiles','academy_lessons','academy_questions','exam_attempts','learning_progress'];const vals={};await Promise.all(tables.map(async t=>{try{vals[t]=await count(t)}catch{vals[t]='—'}}));
   mount.innerHTML=`<section class="cardx"><div class="toolbar"><div><span class="eyebrow">NOOR ALDHIKR · V92</span><h2>مركز القيادة العالمي</h2><p class="muted">Supabase هو مصدر التحكم بعد اكتمال التهيئة، مع بنك محلي كامل كنسخة احتياطية.</p></div><a class="btn ghost" href="supabase-check.html" target="_blank">تشخيص النظام</a></div>
   <div class="owner-kpi-grid"><article class="owner-kpi"><b>${vals.profiles}</b><span>الحسابات</span></article><article class="owner-kpi"><b>${vals.academy_lessons}</b><span>الدروس السحابية</span></article><article class="owner-kpi"><b>${vals.academy_questions}</b><span>الأسئلة السحابية</span></article><article class="owner-kpi"><b>${vals.exam_attempts}</b><span>محاولات الاختبار</span></article><article class="owner-kpi"><b>${vals.learning_progress}</b><span>سجلات التقدم</span></article></div>
    <div class="notice"><b>بوابة الثقة V92.1:</b> تضيف الأسئلة والدروس الناقصة كمسودات فقط، ولا تنشرها أو تحذف أي محتوى موجود.</div><div class="toolbar"><button class="btn primary" id="v86SeedAcademy">استيراد/استكمال المسودات</button><span id="v86SeedStatus" class="muted"></span></div></section>`;
   const b=document.getElementById('v86SeedAcademy'),st=document.getElementById('v86SeedStatus');b.onclick=async()=>{b.disabled=true;st.className='muted';try{await seedAcademy(st)}catch(e){console.error(e);st.textContent=`تعذر الإكمال: ${e.message||e}`;st.className='error'}finally{b.disabled=false}};
 }
 window.NOOR_V86_OWNER={seedAcademy};
 document.addEventListener('noor:admin-ready',render);document.addEventListener('DOMContentLoaded',()=>setTimeout(render,900));
})();
