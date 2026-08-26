
'use strict';
(()=>{
  const SUBJECTS={creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة النبوية',hadith:'الحديث'};
  const LEVELS={easy:'سهل',medium:'متوسط',hard:'عالي'};
  const HISTORY='noor_exam_history_v58';
  const RECENT='noor_exam_recent_v58';

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const load=(k,d={})=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch{return d}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x};
  const unique=a=>[...new Set(a.filter(Boolean).map(x=>String(x).trim()).filter(Boolean))];
  const grade=p=>p>=90?'ممتاز جدًا':p>=80?'ممتاز':p>=70?'جيد جدًا':p>=60?'جيد':p>=50?'مقبول':'يحتاج مراجعة';
  const stars=p=>{const n=Math.max(1,Math.min(5,Math.ceil(p/20)));return '★'.repeat(n)+'☆'.repeat(5-n)};

  function normalizeCore(A,id){
    return (A[id]?.quizzes||[]).map((q,i)=>({
      id:`${id}-core-${i}`,
      subject:id,
      subjectName:SUBJECTS[id],
      level:i<7?'easy':i<14?'medium':'hard',
      lesson:null,
      q:String(q[0]||'').trim(),
      opts:(q[1]||[]).map(String),
      correct:+q[2]||0,
      why:String(q[3]||'راجع شرح الدرس والمصدر المعتمد.'),
      kind:'core'
    })).filter(x=>x.q&&x.opts.length>=2);
  }

  function lessonRows(A,id){
    return (A[id]?.paths||[]).map((x,i)=>({
      i,
      title:String(x[0]||'').trim(),
      summary:String(x[1]||'').trim(),
      ref:String(x[2]||'المراجع المعتمدة').trim()
    })).filter(x=>x.title&&x.summary);
  }

  function choiceSet(correct,pool){
    let opts=unique([correct,...shuffle(unique(pool).filter(x=>x!==correct)).slice(0,3)]);
    while(opts.length<4)opts.push(`خيار غير صحيح ${opts.length+1}`);
    opts=shuffle(opts.slice(0,4));
    return {opts,correct:opts.indexOf(correct)};
  }

  function derivedPool(A,id){
    const rows=lessonRows(A,id),out=[];
    const titles=rows.map(x=>x.title),summaries=rows.map(x=>x.summary),refs=unique(rows.map(x=>x.ref));

    rows.forEach((x,i)=>{
      // سهل: التعرف على عنوان الدرس من ملخصه
      let c=choiceSet(x.title,titles);
      out.push({
        id:`${id}-d-e-${i}`,subject:id,subjectName:SUBJECTS[id],level:'easy',lesson:i,
        q:`أي عنوان يناسب هذا الوصف: «${x.summary}»؟`,
        opts:c.opts,correct:c.correct,
        why:`هذا الوصف مرتبط في المنهج بدرس «${x.title}».`,
        kind:'lesson-title'
      });

      // متوسط: التعرف على الملخص الصحيح للعنوان
      c=choiceSet(x.summary,summaries);
      out.push({
        id:`${id}-d-m-${i}`,subject:id,subjectName:SUBJECTS[id],level:'medium',lesson:i,
        q:`ما الفكرة الأساسية في درس «${x.title}»؟`,
        opts:c.opts,correct:c.correct,
        why:`الفكرة الأساسية المسجلة للدرس هي: ${x.summary}.`,
        kind:'lesson-summary'
      });

      // عالي: المرجع أو الدليل المدرج للدرس
      if(refs.length>=4){
        c=choiceSet(x.ref,refs);
        out.push({
          id:`${id}-d-h-${i}`,subject:id,subjectName:SUBJECTS[id],level:'hard',lesson:i,
          q:`ما المرجع أو الدليل المدرج في المنهج لدرس «${x.title}»؟`,
          opts:c.opts,correct:c.correct,
          why:`المرجع المدرج لهذا الدرس هو: ${x.ref}.`,
          kind:'lesson-reference'
        });
      }

      // عالي إضافي: التمييز بين موضوعين متقاربين
      const other=rows[(i+7)%rows.length];
      if(other&&other.title!==x.title){
        c=choiceSet(x.title,titles.filter(t=>t!==other.title));
        out.push({
          id:`${id}-d-h2-${i}`,subject:id,subjectName:SUBJECTS[id],level:'hard',lesson:i,
          q:`أي درس من الخيارات التالية يرتبط أكثر بهذه العبارة: «${x.summary}»؟`,
          opts:c.opts,correct:c.correct,
          why:`العبارة مأخوذة من مضمون درس «${x.title}».`,
          kind:'distinction'
        });
      }
    });
    return out;
  }

  function buildSubjectBank(A,id){
    const core=normalizeCore(A,id),derived=derivedPool(A,id);
    const buckets={easy:[],medium:[],hard:[]};

    core.forEach(q=>buckets[q.level].push(q));
    derived.forEach(q=>buckets[q.level].push(q));

    const selected={},globalSeen=new Set(),takenIds=new Set();
    for(const level of ['easy','medium','hard']){
      const arr=[];
      for(const q of buckets[level]){
        const key=q.q.replace(/\s+/g,' ').trim();
        if(!globalSeen.has(key)){
          globalSeen.add(key);takenIds.add(q.id);arr.push(q);
        }
        if(arr.length>=50)break;
      }
      selected[level]=arr;
      if(selected[level].length<50){
        for(const q of [...derived,...core]){
          if(selected[level].length>=50)break;
          const key=q.q.replace(/\s+/g,' ').trim();
          if(!takenIds.has(q.id)&&!globalSeen.has(key)){
            selected[level].push({...q,id:`${q.id}-${level}-borrow`,level});
            takenIds.add(q.id);globalSeen.add(key);
          }
        }
      }
    }
    const bank=[...selected.easy,...selected.medium,...selected.hard];
    return bank.slice(0,150);
  }

  function buildAll(A){
    const banks={};
    Object.keys(SUBJECTS).forEach(id=>banks[id]=buildSubjectBank(A,id));
    return banks;
  }

  function capCount(n){return Math.max(5,Math.min(150,+n||20))}
  function countOptions(selected=20){
    return [5,10,15,20,25,30,40,50,60,75,100,125,150].map(n=>`<option value="${n}" ${n===selected?'selected':''}>${n} سؤال</option>`).join('');
  }

  function pickOneSubject(bank,level,count){
    let pool=level==='all'?bank:bank.filter(q=>q.level===level);
    const recent=load(RECENT,{ids:[]}).ids||[];
    let fresh=pool.filter(q=>!recent.includes(q.id));
    if(fresh.length<count)fresh=pool;
    const qs=shuffle(fresh).slice(0,Math.min(count,pool.length));
    save(RECENT,{ids:[...qs.map(x=>x.id),...recent].slice(0,500)});
    return qs;
  }

  function pickFinal(banks,level,count){
    count=capCount(count);
    const ids=Object.keys(SUBJECTS);
    const per=Math.floor(count/ids.length),rem=count%ids.length;
    let out=[];
    ids.forEach((id,i)=>{
      const bank=level==='all'?banks[id]:banks[id].filter(q=>q.level===level);
      out.push(...shuffle(bank).slice(0,per+(i<rem?1:0)));
    });
    return shuffle(out).slice(0,count);
  }

  function summaryCounts(bank){
    return {
      easy:bank.filter(x=>x.level==='easy').length,
      medium:bank.filter(x=>x.level==='medium').length,
      hard:bank.filter(x=>x.level==='hard').length
    };
  }

  function render(){
    const host=document.getElementById('academyExams'),A=window.NOOR_ACADEMY;
    if(!host||!A)return false;
    const banks=buildAll(A);

    host.innerHTML=`
      <section class="exam-hero v58-hero">
        <div>
          <span class="eyebrow">V58 · بنك الاختبارات الكامل</span>
          <h1>الاختبارات الشرعية</h1>
          <p>150 سؤالًا لكل مادة، بثلاثة مستويات، مع اختيار عدد الأسئلة حتى 150 سؤالًا.</p>
        </div>
        <div class="v58-total"><b>600</b><span>سؤال إجمالي</span></div>
      </section>

      <section class="v58-bank-grid">
        ${Object.entries(SUBJECTS).map(([id,name])=>{
          const c=summaryCounts(banks[id]);
          return `<article class="exam-card v58-subject-card">
            <div class="v58-subject-head"><div><span>${id==='creed'?'☪':id==='fiqh'?'⚖':id==='seerah'?'◈':'❝'}</span><h2>${esc(name)}</h2></div><strong>150 سؤال</strong></div>
            <div class="v58-level-counts"><span>سهل ${c.easy}</span><span>متوسط ${c.medium}</span><span>عالي ${c.hard}</span></div>
            <div class="v58-config">
              <label>المستوى
                <select data-level="${id}">
                  <option value="all">كل المستويات</option>
                  <option value="easy">سهل</option>
                  <option value="medium">متوسط</option>
                  <option value="hard">عالي</option>
                </select>
              </label>
              <label>عدد الأسئلة
                <select data-count="${id}">${countOptions()}</select>
              </label>
            </div>
            <button class="btn primary v58-start-subject" data-subject="${id}">ابدأ اختبار ${esc(name)}</button>
          </article>`;
        }).join('')}
      </section>

      <section class="exam-card v58-final">
        <div class="v58-final-head">
          <div><span class="eyebrow">الاختبار النهائي الشامل</span><h2>العقيدة + الفقه + السيرة + الحديث</h2><p>اختبار متوازن من بنك الـ600 سؤال، وبحد أقصى 150 سؤالًا في المحاولة.</p></div>
          <strong>نهائي شامل</strong>
        </div>
        <div class="v58-final-config">
          <label>مستوى الاختبار
            <select id="v58FinalLevel">
              <option value="all">كل المستويات</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">عالي</option>
            </select>
          </label>
          <label>عدد الأسئلة
            <select id="v58FinalCount">${countOptions(50)}</select>
          </label>
          <button class="btn primary" id="v58FinalStart">ابدأ الاختبار النهائي</button>
        </div>
      </section>

      <section class="exam-card hidden" id="v58ExamBox"></section>
      <section class="exam-card" id="v58LastResult">${renderHistory()}</section>
    `;

    host.querySelectorAll('.v58-start-subject').forEach(b=>b.onclick=()=>{
      const id=b.dataset.subject;
      const level=host.querySelector(`[data-level="${id}"]`).value;
      const count=capCount(host.querySelector(`[data-count="${id}"]`).value);
      const available=level==='all'?150:50;
      startExam(pickOneSubject(banks[id],level,Math.min(count,available)),{scope:id,level,banks});
    });

    const requested=new URLSearchParams(location.search).get('subject');
    if(requested&&SUBJECTS[requested]){
      setTimeout(()=>host.querySelector(`[data-subject="${requested}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),120);
    }

    host.querySelector('#v58FinalStart').onclick=()=>{
      const level=host.querySelector('#v58FinalLevel').value;
      const count=capCount(host.querySelector('#v58FinalCount').value);
      const available=level==='all'?150:150; // across 4 subjects there are >150 in any level
      startExam(pickFinal(banks,level,Math.min(count,available)),{scope:'final',level,banks});
    };
    if(location.hash==='#final')setTimeout(()=>document.querySelector('.v58-final')?.scrollIntoView({behavior:'smooth',block:'start'}),150);
    return true;
  }

  function renderHistory(){
    const h=load(HISTORY,{});
    if(h.percent==null)return `<h2>آخر نتيجة</h2><div class="empty">لم تبدأ اختبار V58 بعد.</div>`;
    return `<h2>آخر نتيجة</h2><div class="last-result"><b>${h.score}/${h.total}</b><span>${h.percent}% · ${grade(h.percent)}</span><div>${stars(h.percent)}</div><small>${h.scope==='final'?'اختبار نهائي شامل':SUBJECTS[h.scope]||''} · ${LEVELS[h.level]||'كل المستويات'}</small></div>`;
  }


  function getCertificateUserName(){
    const candidates=[
      load('noor_user_profile',{}).name,
      load('user_profile',{}).name,
      localStorage.getItem('noor_user_name'),
      localStorage.getItem('userName'),
      localStorage.getItem('username')
    ].filter(Boolean);
    return String(candidates[0]||'').replace(/^"|"$/g,'').trim();
  }

  function certificateEligible(percent){return percent>=60}

  function certificateId(result){
    const d=new Date(result.date||Date.now());
    const ds=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const raw=`${result.name}|${result.scope}|${result.score}|${result.total}|${result.percent}|${ds}`;
    let h=2166136261;
    for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619)}
    return `ND-${ds}-${Math.abs(h>>>0).toString(36).toUpperCase().slice(0,7)}`;
  }

  function askCertificateName(result){
    let name=getCertificateUserName();
    if(!name)name=prompt('اكتب اسمك كما تريد أن يظهر في الشهادة:','')||'';
    name=name.trim();
    if(!name){toast?.('اكتب الاسم أولًا');return}
    result.name=name;
    localStorage.setItem('noor_user_name',name);
    result.certificateId=certificateId(result);
    save('noor_last_certificate_v59',result);
    openCertificate(result);
  }

  function openCertificate(r){
    const scopeName=r.scope==='final'?'الاختبار النهائي الشامل في العلوم الشرعية':`اختبار ${SUBJECTS[r.scope]||'العلوم الشرعية'}`;
    const levelName=LEVELS[r.level]||'كل المستويات';
    const date=new Date(r.date||Date.now()).toLocaleDateString('ar-SA',{year:'numeric',month:'2-digit',day:'2-digit'});
    const breakdown=Object.entries(r.per||{}).map(([id,v])=>`<div><b>${esc(SUBJECTS[id]||id)}</b><span>${v.correct}/${v.total}</span></div>`).join('');
    const win=window.open('','_blank');
    if(!win){alert('اسمح بفتح النافذة المنبثقة لإظهار الشهادة.');return}
    win.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>شهادة نور الذكر</title>
    <style>
    *{box-sizing:border-box}body{margin:0;background:#e9e5da;font-family:Tahoma,Arial,sans-serif;color:#0d2744;padding:24px}.certificate{position:relative;width:1120px;min-height:790px;margin:auto;background:#fffdf7;border:2px solid #b58c35;padding:34px 52px 42px;overflow:hidden;box-shadow:0 20px 60px #0002}.certificate:before{content:"";position:absolute;inset:12px;border:1px solid #d7bc7c;pointer-events:none}.certificate:after{content:"";position:absolute;inset:22px;border:1px solid #eadfc2;pointer-events:none}.corner{position:absolute;width:170px;height:170px;border:18px solid #102b4c;transform:rotate(45deg);opacity:.98}.c1{top:-105px;right:-105px}.c2{bottom:-105px;left:-105px}.top{text-align:center;position:relative;z-index:1}.logo{font-size:48px;color:#b58c35}.brand{font-size:26px;font-weight:900}.sub{font-size:13px;color:#8b7448}.title{font-size:48px;margin:28px 0 8px;color:#102b4c}.grant{font-size:18px}.name{font-size:42px;font-weight:900;margin:10px auto 16px;padding-bottom:12px;border-bottom:1px solid #c6a45e;max-width:720px}.desc{font-size:20px;line-height:1.8}.scope{font-weight:900;color:#9a762d}.stats{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #d7bc7c;margin:28px auto 20px;max-width:850px}.stats>div{padding:14px 8px;border-left:1px solid #e2d2aa;text-align:center}.stats>div:last-child{border-left:0}.stats small,.stats b,.stats span{display:block}.stats small{color:#806c45}.stats b{font-size:30px;margin:5px}.stars{color:#b58c35;font-size:22px}.breakdown{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:14px}.breakdown div{border:1px solid #eadfc2;border-radius:999px;padding:7px 13px}.breakdown span{margin-right:6px;color:#9a762d}.dua{text-align:center;font-size:16px;margin:20px}.foot{display:grid;grid-template-columns:1fr 1fr 1fr;align-items:end;margin-top:28px;font-size:13px}.foot>div{text-align:center}.seal{width:110px;height:110px;border-radius:50%;border:5px double #b58c35;display:grid;place-content:center;margin:auto;color:#9a762d;font-weight:900;transform:rotate(-5deg)}.id{font-family:monospace;font-size:12px}.actions{display:flex;justify-content:center;gap:10px;margin:20px}.actions button{border:0;border-radius:12px;padding:12px 18px;background:#102b4c;color:#fff;font:inherit;cursor:pointer}.actions .gold{background:#b58c35}@media print{body{padding:0;background:white}.actions{display:none}.certificate{box-shadow:none;width:100%;min-height:100vh;border:2px solid #b58c35}@page{size:A4 landscape;margin:8mm}}@media(max-width:900px){body{padding:0;overflow:auto}.certificate{transform-origin:top right;min-width:1120px}.actions{position:fixed;bottom:10px;left:10px;z-index:10}}
    </style></head><body>
    <div class="certificate">
      <div class="corner c1"></div><div class="corner c2"></div>
      <div class="top">
        <div class="logo">☾</div><div class="brand">نور الذكر</div><div class="sub">منصة تعليم الإسلام</div>
        <h1 class="title">شهادة إتمام الاختبار</h1>
        <div class="grant">تُمنح هذه الشهادة إلى</div>
        <div class="name">${esc(r.name)}</div>
        <div class="desc">تقديرًا لإتمام <span class="scope">${esc(scopeName)}</span><br>واجتياز الاختبار بمستوى <b>${esc(levelName)}</b></div>
        <div class="stats">
          <div><small>الدرجة</small><b>${r.score}</b><span>من ${r.total}</span></div>
          <div><small>النسبة</small><b>${r.percent}%</b><span>نسبة النجاح</span></div>
          <div><small>التقدير</small><b style="font-size:22px">${esc(grade(r.percent))}</b><span class="stars">${stars(r.percent)}</span></div>
          <div><small>المستوى</small><b style="font-size:22px">${esc(levelName)}</b><span>${r.scope==='final'?'شامل':'تخصصي'}</span></div>
        </div>
        ${breakdown?`<div class="breakdown">${breakdown}</div>`:''}
        <div class="dua">نسأل الله تعالى أن يجعل هذا العلم حجةً لك لا عليك، وأن ينفع بك الإسلام والمسلمين.</div>
        <div class="foot">
          <div><b>التاريخ</b><p>${date}</p></div>
          <div><div class="seal">تم بحمد<br>الله</div><p class="id">${esc(r.certificateId||certificateId(r))}</p></div>
          <div><b>إدارة منصة نور الذكر</b><p>شهادة إلكترونية صادرة من المنصة</p></div>
        </div>
      </div>
    </div>
    <div class="actions"><button onclick="window.print()" class="gold">طباعة / حفظ PDF</button><button onclick="window.close()">إغلاق</button></div>
    </body></html>`);
    win.document.close();
  }

  function startExam(qs,meta){
    const host=document.getElementById('academyExams'),box=document.getElementById('v58ExamBox');
    if(!qs.length){alert('لا توجد أسئلة كافية لهذا الاختيار.');return}
    host.querySelectorAll('.v58-bank-grid,.v58-final,.v58-hero').forEach(x=>x.classList.add('hidden'));
    box.classList.remove('hidden');
    let i=0,score=0,wrong=[],per={};

    function step(){
      if(i>=qs.length)return finish();
      const x=qs[i];
      per[x.subject]||={correct:0,total:0};per[x.subject].total++;
      box.innerHTML=`
        <div class="v58-exam-top">
          <div><span>${esc(x.subjectName)} · ${LEVELS[x.level]||x.level}</span><b>السؤال ${i+1} من ${qs.length}</b></div>
          <div class="v58-progress"><i style="width:${Math.round(i/qs.length*100)}%"></i></div>
        </div>
        <h2 class="v58-question">${esc(x.q)}</h2>
        <div class="combined-options">${x.opts.map((o,n)=>`<button data-i="${n}">${esc(o)}</button>`).join('')}</div>
        <div class="combined-feedback hidden"></div>`;

      box.querySelectorAll('.combined-options button').forEach(b=>b.onclick=()=>{
        const n=+b.dataset.i;
        box.querySelectorAll('.combined-options button').forEach(z=>z.disabled=true);
        if(n===x.correct){score++;per[x.subject].correct++;b.classList.add('right')}
        else{
          b.classList.add('wrong');box.querySelector(`[data-i="${x.correct}"]`)?.classList.add('right');wrong.push(x);
        }
        const f=box.querySelector('.combined-feedback');f.classList.remove('hidden');
        f.innerHTML=`<b>${n===x.correct?'إجابة صحيحة ✓':'إجابة غير صحيحة'}</b><p>${esc(x.why)}</p><button class="btn primary">التالي</button>`;
        f.querySelector('button').onclick=()=>{i++;step()};
      });
    }

    function finish(){
      const percent=Math.round(score/qs.length*100);
      const result={score,total:qs.length,percent,scope:meta.scope,level:meta.level,date:new Date().toISOString(),per};
      save(HISTORY,result);
      const breakdown=Object.entries(per).map(([id,v])=>`<article><b>${esc(SUBJECTS[id])}</b><strong>${v.correct}/${v.total}</strong><span>${Math.round(v.correct/v.total*100)}%</span></article>`).join('');
      box.innerHTML=`<div class="combined-result v58-result">
        <span class="result-stars">${stars(percent)}</span>
        <h2>${score} من ${qs.length}</h2>
        <strong>${percent}% · ${grade(percent)}</strong>
        <div class="result-breakdown">${breakdown}</div>
        ${wrong.length?`<div class="weak-review"><h3>أسئلة تحتاج مراجعة</h3><ul>${wrong.slice(0,12).map(x=>`<li><b>${esc(x.subjectName)}:</b> ${esc(x.q)}</li>`).join('')}</ul></div>`:'<p>ممتاز، كل الإجابات صحيحة.</p>'}
        ${certificateEligible(percent)?'<button class="btn v59-certificate" id="v59Certificate">إصدار الشهادة باسمي</button>':''}
        <button class="btn primary" id="v58Back">العودة للاختبارات</button>
      </div>`;
      box.querySelector('#v58Back').onclick=render;
      const certBtn=box.querySelector('#v59Certificate');
      if(certBtn)certBtn.onclick=()=>askCertificateName(result);
      document.getElementById('v58LastResult').innerHTML=renderHistory();
    }
    step();
  }

  window.NOOR_RENDER_ACADEMY_EXAMS=render;
  window.NOOR_START_ACADEMY_EXAM=(scope='creed',count=20,level='all')=>{
    const A=window.NOOR_ACADEMY;if(!A)return false;
    const banks=buildAll(A);
    startExam(scope==='final'?pickFinal(banks,level,count):pickOneSubject(banks[scope]||[],level,count),{scope,level,banks});
    return true;
  };

  function init(){
    const host=document.getElementById('academyExams');
    if(host)host.innerHTML='<section class="exam-card"><h2>جاري تجهيز بنك 600 سؤال…</h2><p>150 سؤالًا لكل مادة.</p></section>';
    if(render())return;
    let n=0,t=setInterval(()=>{if(render()||++n>200)clearInterval(t)},100);
  }
  document.addEventListener('DOMContentLoaded',init);
  setTimeout(init,350);
})();
