'use strict';

(() => {
  const APP_VERSION = window.NOOR_CONFIG?.appVersion || '82.0.0-owner-stable';
  document.documentElement.dataset.appVersion = APP_VERSION;

  if (!('serviceWorker' in navigator)) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  const forceUpdateCheck = async () => {
    try {
      const registration = await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(APP_VERSION)}`, {
        scope: './',
        updateViaCache: 'none'
      });
      await registration.update();

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    } catch (error) {
      console.warn('تعذر فحص تحديث الموقع:', error);
    }
  };

  window.addEventListener('load', forceUpdateCheck);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') forceUpdateCheck();
  });
})();
