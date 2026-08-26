'use strict';
(function(){
  const cfg=window.NOOR_ADS_CONFIG||{};
  const slots=[...document.querySelectorAll('.noor-ad-slot[data-ad-key]')];
  const validClient=typeof cfg.client==='string'&&/^ca-pub-\d{10,}$/.test(cfg.client.trim());
  function preview(){if(!cfg.previewEmptySlots)return;slots.forEach(s=>{s.classList.remove('hidden');s.classList.add('ad-preview');s.textContent='مساحة إعلانية جاهزة — أضف بيانات الشبكة في assets/js/ads-config.js';});}
  if(!cfg.enabled||cfg.provider!=='adsense'||!validClient){document.addEventListener('DOMContentLoaded',preview);return;}
  function boot(){
    if(!document.querySelector('script[data-noor-adsense]')){
      const sc=document.createElement('script');sc.async=true;sc.dataset.noorAdsense='1';sc.crossOrigin='anonymous';sc.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(cfg.client.trim())}`;document.head.append(sc);
    }
    slots.forEach(host=>{
      const key=host.dataset.adKey,slot=cfg.slots?.[key];
      if(!slot)return;
      host.classList.remove('hidden');host.classList.add('ad-ready');host.innerHTML='';
      const ins=document.createElement('ins');ins.className='adsbygoogle';ins.style.display='block';ins.dataset.adClient=cfg.client.trim();ins.dataset.adSlot=String(slot);ins.dataset.adFormat='auto';ins.dataset.fullWidthResponsive='true';host.append(ins);
      try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){console.warn('تعذر تهيئة المساحة الإعلانية',key,e);}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
