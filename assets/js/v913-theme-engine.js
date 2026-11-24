'use strict';
(()=>{
  const RELEASE=window.NOOR_VERSION||{semver:'92.1.1',cachePrefix:'noor-aldhikr-',cacheName:'noor-aldhikr-v92-1-1-usability-safety'};
  const VERSION=RELEASE.semver;
  const MODE_KEY='noor_theme_mode_v882';
  const DATA_KEY='noor_v9200_theme_data';
  const MIGRATION_KEY='noor_v9200_theme_migrated';
  const CACHE_PREFIX=RELEASE.cachePrefix;
  const CACHE_NAME=RELEASE.cacheName;
  const OLD_DATA_KEYS=[
    'noor_v9133_theme_migrated',
    'noor_v9133_theme_data',
    'noor_v9132_theme_migrated',
    'noor_v9132_theme_data',
    'noor_v9131_theme_migrated',
    'noor_v9131_theme_data',
    'noor_v913_theme_migrated',
    'noor_v913_theme_data',
    'noor_v9124_neutral_pro_design',
    'noor_v9123_calm_visual_design',
    'noor_v9122_eye_comfort_design',
    'noor_v9121_public_design',
    'noor_v87_public_design'
  ];
  const root=document.documentElement;
  const DEF={
    light:{bg:'#F5F8F4',surface:'#FFFFFF',surfaceSoft:'#EDF4EF',text:'#17251F',muted:'#586A61',border:'#D4E1D8',accent:'#176B52',accentStrong:'#0F513D',accentSoft:'#E2F1E8',gold:'#9B6B1F'},
    dark:{bg:'#08130F',surface:'#102019',surfaceSoft:'#172A22',text:'#F4F8F5',muted:'#B0C2B7',border:'#2A4438',accent:'#74D3A7',accentStrong:'#216E54',accentSoft:'#18382B',gold:'#E2BE70'}
  };
  const EXTRA_KEYS=['design_button_radius','design_content_width','design_font_scale','design_shadow','design_surface','design_text','design_muted','design_border','design_dark_surface','design_dark_text'];
  const validHex=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v.trim())?v.trim().toUpperCase():null;
  const migratedHex=(value,map,fallback)=>{
    const hex=validHex(value);
    return hex?(map[hex]||hex):fallback;
  };
  const num=(v,fallback,min,max)=>Number.isFinite(+v)?Math.min(max,Math.max(min,+v)):fallback;
  let currentRaw={};

  function normalize(raw={}){
    const ui=raw&&raw.ui&&typeof raw.ui==='object'?raw.ui:{};
    const extra=raw&&raw.extra&&typeof raw.extra==='object'?raw.extra:{};
    const light={...DEF.light};
    const dark={...DEF.dark};
    light.bg=migratedHex(ui.light_bg,{'#F6F7F9':DEF.light.bg,'#F7F6F2':DEF.light.bg,'#F4F1E8':DEF.light.bg},DEF.light.bg);
    light.surface=validHex(extra.design_surface)||DEF.light.surface;
    light.text=migratedHex(extra.design_text,{'#20262D':DEF.light.text},DEF.light.text);
    light.muted=migratedHex(extra.design_muted,{'#66717D':DEF.light.muted,'#6F756F':DEF.light.muted},DEF.light.muted);
    light.border=migratedHex(extra.design_border,{'#E1E5EA':DEF.light.border,'#DDD8CE':DEF.light.border},DEF.light.border);
    light.accent=migratedHex(ui.accent,{'#466A80':DEF.light.accent,'#6E7F72':DEF.light.accent,'#2F735E':DEF.light.accent},DEF.light.accent);
    light.accentStrong=DEF.light.accentStrong;
    light.gold=migratedHex(ui.accent2,{'#E1E5EA':DEF.light.gold,'#B9A57A':DEF.light.gold,'#B99754':DEF.light.gold},DEF.light.gold);
    dark.bg=migratedHex(ui.dark_bg,{'#0F1318':DEF.dark.bg,'#1E2321':DEF.dark.bg,'#07110D':DEF.dark.bg},DEF.dark.bg);
    dark.surface=migratedHex(extra.design_dark_surface,{'#171C22':DEF.dark.surface},DEF.dark.surface);
    dark.text=migratedHex(extra.design_dark_text,{'#F3F5F7':DEF.dark.text},DEF.dark.text);
    dark.surfaceSoft=DEF.dark.surfaceSoft;
    dark.muted=DEF.dark.muted;
    dark.border=DEF.dark.border;
    dark.accent=DEF.dark.accent;
    dark.accentStrong=DEF.dark.accentStrong;
    dark.gold=DEF.dark.gold;
    return {
      light,dark,
      radius:num(ui.radius,15,10,26),
      compact:!!ui.compact,
      buttonRadius:num(extra.design_button_radius,13,8,24),
      contentWidth:num(extra.design_content_width,1240,980,1440),
      fontScale:num(extra.design_font_scale,1,.92,1.16),
      shadow:['none','soft','medium','strong'].includes(extra.design_shadow)?extra.design_shadow:'soft'
    };
  }

  function apply(raw={}){
    currentRaw=raw&&typeof raw==='object'?raw:{};
    const normalized=normalize(currentRaw);
    const darkMode=root.dataset.theme==='dark';
    const p=darkMode?normalized.dark:normalized.light;
    const set=(k,v)=>root.style.setProperty(k,v);

    set('--theme-bg',p.bg);
    set('--theme-surface',p.surface);
    set('--theme-surface-soft',p.surfaceSoft);
    set('--theme-text',p.text);
    set('--theme-muted',p.muted);
    set('--theme-border',p.border);
    set('--theme-accent',p.accent);
    set('--theme-accent-strong',p.accentStrong);
    set('--theme-accent-soft',p.accentSoft);
    set('--theme-gold',p.gold);

    // Temporary compatibility aliases. The V92 runtime is the only writer.
    set('--v88-bg',p.bg); set('--v88-bg-alt',p.surfaceSoft); set('--v88-surface',p.surface); set('--v88-surface-soft',p.surfaceSoft);
    set('--v88-surface-warm',p.surface); set('--v88-text',p.text); set('--v88-text-soft',p.muted); set('--v88-muted',p.muted);
    set('--v88-line',p.border); set('--v88-line-strong',p.border); set('--v88-primary',p.accent); set('--v88-primary-strong',p.accentStrong);
    set('--v88-primary-soft',p.surfaceSoft); set('--v88-primary-softer',p.surfaceSoft); set('--v88-gold',p.gold); set('--v88-gold-strong',p.gold); set('--v88-gold-soft',p.surfaceSoft);

    set('--noor-bg',p.bg); set('--noor-bg-alt',p.surfaceSoft); set('--noor-surface',p.surface); set('--noor-surface-muted',p.surfaceSoft); set('--noor-surface-raised',p.surface);
    set('--noor-primary',p.accent); set('--noor-primary-strong',p.accentStrong); set('--noor-primary-soft',p.surfaceSoft); set('--noor-green',p.accent); set('--noor-green-2',p.accentStrong);
    set('--noor-gold',p.gold); set('--noor-gold-strong',p.gold); set('--noor-gold-soft',p.surfaceSoft); set('--noor-text',p.text); set('--noor-ink',p.text); set('--noor-text-soft',p.muted);
    set('--noor-muted',p.muted); set('--noor-border',p.border); set('--noor-line',p.border); set('--noor-border-strong',p.border);

    set('--bg',p.bg); set('--card',p.surface); set('--ink',p.text); set('--text',p.text); set('--text-soft',p.muted); set('--muted',p.muted);
    set('--line',p.border); set('--border',p.border); set('--surface',p.surface); set('--surface-2',p.surfaceSoft); set('--primary',p.accent);
    set('--accent',p.accent); set('--accent-strong',p.accentStrong); set('--accent2',p.gold);
    set('--v40-bg',p.bg); set('--v40-surface',p.surface); set('--v40-surface-2',p.surfaceSoft); set('--v40-ink',p.text); set('--v40-muted',p.muted); set('--v40-line',p.border); set('--v40-green',p.accent); set('--v40-green-2',p.accentStrong); set('--v40-gold',p.gold);
    set('--site-bg',p.bg); set('--site-surface',p.surface); set('--site-surface-2',p.surfaceSoft); set('--site-ink',p.text); set('--site-muted',p.muted); set('--site-line',p.border); set('--site-accent',p.accent); set('--site-accent-2',p.gold);
    set('--academy-accent',p.accent); set('--academy-border',p.border); set('--academy-ink',p.text); set('--academy-soft',p.surfaceSoft); set('--academy-soft-2',p.surfaceSoft);
    set('--cms-accent',p.accent); set('--cms-accent-2',p.gold); set('--cms-light-bg',normalized.light.bg); set('--cms-dark-bg',normalized.dark.bg);

    set('--v88-radius-md',`${normalized.radius}px`);
    set('--v88-radius-lg',`${Math.min(34,normalized.radius+7)}px`);
    set('--v88-radius-xl',`${Math.min(40,normalized.radius+15)}px`);
    set('--v88-button-radius',`${normalized.buttonRadius}px`);
    set('--v88-content',`${normalized.contentWidth}px`);
    set('--v88-font-scale',String(normalized.fontScale));
    set('--cms-radius',`${normalized.radius}px`);
    set('--cms-font-scale',String(normalized.fontScale));
    const shadow=normalized.shadow==='none'?'none':normalized.shadow==='strong'?'0 18px 46px rgba(16,20,22,.18)':normalized.shadow==='medium'?'0 14px 36px rgba(16,20,22,.11)':'0 8px 24px rgba(16,20,22,.07)';
    set('--v88-shadow-sm',shadow); set('--noor-shadow-sm',shadow); set('--cms-card-shadow',shadow);
    if(root.classList&&typeof root.classList.toggle==='function') root.classList.toggle('noor-compact',normalized.compact);
    root.style.colorScheme=darkMode?'dark':'light';
    return normalized;
  }

  async function migrateOnce(){
    try{
      if(localStorage.getItem(MIGRATION_KEY)==='1') return false;
      if(!localStorage.getItem(DATA_KEY)){
        for(const key of OLD_DATA_KEYS.filter(name=>name.endsWith('_theme_data'))){
          try{
            const previous=JSON.parse(localStorage.getItem(key)||'null');
            if(previous&&typeof previous==='object'){
              localStorage.setItem(DATA_KEY,JSON.stringify(previous));
              break;
            }
          }catch{}
        }
      }
      for(const key of OLD_DATA_KEYS) localStorage.removeItem(key);
      if(typeof caches!=='undefined'&&caches&&typeof caches.keys==='function'){
        const names=await caches.keys();
        const obsolete=names.filter(name=>name!==CACHE_NAME&&name.startsWith(CACHE_PREFIX));
        await Promise.all(obsolete.map(name=>caches.delete(name)));
      }
      localStorage.setItem(MIGRATION_KEY,'1');
      return true;
    }catch(err){
      console.warn('V92 theme migration:',err);
      return false;
    }
  }

  function readCached(){
    try{return JSON.parse(localStorage.getItem(DATA_KEY)||'null')}catch{return null}
  }

  async function load(){
    const cached=readCached();
    if(cached) apply(cached); else apply({});
    const cfg=window.NOOR_CONFIG||{};
    if(!cfg.supabaseUrl||!cfg.publishableKey) return normalize(currentRaw);
    const base=cfg.supabaseUrl.replace(/\/$/,'')+'/rest/v1';
    const headers={apikey:cfg.publishableKey,Accept:'application/json'};
    try{
      const [uiResponse,extraResponse]=await Promise.all([
        fetch(`${base}/ui_settings?id=eq.true&select=accent,accent2,light_bg,dark_bg,radius,compact`,{headers,cache:'no-store'}),
        fetch(`${base}/app_settings?key=in.(${EXTRA_KEYS.join(',')})&select=key,value`,{headers,cache:'no-store'})
      ]);
      if(!uiResponse.ok||!extraResponse.ok) throw new Error(`theme fetch ${uiResponse.status}/${extraResponse.status}`);
      const [uiRows,extraRows]=await Promise.all([uiResponse.json(),extraResponse.json()]);
      const raw={ui:uiRows?.[0]||{},extra:Object.fromEntries((extraRows||[]).map(row=>[row.key,row.value]))};
      localStorage.setItem(DATA_KEY,JSON.stringify(raw));
      return apply(raw);
    }catch(err){
      console.warn('V92 theme load:',err);
      return apply(cached||{});
    }
  }

  function setMode(mode){
    const next=mode==='dark'?'dark':'light';
    root.dataset.theme=next;
    root.style.colorScheme=next;
    try{localStorage.setItem(MODE_KEY,next)}catch{}
    return apply(currentRaw);
  }

  try{
    const stored=localStorage.getItem(MODE_KEY);
    if(stored==='dark'||stored==='light') root.dataset.theme=stored;
    else if(!root.dataset.theme) root.dataset.theme='light';
  }catch{if(!root.dataset.theme) root.dataset.theme='light'}

  const observer=new MutationObserver(()=>apply(currentRaw));
  observer.observe(root,{attributes:true,attributeFilter:['data-theme']});

  window.NOOR_THEME=window.NOOR_V913_THEME={VERSION,apply,normalize,load,setMode,migrateOnce,defaults:DEF,resetLocal(){try{localStorage.removeItem(DATA_KEY)}catch{}}};
  migrateOnce();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load,{once:true}); else load();
})();
