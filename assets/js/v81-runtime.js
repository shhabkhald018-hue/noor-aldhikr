
'use strict';
(()=>{
  const clean=s=>String(s??'').trim();
  const state=window.NOOR_RUNTIME={modules:{},texts:{},blocks:[],ai:null,ui:null,settings:{},loaded:false,cloudAvailable:false};

  function client(){
    return window.NOOR_GET_SUPABASE_CLIENT?.() || window.supabaseClient || null;
  }
  function timed(promise,ms=12000){
    if(window.noorWithTimeout)return window.noorWithTimeout(promise,ms);
    let timer;
    return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('NOOR_TIMEOUT')),ms)})]).finally(()=>clearTimeout(timer));
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
    // V88.3 owns all visual theme values through v88-theme-runtime.js.
    // This legacy runtime only keeps non-visual behavior such as maintenance state.
    document.documentElement.classList.toggle('noor-compact',!!u.compact);
    if(u.maintenance_mode && window.NOOR_V86_OWNER_PREVIEW!==true){
      let m=document.getElementById('v81Maintenance');
      if(!m){
        m=document.createElement('div');m.id='v81Maintenance';m.className='v81-maintenance';
        m.innerHTML='<div><b>نور الذكر</b><h1>تحديث جارٍ</h1><p></p></div>';
        document.body.appendChild(m);
      }
      m.querySelector('p').textContent=u.maintenance_message||'الموقع تحت التحديث.';
    }else document.getElementById('v81Maintenance')?.remove();
  }
  function applyTexts(){
    const homeMessage=state.settings.home_message||'';
    let msg=document.getElementById('v86HomeMessage');
    if(homeMessage){if(!msg){msg=document.createElement('div');msg.id='v86HomeMessage';msg.className='v86-home-message';const home=document.getElementById('home');(home||document.body).prepend(msg)}msg.textContent=homeMessage}else{msg?.remove()}
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
      document.querySelectorAll(`[data-page="${CSS.escape(key)}"],[data-module-key="${CSS.escape(key)}"]`).forEach(el=>{
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
    if(ai||state.ai)window.NOOR_AI_ENABLED=(ai?.enabled!==false)&&(state.ai?.enabled!==false);
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
    const v=state.texts['global.announcement']||state.settings.announcement;
    let bar=document.getElementById('v81Announcement');
    if(!v){bar?.remove();return}
    if(!bar){bar=document.createElement('div');bar.id='v81Announcement';bar.className='v81-announcement';document.body.prepend(bar)}
    bar.textContent=v;
  }

  async function load(){
    const sb=client();
    if(!sb){
      state.loaded=true;state.cloudAvailable=false;
      window.dispatchEvent(new CustomEvent('noor:runtime-ready',{detail:state}));
      return;
    }
    const tasks=[
      timed(sb.from('site_modules').select('*').order('sort_order')),
      timed(sb.from('site_texts').select('text_key,value').eq('public',true)),
      timed(sb.from('custom_blocks').select('*').eq('active',true).order('sort_order')),
      timed(sb.from('ai_settings').select('*').eq('id',true).maybeSingle()),
      timed(sb.from('ui_settings').select('*').eq('id',true).maybeSingle()),
      timed(sb.from('app_settings').select('key,value').in('key',['home_message','announcement','design_button_radius','design_content_width','design_font_scale','design_shadow']))
    ];
    const results=await Promise.allSettled(tasks);
    const value=index=>{
      const result=results[index];
      if(result.status==='rejected'){console.warn('V81 cloud request:',result.reason);return null}
      if(result.value?.error){console.warn('V81 cloud response:',result.value.error.message);return null}
      return result.value;
    };
    const mods=value(0),texts=value(1),blocks=value(2),ai=value(3),ui=value(4),settings=value(5);
    state.modules={};state.texts={};
    (mods?.data||[]).forEach(x=>state.modules[x.module_key]=x);
    (texts?.data||[]).forEach(x=>state.texts[x.text_key]=x.value);
    if(blocks)state.blocks=blocks.data||[];
    if(ai)state.ai=ai.data||null;
    if(ui)state.ui=ui.data||null;
    if(settings)state.settings=Object.fromEntries((settings.data||[]).map(x=>[x.key,x.value]));
    state.loaded=true;state.cloudAvailable=!!(mods||texts||blocks||ai||ui||settings);
    applyUi();applyTexts();applyModules();injectBlocks();announce();
    window.dispatchEvent(new CustomEvent('noor:runtime-ready',{detail:state}));
  }
  window.NOOR_RUNTIME_RELOAD=load;
  document.addEventListener('DOMContentLoaded',()=>setTimeout(load,180));
})();
