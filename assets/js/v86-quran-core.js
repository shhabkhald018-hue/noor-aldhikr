'use strict';
(()=>{
  const BASMALA='بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const marks=/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
  const norm=s=>String(s||'').normalize('NFKC').replace(marks,'').replace(/[ٱأإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/\s+/g,' ').trim();
  const target=norm('بسم الله الرحمن الرحيم');
  function stripLeadingBasmala(text,surah,ayah){
    const raw=String(text||'').trim();
    if(Number(ayah)!==1 || Number(surah)===1 || Number(surah)===9) return raw;
    const compactTarget=target.replace(/\s+/g,'');
    let compact='';
    for(let i=0;i<raw.length;i++){
      const piece=norm(raw[i]).replace(/\s+/g,'');
      if(piece) compact+=piece;
      if(!compactTarget.startsWith(compact)) return raw;
      if(compact===compactTarget){
        return raw.slice(i+1).replace(/^[\s\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640۝۞﴿﴾]+/,'').trim();
      }
    }
    return raw;
  }
  function shouldShowHeadingBasmala(surah,firstAyah){return Number(firstAyah)===1&&Number(surah)!==1&&Number(surah)!==9}
  function parseDeepLink(search=''){
    const q=new URLSearchParams(String(search||'').replace(/^\?/,''));
    const rawPage=q.get('page'),rawSurah=q.get('surah'),rawAyah=q.get('ayah');
    const page=rawPage&&Number.isFinite(Number(rawPage))?Math.max(1,Math.min(604,Number(rawPage))):null;
    const surah=rawSurah&&Number.isFinite(Number(rawSurah))?Math.max(1,Math.min(114,Number(rawSurah))):null;
    const ayah=rawAyah&&Number.isFinite(Number(rawAyah))?Math.max(1,Number(rawAyah)):null;
    return {page,surah,ayah};
  }
  function validatePage(rows){
    if(!Array.isArray(rows)||!rows.length) return {ok:false,reason:'empty'};
    return {ok:rows.every(x=>x&&Number.isFinite(+x.numberInSurah)&&x.surah&&Number.isFinite(+x.surah.number)&&String(x.text||'').trim()),reason:'invalid_ayah'};
  }

  async function fetchPage(page,apiBase='https://api.alquran.cloud/v1'){
    const n=Math.max(1,Math.min(604,Number(page)||1));const key=`noor_quran_page_v86_${n}`;
    try{
      const r=await fetch(`${apiBase}/page/${n}/quran-uthmani`,{headers:{Accept:'application/json'}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();const rows=j.data?.ayahs||[];if(!validatePage(rows).ok)throw new Error('invalid_quran_page');
      try{localStorage.setItem(key,JSON.stringify(j));let idx=JSON.parse(localStorage.getItem('noor_quran_cache_index_v86')||'[]').filter(x=>x!==n);idx.unshift(n);for(const old of idx.slice(24))localStorage.removeItem(`noor_quran_page_v86_${old}`);localStorage.setItem('noor_quran_cache_index_v86',JSON.stringify(idx.slice(0,24)))}catch{}
      return j;
    }catch(error){try{const cached=JSON.parse(localStorage.getItem(key)||'null');if(cached&&validatePage(cached.data?.ayahs||[]).ok)return cached}catch{}throw error}
  }
  window.NOOR_QURAN_V86={BASMALA,normalize:norm,stripLeadingBasmala,shouldShowHeadingBasmala,validatePage,parseDeepLink,fetchPage};
})();
