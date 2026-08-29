const prayerNames={Fajr:'الفجر',Sunrise:'الشروق',Dhuhr:'الظهر',Asr:'العصر',Maghrib:'المغرب',Isha:'العشاء'};
let lastPrayerData=null;
const cityCoords={
 'الرياض':[24.7136,46.6753,3],'riyadh':[24.7136,46.6753,3],
 'جدة':[21.4858,39.1925,3],'مكة':[21.3891,39.8579,3],'المدينة':[24.5247,39.5692,3],
 'الدمام':[26.4207,50.0888,3],'الخبر':[26.2172,50.1971,3],'الطائف':[21.2854,40.4260,3],
 'القاهرة':[30.0444,31.2357,2],'الجيزة':[30.0131,31.2089,2],'المنصورة':[31.0409,31.3785,2],
 'شربين':[31.1967,31.5243,2],'الإسكندرية':[31.2001,29.9187,2]
};
function cleanTime(t){return (t||'--:--').split(' ')[0]}
function format12Hour(t){const raw=cleanTime(t);const parts=raw.split(':').map(Number);if(parts.length<2||Number.isNaN(parts[0]))return raw;const h=parts[0],m=parts[1];const period=h<12?'ص':'م';const h12=h%12||12;return `${h12}:${String(m).padStart(2,'0')} ${period}`}
function safeText(sel,val){const el=qs(sel);if(el)el.textContent=val}
function dayOfYear(d){return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/86400000)}
function norm360(x){x%=360;return x<0?x+360:x}
function deg2rad(x){return x*Math.PI/180} function rad2deg(x){return x*180/Math.PI}
function solarTimes(lat,lng,tz,date=new Date()){
 const n=dayOfYear(date), gamma=2*Math.PI/365*(n-1+(12-12)/24);
 const eq=229.18*(0.000075+0.001868*Math.cos(gamma)-0.032077*Math.sin(gamma)-0.014615*Math.cos(2*gamma)-0.040849*Math.sin(2*gamma));
 const decl=0.006918-0.399912*Math.cos(gamma)+0.070257*Math.sin(gamma)-0.006758*Math.cos(2*gamma)+0.000907*Math.sin(2*gamma)-0.002697*Math.cos(3*gamma)+0.00148*Math.sin(3*gamma);
 const noon=720-4*lng-eq+tz*60;
 function angleTime(angle,after){
  const zen=deg2rad(angle), phi=deg2rad(lat);
  let c=(Math.cos(zen)-Math.sin(phi)*Math.sin(decl))/(Math.cos(phi)*Math.cos(decl));
  c=Math.max(-1,Math.min(1,c)); const delta=rad2deg(Math.acos(c))*4;
  return noon+(after?delta:-delta);
 }
 function asrTime(){
  const phi=deg2rad(lat); const alt=Math.atan(1/(1+Math.tan(Math.abs(phi-decl))));
  const zen=Math.PI/2-alt; let c=(Math.cos(zen)-Math.sin(phi)*Math.sin(decl))/(Math.cos(phi)*Math.cos(decl));
  c=Math.max(-1,Math.min(1,c)); return noon+rad2deg(Math.acos(c))*4;
 }
 const toTime=m=>{m=(m+1440)%1440;let h=Math.floor(m/60),mi=Math.round(m%60);if(mi===60){h=(h+1)%24;mi=0}return String(h).padStart(2,'0')+':'+String(mi).padStart(2,'0')};
 // Umm Al-Qura style approximation: Fajr 18.5°, Isha 90 min after Maghrib.
 const sunrise=angleTime(90.833,false), sunset=angleTime(90.833,true);
 return {Fajr:toTime(angleTime(108.5,false)),Sunrise:toTime(sunrise),Dhuhr:toTime(noon+2),Asr:toTime(asrTime()),Maghrib:toTime(sunset+2),Isha:toTime(sunset+92)};
}
function renderPrayer(data,label,source=''){
 lastPrayerData=data;const timings=data.timings||data;
 safeText('#prayerLocation',label||load('prayer_place',''));
 safeText('#hijriDate',data.date?.hijri?`${data.date.hijri.day} ${data.date.hijri.month.ar} ${data.date.hijri.year} هـ`:'');
 const grid=qs('#prayerGrid'); if(grid) grid.innerHTML=Object.keys(prayerNames).map(k=>`<article class="prayer" data-key="${k}"><span>${prayerNames[k]}</span><strong>${format12Hour(timings[k])}</strong><small>${k==='Sunrise'?'وقت الشروق':'موعد الصلاة'}</small></article>`).join('');
 updateNextPrayer();store('prayer_cache',{data,label,at:Date.now()});
 if(source)safeText('#prayerStatus',source);
}
function updateNextPrayer(){if(!lastPrayerData)return;const t=lastPrayerData.timings||lastPrayerData,now=new Date(),mins=now.getHours()*60+now.getMinutes();let next=null;for(const k of ['Fajr','Dhuhr','Asr','Maghrib','Isha']){const [h,m]=cleanTime(t[k]).split(':').map(Number),v=h*60+m;if(v>mins){next={k,v};break}}if(!next){const [h,m]=cleanTime(t.Fajr).split(':').map(Number);next={k:'Fajr',v:1440+h*60+m}}const diff=next.v-mins;safeText('#nextPrayerName',prayerNames[next.k]);safeText('#nextPrayerCountdown',`${Math.floor(diff/60)} س ${diff%60} د`);safeText('#v38PrayerName',prayerNames[next.k]);safeText('#v38PrayerCountdown',`${Math.floor(diff/60)}:${String(diff%60).padStart(2,'0')}`);qsa('.prayer').forEach(x=>x.classList.toggle('next',x.dataset.key===next.k))}
setInterval(updateNextPrayer,30000);
function offlineByCity(city,label){const key=String(city||'').trim().toLowerCase();const c=cityCoords[key]||cityCoords[String(city||'').trim()]||cityCoords['الرياض'];const times=solarTimes(c[0],c[1],c[2]);renderPrayer(times,label,'تم حساب المواقيت على الجهاز — تعمل حتى دون إنترنت');}
async function fetchPrayer(url,label,city){safeText('#prayerStatus','جاري تحميل المواقيت…');const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),8000);try{const r=await fetch(url,{signal:ctrl.signal,cache:'no-store'});if(!r.ok)throw Error('تعذر الاتصال بالخدمة');const j=await r.json();if(j.code!==200||!j.data?.timings)throw Error('بيانات المواقيت غير مكتملة');renderPrayer(j.data,label,'تم تحديث المواقيت من الخدمة المعتمدة');}catch(e){offlineByCity(city,label)}finally{clearTimeout(timer)}}
qs('#useLocation')?.addEventListener('click',()=>{if(!navigator.geolocation)return offlineByCity('الرياض','الرياض، السعودية');safeText('#prayerStatus','جارٍ تحديد موقعك…');navigator.geolocation.getCurrentPosition(p=>{const method=qs('#calcMethod')?.value||4;const label='موقعك الحالي';fetchPrayer(`${CFG.prayerApiBase}/timings?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&method=${method}`,label,'الرياض')},()=>offlineByCity('الرياض','الرياض، السعودية'),{enableHighAccuracy:true,timeout:8000})});
qs('#cityPrayerForm')?.addEventListener('submit',e=>{e.preventDefault();const city=qs('#city')?.value.trim()||'الرياض',country=qs('#country')?.value.trim()||'السعودية',method=qs('#calcMethod')?.value||4;const label=`${city}، ${country}`;store('prayer_place',label);fetchPrayer(`${CFG.prayerApiBase}/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`,label,city)});
const cached=load('prayer_cache');if(cached)renderPrayer(cached.data,cached.label,'آخر مواقيت محفوظة');else offlineByCity('الرياض','الرياض، السعودية');
