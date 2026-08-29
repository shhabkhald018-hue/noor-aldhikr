
'use strict';
(()=>{
  const CFG=window.NOOR_CONFIG||{};
  const clean=s=>String(s??'').trim();
  const state=window.NOOR_RUNTIME={modules:{},texts:{},blocks:[],ai:null,ui:null,loaded:false};

  function client(){
    if(window.supabaseClient) return window.supabaseClient;
    if(!window.supabase?.createClient || !CFG.supabaseUrl || !CFG.publishableKey || /PASTE_NEW_/.test(CFG.supabaseUrl+CFG.publishableKey)) return null;
    return window.supabase.createClient(CFG.supabaseUrl,CFG.publishableKey);
  }
  function safeUrl(v){
    v=clean(v); if(!v)return '';
    try{
      const u=new URL(v,location.href);
      if(u.origin===location.origin || u.protocol==='https:') return u.href;
    }catch(e){}
    return '';
  }
  function applyUi(){
    const u=state.ui||{};
    const r=document.documentElement.style;
    if(/^#[0-9a-f]{6}$/i.test(u.accent||''))r.setProperty('--noor-green',u.accent);
    if(/^#[0-9a-f]{6}$/i.test(u.accent2||''))r.setProperty('--noor-gold',u.accent2);
    if(/^#[0-9a-f]{6}$/i.test(u.light_bg||''))r.setProperty('--noor-light-bg',u.light_bg);
    if(/^#[0-9a-f]{6}$/i.test(u.dark_bg||''))r.setProperty('--noor-dark-bg',u.dark_bg);
    if(Number.isFinite(+u.radius))r.setProperty('--noor-owner-radius',`${u.radius}px`);
    document.documentElement.classList.toggle('noor-compact',!!u.compact);

    if(u.maintenance_mode && !new URLSearchParams(location.search).has('ownerPreview')){
      let m=document.getElementById('v81Maintenance');
      if(!m){
        m=document.createElement('div');m.id='v81Maintenance';m.className='v81-maintenance';
        m.innerHTML='<div><b>نور الذكر</b><h1>تحديث جارٍ</h1><p></p></div>';
        document.body.appendChild(m);
      }
      m.querySelector('p').textContent=u.maintenance_message||'الموقع تحت التحديث.';
    }
  }
  function applyTexts(){
    const map={
      'hero.title':'.hero-card h1',
      'hero.subtitle':'.hero-card p',
      'home.cta.title':'.v38-home-cta h2',
      'home.cta.body':'.v38-home-cta p'
    };
    for(const [k,sel] of Object.entries(map)){
      const val=state.texts[k]; const el=document.querySelector(sel);
      if(el && val!==undefined) el.textContent=val;
    }
  }
  function applyModules(){
    for(const [key,m] of Object.entries(state.modules)){
      const page=document.getElementById(key);
      if(page) page.hidden=!m.enabled;
      document.querySelectorAll(`[data-page="${CSS.escape(key)}"]`).forEach(el=>{
        el.hidden=!m.enabled || !m.nav_visible;
        if(m.label) el.textContent=m.label;
      });
      if(m.title_override && page){
        const h=page.querySelector('h1,h2'); if(h)h.textContent=m.title_override;
      }
      if(m.subtitle_override && page){
        const p=page.querySelector('p.muted,.section-title p'); if(p)p.textContent=m.subtitle_override;
      }
    }
    const ai=state.modules.aiAssistant;
    window.NOOR_AI_ENABLED=!!(ai?.enabled && state.ai?.enabled);
  }
  function injectBlocks(){
    document.querySelectorAll('[data-v81-custom-block]').forEach(x=>x.remove());
    const grouped={};
    for(const b of state.blocks.filter(x=>x.active)){
      (grouped[b.area_key]??=[]).push(b);
    }
    for(const [area,list] of Object.entries(grouped)){
      const host=document.getElementById(area);
      if(!host)continue;
      const wrap=document.createElement('div');wrap.dataset.v81CustomBlock='1';wrap.className='v81-custom-blocks';
      list.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).forEach(b=>{
        const c=document.createElement('article');c.className=`v81-custom-card v81-style-${clean(b.style_key)||'default'}`;
        const h=document.createElement('h3');h.textContent=b.title;c.appendChild(h);
        if(b.body){const p=document.createElement('p');p.textContent=b.body;c.appendChild(p)}
        const url=safeUrl(b.button_url);
        if(b.button_label && url){const a=document.createElement('a');a.className='btn';a.textContent=b.button_label;a.href=url;c.appendChild(a)}
        wrap.appendChild(c);
      });
      host.appendChild(wrap);
    }
  }
  function announce(){
    const v=state.texts['global.announcement'];
    let bar=document.getElementById('v81Announcement');
    if(!v){bar?.remove();return}
    if(!bar){bar=document.createElement('div');bar.id='v81Announcement';bar.className='v81-announcement';document.body.prepend(bar)}
    bar.textContent=v;
  }

  async function load(){
    const sb=client(); if(!sb)return;
    try{
      const [mods,texts,blocks,ai,ui]=await Promise.all([
        sb.from('site_modules').select('*').order('sort_order'),
        sb.from('site_texts').select('text_key,value').eq('public',true),
        sb.from('custom_blocks').select('*').eq('active',true).order('sort_order'),
        sb.from('ai_settings').select('*').eq('id',true).maybeSingle(),
        sb.from('ui_settings').select('*').eq('id',true).maybeSingle()
      ]);
      (mods.data||[]).forEach(x=>state.modules[x.module_key]=x);
      (texts.data||[]).forEach(x=>state.texts[x.text_key]=x.value);
      state.blocks=blocks.data||[];state.ai=ai.data||null;state.ui=ui.data||null;state.loaded=true;
      applyUi();applyTexts();applyModules();injectBlocks();announce();
      window.dispatchEvent(new CustomEvent('noor:runtime-ready',{detail:state}));
    }catch(e){console.warn('V81 runtime:',e)}
  }
  window.NOOR_RUNTIME_RELOAD=load;
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,180));
})();
