'use strict';
importScripts('./assets/js/version.js');

const RELEASE=self.NOOR_VERSION||{semver:'92.0.3',cachePrefix:'noor-aldhikr-',cacheName:'noor-aldhikr-v92-0-3-security1'};
const CACHE_PREFIX=RELEASE.cachePrefix;
const CACHE_NAME=RELEASE.cacheName;
const OFFLINE_URL='./offline.html';
const APP_PATH=new URL(self.registration.scope).pathname;
const CORE_ASSETS=[
 './index.html',
 './offline.html',
 './404.html',
 './mushaf.html',
 './exams.html',
 './privacy.html',
 './terms.html',
 './manifest.webmanifest',
 './icon.svg',
 './icon-192.png',
 './icon-512.png',
 './apple-touch-icon.png',
 './assets/js/ads-config.js',
 './assets/js/version.js',
 './assets/js/error-handler.js',
 './assets/js/password-policy.js',
 './assets/js/common.js',
 './assets/js/v86-security.js',
 './assets/js/auth.js',
 './assets/js/v40-12-public.js',
 './assets/js/v40-21-private-chat.js',
 './assets/js/adhkar.js',
 './assets/js/features.js',
 './assets/js/support.js',
 './assets/js/prayer.js',
 './assets/js/v86-quran-core.js',
 './assets/js/quran-data.js',
 './assets/js/quran.js',
 './assets/js/memorization.js',
 './assets/js/v25-ui.js',
 './assets/js/v26-ruqyah.js',
 './assets/js/v28-assessment.js',
 './assets/js/v29-legal.js',
 './assets/js/v30-page-isolation.js',
 './assets/js/v33-expanded-ruqyah.js',
 './assets/js/v34-dreams.js',
 './assets/js/focused-ui.js',
 './assets/js/v36-professional.js',
 './assets/js/bootstrap.js',
 './assets/js/phase3-home.js',
 './assets/js/phase4-search.js',
 './assets/js/phase5-ruqyah-encyclopedia.js',
 './assets/js/phase6-eye-encyclopedia.js',
 './assets/js/phase7-hasad-encyclopedia.js',
 './assets/js/phase8-magic-encyclopedia.js',
 './assets/js/phase9-mas-complete-ruqyah.js',
 './assets/js/phase10-knowledge-bank.js',
 './assets/js/v38-major-rebuild.js',
 './assets/js/v39-3-location-selects.js',
 './assets/js/v40-2-quran.js',
 './assets/js/v40-3-professional.js',
 './assets/js/v40-4-final.js',
 './assets/js/v40-10-navigation-qibla.js',
 './assets/js/ads.js',
 './assets/js/v40-13-mobile-quran-assessment.js',
 './assets/js/v40-19-experience.js',
 './assets/js/v40-22-spiritual-assessment.js',
 './assets/js/v40-23-islamic-library.js',
 './assets/js/v40-23-legal-privacy.js',
 './assets/js/v86-academy-cloud.js',
 './assets/js/v40-24-islamic-academy.js',
 './assets/js/v86-academy-runtime.js',
 './assets/js/v48-student-dashboard.js',
 './assets/js/v40-27-global-pro.js',
 './assets/js/v40-28-ruqyah-pro.js',
 './assets/js/v40-28-mushaf-khatma.js',
 './assets/js/v66-direct-quran.js',
 './assets/js/v81-runtime.js',
 './assets/js/v883-ai-runtime.js',
 './assets/js/v883-ai-core.js',
 './assets/js/v66-ai-assistant.js',
 './assets/js/v89-local-llm.js',
 './assets/js/v89-retriever.js',
 './assets/js/v89-rag-orchestrator.js',
 './assets/js/v89-ai-runtime.js',
 './assets/js/v902-dream-engine.js',
 './assets/js/v902-grounded-composer.js',
 './assets/js/v89-ai-ui.js',
 './assets/js/v90-conversation.js',
 './assets/js/v90-evidence.js',
 './assets/js/v90-model-router.js',
 './assets/js/v90-stream.js',
 './assets/js/v90-rag-orchestrator.js',
 './assets/js/v90-ai-runtime.js',
 './assets/js/v90-ai-ui.js',
 './assets/js/v911-ai-router.js',
 './assets/js/v80-user-security.js',
 './assets/js/v913-theme-engine.js',
 './assets/js/v88-router.js',
 './assets/css/v88-tokens.css',
 './assets/css/v88-core.css',
 './assets/css/v913-theme.css',
 './assets/css/v91-shell.css',
 './assets/css/v91-cms-public.css',
 './assets/js/v40-18-cms-core.js',
 './assets/js/v40-18-cms-public.js',
 './assets/css/v40-18-owner-cms.css',
 './assets/js/v40-18-cms-admin.js',
 './assets/js/mushaf-v54-final.js',
 './assets/css/mushaf-v54-final.css',
 './assets/css/v66-ai-assistant.css',
 './assets/css/v89-ai.css',
 './assets/css/v90-ai.css',
 './assets/css/v902-ai-core.css',
 './assets/css/v88-quran.css',
 './assets/js/v43-academy-exams.js',
 './assets/css/app.css',
 './assets/css/v43-academy-exams.css',
 './assets/css/v58-exams-150.css',
 './assets/css/v69-production-polish.css',
 './assets/css/v86-global.css',
 './assets/data/adhkar-library.json',
 './assets/data/hasad_questions.json',
 './assets/data/knowledge_questions.json',
 './assets/data/v883-knowledge.json',
 './assets/data/v86-lessons.json',
 './assets/data/v86-questions.json',
 './assets/data/quran-uthmani-hafs-v20.json',
 './assets/fonts/Hafs_20.woff2',
 './assets/css/v88-owner.css',
 './assets/js/v88-owner-os.js',
 './assets/js/v883-owner-ai-health.js',
 './assets/js/v89-owner-os.js',
 './assets/js/v90-owner-os.js',
 './assets/css/v89-owner-os.css',
 './assets/css/v90-owner-os.css',
 './assets/css/v87-legacy-layout.css',
 './assets/css/v87-components.css',
 './assets/css/v87-pages.css',
 './assets/css/v87-home.css',
 './assets/css/v87-mushaf.css',
 './assets/css/v87-exams.css',
 './',
];
const isOwnCache=key=>key.startsWith(CACHE_PREFIX);
const isApiRequest=url=>/\.supabase\.co$/i.test(url.hostname)||
 /(?:^|\/)(?:auth|rest|storage|functions|realtime|graphql)\/v\d+(?:\/|$)/i.test(url.pathname)||
 /\/api(?:\/|$)/i.test(url.pathname);
