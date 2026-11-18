'use strict';
(()=>{
  const PAGE_TITLES={
    home:'الرئيسية',search:'البحث',adhkar:'الأذكار',creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة النبوية',hadith:'الحديث',studentDashboard:'لوحة الطالب',memorization:'اختبارات الحفظ',prayer:'الصلاة',ruqyah:'الرقية الشرعية',assessment:'تقييم الأعراض',dreams:'تعبير الرؤى',library:'المراجع والمصادر',qibla:'القبلة',khatma:'الختمة',favorites:'المفضلة',tasbeeh:'المسبحة',privateChat:'محادثة المالك',support:'الدعم والخصوصية'
  };
  const DIRECT={quran:'mushaf.html',exams:'exams.html'};
  let active='home';
  let installing=false;

  function combined(group,target){
    document.querySelectorAll(`[data-combined-panel-group="${group}"]`).forEach(p=>p.classList.toggle('hidden',p.dataset.combinedPanel!==target));
    document.querySelectorAll(`[data-combined-group="${group}"][data-combined-target]`).forEach(b=>b.classList.toggle('active',b.dataset.combinedTarget===target));
  }

  function normalize(id){
    let target=id,combinedTarget=null;
    if(id==='sourcesPolicy'){target='library';combinedTarget='sources'}
    else if(id==='privacy'){target='support';combinedTarget='privacy'}
    return {target,combinedTarget};
  }

  function render(target){
    const pages=[...document.querySelectorAll('.page')];
    const exists=pages.some(p=>p.id===target);
    if(!exists)return false;
    pages.forEach(p=>{
      /* V30 and other legacy modules wrote inline display:none. V88 removes that authority on every navigation. */
      p.style.removeProperty('display');
      p.classList.toggle('active',p.id===target);
      p.setAttribute('aria-hidden',p.id===target?'false':'true');
    });
    document.querySelectorAll('.nav [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===target));
    document.body.classList.toggle('home-view',target==='home');
    document.body.classList.toggle('inner-view',target!=='home');
    document.body.dataset.activePage=target;
    document.getElementById('globalInnerBar')?.classList.toggle('hidden',target==='home');
    const title=document.getElementById('globalPageTitle');if(title)title.textContent=PAGE_TITLES[target]||'القسم';
    active=target;
    return true;
  }

  function navigate(id,options={}){
    if(DIRECT[id]){location.href=DIRECT[id];return true}
    const {target,combinedTarget}=normalize(id);
    if(!render(target))return false;
    if(target==='adhkar')window.showAdhkarCategories?.();
    if(target==='library')setTimeout(()=>combined('library',combinedTarget||'references'),0);
    if(target==='support')setTimeout(()=>combined('support',combinedTarget||'support'),0);
    if(!options.keepScroll)requestAnimationFrame(()=>window.scrollTo({top:0,behavior:options.instant?'auto':'smooth'}));
    try{history.replaceState(null,'',location.pathname+location.search)}catch{}
    window.dispatchEvent(new CustomEvent('noor:navigation',{detail:{id,target,source:'v88'}}));
    return true;
  }
  navigate.__v88Router=true;
  navigate.__directQuran=true;

  function installAuthority(){
    if(installing)return; installing=true;
    try{
      const d=Object.getOwnPropertyDescriptor(window,'navTo');
      if(!d || d.configurable){
        Object.defineProperty(window,'navTo',{
          configurable:true,
          enumerable:true,
          get(){return navigate},
          set(fn){if(fn && fn!==navigate)window.__NOOR_LAST_LEGACY_NAV_OVERRIDE=fn}
        });
      }else window.navTo=navigate;
    }catch{window.navTo=navigate}
    installing=false;
  }

  function bindNavigation(){
    document.addEventListener('click',e=>{
      const el=e.target.closest?.('.nav [data-page]');
      if(!el)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      navigate(el.dataset.page);
    },true);
  }

  function boot(){
    installAuthority();
    bindNavigation();
    /* Clear stale inline page-display state left by previous runtime versions. */
    document.querySelectorAll('.page').forEach(p=>p.style.removeProperty('display'));
    const initial=window.NOOR_INITIAL_ROUTE;
    if(initial && document.getElementById(initial))navigate(initial,{instant:true});
    else if(document.querySelector('.page.active'))navigate(document.querySelector('.page.active').id,{instant:true});
    else navigate('home',{instant:true});
    /* Defensive re-assertion for legacy timers. */
    [50,300,900,1800].forEach(ms=>setTimeout(()=>{installAuthority();render(active)},ms));
  }

  window.NOOR_V88_ROUTER={navigate,render,get active(){return active},installAuthority};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
