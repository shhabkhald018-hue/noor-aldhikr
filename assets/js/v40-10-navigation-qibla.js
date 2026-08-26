'use strict';
(()=>{
  const $=(s,p=document)=>p.querySelector(s);
  const $$=(s,p=document)=>[...p.querySelectorAll(s)];

  const PLACES={
    'السعودية':{
      'الرياض':[24.7136,46.6753],'مكة المكرمة':[21.3891,39.8579],'المدينة المنورة':[24.5247,39.5692],
      'جدة':[21.4858,39.1925],'الدمام':[26.4207,50.0888],'الخبر':[26.2172,50.1971],
      'الطائف':[21.2703,40.4158],'تبوك':[28.3838,36.5550],'بريدة':[26.3592,43.9818],
      'حائل':[27.5114,41.7208],'أبها':[18.2164,42.5053],'خميس مشيط':[18.3060,42.7290],
      'جازان':[16.8892,42.5511],'نجران':[17.5650,44.2289],'ينبع':[24.0895,38.0618],
      'الجبيل':[27.0174,49.6225],'الأحساء':[25.3830,49.5860],'الخرج':[24.1556,47.3120]
    },
    'مصر':{
      'القاهرة':[30.0444,31.2357],'الجيزة':[30.0131,31.2089],'الإسكندرية':[31.2001,29.9187],
      'المنصورة':[31.0409,31.3785],'شربين':[31.1960,31.5243],'طنطا':[30.7865,31.0004],
      'الزقازيق':[30.5877,31.5020],'الإسماعيلية':[30.5965,32.2715],'بورسعيد':[31.2653,32.3019],
      'السويس':[29.9668,32.5498],'دمياط':[31.4175,31.8144],'دمنهور':[31.0341,30.4682],
      'بني سويف':[29.0661,31.0994],'الفيوم':[29.3084,30.8428],'المنيا':[28.1099,30.7503],
      'أسيوط':[27.1809,31.1837],'سوهاج':[26.5591,31.6957],'قنا':[26.1551,32.7160],
      'الأقصر':[25.6872,32.6396],'أسوان':[24.0889,32.8998]
    },
    'الإمارات':{'أبوظبي':[24.4539,54.3773],'دبي':[25.2048,55.2708],'الشارقة':[25.3463,55.4209],'عجمان':[25.4052,55.5136],'رأس الخيمة':[25.7895,55.9432],'الفجيرة':[25.1288,56.3265],'العين':[24.1302,55.8023]},
    'الكويت':{'مدينة الكويت':[29.3759,47.9774],'حولي':[29.3328,48.0286],'السالمية':[29.3339,48.0761],'الفروانية':[29.2775,47.9586],'الجهراء':[29.3375,47.6581]},
    'قطر':{'الدوحة':[25.2854,51.5310],'الريان':[25.2919,51.4244],'الوكرة':[25.1715,51.6034],'الخور':[25.6804,51.4969]},
    'البحرين':{'المنامة':[26.2235,50.5876],'المحرق':[26.2572,50.6119],'الرفاع':[26.1292,50.5550]},
    'عُمان':{'مسقط':[23.5880,58.3829],'صلالة':[17.0194,54.0897],'صحار':[24.3470,56.7075],'نزوى':[22.9333,57.5333]},
    'الأردن':{'عمّان':[31.9539,35.9106],'الزرقاء':[32.0728,36.0880],'إربد':[32.5568,35.8469],'العقبة':[29.5321,35.0063]},
    'فلسطين':{'القدس':[31.7683,35.2137],'غزة':[31.5017,34.4668],'رام الله':[31.9038,35.2034],'الخليل':[31.5326,35.0998]},
    'لبنان':{'بيروت':[33.8938,35.5018],'طرابلس':[34.4332,35.8497],'صيدا':[33.5606,35.3757]},
    'سوريا':{'دمشق':[33.5138,36.2765],'حلب':[36.2021,37.1343],'حمص':[34.7324,36.7137]},
    'العراق':{'بغداد':[33.3152,44.3661],'البصرة':[30.5085,47.7804],'الموصل':[36.3350,43.1189],'أربيل':[36.1911,44.0092],'النجف':[31.9958,44.3148]},
    'اليمن':{'صنعاء':[15.3694,44.1910],'عدن':[12.7855,45.0187],'تعز':[13.5795,44.0209]},
    'السودان':{'الخرطوم':[15.5007,32.5599],'أم درمان':[15.6445,32.4777],'بورتسودان':[19.6158,37.2164]},
    'ليبيا':{'طرابلس':[32.8872,13.1913],'بنغازي':[32.1167,20.0667],'مصراتة':[32.3754,15.0925]},
    'تونس':{'تونس':[36.8065,10.1815],'صفاقس':[34.7406,10.7603],'سوسة':[35.8256,10.63699]},
    'الجزائر':{'الجزائر':[36.7538,3.0588],'وهران':[35.6971,-0.6308],'قسنطينة':[36.3650,6.6147]},
    'المغرب':{'الرباط':[34.0209,-6.8416],'الدار البيضاء':[33.5731,-7.5898],'مراكش':[31.6295,-7.9811],'فاس':[34.0181,-5.0078]},
    'تركيا':{'إسطنبول':[41.0082,28.9784],'أنقرة':[39.9334,32.8597],'إزمير':[38.4237,27.1428]},
    'المملكة المتحدة':{'لندن':[51.5074,-0.1278],'مانشستر':[53.4808,-2.2426],'برمنغهام':[52.4862,-1.8904]},
    'الولايات المتحدة':{'نيويورك':[40.7128,-74.0060],'واشنطن':[38.9072,-77.0369],'لوس أنجلوس':[34.0522,-118.2437],'شيكاغو':[41.8781,-87.6298]},
    'كندا':{'تورونتو':[43.6532,-79.3832],'مونتريال':[45.5017,-73.5673],'فانكوفر':[49.2827,-123.1207]},
    'فرنسا':{'باريس':[48.8566,2.3522],'مارسيليا':[43.2965,5.3698],'ليون':[45.7640,4.8357]},
    'ألمانيا':{'برلين':[52.5200,13.4050],'هامبورغ':[53.5511,9.9937],'ميونخ':[48.1351,11.5820]}
  };
  const KAABA={lat:21.422487,lng:39.826206};
  let currentBearing=null;
  let orientationStarted=false;

  function bearing(lat,lng){
    const p1=lat*Math.PI/180,p2=KAABA.lat*Math.PI/180,dl=(KAABA.lng-lng)*Math.PI/180;
    const y=Math.sin(dl)*Math.cos(p2);
    const x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
    return (Math.atan2(y,x)*180/Math.PI+360)%360;
  }
  function directionName(b){
    const names=['الشمال','الشمال الشرقي','الشرق','الجنوب الشرقي','الجنوب','الجنوب الغربي','الغرب','الشمال الغربي'];
    return names[Math.round(b/45)%8];
  }
  function setStatus(message,type=''){
    const el=$('#qiblaStatus'); if(!el)return;
    el.textContent=message;el.className=`qibla-status-box ${type}`.trim();
  }
  function showBearing(b,label){
    currentBearing=b;
    const needle=$('#qiblaNeedle'),degrees=$('#qiblaDegrees'),direction=$('#qiblaDirection');
    if(needle)needle.style.transform=`rotate(${b}deg)`;
    if(degrees)degrees.textContent=`${Math.round(b)}°`;
    if(direction)direction.textContent=`نحو ${directionName(b)} من اتجاه الشمال`;
    try{localStorage.setItem('noor_qibla',JSON.stringify({bearing:b,label,updatedAt:Date.now()}));}catch(_){ }
    setStatus(`تم حساب القبلة من ${label}. اجعل أعلى الشاشة باتجاه الشمال، أو شغّل بوصلة الهاتف للاتجاه الحي.`,'success');
  }

  function initSearchLauncher(){
    const input=$('#quickSearchLauncher'),button=$('#openQuickSearch');
    if(!input||!button)return;
    const open=()=>{
      const q=input.value.trim();
      window.navTo?.('search');
      setTimeout(()=>{
        const target=$('#globalSearch');
        if(target){target.value=q;target.dispatchEvent(new Event('input',{bubbles:true}));target.focus();}
      },100);
    };
    button.onclick=open;
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();open();}});
  }

  function initCombinedPages(){
    const switchPanel=(group,target)=>{
      $$(`[data-combined-group="${group}"]`).forEach(b=>b.classList.toggle('active',b.dataset.combinedTarget===target));
      $$(`[data-combined-panel-group="${group}"]`).forEach(p=>p.classList.toggle('hidden',p.dataset.combinedPanel!==target));
    };
    $$('[data-combined-target]').forEach(b=>b.onclick=()=>switchPanel(b.dataset.combinedGroup,b.dataset.combinedTarget));

    const previous=window.navTo;
    window.navTo=function(id){
      let target=id;
      if(id==='sourcesPolicy')target='library';
      if(id==='privacy')target='support';
      if(typeof previous==='function')previous(target);
      try{history.replaceState(null,'',location.pathname+location.search);}catch(_){ }
      if(id==='sourcesPolicy')setTimeout(()=>switchPanel('library','sources'),0);
      else if(target==='library')setTimeout(()=>switchPanel('library','references'),0);
      if(id==='privacy')setTimeout(()=>switchPanel('support','privacy'),0);
      else if(target==='support')setTimeout(()=>switchPanel('support','support'),0);
      const title=$('#globalPageTitle');
      if(title&&target==='library')title.textContent='المراجع وسياسة المصادر';
      if(title&&target==='support')title.textContent='الدعم والخصوصية';
    };
  }

  function initQibla(){
    const country=$('#qiblaCountry'),city=$('#qiblaCity');
    if(!country||!city)return;
    country.innerHTML=Object.keys(PLACES).map(n=>`<option value="${n}">${n}</option>`).join('');

    let savedCity='الرياض',savedCountry='السعودية';
    try{
      const raw=localStorage.getItem('noor_prayer_place')||localStorage.getItem('prayer_place')||'';
      const value=raw.startsWith('"')?JSON.parse(raw):raw;
      const parts=String(value||'').split('،').map(x=>x.trim());
      if(PLACES[parts[1]]){savedCity=parts[0];savedCountry=parts[1];}
    }catch(_){ }

    const fillCities=(countryName,preferred='')=>{
      const cities=Object.keys(PLACES[countryName]||{});
      city.innerHTML=cities.map(n=>`<option value="${n}">${n}</option>`).join('');
      city.value=cities.includes(preferred)?preferred:cities[0];
    };
    country.value=savedCountry;
    fillCities(savedCountry,savedCity);
    country.onchange=()=>fillCities(country.value);

    $('#qiblaFromCity').onclick=()=>{
      const point=PLACES[country.value]?.[city.value];
      if(!point)return setStatus('تعذر العثور على إحداثيات المدينة المختارة.','error');
      showBearing(bearing(point[0],point[1]),`${city.value}، ${country.value}`);
    };

    $('#findQibla').onclick=()=>{
      if(!navigator.geolocation){setStatus('هذا المتصفح لا يدعم تحديد الموقع. استخدم اختيار الدولة والمدينة.','error');return;}
      setStatus('جارٍ طلب موقع الجهاز…');
      navigator.geolocation.getCurrentPosition(pos=>{
        const b=bearing(pos.coords.latitude,pos.coords.longitude);
        showBearing(b,'موقع جهازك الحالي');
      },err=>{
        const messages={1:'تم رفض إذن الموقع. اسمح للموقع باستخدام موقعك أو اختر الدولة والمدينة يدويًا.',2:'تعذر معرفة موقع الجهاز حاليًا. استخدم الدولة والمدينة.',3:'انتهت مهلة تحديد الموقع. حاول مرة أخرى أو استخدم المدينة.'};
        setStatus(messages[err.code]||'تعذر تحديد الموقع. استخدم اختيار الدولة والمدينة.','error');
      },{enableHighAccuracy:true,timeout:15000,maximumAge:300000});
    };

    const compassBtn=$('#startQiblaCompass');
    const orientationHandler=e=>{
      if(currentBearing==null)return;
      let heading=null;
      if(typeof e.webkitCompassHeading==='number')heading=e.webkitCompassHeading;
      else if(e.absolute&&typeof e.alpha==='number')heading=(360-e.alpha)%360;
      else if(typeof e.alpha==='number')heading=(360-e.alpha)%360;
      if(heading==null)return;
      const needle=$('#qiblaNeedle');
      if(needle)needle.style.transform=`rotate(${(currentBearing-heading+360)%360}deg)`;
      const live=$('#qiblaLive');if(live)live.classList.remove('hidden');
    };
    compassBtn.onclick=async()=>{
      if(currentBearing==null)$('#qiblaFromCity').click();
      try{
        if(typeof DeviceOrientationEvent==='undefined')throw new Error('not-supported');
        if(typeof DeviceOrientationEvent.requestPermission==='function'){
          const result=await DeviceOrientationEvent.requestPermission();
          if(result!=='granted')throw new Error('denied');
        }
        if(!orientationStarted){window.addEventListener('deviceorientationabsolute',orientationHandler,true);window.addEventListener('deviceorientation',orientationHandler,true);orientationStarted=true;}
        setStatus('البوصلة الحية تعمل الآن. حرّك الهاتف على شكل رقم 8 لمعايرته ثم اتبع السهم.','success');
      }catch(_){
        setStatus('البوصلة الحية غير متاحة على هذا الجهاز. الاتجاه المحسوب بالدرجات ما زال صالحًا.','error');
      }
    };

    try{
      const saved=JSON.parse(localStorage.getItem('noor_qibla')||'null');
      if(saved?.bearing!=null)showBearing(Number(saved.bearing),saved.label||'الموقع المحفوظ');
      else $('#qiblaFromCity').click();
    }catch(_){$('#qiblaFromCity').click();}
  }

  document.addEventListener('DOMContentLoaded',()=>{
    initCombinedPages();
    initSearchLauncher();
    initQibla();
  });
})();
