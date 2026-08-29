'use strict';
(()=>{
 const VERSION='40.4';
 const REQUIRED_IDS=['home','quran','prayer','khatma','memorization','adhkar','ruqyah','assessment','dreams','library','ruqyahEncyclopedia','eyeEncyclopedia','hasadEncyclopedia','magicEncyclopedia','knowledgeBank'];
 const REQUIRED_RUQYAH=['موسوعة الرقية الشرعية','موسوعة العين','موسوعة الحسد','موسوعة السحر','موسوعة المس','برامج التحصين','بنك المعرفة الإسلامي'];
 function audit(){
  const missing=REQUIRED_IDS.filter(id=>!document.getElementById(id));
  const text=document.body.innerText||'';
  const missingCards=REQUIRED_RUQYAH.filter(t=>!text.includes(t));
  const duplicateIds=[...document.querySelectorAll('[id]')].map(x=>x.id).filter((x,i,a)=>a.indexOf(x)!==i);
  const result={version:VERSION,missing,missingCards,duplicateIds:[...new Set(duplicateIds)],checkedAt:new Date().toISOString()};
  window.NOOR_V40_4_AUDIT=result;
  try{localStorage.setItem('noor_last_integrity_audit',JSON.stringify(result));}catch(_){ }
  if(missing.length||missingCards.length||duplicateIds.length) console.warn('Noor V40.4 integrity audit',result);
  else console.info('Noor V40.4 integrity audit passed',result);
 }
 function accessibility(){
  const main=document.querySelector('main'); if(main&&!main.id) main.id='mainContent';
  if(main&&!document.querySelector('.skip-link')){const a=document.createElement('a');a.className='skip-link';a.href='#mainContent';a.textContent='تخطي إلى المحتوى';document.body.prepend(a)}
  document.querySelectorAll('button:not([type])').forEach(b=>b.type='button');
  document.querySelectorAll('img:not([alt])').forEach(img=>img.alt='');
 }
 function scrollTopButton(){
  if(document.querySelector('.v404-top'))return;
  const b=document.createElement('button');b.className='v404-top';b.type='button';b.setAttribute('aria-label','العودة إلى أعلى الصفحة');b.textContent='↑';
  b.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});document.body.appendChild(b);
  addEventListener('scroll',()=>b.classList.toggle('show',scrollY>650),{passive:true});
 }
 function serviceWorkerUpdate(){
  /* V40.8: تسجيل Service Worker يتم من bootstrap.js فقط.
     منع التسجيل المكرر هنا يوقف حلقة التحديث وإعادة تحميل الصفحة. */
 }

 document.addEventListener('DOMContentLoaded',()=>{accessibility();scrollTopButton();setTimeout(audit,900);serviceWorkerUpdate()});
})();
