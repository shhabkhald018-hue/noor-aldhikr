
(function(){
const categoryInfo={
 morning:['☀️','أذكار الصباح','ابدأ يومك بالذكر والتحصين'], evening:['🌙','أذكار المساء','اختم يومك بالذكر والطمأنينة'],
 sleep:['🛏️','أذكار النوم','ما يقال قبل النوم'], wake:['🌅','أذكار الاستيقاظ','ما يقال عند الاستيقاظ'],
 after_prayer:['🕌','بعد الصلاة','الأذكار الثابتة بعد الصلاة'], home:['🏠','المنزل','الدخول والخروج من المنزل'],
 mosque:['🕋','المسجد','الدخول والخروج من المسجد'], food:['🍽️','الطعام','قبل الطعام وبعده'],
 travel:['✈️','السفر','أدعية السفر والركوب'], distress:['🤍','الهم والكرب','أدعية الفرج والطمأنينة'],
 virtue:['🌿','فضل الذكر','آيات وأحاديث صحيحة في فضل ذكر الله'],
 ruqyah:['🤲','الرقية الشرعية','آيات وأدعية الرقية'], general:['✨','أذكار عامة','أذكار متنوعة ثابتة']
};
function buildCategoryCards(){
 const box=document.querySelector('#adhkarCategoryCards'); if(!box)return;
 const data=Array.isArray(window.allAdhkar)?window.allAdhkar:[];
 box.innerHTML=Object.entries(categoryInfo).map(([key,v])=>{
  const count=data.filter(x=>x.cat===key).length;
  return `<button class="adhkar-category-card" data-open-adhkar="${key}"><span class="category-icon">${v[0]}</span><span class="category-arrow">←</span><h3>${v[1]}</h3><p>${v[2]}</p><small>${count||''} ذكر</small></button>`;
 }).join('');
 box.querySelectorAll('[data-open-adhkar]').forEach(b=>b.onclick=()=>openCategory(b.dataset.openAdhkar));
}
function openCategory(cat){
 const select=document.querySelector('#dhikrCategory'); if(select){select.value=cat;select.dispatchEvent(new Event('change'))}
 document.querySelector('#adhkarCategoriesView')?.classList.add('hidden');
 document.querySelector('#adhkarReaderView')?.classList.remove('hidden');
 const info=categoryInfo[cat]; if(info)document.querySelector('#activeAdhkarCategoryTitle').textContent=info[1];
 scrollTo({top:0,behavior:'smooth'});
}
window.showAdhkarCategories=function(){
 document.querySelector('#adhkarCategoriesView')?.classList.remove('hidden');
 document.querySelector('#adhkarReaderView')?.classList.add('hidden');
 const search=document.querySelector('#dhikrSearch');if(search)search.value='';
 buildCategoryCards();
};
document.querySelector('#backToAdhkarCategories')?.addEventListener('click',window.showAdhkarCategories);

function libraryFilter(){
 const search=(document.querySelector('#librarySearch')?.value||'').trim().toLowerCase();
 const active=document.querySelector('.library-index-btn.active')?.dataset.libraryFilter||'all';
 document.querySelectorAll('.library-topic').forEach(x=>{
   const book=x.dataset.book||'';const text=(x.dataset.search+' '+x.textContent).toLowerCase();
   x.classList.toggle('hidden',!(active==='all'||book===active||book==='all')||!text.includes(search));
 });
}
document.querySelectorAll('.library-index-btn').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.library-index-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');libraryFilter();
});
document.querySelector('#librarySearch')?.addEventListener('input',libraryFilter);
setTimeout(buildCategoryCards,100);
})();
