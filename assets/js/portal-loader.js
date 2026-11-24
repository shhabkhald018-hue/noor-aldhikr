'use strict';

(() => {
  const ASSET_VERSION = window.NOOR_VERSION?.assetVersion || '92.1.0-trusted-content';
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
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4',
      'https://unpkg.com/@supabase/supabase-js@2.112.4'
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
      `assets/js/error-handler.js?v=${ASSET_VERSION}`,
      `assets/js/common.js?v=${ASSET_VERSION}`,
      `assets/js/v40-18-cms-core.js?v=${ASSET_VERSION}`,
      `assets/js/v40-18-cms-admin.js?v=${ASSET_VERSION}`,
      `assets/js/v80-owner-security.js?v=${ASSET_VERSION}`,
      `assets/js/v81-owner-studio.js?v=${ASSET_VERSION}`,
      `assets/js/v86-owner-control.js?v=${ASSET_VERSION}`,
      `assets/js/v88-owner-os.js?v=${ASSET_VERSION}`,
      `assets/js/v883-owner-ai-health.js?v=${ASSET_VERSION}`,
      `assets/js/v883-ai-core.js?v=${ASSET_VERSION}`,
      `assets/js/v89-retriever.js?v=${ASSET_VERSION}`,
      `assets/js/v89-rag-orchestrator.js?v=${ASSET_VERSION}`,
      `assets/js/v90-evidence.js?v=${ASSET_VERSION}`,
      `assets/js/v90-rag-orchestrator.js?v=${ASSET_VERSION}`,
      `assets/js/v89-owner-os.js?v=${ASSET_VERSION}`,
      `assets/js/v92-owner-admin.js?v=${ASSET_VERSION}`,
      `assets/js/v43-owner-portal.js?v=${ASSET_VERSION}`
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