const isSensitiveNavigation=url=>/\/(?:portal|reset-password|supabase-check|clear-cache)\.html$/i.test(url.pathname);
const isSensitiveAsset=url=>url.pathname.endsWith('/config.js')||
 url.pathname.endsWith('/supabase-check.html')||
 /\/assets\/js\/(?:v43-owner-portal|portal-loader|v86-owner-control|v88-owner-os|v883-owner-ai-health|v89-owner-os|v90-owner-os|v92-owner-admin)\.js$/i.test(url.pathname);

async function putSafe(cache,request,response){
 if(!response?.ok||response.type==='opaque')return;
 try{await cache.put(request,response.clone())}catch(error){console.warn('[V92 SW] Cache write skipped:',error)}
}

async function networkFirst(request,{fallbackUrl='',cacheResponse=true}={}){
 const cache=await caches.open(CACHE_NAME);
 try{
  const response=await fetch(request);
  if(cacheResponse)await putSafe(cache,request,response);
  return response;
 }catch(error){
  const cached=await cache.match(request,{ignoreSearch:true});
  if(cached)return cached;
  if(fallbackUrl){const fallback=await cache.match(fallbackUrl,{ignoreSearch:true});if(fallback)return fallback}
  return new Response('تعذر الاتصال ولا توجد نسخة محفوظة لهذا المورد.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 }
}

async function cacheFirst(request){
 const cache=await caches.open(CACHE_NAME);
 const cached=await cache.match(request,{ignoreSearch:true});
 if(cached)return cached;
 const response=await fetch(request);
 await putSafe(cache,request,response);
 return response;
}

self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE_NAME);
 const results=await Promise.allSettled(CORE_ASSETS.map(async asset=>{
  const request=new Request(asset,{cache:'reload'});
  const response=await fetch(request);
  if(!response.ok)throw new Error(`${asset}:${response.status}`);
  await cache.put(request,response);
 }));
 const failed=results.map((result,index)=>result.status==='rejected'?CORE_ASSETS[index]:'').filter(Boolean);
 if(failed.length)console.warn('[V92 SW] Optional precache failures:',failed);
 await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(key=>isOwnCache(key)&&key!==CACHE_NAME).map(key=>caches.delete(key)));
 await self.clients.claim();
})()));

self.addEventListener('message',event=>{
 if(event.data?.type==='SKIP_WAITING')self.skipWaiting();
 if(event.data?.type==='CHECK_UPDATE')event.waitUntil(self.registration.update());
 if(event.data?.type==='CLEAR_CACHES')event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(isOwnCache).map(key=>caches.delete(key)))));
});

self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);

 // لا نعترض أو نخزن أي طلب خارجي أو API، وبالأخص Supabase.
 if(url.origin!==self.location.origin||isApiRequest(url))return;

 if(request.mode==='navigate'){
  event.respondWith(networkFirst(request,{fallbackUrl:OFFLINE_URL,cacheResponse:!isSensitiveNavigation(url)}));
  return;
 }

 if(isSensitiveAsset(url)){
  event.respondWith(fetch(new Request(request,{cache:'no-store'})).catch(()=>new Response('',{status:503})));
  return;
 }

 if(request.destination==='script'||request.destination==='style'||request.destination==='manifest'){
  event.respondWith(networkFirst(request));
  return;
 }

 if(request.destination==='image'||request.destination==='font'||url.pathname.startsWith(`${APP_PATH}assets/data/`)){
  event.respondWith(cacheFirst(request));
 }
});
