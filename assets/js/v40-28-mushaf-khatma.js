
'use strict';
(function(){
  const TOTAL=604;
  const WAQF=/([ۘۙۚۛۖۗۜ۞۝])/g;
  const KHATM_DUA="اللهم لك الحمد على ما أنعمت به علينا من تلاوة كتابك، ولك الحمد حتى ترضى، ولك الحمد إذا رضيت، ولك الحمد بعد الرضا.\nاللهم اجعل القرآن العظيم ربيع قلوبنا، ونور صدورنا، وجلاء أحزاننا، وذهاب همومنا وغمومنا، وسائقنا ودليلنا إليك وإلى جنات النعيم.\nاللهم علمنا منه ما جهلنا، وذكرنا منه ما نسينا، وارزقنا تلاوته آناء الليل وأطراف النهار على الوجه الذي يرضيك عنا.\nاللهم اجعله حجة لنا لا علينا، واجعله شفيعًا لنا، ورفيقًا لنا في قبورنا، ونورًا لنا على الصراط، وسببًا لرفعة درجاتنا.\nاللهم اجعلنا من أهل القرآن الذين هم أهلك وخاصتك، واجعلنا ممن يقرأه فيعمل به، ويتدبره فيهتدي به، ويدعو إليه بالحكمة والرحمة.\nاللهم أصلح بالقرآن قلوبنا، وزك به نفوسنا، وطهر به أخلاقنا، واشرح به صدورنا، وأصلح به بيوتنا وذرياتنا وأحوالنا.\nاللهم ارفعنا بالقرآن، ولا تضعنا به، وأكرمنا به، ولا تهنا بعده، واجعل خير أعمالنا خواتيمها، وخير أيامنا يوم نلقاك.\nاللهم اغفر لنا ولوالدينا ولأهلينا وللمؤمنين والمؤمنات، الأحياء منهم والأموات، واشف مرضانا ومرضى المسلمين، وارحم موتانا وموتى المسلمين.\nاللهم آتنا في الدنيا حسنة، وفي الآخرة حسنة، وقنا عذاب النار. اللهم صل وسلم وبارك على نبينا محمد، وعلى آله وصحبه أجمعين.";
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cfg=()=>window.NOOR_CONFIG||{};
  function base(){return cfg().quranApiBase||'https://api.alquran.cloud/v1'}
  function cacheKey(p){return 'mushaf_page_v4028_'+p}
  function savePage(p,data){try{localStorage.setItem(cacheKey(p),JSON.stringify(data));localStorage.setItem('last_mushaf_page',String(p))}catch{}}
  function loadPage(p){try{return JSON.parse(localStorage.getItem(cacheKey(p))||'null')}catch{return null}}
  async function fetchPage(page,force=false){
    page=Math.max(1,Math.min(TOTAL,Number(page)||1));
    const cached=!force&&loadPage(page); if(cached?.ayahs?.length)return cached;
    const r=await fetch(`${base()}/page/${page}/quran-uthmani`,{headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error('تعذر تحميل صفحة المصحف: HTTP '+r.status);
    const j=await r.json(), d=j.data||{};
    const ayahs=(d.ayahs||[]).map(a=>({
      text:String(a.text||'').trim(), number:Number(a.number), numberInSurah:Number(a.numberInSurah), page:Number(a.page||page), juz:Number(a.juz||d.number),
      sajda:!!a.sajda, surah:{number:Number(a.surah?.number), name:a.surah?.name||'', englishName:a.surah?.englishName||''}
    }));
    const data={page,ayahs,source:'AlQuran.Cloud quran-uthmani page endpoint'}; savePage(page,data); return data;
  }
  function formatText(text){return esc(text).replace(WAQF,'<span class="v4028-waqf" title="علامة وقف">$1</span>')}
  function groupPage(data){
    const out=[]; let current=null;
    data.ayahs.forEach(a=>{if(!current||current.surah.number!==a.surah.number){current={surah:a.surah,ayahs:[]};out.push(current)} current.ayahs.push(a)});
    return out;
  }
  function pageArticle(data,{compact=false}={}){
    const groups=groupPage(data);
    const first=data.ayahs[0]||{}, last=data.ayahs[data.ayahs.length-1]||{};
    const firstName=groups[0]?.surah?.name||'سورة';
    const lastName=groups[groups.length-1]?.surah?.name||firstName;
    const title=firstName===lastName?firstName:`${firstName} - ${lastName}`;
    const body=groups.map((g,index)=>`<section class="v4028-surah-group">${index===0?'':`<div class="v4028-surah-break"><h2>${esc(g.surah.name||'سورة')}</h2></div>`}<div class="v4028-quran-text">${g.ayahs.map(a=>`<button class="v4028-ayah ${a.sajda?'has-sajda':''}" type="button" data-surah="${a.surah.number}" data-ayah="${a.numberInSurah}" data-page="${data.page}"><span class="v4028-ayah-text">${formatText(a.text)}</span><span class="v4028-ayah-mark">${a.numberInSurah}</span>${a.sajda?'<span class="v4028-sajda">۩ سجدة</span>':''}</button>`).join(' ')}</div></section>`).join('');
    return `<article class="v4028-mushaf-page v4029-paper" data-page="${data.page}"><header class="v4029-mushaf-top"><span>الجزء ${first.juz||''}</span><div class="v4029-surah-title">${esc(title)}</div><span class="v4029-page-label">صفحة ${data.page}</span></header>${body}${data.page===TOTAL?`<section class="v4028-khatm-dua"><h3>دعاء ختم القرآن</h3><p>${esc(KHATM_DUA)}</p><small>دعاء جامع، وليس نصًا نبويًا مخصوصًا لختم القرآن.</small></section>`:''}<footer class="v4029-page-bottom"><b>${data.page}</b></footer></article>${compact?'':legend()}<div class="v4029-source-limit">النص بالرسم العثماني عبر مصدر API. الشكل مستوحى من صفحات المصحف الورقي، وليس نسخة رسمية مطابقة لمصحف المدينة إلا بعد اعتماد مصدر مصحف رسمي مرخّص.</div>`;
  }
  function legend(){return '<div class="v4028-waqf-legend"><span>مـ: وقف لازم</span><span>لا: لا تقف</span><span>ج: وقف جائز</span><span>قلى: الوقف أولى</span><span>صلى: الوصل أولى</span><span>۩: سجدة تلاوة</span></div>'}
  async function renderMushafPage(page,force=false){
    const q=$('#quran'), reader=$('#quranReader'); if(!reader)return;
    q?.classList.add('noor-v4028-quran'); page=Math.max(1,Math.min(TOTAL,Number(page)||Number(localStorage.getItem('last_mushaf_page'))||1));
    reader.innerHTML='<div class="v4028-loading">جاري تحميل صفحة المصحف...</div>';
    try{const data=await fetchPage(page,force); reader.innerHTML=`<div class="v4028-mushaf-shell"><div class="v4028-mushaf-toolbar"><button class="btn" data-v4028-page="${Math.max(1,page-1)}">السابق</button><div><div class="v4028-page-jump"><input id="v4028PageInput" type="number" min="1" max="604" value="${page}" aria-label="رقم الصفحة"><button class="btn primary" id="v4028GoPage">اذهب</button></div><div class="v4028-mushaf-meta">604 صفحة · آخر صفحة تحتوي دعاء الختمة · اسحب يمينًا أو يسارًا على الهاتف</div></div><button class="btn" data-v4028-page="${Math.min(TOTAL,page+1)}">التالي</button></div>${pageArticle(data) }<div class="v4028-read-actions"><button class="btn" id="v4028FontDown">أ−</button><button class="btn" id="v4028FontUp">أ+</button><button class="btn" id="v4028ReloadPage">تحديث الصفحة</button></div></div>`; bindReader(page);}catch(err){reader.innerHTML=`<div class="v4028-error"><b>تعذر تحميل صفحة المصحف</b><p>${esc(err.message||err)}</p><button class="btn primary" onclick="openMushafPage(${page},true)">إعادة المحاولة</button></div>`}
  }
  function bindReader(page){
    $$('#quranReader [data-v4028-page]').forEach(button=>button.addEventListener('click',()=>renderMushafPage(Number(button.dataset.v4028Page))));
    $('#v4028GoPage')?.addEventListener('click',()=>renderMushafPage($('#v4028PageInput')?.value));
    $('#v4028PageInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')renderMushafPage(e.currentTarget.value)});
    $('#v4028ReloadPage')?.addEventListener('click',()=>renderMushafPage(page,true));
    $('#v4028FontDown')?.addEventListener('click',()=>window.v39Font?.(-1)); $('#v4028FontUp')?.addEventListener('click',()=>window.v39Font?.(1));
    const reader=$('#quranReader'); let start=0; reader?.addEventListener('touchstart',e=>{start=e.changedTouches[0].clientX},{passive:true}); reader?.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-start;if(Math.abs(dx)>55)renderMushafPage(page+(dx<0?1:-1))},{passive:true});
  }
  async function surahToPage(n){try{const r=await fetch(`${base()}/surah/${n}/quran-uthmani`);const j=await r.json();return j.data?.ayahs?.[0]?.page||1}catch{return 1}}
  async function openSurahAsPage(n){const p=await surahToPage(n); renderMushafPage(p)}
  function replaceQuran(){if(!$('#quranReader'))return; window.openMushafPage=renderMushafPage; window.openSurah=openSurahAsPage; renderMushafPage(Number(localStorage.getItem('last_mushaf_page'))||1)}
  function renderKhatmaShell(){
    const sec=$('#khatma'); if(!sec||sec.dataset.v4028)return; sec.dataset.v4028='1';
    sec.innerHTML=`<div class="v4028-khatma"><header class="v4028-khatma-hero"><div><span>ختمة بالصفحات فقط</span><h1>وردك اليومي من المصحف</h1><p>حدد الصفحة الحالية وعدد الصفحات في اليوم، وسيظهر المطلوب فقط من القرآن.</p></div><button class="btn" type="button" onclick="navTo('quran')">فتح المصحف</button></header><form class="v4028-khatma-form" id="v4028KhatmaForm"><label><span>ابدأ من صفحة</span><input id="v4028KhatmaStart" type="number" min="1" max="604" value="${Number(localStorage.getItem('khatma_start_page_v4028'))||1}"></label><label><span>كم صفحة في اليوم؟</span><input id="v4028KhatmaDaily" type="number" min="1" max="60" value="${Number(localStorage.getItem('khatma_daily_pages_v4028'))||5}"></label><button class="btn primary" type="submit">إظهار ورد اليوم</button></form><section class="v4028-khatma-result" id="v4028KhatmaResult"></section></div>`;
    $('#v4028KhatmaForm')?.addEventListener('submit',e=>{e.preventDefault();renderKhatmaPages()}); renderKhatmaPages();
  }
  async function renderKhatmaPages(){
    const box=$('#v4028KhatmaResult'); if(!box)return; const start=Math.max(1,Math.min(TOTAL,Number($('#v4028KhatmaStart')?.value)||1)); const daily=Math.max(1,Math.min(60,Number($('#v4028KhatmaDaily')?.value)||5)); const end=Math.min(TOTAL,start+daily-1);
    localStorage.setItem('khatma_start_page_v4028',String(start)); localStorage.setItem('khatma_daily_pages_v4028',String(daily));
    box.innerHTML=`<div class="v4028-khatma-summary"><div><small>ورد اليوم فقط</small><h2>من صفحة ${start} إلى ${end}</h2><p>${end-start+1} صفحة من القرآن، بدون أقسام جانبية أو محتوى زائد.</p></div><button class="btn primary" id="v4028DonePages">تمت القراءة</button></div><div class="v4028-loading">جاري تحميل صفحات الورد...</div>`;
    $('#v4028DonePages')?.addEventListener('click',()=>{const next=Math.min(TOTAL,end+1);$('#v4028KhatmaStart').value=next;localStorage.setItem('khatma_start_page_v4028',String(next));renderKhatmaPages()});
    try{const pages=[]; for(let p=start;p<=end;p++)pages.push(await fetchPage(p)); box.querySelector('.v4028-loading')?.remove(); const holder=document.createElement('div'); holder.className='v4028-khatma-pages'; holder.innerHTML=pages.map(p=>pageArticle(p,{compact:true})).join(''); box.appendChild(holder);}catch(err){box.innerHTML+=`<div class="v4028-error">${esc(err.message||err)}</div>`}
  }
  function boot(){
    setTimeout(replaceQuran,180); setTimeout(replaceQuran,900); setTimeout(replaceQuran,1800); renderKhatmaShell();
    const old=window.navTo; if(!window.__v4028NavPatch){window.__v4028NavPatch=true; window.navTo=function(id){const r=old?.apply(this,arguments); if(id==='quran')setTimeout(replaceQuran,120); if(id==='khatma')setTimeout(renderKhatmaShell,80); return r;}}
    const qr=$('#quranReader'); if(qr&&!window.__v4028QuranObserver){window.__v4028QuranObserver=true; new MutationObserver(()=>{if($('#quranReader .v39-reader-shell'))setTimeout(replaceQuran,30)}).observe(qr,{childList:true,subtree:true});}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
