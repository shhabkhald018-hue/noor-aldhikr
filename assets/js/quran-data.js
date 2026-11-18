/* Noor AlDhikr V92 — bundled Quran dataset loader.
 * Uthmanic text: QuranEnc Hafs_20 / King Fahd Complex.
 * Page, juz and hizb metadata: AlQuran.Cloud quran-uthmani.
 */
'use strict';
(()=>{
  const DATA_URL='assets/data/quran-uthmani-hafs-v20.json';
  let dataPromise=null;

  function assetUrl(){
    const version=window.NOOR_VERSION?.assetVersion||window.NOOR_VERSION?.semver||'92.0.2';
    return `${DATA_URL}?v=${encodeURIComponent(version)}`;
  }

  function validate(data){
    const errors=[];
    if(!data||!Array.isArray(data.surahs))errors.push('قائمة السور غير موجودة');
    if((data?.surahs?.length||0)!==114)errors.push('عدد السور ليس 114');
    let total=0,globalNumber=0;
    for(const [surahIndex,surah] of (data?.surahs||[]).entries()){
      if(Number(surah.number)!==surahIndex+1)errors.push(`ترتيب السورة ${surahIndex+1}`);
      if(!Array.isArray(surah.ayahs)||surah.ayahs.length!==Number(surah.numberOfAyahs))errors.push(`عدد آيات السورة ${surahIndex+1}`);
      for(const [ayahIndex,ayah] of (surah.ayahs||[]).entries()){
        total++;globalNumber++;
        if(Number(ayah.number)!==globalNumber||Number(ayah.numberInSurah)!==ayahIndex+1)errors.push(`تسلسل الآية ${globalNumber}`);
        if(!String(ayah.text||'').trim())errors.push(`نص الآية ${globalNumber} فارغ`);
        if(Number(ayah.page)<1||Number(ayah.page)>604)errors.push(`صفحة الآية ${globalNumber} غير صالحة`);
      }
    }
    if(total!==6236)errors.push(`عدد الآيات ${total} بدل 6236`);
    return {ok:errors.length===0,errors,total};
  }

  async function load(){
    if(!dataPromise){
      dataPromise=fetch(assetUrl(),{headers:{Accept:'application/json'},cache:'force-cache'})
        .then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()})
        .then(data=>{const check=validate(data);if(!check.ok)throw new Error(check.errors[0]);return data})
        .catch(error=>{dataPromise=null;throw error});
    }
    return dataPromise;
  }

  function apiRow(surah,ayah){
    return {...ayah,surah:{
      number:surah.number,
      name:surah.name,
      englishName:surah.englishName,
      englishNameTranslation:surah.englishNameTranslation,
      revelationType:surah.revelationType,
      numberOfAyahs:surah.numberOfAyahs
    }};
  }

  async function surah(number){
    const data=await load(),n=Math.max(1,Math.min(114,Number(number)||1));
    const value=data.surahs[n-1];
    if(!value)throw new Error('السورة غير موجودة في النسخة المحلية');
    return {...value,source:data.meta?.textSource||'QuranEnc Hafs_20'};
  }

  async function selectRows(predicate){
    const data=await load(),rows=[];
    for(const s of data.surahs)for(const a of s.ayahs)if(predicate(a,s))rows.push(apiRow(s,a));
    return {data:{ayahs:rows,edition:{identifier:'noor-hafs-20',name:data.meta?.title||'القرآن الكريم'}}};
  }

  const page=number=>{const n=Math.max(1,Math.min(604,Number(number)||1));return selectRows(a=>Number(a.page)===n)};
  const juz=number=>{const n=Math.max(1,Math.min(30,Number(number)||1));return selectRows(a=>Number(a.juz)===n)};
  const hizbQuarter=number=>{const n=Math.max(1,Math.min(240,Number(number)||1));return selectRows(a=>Number(a.hizbQuarter)===n)};

  window.NOOR_QURAN_DATA={DATA_URL,load,validate,surah,page,juz,hizbQuarter};
})();
