'use strict';

const CACHE_NAME='noor-v81-3-core';
const CORE_ASSETS=[
  './',
  './index.html',
  './404.html',
  './mushaf.html',
  './exams.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './assets/css/app.css',
  './assets/css/v67-balanced-theme.css',
  './assets/css/v69-production-polish.css',
  './assets/css/v80-security.css',
  './assets/css/v81-owner-studio.css',
  './assets/js/v81-runtime.js'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(CORE_ASSETS.map(url=>new Request(url,{cache:'reload'}))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
  if(event.data?.type==='CLEAR_CACHES'){
    event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))));
  }
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  // ملف الاتصال لا يُقرأ من الكاش أبدًا حتى لا تبقى إعدادات مشروع قديم.
  if(url.pathname.endsWith('/assets/js/config.js')){
    event.respondWith(fetch(new Request(event.request,{cache:'no-store'})));
    return;
  }

  // صفحات المصادقة/المالك network-first دائمًا لتجنب تشغيل نسخة قديمة من الكاش.
  const sensitive=/\/(?:portal|reset-password)\.html$/.test(url.pathname);
  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request).catch(()=> sensitive ? Response.error() : caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }))
  );
});
