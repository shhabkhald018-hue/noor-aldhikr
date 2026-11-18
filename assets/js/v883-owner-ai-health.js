'use strict';
(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function json(path,fb){try{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw 0;return await r.json()}catch{return fb}}
 async function render(){
   const panel=document.getElementById('systemHealth'),anchor=document.getElementById('v87SystemHealthMount');if(!panel||!anchor||!window.supabaseClient)return;
   let host=document.getElementById('v883AiHealth');if(!host){host=document.createElement('div');host.id='v883AiHealth';anchor.insertAdjacentElement('afterend',host)}
   host.innerHTML='<section class="cardx"><h2>صحة المساعد V92</h2><p class="muted">جاري فحص المعرفة والمصادر…</p></section>';
   try{
     const sb=window.supabaseClient;
     const [mod,settings,kb,canonical,lessons]=await Promise.all([
       sb.from('site_modules').select('enabled').eq('module_key','aiAssistant').maybeSingle(),
       sb.from('ai_settings').select('enabled,model_label').eq('id',true).maybeSingle(),
       sb.from('ai_knowledge').select('id,source_text,active').eq('active',true),
       json('assets/data/v883-knowledge.json?v=89.0',[]),json('assets/data/v86-lessons.json?v=89.0',{})
     ]);
     const cloud=kb.data||[],withSource=cloud.filter(x=>String(x.source_text||'').trim()).length,lessonCount=Object.values(lessons||{}).reduce((n,a)=>n+(Array.isArray(a)?a.length:0),0),enabled=mod.data?.enabled!==false&&settings.data?.enabled!==false;
     host.innerHTML=`<section class="cardx"><div class="v87-os-head"><div><span class="v87-os-kicker">ASSISTANT HEALTH</span><h2>المساعد المعرفي V92</h2><p class="muted">فحص مباشر للتشغيل والتغطية والمراجع.</p></div><button class="btn ghost" id="v883AiHealthRefresh">إعادة الفحص</button></div><div class="v87-health-grid"><article class="v87-health-card"><b>${enabled?'ON':'OFF'}</b><span>حالة المساعد</span></article><article class="v87-health-card"><b>${cloud.length}</b><span>معرفة Supabase نشطة</span></article><article class="v87-health-card"><b>${withSource}/${cloud.length}</b><span>معرفة سحابية بمصدر</span></article><article class="v87-health-card"><b>${canonical.length}/50</b><span>مواضيع Offline موثقة</span></article><article class="v87-health-card"><b>${lessonCount}/310</b><span>دروس الأكاديمية للبحث</span></article><article class="v87-health-card"><b>${esc(settings.data?.model_label||'V92 Free Islamic RAG AI')}</b><span>محرك المعرفة</span></article></div><p style="margin-top:14px"><span class="v87-health-status ${enabled?'':'warn'}">${enabled?'✓ المساعد مفعّل':'⚠ المساعد متوقف من الإعدادات'}</span> <span class="v87-health-status ${cloud.length===withSource?'':'warn'}">${cloud.length===withSource?'✓ كل معرفة Supabase لها مصدر':'⚠ توجد إجابات سحابية بدون مصدر'}</span> <span class="v87-health-status ${canonical.length===50&&lessonCount===310?'':'warn'}">${canonical.length===50&&lessonCount===310?'✓ بنك Offline والأكاديمية كاملان':'⚠ ملفات المعرفة المحلية غير مكتملة'}</span></p></section>`;
     document.getElementById('v883AiHealthRefresh').onclick=render;
   }catch(e){host.innerHTML=`<section class="cardx"><h2>صحة المساعد V92</h2><p class="error">${esc(e.message||e)}</p></section>`}
 }
 window.NOOR_V883_AI_HEALTH=render;
 window.addEventListener('noor:admin-ready',()=>setTimeout(render,300));document.addEventListener('DOMContentLoaded',()=>setTimeout(render,1400));
})();
