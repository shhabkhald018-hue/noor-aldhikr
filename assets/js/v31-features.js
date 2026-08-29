
(function(){
'use strict';
async function openBurningDua(){
 const reader=document.getElementById('ruqyahReaderContent');
 try{
  const r=await fetch('assets/data/dua_burning_jinn.json');
  const d=await r.json();
  document.getElementById('ruqyahHub')?.classList.add('hidden');
  document.getElementById('ruqyahReader')?.classList.remove('hidden');
  document.getElementById('rqReaderTitle').textContent=d.title;
  document.getElementById('rqReaderKicker').textContent='نص منسوب — غير مأثور';
  document.getElementById('rqReaderDescription').textContent=d.intro;
  reader.innerHTML=`<article class="rq-reading-card burning-dua-card">
   <div class="dua-verification-note"><b>بيان المصدر</b><p>${d.attribution}</p></div>
   <div class="dua-safety-note"><b>تنبيه</b><p>${d.notice}</p></div>
   <div class="long-dua-text">${d.text}</div>
   <div class="rq-source-line">المصدر: ${d.attribution}</div>
  </article>`;
  window.scrollTo({top:0,behavior:'smooth'});
 }catch(e){reader.innerHTML='<div class="notice">تعذر فتح النص.</div>'}
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('[data-rq-open="burningDua"]').forEach(b=>b.onclick=openBurningDua);
});
})();
