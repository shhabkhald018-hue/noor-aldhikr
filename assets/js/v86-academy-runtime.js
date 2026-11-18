'use strict';
(()=>{
  function applyCloudLessons(){
    const A=window.NOOR_ACADEMY,L=window.NOOR_V86_CLOUD_LESSONS;
    if(!A||!L)return false;
    for(const id of Object.keys(L)){if(A[id]&&L[id]?.length)A[id].paths=L[id];}
    return true;
  }
  async function mergeProgress(){
    const rows=await window.NOOR_V86_ACADEMY?.loadProgress?.();if(!rows?.length)return;
    let st={};try{st=JSON.parse(localStorage.getItem('noor_academy_progress')||'{}')}catch{}
    for(const r of rows){if(!r.completed)continue;const i=Number(r.lesson_key);if(!Number.isFinite(i))continue;const cur=new Set(st[r.subject]?.done||[]);cur.add(i);st[r.subject]={...(st[r.subject]||{}),done:[...cur]};}
    localStorage.setItem('noor_academy_progress',JSON.stringify(st));
  }
  document.addEventListener('DOMContentLoaded',async()=>{await mergeProgress();let n=0;const t=setInterval(()=>{if(applyCloudLessons()||++n>30)clearInterval(t)},100)});
  document.addEventListener('click',e=>{
    const b=e.target.closest('.lesson-complete,.lesson-check');if(!b)return;
    const page=b.closest('.noor-academy-page');if(!page)return;
    const subject=page.id;if(!['creed','fiqh','seerah','hadith'].includes(subject))return;
    const i=Number(b.dataset.i);if(Number.isFinite(i))setTimeout(()=>window.NOOR_V86_ACADEMY?.saveProgress?.(subject,i,true),0);
  },true);
})();
