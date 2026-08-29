'use strict';
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function enforceRuqyahOnly(){
    $('#v4013AssessmentEncyclopedia')?.remove();
    if(window.NOOR_V4022?.rebuild){ try{ window.NOOR_V4022.rebuild(); }catch{} }
    const h=$('#assessment .v4022-hero h1'); if(h) h.textContent='تقييم الرقية الشرعية فقط';
    const p=$('#assessment .v4022-hero p'); if(p) p.textContent='اختر العين أو الحسد أو السحر أو المس أو أسباب الاشتباه أو خطة العلاج. الأسئلة إرشادية ولا تثبت تشخيصًا ولا تغني عن الرقية الشرعية الآمنة ومراجعة المختص عند الحاجة.';
  }
  function readSurahCache(n){try{return JSON.parse(localStorage.getItem('surah_v37_'+n)||'null')}catch{return null}}
  function setupMobileMushaf(){
    if(!matchMedia('(max-width: 760px)').matches) return;
    const shell=$('#quranReader .v39-reader-shell'); if(!shell) return;
    const surah=Number(shell.dataset.surah||0), flow=$('#v39QuranFlow',shell), page=$('.v39-mushaf-page',shell);
    if(!surah||!flow||!page||flow.dataset.v4027==='1') return;
    const ayahs=$$('.v39-ayah',flow); if(ayahs.length<2) return;
    flow.dataset.v4027='1'; page.classList.add('v4027-mobile-mushaf');
    const cached=readSurahCache(surah), byAyah=new Map((cached?.ayahs||[]).map(a=>[Number(a.numberInSurah),Number(a.page)||0]));
    const groups=[], keys=[];
    ayahs.forEach((ayah,i)=>{let key=Number(ayah.dataset.page)||byAyah.get(Number(ayah.dataset.ayah))||Math.ceil((i+1)/8);let index=keys.indexOf(key);if(index<0){keys.push(key);groups.push({key,nodes:[]});index=groups.length-1}groups[index].nodes.push(ayah)});
    if(groups.length<2 && ayahs.length>10){groups.length=0;keys.length=0;for(let i=0;i<ayahs.length;i+=9)groups.push({key:groups.length+1,nodes:ayahs.slice(i,i+9)})}
    if(groups.length<2) return;
    const pager=document.createElement('div'); pager.className='v4027-mobile-pager'; pager.innerHTML='<button type="button" data-dir="prev" aria-label="الصفحة السابقة">‹</button><div class="v4027-page-indicator"></div><button type="button" data-dir="next" aria-label="الصفحة التالية">›</button>';
    const strip=document.createElement('div'); strip.className='v4027-page-strip';
    groups.forEach((g,i)=>{const section=document.createElement('section');section.className='v4027-mushaf-mobile-page';section.innerHTML='<div class="v4027-mushaf-mobile-page-head"><span>صفحة '+(i+1)+'</span><span>'+g.nodes.length+' آيات</span></div>';g.nodes.forEach(node=>section.appendChild(node));strip.appendChild(section)});
    flow.textContent=''; flow.appendChild(pager); flow.appendChild(strip); const hint=document.createElement('div'); hint.className='v4027-swipe-hint'; hint.textContent='اسحب يمينًا أو يسارًا للتنقل بين صفحات القراءة'; flow.appendChild(hint);
    let current=0,startX=0; const indicator=$('.v4027-page-indicator',pager);
    function show(i){current=Math.max(0,Math.min(groups.length-1,i));strip.style.transform='translateX(' + (-current*100) + '%)';indicator.textContent='صفحة '+(current+1)+' من '+groups.length;pager.querySelector('[data-dir="prev"]').disabled=current===0;pager.querySelector('[data-dir="next"]').disabled=current===groups.length-1;}
    pager.addEventListener('click',e=>{const b=e.target.closest('button[data-dir]');if(!b)return;show(current+(b.dataset.dir==='next'?1:-1));});
    flow.addEventListener('touchstart',e=>{startX=e.changedTouches[0].clientX},{passive:true});
    flow.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX;if(Math.abs(dx)>45)show(current+(dx<0?1:-1));},{passive:true});
    show(0);
  }
  function boot(){enforceRuqyahOnly();setupMobileMushaf();setTimeout(enforceRuqyahOnly,500);setTimeout(setupMobileMushaf,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  new MutationObserver(()=>setupMobileMushaf()).observe(document.documentElement,{subtree:true,childList:true});
})();