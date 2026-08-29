/* نور الذكر v37 — مصادر معلنة وفحص بنيوي للقرآن والتفسير */
'use strict';
const Q37_META=[
['الفاتحة','Al-Faatiha',7],['البقرة','Al-Baqara',286],['آل عمران','Aal-i-Imraan',200],['النساء','An-Nisaa',176],['المائدة','Al-Maaida',120],['الأنعام','Al-Anam',165],['الأعراف','Al-Araaf',206],['الأنفال','Al-Anfaal',75],['التوبة','At-Tawba',129],['يونس','Yunus',109],['هود','Hud',123],['يوسف','Yusuf',111],['الرعد','Ar-Rad',43],['إبراهيم','Ibrahim',52],['الحجر','Al-Hijr',99],['النحل','An-Nahl',128],['الإسراء','Al-Israa',111],['الكهف','Al-Kahf',110],['مريم','Maryam',98],['طه','Taa-Haa',135],['الأنبياء','Al-Anbiyaa',112],['الحج','Al-Hajj',78],['المؤمنون','Al-Muminoon',118],['النور','An-Noor',64],['الفرقان','Al-Furqaan',77],['الشعراء','Ash-Shuaraa',227],['النمل','An-Naml',93],['القصص','Al-Qasas',88],['العنكبوت','Al-Ankaboot',69],['الروم','Ar-Room',60],['لقمان','Luqman',34],['السجدة','As-Sajda',30],['الأحزاب','Al-Ahzaab',73],['سبإ','Saba',54],['فاطر','Faatir',45],['يس','Yaseen',83],['الصافات','As-Saaffaat',182],['ص','Saad',88],['الزمر','Az-Zumar',75],['غافر','Ghafir',85],['فصلت','Fussilat',54],['الشورى','Ash-Shura',53],['الزخرف','Az-Zukhruf',89],['الدخان','Ad-Dukhaan',59],['الجاثية','Al-Jaathiya',37],['الأحقاف','Al-Ahqaf',35],['محمد','Muhammad',38],['الفتح','Al-Fath',29],['الحجرات','Al-Hujuraat',18],['ق','Qaaf',45],['الذاريات','Adh-Dhaariyat',60],['الطور','At-Tur',49],['النجم','An-Najm',62],['القمر','Al-Qamar',55],['الرحمن','Ar-Rahmaan',78],['الواقعة','Al-Waaqia',96],['الحديد','Al-Hadid',29],['المجادلة','Al-Mujaadila',22],['الحشر','Al-Hashr',24],['الممتحنة','Al-Mumtahana',13],['الصف','As-Saff',14],['الجمعة','Al-Jumua',11],['المنافقون','Al-Munaafiqoon',11],['التغابن','At-Taghaabun',18],['الطلاق','At-Talaaq',12],['التحريم','At-Tahrim',12],['الملك','Al-Mulk',30],['القلم','Al-Qalam',52],['الحاقة','Al-Haaqqa',52],['المعارج','Al-Maarij',44],['نوح','Nooh',28],['الجن','Al-Jinn',28],['المزمل','Al-Muzzammil',20],['المدثر','Al-Muddaththir',56],['القيامة','Al-Qiyaama',40],['الإنسان','Al-Insaan',31],['المرسلات','Al-Mursalaat',50],['النبإ','An-Naba',40],['النازعات','An-Naaziaat',46],['عبس','Abasa',42],['التكوير','At-Takwir',29],['الانفطار','Al-Infitaar',19],['المطففين','Al-Mutaffifin',36],['الانشقاق','Al-Inshiqaaq',25],['البروج','Al-Burooj',22],['الطارق','At-Taariq',17],['الأعلى','Al-Alaa',19],['الغاشية','Al-Ghaashiya',26],['الفجر','Al-Fajr',30],['البلد','Al-Balad',20],['الشمس','Ash-Shams',15],['الليل','Al-Lail',21],['الضحى','Ad-Dhuhaa',11],['الشرح','Ash-Sharh',8],['التين','At-Tin',8],['العلق','Al-Alaq',19],['القدر','Al-Qadr',5],['البينة','Al-Bayyina',8],['الزلزلة','Az-Zalzala',8],['العاديات','Al-Aadiyaat',11],['القارعة','Al-Qaaria',11],['التكاثر','At-Takaathur',8],['العصر','Al-Asr',3],['الهمزة','Al-Humaza',9],['الفيل','Al-Fil',5],['قريش','Quraish',4],['الماعون','Al-Maaun',7],['الكوثر','Al-Kawthar',3],['الكافرون','Al-Kaafiroon',6],['النصر','An-Nasr',3],['المسد','Al-Masad',5],['الإخلاص','Al-Ikhlaas',4],['الفلق','Al-Falaq',5],['الناس','An-Naas',6]
].map((r,i)=>({number:i+1,name:r[0],englishName:r[1],numberOfAyahs:r[2]}));
const Q37_TOTAL=6236;
window.Q37_META=Q37_META;
let surahs=Q37_META,currentSurah=null,bookmarks=load('quran_bookmarks',[]),favoriteAyat=load('favorite_ayat',[]);
const q37esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
function q37plain(v){const d=document.createElement('textarea');d.innerHTML=String(v??'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,' ');return d.value.replace(/\s+/g,' ').trim()}
function q37check(data,n,type='quran'){
 const expected=Q37_META[n-1]?.numberOfAyahs||0,rows=type==='quran'?data?.ayahs:data?.ayahs;
 const errors=[];if(!Array.isArray(rows))errors.push('القائمة غير موجودة');
 if((rows?.length||0)!==expected)errors.push(`العدد ${rows?.length||0} بدل ${expected}`);
 (rows||[]).forEach((x,i)=>{if(Number(x.numberInSurah)!==i+1)errors.push(`التسلسل عند ${i+1}`);if(!String(x.text||'').trim())errors.push(`النص فارغ عند ${i+1}`)});
 return {ok:!errors.length,errors};
}
async function q37fetch(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
function getSurahs(){renderSurahList();return Promise.resolve()}
function renderSurahList(){const term=(qs('#surahSearch')?.value||'').trim().toLowerCase(),box=qs('#surahList');if(!box)return;box.innerHTML=surahs.filter(s=>!term||s.name.includes(term)||s.englishName.toLowerCase().includes(term)||String(s.number)===term).map(s=>`<button class="surah-item ${currentSurah===s.number?'active':''}" onclick="openSurah(${s.number})"><span>${s.number}. ${q37esc(s.name)}</span><small>${s.numberOfAyahs} آية</small></button>`).join('')}
async function getTafsir(n,force=false){
 let cached=!force&&load('tafsir_muyassar_v37_'+n);if(cached&&q37check(cached,n,'tafsir').ok)return cached;
 try{
  const base=CFG.quranEncApiBase||'https://quranenc.com/api/v1',j=await q37fetch(`${base}/translation/sura/arabic_moyassar/${n}`),rows=Array.isArray(j)?j:(j.result||j.data||[]);
  const tafsir={number:n,source:'التفسير الميسر — إصدار مجمع الملك فهد، عبر QuranEnc',ayahs:rows.map((x,i)=>({numberInSurah:Number(x.aya||x.ayah||x.numberInSurah||i+1),text:q37plain(x.translation||x.text||x.tafsir||'')}))};
  if(!q37check(tafsir,n,'tafsir').ok)throw new Error('استجابة QuranEnc غير مكتملة');store('tafsir_muyassar_v37_'+n,tafsir);return tafsir;
 }catch(e){
  const j=await q37fetch(`${CFG.quranApiBase}/surah/${n}/ar.muyassar`),d=j.data;
  const tafsir={number:n,source:'نسخة احتياطية ar.muyassar عبر AlQuran.Cloud',ayahs:(d.ayahs||[]).map((x,i)=>({numberInSurah:Number(x.numberInSurah||i+1),text:q37plain(x.text)}))};
  if(!q37check(tafsir,n,'tafsir').ok)throw new Error('التفسير غير مكتمل');store('tafsir_muyassar_v37_'+n,tafsir);return tafsir;
 }
}
async function getQuran(n,force=false){
 let data=!force&&load('surah_v37_'+n);if(data&&q37check(data,n).ok)return data;
 const j=await q37fetch(`${CFG.quranApiBase}/surah/${n}/quran-uthmani`),d=j.data,m=Q37_META[n-1];
 data={number:n,name:d.name||m.name,englishName:d.englishName||m.englishName,numberOfAyahs:m.numberOfAyahs,source:'quran-uthmani عبر AlQuran.Cloud',ayahs:(d.ayahs||[]).map((x,i)=>({number:Number(x.number||0),numberInSurah:Number(x.numberInSurah||i+1),text:String(x.text||'').trim(),page:x.page,juz:x.juz,hizbQuarter:x.hizbQuarter,manzil:x.manzil,ruku:x.ruku,sajda:x.sajda}))};
 const c=q37check(data,n);if(!c.ok)throw new Error(`فشل التحقق البنيوي: ${c.errors[0]}`);store('surah_v37_'+n,data);return data;
}
window.openSurah=async n=>{currentSurah=n;renderSurahList();qs('#quranReader').innerHTML='<div class="card">جاري تحميل السورة والتفسير والتحقق...</div>';try{const [data,tafsir]=await Promise.all([getQuran(n),getTafsir(n)]);renderSurah(data,tafsir);store('last_surah',n);q37stats()}catch(e){qs('#quranReader').innerHTML=`<div class="notice"><b>تعذر التحميل أو فشل التحقق.</b><br>${q37esc(e.message)}</div>`}};
function renderSurah(s,tafsir){
 const tm=new Map((tafsir.ayahs||[]).map(x=>[x.numberInSurah,x.text]));
 const ok=q37check(s,s.number).ok&&q37check(tafsir,s.number,'tafsir').ok;
 const lastAyah=load('last_ayah');
 const favSet=new Set(favoriteAyat.map(x=>x.key));
 const basmala=s.number!==1&&s.number!==9?'<div class="v39-basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>':'';
 const ayat=s.ayahs.map(a=>{
   const text=q37esc(q37stripBasmala(a.text,s.number,a.numberInSurah));
   const saved=favSet.has(`${s.number}:${a.numberInSurah}`);
   return `<button class="v39-ayah ${lastAyah?.s===s.number&&lastAyah?.a===a.numberInSurah?'is-last':''}" id="ayah-${a.numberInSurah}" type="button" data-ayah="${a.numberInSurah}" aria-label="الآية ${a.numberInSurah}"><span class="v39-ayah-text">${text}</span><span class="v39-ayah-mark ${saved?'saved':''}">${a.numberInSurah}</span>${a.sajda?'<small class="q52-sajda">سجدة</small>':''}${lastAyah?.s===s.number&&lastAyah?.a===a.numberInSurah?'<small class="q52-last-label">آخر قراءة</small>':''}</button>`;
 }).join(' ');
 qs('#quranReader').innerHTML=`
 <div class="v39-reader-shell" data-surah="${s.number}">
   <div class="v39-toolbar card">
     <div class="v39-toolbar-main">
       <button class="btn" type="button" onclick="v39PrevSurah(${s.number})">السورة السابقة</button>
       <div><b>سورة ${q37esc(s.name)}</b><small>${s.numberOfAyahs} آية</small></div>
       <button class="btn" type="button" onclick="v39NextSurah(${s.number})">السورة التالية</button>
     </div>
     <div class="v39-toolbar-actions">
       <button type="button" onclick="v39Font(-1)" aria-label="تصغير الخط">أ−</button>
       <button type="button" onclick="v39Font(1)" aria-label="تكبير الخط">أ+</button>
       <button type="button" onclick="v39ToggleTafsir()">التفسير</button>
       <button type="button" onclick="q37reload(${s.number})">تحديث النص</button>
     </div>
   </div>
   <article class="v39-mushaf-page">
     <header class="v39-surah-plaque">
       <span>سورة</span><h2>${q37esc(s.name)}</h2><small>${q37esc(s.englishName)} · ${s.numberOfAyahs} آية</small>
     </header>
     ${basmala}
     <div class="v39-quran-flow" id="v39QuranFlow">${ayat}</div>
     <footer class="v39-page-footer"><span>القرآن الكريم</span><span>${ok?'تم التحقق من عدد الآيات وترتيبها':'يلزم إعادة التحقق'}</span></footer>
   </article>
   <section class="v39-tafsir-drawer card hidden" id="v39TafsirDrawer" aria-live="polite">
      <div class="v39-tafsir-head"><div><span>التفسير الميسّر</span><h3 id="v39TafsirTitle">اختر آية من صفحة المصحف</h3></div><button type="button" onclick="v39ToggleTafsir(false)">إغلاق</button></div>
      <p id="v39TafsirText">اضغط على أي آية لعرض تفسيرها هنا بدون تشتيت صفحة القراءة.</p>
      <div class="v39-tafsir-actions hidden" id="v39TafsirActions">
        <button class="btn" id="v39BookmarkBtn" type="button">حفظ الآية</button>
        <button class="btn" id="v39ShareBtn" type="button">مشاركة</button>
      </div>
      <small>المصدر: ${q37esc(tafsir.source)}.</small>
   </section>
   <div class="v39-source-note">النص العثماني: ${q37esc(s.source)} · تصميم خاص بتطبيق نور الذكر مستوحى من راحة صفحات المصحف، وليس نسخة مطابقة لطبعة ورقية.</div>
 </div>`;
 const flow=qs('#v39QuranFlow');
 flow?.addEventListener('click',e=>{
   const ay=e.target.closest('.v39-ayah');if(!ay)return;
   const a=Number(ay.dataset.ayah);store('last_ayah',{s:s.number,a});
   document.querySelectorAll('.v39-ayah.is-selected').forEach(x=>x.classList.remove('is-selected'));
   ay.classList.add('is-selected');
   v39ShowTafsir(s.number,a,s.name,tm.get(a)||'التفسير غير متاح.');
 });
 if(lastAyah?.s===s.number)setTimeout(()=>qs(`#ayah-${lastAyah.a}`)?.scrollIntoView({block:'center'}),250);
}
window.v39ShowTafsir=(surah,ayah,name,text)=>{
 const drawer=qs('#v39TafsirDrawer'),title=qs('#v39TafsirTitle'),body=qs('#v39TafsirText'),actions=qs('#v39TafsirActions');
 if(!drawer)return;drawer.classList.remove('hidden');title.textContent=`سورة ${name} — الآية ${ayah}`;body.textContent=text;actions.classList.remove('hidden');
 const b=qs('#v39BookmarkBtn'),sh=qs('#v39ShareBtn');
 if(b){const saved=favoriteAyat.some(x=>x.key===`${surah}:${ayah}`);b.textContent=saved?'إزالة من المحفوظات':'حفظ الآية';b.onclick=()=>bookmarkAyah(surah,ayah,name)}
 if(sh)sh.onclick=()=>shareAyah(surah,ayah);
 drawer.scrollIntoView({behavior:'smooth',block:'nearest'});
};
window.v39ToggleTafsir=(show)=>{const d=qs('#v39TafsirDrawer');if(!d)return;d.classList.toggle('hidden',show===false?true:show===true?false:!d.classList.contains('hidden'))};
window.v39Font=(delta)=>{const root=document.documentElement;let n=Number(localStorage.getItem('v39_quran_font')||100);n=Math.max(82,Math.min(138,n+delta*8));localStorage.setItem('v39_quran_font',n);root.style.setProperty('--v39-quran-scale',n/100);toast(`حجم خط القرآن ${n}%`)};
window.v39PrevSurah=n=>openSurah(n<=1?114:n-1);
window.v39NextSurah=n=>openSurah(n>=114?1:n+1);
try{document.documentElement.style.setProperty('--v39-quran-scale',Number(localStorage.getItem('v39_quran_font')||100)/100)}catch{}
function q37stripBasmala(text,s,a){
 if(a!==1||s===1||s===9)return text;
 const original=String(text||'').trim();
 const normalize=v=>String(v||'')
  .normalize('NFD')
  .replace(/\p{M}/gu,'')
  .replace(/[ٱأإآ]/g,'ا')
  .replace(/[ـ۞۝﴿﴾]/g,'')
  .replace(/\s+/g,' ')
  .trim();
 const target='بسم الله الرحمن الرحيم';
 const chars=Array.from(original);
 let end=0;
 for(let i=1;i<=Math.min(chars.length,100);i++){
  const prefix=normalize(chars.slice(0,i).join(''));
  if(prefix===target){end=i;continue}
  if(end&&prefix.length>target.length)break;
 }
 if(!end)return original;
 const rest=chars.slice(end).join('').replace(/^[\s،,:؛.ـ۞۝﴿﴾-]+/u,'').trim();
 return rest||original;
}
window.toggleTafsir=a=>document.getElementById('tafsir-'+a)?.classList.toggle('hidden');
window.q37reload=async n=>{qs('#quranReader').innerHTML='<div class="card">جاري إعادة التحميل والتحقق...</div>';try{const [s,t]=await Promise.all([getQuran(n,true),getTafsir(n,true)]);renderSurah(s,t);toast('نجح التحقق البنيوي للسورة والتفسير');q37stats()}catch(e){qs('#quranReader').innerHTML=`<div class="notice">${q37esc(e.message)}</div>`}};
window.bookmarkAyah=(s,a,name)=>{const data=load('surah_v37_'+s),ayah=data?.ayahs.find(x=>x.numberInSurah===a);if(!ayah)return;const key=`${s}:${a}`;favoriteAyat=favoriteAyat.some(x=>x.key===key)?favoriteAyat.filter(x=>x.key!==key):[...favoriteAyat,{key,surah:s,ayah:a,surahName:name,text:ayah.text}];store('favorite_ayat',favoriteAyat);bookmarks=favoriteAyat.map(x=>({key:x.key,s:x.surah,a:x.ayah,name:x.surahName}));store('quran_bookmarks',bookmarks);store('last_ayah',{s,a});getTafsir(s).then(t=>renderSurah(data,t));toast(favoriteAyat.some(x=>x.key===key)?'تم حفظ الآية':'تمت الإزالة')};
window.shareAyah=async(s,a)=>{const data=load('surah_v37_'+s),ayah=data?.ayahs.find(x=>x.numberInSurah===a);if(!ayah)return;const text=`${ayah.text} (${data.name}: ${a})`;if(navigator.share)await navigator.share({title:'آية من القرآن الكريم',text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('تم نسخ الآية')}};
function q37panel(){const section=qs('#quran'),layout=section?.querySelector('.quran-layout');if(!layout||qs('#q37Audit'))return;const x=document.createElement('div');x.id='q37Audit';x.className='card q37-audit';x.innerHTML=`<div class="row between"><div><small>الإصدار v37</small><h3>سلامة مصادر القرآن والتفسير</h3></div><span id="q37Stats" class="q37-badge">فهرس 114 سورة</span></div><p>فهرس السور وأعداد الآيات محفوظ داخل التطبيق. يتم فحص عدد الآيات وتسلسلها وعدم فراغ النص والتفسير عند التحميل.</p><div class="q37-actions"><button class="btn" id="q37AuditBtn">فحص السور المحفوظة</button></div><div id="q37Result"></div><details><summary>حدود الاعتماد</summary><p>التحقق الحالي بنيوي ومصدري. لا تُستخدم عبارة «مطابقة حرفيًا لمصحف المدينة» إلا بعد تضمين حزمة مجمع الملك فهد الأصلية والتحقق من بصمتها الرسمية.</p></details>`;layout.before(x);qs('#q37AuditBtn').onclick=q37audit;q37stats()}
function q37stats(){let q=0,t=0;Q37_META.forEach(m=>{if(q37check(load('surah_v37_'+m.number),m.number).ok)q++;if(q37check(load('tafsir_muyassar_v37_'+m.number),m.number,'tafsir').ok)t++});const e=qs('#q37Stats');if(e)e.textContent=`محفوظ: ${q}/114 قرآن · ${t}/114 تفسير`}
function q37audit(){let q=0,t=0,qa=0,ta=0,issues=[];Q37_META.forEach(m=>{const s=load('surah_v37_'+m.number),f=load('tafsir_muyassar_v37_'+m.number),sc=q37check(s,m.number),fc=q37check(f,m.number,'tafsir');if(sc.ok){q++;qa+=s.ayahs.length}else if(s)issues.push(`س${m.number}: ${sc.errors[0]}`);if(fc.ok){t++;ta+=f.ayahs.length}else if(f)issues.push(`ت${m.number}: ${fc.errors[0]}`)});const complete=q===114&&t===114&&qa===Q37_TOTAL&&ta===Q37_TOTAL;qs('#q37Result').innerHTML=`<div class="${complete?'q37-success':'notice'}"><b>${complete?'نجح الفحص البنيوي الكامل':'الفحص الحالي جزئي'}</b><br>القرآن: ${q}/114 سورة، ${qa}/${Q37_TOTAL} آية · التفسير: ${t}/114 سورة، ${ta}/${Q37_TOTAL} مادة.${issues.length?`<br><small>${q37esc(issues.slice(0,8).join(' | '))}</small>`:''}</div>`}
qs('#surahSearch')?.addEventListener('input',renderSurahList);getSurahs().then(()=>{q37panel();openSurah(load('last_surah',1))});
