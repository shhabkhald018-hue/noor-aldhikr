
'use strict';
(()=>{
 function go(){location.href='mushaf.html'}
 function patch(){
   document.querySelectorAll('[data-page="quran"]').forEach(el=>{
     const a=document.createElement('a');
     a.href='mushaf.html';a.className=(el.className||'')+' nav-direct-link';a.innerHTML=el.innerHTML||'القرآن والتفسير';
     el.replaceWith(a);
   });
   const old=window.navTo;
   if(typeof old==='function'&&!old.__directQuran){
     const fn=function(page,...args){if(page==='quran'){go();return}return old.call(this,page,...args)};
     fn.__directQuran=true;window.navTo=fn;
   }
 }
 document.addEventListener('click',e=>{
   const el=e.target.closest?.('[data-page="quran"],a[href="#quran"]');
   if(!el)return;e.preventDefault();e.stopImmediatePropagation();go();
 },true);
 document.addEventListener('DOMContentLoaded',()=>{patch();setTimeout(patch,500);setTimeout(patch,1500)});
})();
