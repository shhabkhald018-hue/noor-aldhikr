
(function(){
'use strict';

const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const categoryInfo={
 morning:['☀️','أذكار الصباح','التحصين وذكر الله في بداية اليوم'],
 evening:['🌙','أذكار المساء','الطمأنينة والتحصين في آخر اليوم'],
 sleep:['🛏️','أذكار النوم','الأذكار الثابتة قبل النوم'],
 wake:['🌅','أذكار الاستيقاظ','ما يقال عند الاستيقاظ'],
 after_prayer:['🕌','أذكار بعد الصلاة','الأذكار الثابتة بعد الصلوات'],
 home:['🏠','أذكار المنزل','الدخول والخروج من المنزل'],
 mosque:['🕋','أذكار المسجد','الدخول والخروج من المسجد'],
 food:['🍽️','أذكار الطعام','قبل الطعام وبعده'],
 travel:['✈️','أذكار السفر','السفر والركوب والعودة'],
 distress:['🤍','الهم والكرب','أدعية الفرج والطمأنينة'],
 ruqyah:['🛡️','أذكار الرقية الشرعية','آيات وأدعية صحيحة للرقية والاستشفاء'],
  virtue:['🌿','فضل الذكر','آيات وأحاديث صحيحة في فضل ذكر الله'],
  general:['✨','أذكار عامة','أذكار متنوعة من القرآن والسنة']
};

function safeStore(k,v){try{localStorage.setItem('noor_'+k,JSON.stringify(v))}catch(e){}}
function safeLoad(k,d){try{const v=JSON.parse(localStorage.getItem('noor_'+k));return v??d}catch(e){return d}}

function installThemeSystem(){
 const old=$('#themeBtn');
 if(!old)return;
 old.setAttribute('aria-label','تغيير المظهر');
 old.setAttribute('title','تغيير المظهر');
 old.innerHTML='<span class="theme-icon">◐</span><span class="theme-label">المظهر</span>';

 const apply=(mode)=>{
   const resolved=mode==='system'
     ? (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')
     : mode;
   document.documentElement.dataset.theme=resolved;
   document.documentElement.dataset.themeMode=mode;
   safeStore('theme_mode',mode);
   const label=mode==='dark'?'ليلي':mode==='light'?'فاتح':'تلقائي';
   old.querySelector('.theme-icon').textContent=mode==='dark'?'☾':mode==='light'?'☀':'◐';
   old.querySelector('.theme-label').textContent=label;
   old.setAttribute('aria-pressed',resolved==='dark'?'true':'false');
   const meta=$('meta[name="theme-color"]');
   if(meta)meta.content=resolved==='dark'?'#0b1712':'#176b52';
 };
 let mode=safeLoad('theme_mode',safeLoad('theme','light'));
 if(!['light','dark','system'].includes(mode))mode='light';
 apply(mode);
 old.onclick=()=>{
   const current=document.documentElement.dataset.themeMode||'light';
   const next=current==='light'?'dark':current==='dark'?'system':'light';
   apply(next);
   if(window.toast)toast(next==='dark'?'تم تشغيل الوضع الليلي':next==='system'?'المظهر حسب الجهاز':'تم تشغيل الوضع الفاتح');
 };
 matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{
   if((document.documentElement.dataset.themeMode||'')==='system')apply('system');
 });
}

function createGlobalBackBar(){
 if($('#globalInnerBar'))return;
 const bar=document.createElement('div');
 bar.id='globalInnerBar';
 bar.className='global-inner-bar hidden';
 bar.innerHTML=`
   <button id="globalHomeBtn" class="global-home-btn" type="button" aria-label="العودة إلى الصفحة الرئيسية">
     <span class="home-btn-icon">⌂</span>
     <span>الصفحة الرئيسية</span>
   </button>
   <div class="global-page-title">
     <small>أنت الآن في</small>
     <strong id="globalPageTitle">القسم</strong>
   </div>
   <button id="globalBackBtn" class="global-back-btn" type="button" aria-label="الرجوع للصفحة السابقة">← رجوع</button>`;
 const main=$('main');
 main?.parentNode.insertBefore(bar,main);
 $('#globalHomeBtn').onclick=()=>window.navTo?.('home');
 $('#globalBackBtn').onclick=()=>{
   if(document.body.classList.contains('inner-view'))window.navTo?.('home');
   else history.back();
 };
}

const pageNames={
 home:'الرئيسية',quran:'القرآن الكريم',memorization:'اختبارات الحفظ',adhkar:'الأذكار',
 ruqyah:'الرقية الشرعية',library:'المراجع',prayer:'مواقيت الصلاة',qibla:'اتجاه القبلة',
 tasbeeh:'المسبحة',khatma:'الختمة',favorites:'المفضلة',search:'البحث',support:'الدعم',
 privacy:'الخصوصية',account:'حسابي'
};

function patchNavigation(){
 const original=window.navTo;
 window.navTo=function(id){
   if(typeof original==='function')original(id);
   else{
     $$('.page').forEach(p=>p.classList.toggle('active',p.id===id));
     try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
   }
   const inner=id!=='home';
   document.body.classList.toggle('home-view',!inner);
   document.body.classList.toggle('inner-view',inner);
   $('#globalInnerBar')?.classList.toggle('hidden',!inner);
   const t=$('#globalPageTitle'); if(t)t.textContent=pageNames[id]||'القسم';
   if(id==='adhkar')showAdhkarCategories();
   requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}));
 };
 $$('.nav button').forEach(b=>b.onclick=()=>window.navTo(b.dataset.page));
 const initial='home';
 window.navTo(initial);
 window.addEventListener('popstate',()=>{
   window.navTo('home');
 });
}

