
(function(){
const surahNames=["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];

function initGlobalSearch(){
 if(qs('.search-page-v38'))return;
 const input=qs('#globalSearch'), results=qs('#globalSearchResults');
 if(!input||!results)return;
 input.addEventListener('input',()=>{
   const q=input.value.trim().toLowerCase();
   if(q.length<2){results.innerHTML='<p class="muted">اكتب كلمتين على الأقل للبحث في الأذكار والرقية وأسماء السور.</p>';return}
   const dh=(Array.isArray(window.allAdhkar)?window.allAdhkar:[]).filter(x=>(x.title+' '+x.text+' '+x.source).toLowerCase().includes(q)).slice(0,25);
   const su=surahNames.map((n,i)=>({n,i:i+1})).filter(x=>(x.n+' '+x.i).includes(q)).slice(0,15);
   results.innerHTML=[
    ...dh.map(x=>`<button class="search-result" onclick="openSearchDhikr('${x.id}')"><b>${x.title}</b><span>${categoryLabels[x.cat]||x.cat}</span><small>${x.text.slice(0,110)}…</small></button>`),
    ...su.map(x=>`<button class="search-result" onclick="openSearchSurah(${x.i})"><b>سورة ${x.n}</b><span>القرآن الكريم · رقم ${x.i}</span></button>`)
   ].join('')||'<p class="muted">لا توجد نتائج مطابقة.</p>';
 });
}
window.openSearchDhikr=function(id){
 navTo('adhkar');
 const item=(Array.isArray(window.allAdhkar)?window.allAdhkar:[]).find(x=>x.id===id);
 if(item){qs('#dhikrSearch').value=item.title;qs('#dhikrSearch').dispatchEvent(new Event('input'))}
};
window.openSearchSurah=function(n){navTo('quran'); if(window.openSurah)window.openSurah(n)};

function renderFavorites(){
 const box=qs('#favoritesList'); if(!box)return;
 const favIds=new Set(load('favorite_dhikr',[]));
 const dh=(Array.isArray(window.allAdhkar)?window.allAdhkar:[]).filter(x=>favIds.has(x.id));
 const favAyat=load('favorite_ayat',[]);
 box.innerHTML='';
 if(!dh.length&&!favAyat.length){box.innerHTML='<div class="card"><p class="muted">لم تضف أي عناصر إلى المفضلة بعد.</p></div>';return}
 dh.forEach(x=>{
   const d=document.createElement('article');d.className='card';
   d.innerHTML=`<span class="dhikr-category">${categoryLabels[x.cat]||x.cat}</span><h3>${x.title}</h3><p class="dhikr-text">${x.text}</p><button class="btn danger" onclick="removeFavoriteDhikr('${x.id}')">إزالة</button>`;
   box.appendChild(d);
 });
 favAyat.forEach((x,i)=>{
   const d=document.createElement('article');d.className='card';
   d.innerHTML=`<span class="dhikr-category">آية محفوظة</span><h3>${x.surahName||'القرآن الكريم'} — آية ${x.ayah||''}</h3><p class="dhikr-text">${x.text||''}</p><button class="btn danger" onclick="removeFavoriteAyah(${i})">إزالة</button>`;
   box.appendChild(d);
 });
}
window.removeFavoriteDhikr=function(id){store('favorite_dhikr',load('favorite_dhikr',[]).filter(x=>x!==id));renderFavorites();window.updateDhikrFavoriteButtons?.()};
window.removeFavoriteAyah=function(i){const a=load('favorite_ayat',[]);a.splice(i,1);store('favorite_ayat',a);renderFavorites()};
window.renderFavorites=renderFavorites;

function initKhatma(){
 const form=qs('#khatmaForm'), box=qs('#khatmaStatus'); if(!form||!box)return;
 function draw(){
  const k=load('khatma',null);
  if(!k){box.innerHTML=`<div class="khatma-empty"><div>🌙</div><h3>ابدأ ختمتك الجديدة</h3><p>بعد حفظ الخطة سيظهر هنا ورد اليوم، نسبة الإنجاز، والوقت المتبقي.</p><span>«وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا»</span></div>`;return}
  const total=604, page=Math.min(total,Math.max(1,Number(k.page||1))), done=page-1, pct=Math.round(done/total*100), remaining=Math.max(0,total-done);
  const today=new Date();today.setHours(0,0,0,0);const end=new Date(k.end);end.setHours(23,59,59,999);
  const daysLeft=Math.max(1,Math.ceil((end-today)/86400000));const perDay=Math.max(1,Math.ceil(remaining/daysLeft));const todayEnd=Math.min(604,page+perDay-1);
  box.innerHTML=`<div class="khatma-dashboard-head"><div><small>الخطة الحالية</small><h3>${k.name||'ختمتي'}</h3></div><div class="khatma-percent">${pct}%</div></div>
   <div class="khatma-ring" style="--progress:${pct*3.6}deg"><div><b>${pct}%</b><span>مكتمل</span></div></div>
   <div class="khatma-progress"><div style="width:${pct}%"></div></div>
   <div class="khatma-today"><span>ورد اليوم</span><strong>من صفحة ${page} إلى ${todayEnd}</strong><small>${perDay} صفحة اليوم</small></div>
   <div class="khatma-stats-pro"><div><b>${remaining}</b><span>صفحة متبقية</span></div><div><b>${daysLeft}</b><span>يومًا متبقيًا</span></div><div><b>${page}</b><span>صفحتك الحالية</span></div></div>
   <div class="khatma-actions"><button class="btn primary" onclick="advanceKhatma(1)">✓ أنهيت صفحة</button><button class="btn gold" onclick="advanceKhatma(${perDay})">أنهيت ورد اليوم</button><button class="btn subtle" onclick="resetKhatma()">حذف الخطة</button></div>`;
 }
 form.addEventListener('submit',e=>{e.preventDefault();const end=qs('#khatmaEnd').value;if(!end)return toast('اختر تاريخ الانتهاء');store('khatma',{name:qs('#khatmaName').value||'ختمتي',start:new Date().toISOString(),end,page:Number(qs('#khatmaPage').value||1)});draw();toast('تم حفظ خطة الختمة')});
 window.advanceKhatma=n=>{const k=load('khatma');if(!k)return;k.page=Math.min(604,Number(k.page||1)+Number(n||1));store('khatma',k);qs('#khatmaPage').value=k.page;draw();toast('بارك الله في وردك اليوم')};
 window.resetKhatma=()=>{if(confirm('هل تريد حذف خطة الختمة؟')){localStorage.removeItem('noor_khatma');draw()}};
 const d=new Date();d.setDate(d.getDate()+30);if(!qs('#khatmaEnd').value)qs('#khatmaEnd').value=d.toISOString().slice(0,10);const saved=load('khatma');if(saved){qs('#khatmaName').value=saved.name||'ختمة القرآن';qs('#khatmaPage').value=saved.page||1;qs('#khatmaEnd').value=saved.end||qs('#khatmaEnd').value}draw();
}

function initQibla(){
 const btn=qs('#findQibla'), status=qs('#qiblaStatus'), needle=qs('#qiblaNeedle'), deg=qs('#qiblaDegrees');
 if(!btn)return;
 const kaaba={lat:21.422487,lng:39.826206};
 function bearing(lat,lng){
  const p1=lat*Math.PI/180,p2=kaaba.lat*Math.PI/180,dl=(kaaba.lng-lng)*Math.PI/180;
  const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
 }
 btn.onclick=()=>{
  status.textContent='جارٍ تحديد موقعك…';
  navigator.geolocation.getCurrentPosition(pos=>{
   const b=bearing(pos.coords.latitude,pos.coords.longitude);
   needle.style.transform=`rotate(${b}deg)`;deg.textContent=`${Math.round(b)}° من الشمال`;
   status.textContent='تم حساب اتجاه القبلة حسب موقعك. ضع الهاتف أفقيًا واستعن ببوصلة الجهاز.';
   store('qibla',{bearing:b,lat:pos.coords.latitude,lng:pos.coords.longitude});
  },()=>status.textContent='تعذر تحديد الموقع. فعّل إذن الموقع ثم حاول مرة أخرى.',{enableHighAccuracy:true,timeout:12000});
 };
 const saved=load('qibla');if(saved){needle.style.transform=`rotate(${saved.bearing}deg)`;deg.textContent=`${Math.round(saved.bearing)}° من الشمال`}
}

document.addEventListener('click',e=>{
 if(e.target.closest('[data-page="favorites"]'))setTimeout(renderFavorites,0);
});
initGlobalSearch();initKhatma();initQibla();renderFavorites();
})();
