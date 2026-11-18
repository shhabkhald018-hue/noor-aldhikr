
'use strict';
(()=>{
 const CFG=window.NOOR_CONFIG||{};
 const API=CFG.quranApiBase||'https://api.alquran.cloud/v1';
 const TAPI=CFG.quranEncApiBase||'https://quranenc.com/api/v1';
 const SURAH_NAMES=['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبإ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];
 const $=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const load=(k,d=null)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
 const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const initialLocation=window.NOOR_QURAN_V86?.parseDeepLink?.(location.search)||{page:null,surah:null,ayah:null};
 let page=clamp(+initialLocation.page||+localStorage.getItem('m54_page')||+load('q52_last_page',1)||1,1,604);
 let rows=[],selected=null,touchX=null,wakeLock=null;
 let audio=new Audio(),queue=[],queueIndex=0,repeatRemain=1,paused=false;
 let tafsirCache=new Map();

 async function get(url){
   const r=await fetch(url,{headers:{Accept:'application/json'}});
   if(!r.ok)throw new Error(`HTTP ${r.status}`);
   return r.json();
 }
 function toast(text){
   const old=document.querySelector('.m54-toast');old?.remove();
   const x=document.createElement('div');x.className='m54-toast';x.textContent=text;document.body.appendChild(x);setTimeout(()=>x.remove(),1800);
 }
 function stripBasmala(t,s,a){return window.NOOR_QURAN_V86?.stripLeadingBasmala?.(t,s,a) ?? String(t||'').trim();}
 function pageProgress(){return Math.round(page/604*100)}
 function hizbFromQuarter(q){return q?Math.floor((q-1)/4)+1:null}
 function quarterName(q){
   if(!q)return '—';
   const h=hizbFromQuarter(q),part=((q-1)%4)+1;
   return `الحزب ${h} · الربع ${part}`;
 }
 function updateChrome(){
   $('m54PageMeta').textContent=`صفحة ${page}`;
   $('m54SidePage').textContent=page;
   $('m54PageInput').value=page;
   $('m54ProgressBar').style.width=`${pageProgress()}%`;
   const first=rows[0],sel=selected||first;
   const s=sel?.surah?.number||sel?.s||first?.surah?.number;
   $('m54SurahName').textContent=s?`سورة ${SURAH_NAMES[s-1]||s}`:'المصحف الشريف';
   const juz=sel?.juz||first?.juz;
   const hq=sel?.hizbQuarter||first?.hizbQuarter;
   $('m54JuzMeta').textContent=juz?`الجزء ${juz}`:'الجزء —';
   $('m54HizbMeta').textContent=hq?quarterName(hq):'الحزب —';
 }
 async function openPage(n,{preserveSelection=false}={}){
   page=clamp(+n||1,1,604);
   localStorage.setItem('m54_page',page);
   save('q52_last_page',page);
   $('m54Reader').innerHTML='<div class="m54-loading"><span></span><p>جاري تحميل صفحة المصحف…</p></div>';
   updateChrome();
   try{
     const j=window.NOOR_QURAN_DATA?.page
       ?await window.NOOR_QURAN_DATA.page(page)
       :(window.NOOR_QURAN_V86?.fetchPage?await window.NOOR_QURAN_V86.fetchPage(page,API):await get(`${API}/page/${page}/quran-uthmani`));
     rows=j.data?.ayahs||[];
     const integrity=window.NOOR_QURAN_V86?.validatePage?.(rows);
     if(!rows.length||integrity?.ok===false)throw new Error('بيانات صفحة المصحف غير مكتملة');
     renderPage();
     if(!preserveSelection)selected=null;
     const first=rows[0];
     save('m54_last_page_context',{page,s:first.surah.number,a:first.numberInSurah});
     updateChrome();
   }catch(e){
     $('m54Reader').innerHTML=`<div class="m54-loading"><p>تعذر تحميل صفحة المصحف.</p><small>${esc(e.message)}</small><button class="primary" id="m54Retry" style="border:0;border-radius:12px;padding:10px 16px;margin-top:12px">إعادة المحاولة</button></div>`;
     $('m54Retry')?.addEventListener('click',()=>openPage(page));
   }
 }
 function renderPage(){
   const groups=[];
   for(const x of rows){
     let g=groups.find(z=>z.n===x.surah.number);
     if(!g){g={n:x.surah.number,name:x.surah.name,rows:[]};groups.push(g)}
     g.rows.push(x);
   }
   const last=load('last_ayah');
   $('m54Reader').innerHTML=`<article class="m54-page">
     <div class="m54-ornament">۞ ۞ ۞</div>
     ${groups.map(g=>`<section>
       <div class="m54-surah"><h2>${esc(g.name)}</h2><small>${SURAH_NAMES[g.n-1]?`سورة ${esc(SURAH_NAMES[g.n-1])}`:''}</small></div>
       ${window.NOOR_QURAN_V86?.shouldShowHeadingBasmala?.(g.n,g.rows[0]?.numberInSurah) ?? (g.rows[0]?.numberInSurah===1&&g.n!==1&&g.n!==9)?'<div class="m54-basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>':''}
       <div class="m54-flow">${g.rows.map(x=>{
          const lastClass=last?.s===g.n&&last?.a===x.numberInSurah?' last-read':'';
          const sajda=x.sajda?'<small class="m54-sajda">سجدة</small>':'';
          return `<span class="m54-ayah${lastClass}" data-s="${g.n}" data-a="${x.numberInSurah}" data-g="${x.number}" data-juz="${x.juz||''}" data-hq="${x.hizbQuarter||''}" data-page="${x.page||page}">${esc(stripBasmala(x.text,g.n,x.numberInSurah))} <span class="m54-num">${x.numberInSurah}</span>${sajda}</span>`;
       }).join(' ')}</div>
     </section>`).join('')}
     <footer class="m54-footer"><span>${rows[0]?.juz?`الجزء ${rows[0].juz}`:''}</span><b>صفحة ${page}</b><span>${rows[rows.length-1]?.hizbQuarter?quarterName(rows[rows.length-1].hizbQuarter):''}</span></footer>
   </article>`;
   document.querySelectorAll('.m54-ayah').forEach(el=>el.addEventListener('click',()=>selectAyah(el)));bindAyahGestures();
 }
 function selectAyah(el){
   document.querySelectorAll('.m54-ayah.selected').forEach(x=>x.classList.remove('selected'));
   el.classList.add('selected');
   selected={
     s:+el.dataset.s,a:+el.dataset.a,g:+el.dataset.g,
     juz:+el.dataset.juz||null,hizbQuarter:+el.dataset.hq||null,page:+el.dataset.page||page,
     text:el.childNodes[0]?.textContent?.trim()||el.textContent.trim()
   };
   save('last_ayah',{s:selected.s,a:selected.a});
   save('m54_last',{page,s:selected.s,a:selected.a});
   updateChrome();updateSavedStar();
 }
 function updateSavedStar(){
   const fav=load('favorite_ayat',[])||[];
   $('m54Save').querySelector('b').textContent=selected&&fav.some(x=>x.key===`${selected.s}:${selected.a}`)?'★':'☆';
 }
 async function showTafsir(){
   if(!selected){toast('اختر آية أولًا');return}
   $('m54TafsirSheet').hidden=false;
   $('m54TafsirTitle').textContent=`سورة ${SURAH_NAMES[selected.s-1]||selected.s} — الآية ${selected.a}`;
   $('m54TafsirText').textContent='جاري تحميل التفسير…';$('m54TafsirSource').textContent='';
   const key=`${selected.s}:${selected.a}`;
   if(tafsirCache.has(key)){
     const t=tafsirCache.get(key);$('m54TafsirText').textContent=t.text;$('m54TafsirSource').textContent=t.source;return;
   }
   try{
     const j=await get(`${TAPI}/translation/aya/arabic_moyassar/${selected.s}/${selected.a}`);
     const r=j.result||j.data||j;
     const text=String(r.translation||r.text||'التفسير غير متاح').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
     const t={text,source:'المصدر: التفسير الميسر عبر QuranEnc'};
     tafsirCache.set(key,t);$('m54TafsirText').textContent=t.text;$('m54TafsirSource').textContent=t.source;
   }catch{
     try{
       const j=await get(`${API}/ayah/${selected.g}/ar.muyassar`);
       const t={text:j.data?.text||'التفسير غير متاح',source:'مصدر احتياطي: AlQuran Cloud'};
       tafsirCache.set(key,t);$('m54TafsirText').textContent=t.text;$('m54TafsirSource').textContent=t.source;
     }catch{$('m54TafsirText').textContent='تعذر تحميل التفسير حاليًا.'}
   }
 }
 function toggleSaved(){
   if(!selected){toast('اختر آية أولًا');return}
   let fav=load('favorite_ayat',[])||[],key=`${selected.s}:${selected.a}`;
   const exists=fav.some(x=>x.key===key);
   if(exists){fav=fav.filter(x=>x.key!==key);toast('تمت إزالة الآية من المحفوظات')}
   else{
     fav.push({key,surah:selected.s,ayah:selected.a,surahName:SURAH_NAMES[selected.s-1]||String(selected.s),text:selected.text,page});
     toast('تم حفظ الآية');
   }
   save('favorite_ayat',fav);updateSavedStar();
 }
 function renderSaved(){
   const fav=load('favorite_ayat',[])||[],h=$('m54SavedBody');
   h.innerHTML=fav.length?fav.map(x=>`<article class="m54-saved-item"><b>سورة ${esc(x.surahName||x.surah)} — الآية ${x.ayah}</b><p>${esc(x.text)}</p><button data-open="${x.page||''}:${x.surah}:${x.ayah}">فتح في المصحف</button></article>`).join(''):'<div class="m54-empty">لا توجد آيات محفوظة بعد.</div>';
   h.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',async()=>{
     const [p,s,a]=b.dataset.open.split(':').map(Number);
     $('m54SavedSheet').hidden=true;
     if(p)await openPage(p);
     else await openSurah(s);
     setTimeout(()=>{const el=document.querySelector(`.m54-ayah[data-s="${s}"][data-a="${a}"]`);el?.scrollIntoView({behavior:'smooth',block:'center'});el?.click()},250);
   }));
 }
 function audioUrl(g){return `https://cdn.islamic.network/quran/audio/128/${$('m54Reciter').value||'ar.alafasy'}/${g}.mp3`}
 function setAudioQueue(items,start=0){
   queue=items.filter(x=>x?.g);queueIndex=clamp(start,0,Math.max(0,queue.length-1));
   repeatRemain=+$('m54Repeat').value||1;
   if(queue.length)playCurrent();
 }
 function playSelected(){
   if(!selected){toast('اختر آية أولًا');return}
   setAudioQueue([{...selected}]);
 }
 function playCurrent(){
   const x=queue[queueIndex];if(!x)return;
   document.querySelectorAll('.m54-ayah.playing').forEach(z=>z.classList.remove('playing'));
   const el=document.querySelector(`.m54-ayah[data-g="${x.g}"]`);el?.classList.add('playing');el?.scrollIntoView({behavior:'smooth',block:'center'});
   audio.src=audioUrl(x.g);
   $('m54MiniPlayer').hidden=false;
   $('m54NowPlaying').textContent=`سورة ${SURAH_NAMES[x.s-1]||x.s} · الآية ${x.a}`;
   audio.play().then(()=>{paused=false}).catch(()=>toast('تعذر تشغيل التلاوة'));
 }
 function audioStep(delta){
   if(!queue.length){if(selected)playSelected();return}
   queueIndex=clamp(queueIndex+delta,0,queue.length-1);repeatRemain=+$('m54Repeat').value||1;playCurrent();
 }
 function stopAudio(){
   audio.pause();audio.currentTime=0;queue=[];document.querySelectorAll('.m54-ayah.playing').forEach(x=>x.classList.remove('playing'));$('m54MiniPlayer').hidden=true;
 }
 audio.onended=()=>{
   if(repeatRemain>1){repeatRemain--;playCurrent();return}
   repeatRemain=+$('m54Repeat').value||1;
   if(queueIndex<queue.length-1){queueIndex++;playCurrent()}else stopAudio();
 };
 audio.onerror=()=>toast('تعذر تحميل ملف التلاوة');
 async function openJuz(juz){
   try{
     const j=window.NOOR_QURAN_DATA?.juz?await window.NOOR_QURAN_DATA.juz(juz):await get(`${API}/juz/${juz}/quran-uthmani`),first=(j.data?.ayahs||[])[0];
     if(!first)throw new Error('لا توجد بيانات');
     await openPage(first.page||1);
     setTimeout(()=>document.querySelector(`.m54-ayah[data-g="${first.number}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),200);
   }catch(e){toast('تعذر فتح الجزء')}
 }
 async function openHizb(hizb){
   const q=(hizb-1)*4+1;
   try{
     const j=window.NOOR_QURAN_DATA?.hizbQuarter?await window.NOOR_QURAN_DATA.hizbQuarter(q):await get(`${API}/hizbQuarter/${q}/quran-uthmani`),first=(j.data?.ayahs||j.data||[])[0];
     if(!first)throw new Error('لا توجد بيانات');
     await openPage(first.page||1);
   }catch(e){toast('تعذر فتح الحزب')}
 }
 async function openSurah(s,ayah=1){
   try{
     const j=window.NOOR_QURAN_DATA?.surah?await window.NOOR_QURAN_DATA.surah(s):await get(`${API}/surah/${s}/quran-uthmani`),first=(j.ayahs||j.data?.ayahs||[])[0];
     if(!first)throw new Error('لا توجد بيانات');
     await openPage(first.page||1);
     setTimeout(()=>{const el=document.querySelector(`.m54-ayah[data-s="${s}"][data-a="${ayah}"]`)||document.querySelector(`.m54-ayah[data-s="${s}"]`);el?.scrollIntoView({behavior:'smooth',block:'center'});if(el&&Number(ayah)>1)selectAyah(el)},220);
   }catch(e){toast('تعذر فتح السورة')}
 }
 function fillSelects(){
   $('m54JuzSelect').innerHTML=Array.from({length:30},(_,i)=>`<option value="${i+1}">الجزء ${i+1}</option>`).join('');
   $('m54HizbSelect').innerHTML=Array.from({length:60},(_,i)=>`<option value="${i+1}">الحزب ${i+1}</option>`).join('');
   $('m54SurahSelect').innerHTML=SURAH_NAMES.map((n,i)=>`<option value="${i+1}">${i+1}. ${esc(n)}</option>`).join('');
 }
 function applyReadingTheme(theme){
   theme=['light','sepia','dark'].includes(theme)?theme:'light';
   document.documentElement.dataset.readingTheme=theme;
   document.documentElement.dataset.theme=theme==='dark'?'dark':'light';
   localStorage.setItem('m882_reading_theme',theme);localStorage.setItem('m54_theme',theme==='dark'?'dark':'light');
   if($('m87ReadingTheme'))$('m87ReadingTheme').value=theme;
   if($('m54Theme'))$('m54Theme').textContent=theme==='light'?'◐':theme==='sepia'?'◒':'◑';
   document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0F1214':theme==='sepia'?'#D9CCAF':'#236A57');
 }
 function toggleTheme(){const order=['light','sepia','dark'],cur=document.documentElement.dataset.readingTheme||'light';applyReadingTheme(order[(order.indexOf(cur)+1)%order.length])}
 function toggleFocus(){document.body.classList.toggle('m54-focus');$('m54Focus').textContent=document.body.classList.contains('m54-focus')?'◎':'◉'}
 function fontChange(delta){
   const f=$('m54Font');f.value=clamp((+f.value||100)+delta,82,145);applyFont();
 }
 function applyFont(){document.documentElement.style.setProperty('--scale',($('m54Font').value||100)/100);localStorage.setItem('m54_font',$('m54Font').value)}
 async function wakeToggle(){
   if(!$('m54KeepAwake').checked){try{await wakeLock?.release()}catch{}wakeLock=null;return}
   if(!('wakeLock' in navigator)){toast('إبقاء الشاشة مستيقظة غير مدعوم على هذا الجهاز');$('m54KeepAwake').checked=false;return}
   try{wakeLock=await navigator.wakeLock.request('screen')}catch{toast('تعذر تفعيل إبقاء الشاشة مستيقظة')}
 }
 function closeSheets(){document.querySelectorAll('.m54-sheet').forEach(x=>x.hidden=true)}
 function continueReading(){
   const last=load('m54_last')||load('m53_last')||load('m54_last_page_context')||{page};
   closeSheets();openPage(last.page||page).then(()=>setTimeout(()=>{const el=document.querySelector(`.m54-ayah[data-s="${last.s}"][data-a="${last.a}"]`);el?.scrollIntoView({behavior:'smooth',block:'center'});el?.click()},250));
 }
 function openIndex(tab='surahs',focusSearch=false){
   $('m87SurahDrawer').hidden=false;renderIndex(tab,$('m87QuranSearch')?.value||'');
   document.querySelectorAll('[data-index-tab]').forEach(b=>b.classList.toggle('active',b.dataset.indexTab===tab));
   if(focusSearch)setTimeout(()=>$('m87QuranSearch')?.focus(),80);
 }
 function renderIndex(tab='surahs',query=''){
   const host=$('m87IndexBody');if(!host)return;const q=String(query||'').trim();let html='';
   if(tab==='surahs'){
     html=SURAH_NAMES.map((name,i)=>({name,n:i+1})).filter(x=>!q||x.name.includes(q)||String(x.n)===q).map(x=>`<button class="m87-index-item" data-open-surah="${x.n}"><span><b>سورة ${esc(x.name)}</b><small>${x.n} من 114</small></span><span class="m87-index-number">${x.n}</span></button>`).join('');
   }else if(tab==='juz'){
     html=Array.from({length:30},(_,i)=>`<button class="m87-index-item" data-open-juz="${i+1}"><span><b>الجزء ${i+1}</b><small>فتح أول صفحة في الجزء</small></span><span class="m87-index-number">${i+1}</span></button>`).join('');
   }else if(tab==='pages'){
     html=Array.from({length:604},(_,i)=>i+1).filter(n=>!q||String(n).includes(q)).map(n=>`<button class="m87-index-item" data-open-page="${n}"><span><b>صفحة ${n}</b><small>المصحف الشريف</small></span><span class="m87-index-number">${n}</span></button>`).join('');
   }else{
     const fav=load('favorite_ayat',[])||[];html=fav.length?fav.map(x=>`<button class="m87-index-item" data-open-saved="${x.page||''}:${x.surah}:${x.ayah}"><span><b>سورة ${esc(x.surahName||x.surah)} · آية ${x.ayah}</b><small>${esc(String(x.text||'').slice(0,72))}</small></span><span class="m87-index-number">☆</span></button>`).join(''):'<div class="m54-empty">لا توجد آيات محفوظة بعد.</div>';
   }
   host.innerHTML=html||'<div class="m54-empty">لا توجد نتائج.</div>';
   host.querySelectorAll('[data-open-surah]').forEach(b=>b.onclick=()=>{$('m87SurahDrawer').hidden=true;openSurah(+b.dataset.openSurah)});
   host.querySelectorAll('[data-open-juz]').forEach(b=>b.onclick=()=>{$('m87SurahDrawer').hidden=true;openJuz(+b.dataset.openJuz)});
   host.querySelectorAll('[data-open-page]').forEach(b=>b.onclick=()=>{$('m87SurahDrawer').hidden=true;openPage(+b.dataset.openPage)});
   host.querySelectorAll('[data-open-saved]').forEach(b=>b.onclick=async()=>{const [p,s,a]=b.dataset.openSaved.split(':').map(Number);$('m87SurahDrawer').hidden=true;if(p)await openPage(p);else await openSurah(s,a);setTimeout(()=>{const el=document.querySelector(`.m54-ayah[data-s="${s}"][data-a="${a}"]`);el?.scrollIntoView({behavior:'smooth',block:'center'});if(el)selectAyah(el)},220)});
 }
 function openAyahActions(){
   if(!selected)return;$('m87AyahActionTitle').textContent=`سورة ${SURAH_NAMES[selected.s-1]||selected.s} · الآية ${selected.a}`;$('m87SelectedAyahText').textContent=selected.text||'';$('m87AyahActions').hidden=false;updateSavedStar();
 }
 function bindAyahGestures(){
   document.querySelectorAll('.m54-ayah').forEach(el=>{
     let timer=null;
     el.addEventListener('pointerdown',()=>{timer=setTimeout(()=>{selectAyah(el);openAyahActions();timer=null},520)});
     const cancel=()=>{if(timer){clearTimeout(timer);timer=null}};el.addEventListener('pointerup',cancel);el.addEventListener('pointerleave',cancel);el.addEventListener('pointercancel',cancel);
     el.addEventListener('contextmenu',e=>{e.preventDefault();selectAyah(el);openAyahActions()});
   });
 }
 function copySelectedReference(){
   if(!selected){toast('اختر آية أولًا');return}const ref=`${selected.text} — سورة ${SURAH_NAMES[selected.s-1]||selected.s}، الآية ${selected.a}`;
   if(navigator.clipboard?.writeText)navigator.clipboard.writeText(ref).then(()=>toast('تم نسخ الآية ومرجعها')).catch(()=>toast('تعذر النسخ'));
   else{const t=document.createElement('textarea');t.value=ref;document.body.appendChild(t);t.select();try{document.execCommand('copy');toast('تم نسخ الآية ومرجعها')}catch{toast('تعذر النسخ')}t.remove()}
 }
 async function loadOwnerQuranDefaults(){
   const cfg=window.NOOR_CONFIG||{};if(!cfg.supabaseUrl||!cfg.publishableKey)return;
   try{
     const url=cfg.supabaseUrl.replace(/\/$/,'')+'/rest/v1/app_settings?key=in.(quran_default_theme,quran_default_reciter,quran_tafsir_enabled,quran_saved_enabled)&select=key,value';
     const r=await fetch(url,{headers:{apikey:cfg.publishableKey,Accept:'application/json'}});if(!r.ok)return;const rows=await r.json(),settings=Object.fromEntries((rows||[]).map(x=>[x.key,x.value]));
     if(!localStorage.getItem('m882_reading_theme')&&settings.quran_default_theme)applyReadingTheme(settings.quran_default_theme);
     const rec=localStorage.getItem('m87_reciter')||settings.quran_default_reciter;if(rec&&[...$('m54Reciter').options].some(o=>o.value===rec))$('m54Reciter').value=rec;
     const tafsir=settings.quran_tafsir_enabled!=='false',saved=settings.quran_saved_enabled!=='false';
     [$('m54TafsirBtn'),$('m87ActionTafsir')].forEach(x=>{if(x)x.hidden=!tafsir});[$('m87Saved'),$('m54Save'),$('m54SavedList')].forEach(x=>{if(x)x.hidden=!saved});
   }catch(e){console.warn('V87 Quran owner settings:',e)}
 }
 function bind(){
   if($('m54Prev'))$('m54Prev').onclick=()=>openPage(page-1);$('m54PrevPageSide').onclick=()=>openPage(page-1);
   if($('m54Next'))$('m54Next').onclick=()=>openPage(page+1);$('m54NextPageSide').onclick=()=>openPage(page+1);
   $('m54Play').onclick=playSelected;$('m54TafsirBtn').onclick=showTafsir;$('m54Save').onclick=toggleSaved;
   $('m54Theme').onclick=toggleTheme;$('m54Focus').onclick=toggleFocus;$('m54FontDown').onclick=()=>fontChange(-5);$('m54FontUp').onclick=()=>fontChange(5);
   $('m54Settings').onclick=()=>{$('m54SettingsSheet').hidden=false};
   $('m87OpenIndex').onclick=()=>openIndex('surahs');$('m87OpenSearch').onclick=()=>openIndex('surahs',true);$('m87Surahs').onclick=()=>openIndex('surahs');$('m87Juz').onclick=()=>openIndex('juz');
   $('m87Saved').onclick=()=>openIndex('saved');$('m87QuranSearch').oninput=e=>{const tab=document.querySelector('[data-index-tab].active')?.dataset.indexTab||'surahs';renderIndex(tab,e.target.value)};
   document.querySelectorAll('[data-index-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-index-tab]').forEach(x=>x.classList.toggle('active',x===b));renderIndex(b.dataset.indexTab,$('m87QuranSearch').value)});
   $('m87ReadingTheme').onchange=e=>applyReadingTheme(e.target.value);$('m87ActionPlay').onclick=()=>{playSelected();$('m87AyahActions').hidden=true};$('m87ActionTafsir').onclick=()=>{$('m87AyahActions').hidden=true;showTafsir()};$('m87ActionCopy').onclick=copySelectedReference;
   document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).hidden=true);
   document.querySelectorAll('.m54-sheet').forEach(s=>s.addEventListener('click',e=>{if(e.target===s)s.hidden=true}));
   $('m54GoPage').onclick=()=>{closeSheets();openPage($('m54PageInput').value)};
   $('m54JuzSelect').onchange=e=>{closeSheets();openJuz(+e.target.value)};
   $('m54HizbSelect').onchange=e=>{closeSheets();openHizb(+e.target.value)};
   $('m54SurahSelect').onchange=e=>{closeSheets();openSurah(+e.target.value)};
   $('m54Font').oninput=applyFont;$('m54KeepAwake').onchange=wakeToggle;$('m54Continue').onclick=continueReading;$('m54Reciter').onchange=e=>localStorage.setItem('m87_reciter',e.target.value);
   $('m54SavedList').onclick=()=>{renderSaved();$('m54SavedSheet').hidden=false};
   $('m54PrevAudio').onclick=()=>audioStep(-1);$('m54NextAudio').onclick=()=>audioStep(1);
   $('m54PauseAudio').onclick=()=>{if(audio.paused){audio.play();paused=false}else{audio.pause();paused=true}};
   $('m54StopAudio').onclick=stopAudio;
   const reader=$('m54Reader');
   reader.addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});
   reader.addEventListener('touchend',e=>{if(touchX==null)return;const dx=e.changedTouches[0].clientX-touchX;touchX=null;if(Math.abs(dx)<65)return;dx<0?openPage(page+1):openPage(page-1)},{passive:true});
   document.addEventListener('keydown',e=>{
     if(!document.querySelector('.m54-sheet:not([hidden])')){
       if(e.key==='ArrowLeft')openPage(page+1);
       if(e.key==='ArrowRight')openPage(page-1);
       if(e.key==='Escape')closeSheets();
     }
   });
   document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&$('m54KeepAwake').checked&&!wakeLock)await wakeToggle()});
 }
 function init(){
   fillSelects();
   $('m54Font').value=localStorage.getItem('m54_font')||100;applyFont();
   const preferred=localStorage.getItem('m882_reading_theme')||'light';applyReadingTheme(preferred);
   bind();loadOwnerQuranDefaults();
   const savedReciter=localStorage.getItem('m87_reciter');if(savedReciter&&[...$('m54Reciter').options].some(o=>o.value===savedReciter))$('m54Reciter').value=savedReciter;
   if(initialLocation.surah && !initialLocation.page)openSurah(initialLocation.surah,initialLocation.ayah||1);
   else openPage(page).then(()=>{if(initialLocation.surah&&initialLocation.ayah)setTimeout(()=>{const el=document.querySelector(`.m54-ayah[data-s="${initialLocation.surah}"][data-a="${initialLocation.ayah}"]`);el?.scrollIntoView({behavior:'smooth',block:'center'});if(el)selectAyah(el)},230)});
 }
 document.addEventListener('DOMContentLoaded',init);
})();