function buildAdhkarUI(){
 const page=$('#adhkar');
 if(!page || $('#adhkarCategoriesView'))return;
 const title=page.querySelector('.section-title');
 const list=$('#adhkarList');
 if(!list)return;

 const categories=document.createElement('div');
 categories.id='adhkarCategoriesView';
 categories.innerHTML=`
   <section class="adhkar-landing">
    <div class="adhkar-landing-copy">
      <span class="eyebrow">الأذكار اليومية</span>
      <h2>اختر القسم الذي تريد قراءته</h2>
      <p>كل قسم يفتح وحده، مع عداد للتكرار، حفظ التقدم، المصدر، والمفضلة.</p>
    </div>
    <div class="adhkar-summary">
      <div><b id="adhkarTotalCount">0</b><span>ذكرًا</span></div>
      <div><b>13</b><span>قسمًا</span></div>
      <div><b>✓</b><span>حفظ تلقائي</span></div>
    </div>
   </section>
   <div id="adhkarCategoryCards" class="adhkar-category-grid"></div>`;

 const reader=document.createElement('div');
 reader.id='adhkarReaderView';
 reader.className='hidden';
 reader.innerHTML=`
   <div class="reader-toolbar">
    <button id="backToAdhkarCategories" class="btn reader-back-btn" type="button">← أقسام الأذكار</button>
    <div><small>القسم الحالي</small><h2 id="activeAdhkarCategoryTitle">الأذكار</h2></div>
    <div class="reader-filters"></div>
   </div>`;
 title?.classList.add('hidden');
 page.insertBefore(categories,list);
 page.insertBefore(reader,list);
 reader.appendChild(list);
 const filters=reader.querySelector('.reader-filters');
 const search=$('#dhikrSearch'), select=$('#dhikrCategory');
 if(search)filters.appendChild(search);
 if(select){select.classList.add('visually-hidden');reader.appendChild(select)}
 $('#backToAdhkarCategories').onclick=showAdhkarCategories;
 renderCategoryCards();
}

function getAdhkarData(){
 if(Array.isArray(window.allAdhkar))return window.allAdhkar;
 if(typeof window.getDhikrById==='function'){
   const cards=$$('#adhkarList .dhikr');
   return cards.map(c=>({cat:c.querySelector('.dhikr-category')?.textContent||''}));
 }
 return [];
}
function countVisibleByCat(cat){
 const sel=$('#dhikrCategory');
 if(!sel)return '';
 const old=sel.value;
 sel.value=cat;
 sel.dispatchEvent(new Event('change'));
 const n=$$('#adhkarList .dhikr').length;
 sel.value=old;
 sel.dispatchEvent(new Event('change'));
 return n;
}
function renderCategoryCards(){
 const box=$('#adhkarCategoryCards');if(!box)return;
 let total=0;
 box.innerHTML=Object.entries(categoryInfo).map(([key,v])=>{
   const n=countVisibleByCat(key); total+=Number(n||0);
   return `<button class="adhkar-category-card" data-cat="${key}" type="button">
     <span class="category-icon">${v[0]}</span><span class="category-arrow">←</span>
     <h3>${v[1]}</h3><p>${v[2]}</p><small>${n} ذكر</small>
   </button>`;
 }).join('');
 const totalEl=$('#adhkarTotalCount');if(totalEl)totalEl.textContent=total;
 box.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>openAdhkarCategory(b.dataset.cat));
}
function openAdhkarCategory(cat){
 const select=$('#dhikrCategory');
 if(select){select.value=cat;select.dispatchEvent(new Event('change'))}
 $('#adhkarCategoriesView')?.classList.add('hidden');
 $('#adhkarReaderView')?.classList.remove('hidden');
 const info=categoryInfo[cat];
 if(info)$('#activeAdhkarCategoryTitle').textContent=info[1];
 const search=$('#dhikrSearch');if(search)search.value='';
 requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}));
}
function showAdhkarCategories(){
 $('#adhkarCategoriesView')?.classList.remove('hidden');
 $('#adhkarReaderView')?.classList.add('hidden');
 const search=$('#dhikrSearch');if(search)search.value='';
 renderCategoryCards();
}
window.showAdhkarCategories=showAdhkarCategories;

function accessibilityAndPolish(){
 document.documentElement.style.colorScheme='light dark';
 $$('button').forEach(b=>{if(!b.getAttribute('type'))b.setAttribute('type','button')});
 const skip=document.createElement('a');
 skip.href='#mainContent';skip.className='skip-link';skip.textContent='تخطي إلى المحتوى';
 document.body.prepend(skip);
 const main=$('main');if(main)main.id='mainContent';
 window.addEventListener('keydown',e=>{
   if(e.key==='Escape' && document.body.classList.contains('inner-view'))window.navTo?.('home');
 });
}

document.addEventListener('DOMContentLoaded',()=>{
 installThemeSystem();
 createGlobalBackBar();
 buildAdhkarUI();
 patchNavigation();
 accessibilityAndPolish();
 setTimeout(renderCategoryCards,250);
});
})();
