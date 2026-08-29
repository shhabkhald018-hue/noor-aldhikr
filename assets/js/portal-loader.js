'use strict';

(() => {
  const VERSION = window.NOOR_CONFIG?.appVersion || '83.0.0-clean-release';
  const status = (text, type = 'muted') => {
    const el = document.getElementById('portalDiag');
    if (!el) return;
    el.textContent = text;
    el.className = type;
  };

  const loadScript = (src, timeoutMs = 12000) => new Promise((resolve, reject) => {
    const existing = [...document.scripts].find(s => s.src && s.src === new URL(src, location.href).href);
    if (existing?.dataset.loaded === '1') return resolve();

    const script = existing || document.createElement('script');
    let timer = null;
    const done = () => {
      if (timer) clearTimeout(timer);
      script.dataset.loaded = '1';
      resolve();
    };
    const fail = () => {
      if (timer) clearTimeout(timer);
      reject(new Error(`SCRIPT_LOAD_FAILED:${src}`));
    };
    script.addEventListener('load', done, { once: true });
    script.addEventListener('error', fail, { once: true });
    if (!existing) {
      script.src = src;
      script.async = false;
      document.head.appendChild(script);
    }
    timer = setTimeout(() => reject(new Error(`SCRIPT_LOAD_TIMEOUT:${src}`)), timeoutMs);
  });

  async function ensureSupabaseLibrary() {
    if (window.supabase?.createClient) return;
    const sources = [
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
      'https://unpkg.com/@supabase/supabase-js@2'
    ];
    let lastError = null;
    for (const src of sources) {
      try {
        status('جاري تحميل مكتبة Supabase…', 'muted');
        await loadScript(src, 12000);
        if (window.supabase?.createClient) return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error('SUPABASE_LIBRARY_UNAVAILABLE');
  }

  async function start() {
    if (!window.NOOR_CONFIG?.supabaseUrl || !window.NOOR_CONFIG?.publishableKey) {
      throw new Error('CONFIG_NOT_READY');
    }
    await ensureSupabaseLibrary();

    // حمّل كل وحدات لوحة المالك أولًا، ثم شغّل auth/boot أخيرًا.
    // هذا يمنع ضياع حدث noor:admin-ready عند وجود جلسة محفوظة مسبقًا.
    const localScripts = [
      `assets/js/v40-18-cms-core.js?v=${encodeURIComponent(VERSION)}`,
      `assets/js/v40-18-cms-admin.js?v=${encodeURIComponent(VERSION)}`,
      `assets/js/v68-owner-studio.js?v=${encodeURIComponent(VERSION)}`,
      `assets/js/v80-owner-security.js?v=${encodeURIComponent(VERSION)}`,
      `assets/js/v81-owner-studio.js?v=${encodeURIComponent(VERSION)}`,
      `assets/js/v43-owner-portal.js?v=${encodeURIComponent(VERSION)}`
    ];
    for (const src of localScripts) await loadScript(src, 12000);
  }

  start().catch(error => {
    console.error('Owner portal loader:', error);
    const raw = String(error?.message || error || '');
    if (raw.includes('CONFIG_NOT_READY')) {
      status('تعذر قراءة إعدادات Supabase من config.js.', 'error');
    } else if (raw.includes('SCRIPT_LOAD')) {
      status('تعذر تحميل أحد ملفات لوحة المالك أو مكتبة Supabase. حدّث الصفحة وتأكد من الإنترنت.', 'error');
    } else {
      status('تعذر تهيئة لوحة المالك. افتح صفحة التشخيص لمعرفة السبب.', 'error');
    }
  });
})();
