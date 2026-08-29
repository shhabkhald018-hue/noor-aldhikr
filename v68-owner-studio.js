
'use strict';
(()=>{
  const PRESETS={
    balanced:{accent:'#2f735e',accent2:'#b89a5a',light:'#f3f2ee',dark:'#0f1211'},
    green:{accent:'#356f5d',accent2:'#baa15f',light:'#f1f4f1',dark:'#0d1512'},
    gold:{accent:'#5c7162',accent2:'#b58e48',light:'#f5f1e8',dark:'#16130f'},
    charcoal:{accent:'#527264',accent2:'#b7a16d',light:'#f1f2f1',dark:'#111312'}
  };
  const $=s=>document.querySelector(s);
  function setVal(id,v){
    const el=document.getElementById(id);if(!el)return;
    el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function applyPreset(name){
    const p=PRESETS[name];if(!p)return;
    setVal('cmsAccent',p.accent);setVal('cmsAccent2',p.accent2);setVal('cmsLightBg',p.light);setVal('cmsDarkBg',p.dark);
    document.documentElement.style.setProperty('--noor-green',p.accent);
    document.documentElement.style.setProperty('--noor-gold',p.accent2);
  }
  function homeFirst(){
    const state=window.NOOR_CMS_ADMIN?.getState?.();if(!state)return;
    const home=state.sections?.find(x=>x.id==='home');if(!home)return;
    home.sortOrder=-1000;home.active=true;home.navVisible=true;
    alert('تم تثبيت الرئيسية كأول عنصر في المسودة. اضغط «حفظ ونشر التغييرات» لتطبيقها للمستخدمين.');
  }
  function mount(){
    const root=document.getElementById('cmsAdminMount');if(!root||document.getElementById('v68OwnerTools'))return false;
    const target=root.querySelector('.cms-admin-hero')||root.firstElementChild;
    if(!target)return false;
    const box=document.createElement('div');box.id='v68OwnerTools';box.className='v68-owner-tools';
    box.innerHTML=`<div><b>أدوات المالك السريعة</b><small>ألوان جاهزة، ترتيب الرئيسية، ومعاينة الموقع.</small></div>
      <div class="v68-owner-tools-actions">
        <button class="btn" data-preset="balanced">ألوان متوازنة</button>
        <button class="btn" data-preset="green">أخضر هادئ</button>
        <button class="btn" data-preset="gold">ذهبي دافئ</button>
        <button class="btn" data-preset="charcoal">فحمي أنيق</button>
        <button class="btn" id="v68HomeFirst">الرئيسية أولًا</button>
        <button class="btn primary" id="v68Preview">معاينة الموقع</button>
      </div>`;
    target.insertAdjacentElement('afterend',box);
    box.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>applyPreset(b.dataset.preset));
    box.querySelector('#v68HomeFirst').onclick=homeFirst;
    box.querySelector('#v68Preview').onclick=()=>window.open('index.html?ownerPreview=1','_blank');
    return true;
  }
  function start(){
    if(mount())return;
    let n=0,t=setInterval(()=>{if(mount()||++n>100)clearInterval(t)},100);
  }
  document.addEventListener('DOMContentLoaded',start);
  window.addEventListener('noor:admin-ready',start);
  setTimeout(start,800);
})();
