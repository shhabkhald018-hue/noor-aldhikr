
(function(){
const $=s=>document.querySelector(s);
const state={pool:[],questions:[],index:0,score:0,answers:[]};

function selectedJuz(){return [...document.querySelectorAll('.juz-check:checked')].map(x=>Number(x.value))}
function renderJuz(){
 const box=$('#juzSelector');if(!box)return;
 box.innerHTML=Array.from({length:30},(_,i)=>`<label class="juz-chip"><input class="juz-check" type="checkbox" value="${i+1}"><span>الجزء ${i+1}</span></label>`).join('');
 const saved=load('quiz_selected_juz',[30]);
 document.querySelectorAll('.juz-check').forEach(x=>x.checked=saved.includes(Number(x.value)));
}
async function loadJuz(n){
 let data=load('quran_juz_'+n);
 if(data?.ayahs?.length)return data.ayahs;
 const r=await fetch(`${CFG.quranApiBase}/juz/${n}/quran-uthmani`);
 if(!r.ok)throw new Error('تعذر تحميل الجزء '+n);
 const j=await r.json();
 if(!j.data?.ayahs?.length)throw new Error('بيانات الجزء غير مكتملة');
 store('quran_juz_'+n,j.data);
 return j.data.ayahs;
}
function clean(t){return String(t||'').replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/,'').trim()}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function uniqueOptions(correct, candidates){
 const arr=[correct];
 for(const c of shuffle(candidates)){if(!arr.includes(c)&&c&&arr.length<4)arr.push(c)}
 return shuffle(arr);
}
function buildQuestions(pool,type,count){
 const qs=[];
 const usable=pool.filter((a,i)=>type!=='next'||(pool[i+1]&&pool[i+1].surah.number===a.surah.number));
 for(const a of shuffle(usable)){
   if(qs.length>=count)break;
   if(type==='next'){
     const idx=pool.indexOf(a),next=pool[idx+1];
     const correct=clean(next.text);
     const candidates=pool.filter(x=>x.number!==next.number).map(x=>clean(x.text)).filter(x=>x.length>12);
     qs.push({type,prompt:clean(a.text),correct,options:uniqueOptions(correct,candidates),meta:`${a.surah.name}، الآية ${a.numberInSurah}`});
   }else{
     const correct=`${a.surah.name} — الآية ${a.numberInSurah}`;
     const same=pool.filter(x=>x.number!==a.number).map(x=>`${x.surah.name} — الآية ${x.numberInSurah}`);
     qs.push({type,prompt:clean(a.text),correct,options:uniqueOptions(correct,same),meta:'حدد موضع الآية'});
   }
 }
 return qs;
}
function drawQuestion(){
 const q=state.questions[state.index],box=$('#quizBox');
 $('#quizWelcome').classList.add('hidden');$('#quizResult').classList.add('hidden');box.classList.remove('hidden');
 box.innerHTML=`<div class="quiz-progress"><div style="width:${state.index/state.questions.length*100}%"></div></div>
 <div class="row between"><b>السؤال ${state.index+1} من ${state.questions.length}</b><span>النتيجة: ${state.score}</span></div>
 <p class="quiz-label">${q.type==='next'?'ما الآية التالية؟':'في أي سورة ورقم تقع هذه الآية؟'}</p>
 <div class="quiz-prompt" translate="no">${q.prompt}</div>
 <div class="quiz-options">${q.options.map((o,i)=>`<button class="quiz-option" data-answer="${encodeURIComponent(o)}"><span>${i+1}</span>${o}</button>`).join('')}</div>
 <button id="quitQuiz" class="btn danger">إنهاء الاختبار</button>`;
 box.querySelectorAll('.quiz-option').forEach(b=>b.onclick=()=>answer(decodeURIComponent(b.dataset.answer),b));
 $('#quitQuiz').onclick=finish;
}
function answer(value,btn){
 const q=state.questions[state.index],ok=value===q.correct;
 if(ok)state.score++;
 state.answers.push({question:q.prompt,answer:value,correct:q.correct,ok});
 document.querySelectorAll('.quiz-option').forEach(b=>{
   b.disabled=true;
   const v=decodeURIComponent(b.dataset.answer);
   if(v===q.correct)b.classList.add('correct');
   else if(b===btn)b.classList.add('wrong');
 });
 const fb=document.createElement('div');fb.className='quiz-feedback '+(ok?'ok':'bad');
 fb.innerHTML=ok?'إجابة صحيحة ✅':`الإجابة الصحيحة: <b>${q.correct}</b>`;
 $('#quizBox').appendChild(fb);
 setTimeout(()=>{state.index++;state.index>=state.questions.length?finish():drawQuestion()},1300);
}
function finish(){
 $('#quizBox').classList.add('hidden');
 const result=$('#quizResult');result.classList.remove('hidden');
 const total=state.questions.length||1,pct=Math.round(state.score/total*100);
 result.innerHTML=`<h2>نتيجة الاختبار</h2><div class="quiz-score">${state.score} / ${total}</div>
 <div class="khatma-progress"><div style="width:${pct}%"></div></div><p>${pct>=90?'ممتاز، بارك الله في حفظك 🌟':pct>=70?'جيد جدًا، واصل المراجعة 📖':'استمر في المراجعة والتكرار؛ التقدم يأتي بالتدرج.'}</p>
 <button class="btn primary" onclick="navTo('memorization')">اختبار جديد</button>`;
 const history=load('quiz_history',[]);
 history.unshift({date:new Date().toISOString(),score:state.score,total,juz:selectedJuz(),type:$('#quizType').value});
 store('quiz_history',history.slice(0,20));drawHistory();
}
function drawHistory(){
 const box=$('#quizHistory');if(!box)return;const h=load('quiz_history',[]);
 box.innerHTML='<h3>سجل النتائج</h3>'+(h.length?`<div class="history-list">${h.map(x=>`<div><b>${x.score}/${x.total}</b><span>الأجزاء: ${x.juz.join('، ')}</span><small>${new Date(x.date).toLocaleDateString('ar')}</small></div>`).join('')}</div>`:'<p class="muted">لا توجد اختبارات سابقة.</p>');
}
async function start(){
 const juz=selectedJuz(),status=$('#quizLoadStatus');
 if(!juz.length){toast('اختر جزءًا واحدًا على الأقل');return}
 store('quiz_selected_juz',juz);status.textContent='جاري تحميل الآيات المختارة…';
 $('#startQuiz').disabled=true;
 try{
  const chunks=await Promise.all(juz.map(loadJuz));
  state.pool=chunks.flat().sort((a,b)=>a.number-b.number);
  state.questions=buildQuestions(state.pool,$('#quizType').value,Number($('#quizCount').value));
  if(state.questions.length<3)throw new Error('لا توجد آيات كافية لإنشاء الاختبار');
  state.index=0;state.score=0;state.answers=[];status.textContent='';
  drawQuestion();
 }catch(e){status.textContent=e.message||'تعذر تحميل الاختبار. اتصل بالإنترنت وحاول مرة أخرى.'}
 finally{$('#startQuiz').disabled=false}
}
window.openRuqyahHome=function(){
 navTo('adhkar');
 const c=$('#dhikrCategory');if(c){c.value='ruqyah';c.dispatchEvent(new Event('change'))}
 setTimeout(()=>document.querySelector('#adhkarList')?.scrollIntoView({behavior:'smooth'}),100);
};
document.addEventListener('DOMContentLoaded',()=>{
 renderJuz();drawHistory();
 $('#selectAllJuz')?.addEventListener('click',()=>document.querySelectorAll('.juz-check').forEach(x=>x.checked=true));
 $('#clearAllJuz')?.addEventListener('click',()=>document.querySelectorAll('.juz-check').forEach(x=>x.checked=false));
 $('#startQuiz')?.addEventListener('click',start);
});
})();
