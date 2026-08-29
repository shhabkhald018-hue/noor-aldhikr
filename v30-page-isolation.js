
(function(){
  'use strict';

  function applyPageIsolation(pageId){
    document.querySelectorAll('main > section.page').forEach(section=>{
      section.style.display = section.id === pageId ? 'block' : 'none';
      section.classList.toggle('active', section.id === pageId);
    });

    const home = document.getElementById('home');
    if(home) home.style.display = pageId === 'home' ? 'block' : 'none';

    document.body.dataset.activePage = pageId;
    const gt=document.getElementById('globalPageTitle'); if(gt&&pageId==='dreams') gt.textContent='تعبير الرؤى';
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const originalNav = window.navTo;
    window.navTo = function(pageId){
      if(typeof originalNav === 'function'){
        try { originalNav(pageId); } catch(e) {}
      }
      applyPageIsolation(pageId);
      window.scrollTo({top:0, behavior:'smooth'});
    };

    const initial = 'home';
    applyPageIsolation(initial);

    window.addEventListener('hashchange', ()=>{
      try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
      window.navTo?.('home');
    });
  });
})();
