
'use strict';
(()=>{
 const CFG=window.NOOR_CONFIG||{};
 const PAGE_LABELS={home:'الرئيسية',adhkar:'الأذكار',ruqyah:'الرقية الشرعية',assessment:'تقييم الأعراض',dreams:'تفسير الأحلام',creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة',hadith:'الحديث',prayer:'الصلاة',qibla:'القبلة',tasbeeh:'المسبحة',memorization:'اختبارات الحفظ'};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

 function activeContext(){
   const id=document.body.dataset.activePage||document.querySelector('main > section.page.active')?.id||'home';
   const title=PAGE_LABELS[id]||document.querySelector(`#${CSS.escape(id)} h1,#${CSS.escape(id)} h2`)?.textContent?.trim()||id;
   return {page:id,title};
 }
 function aiCfg(){return window.NOOR_RUNTIME?.ai||{}}
 function functionUrl(){
   const base=String(CFG.supabaseUrl||'').replace(/\/$/,'');
   const fn=aiCfg().function_name||CFG.aiFunctionName||'';
   return base&&fn?`${base}/functions/v1/${fn}`:'';
 }
 function shell(){
   let m=document.getElementById('noorAiModal');if(m)return m;
   const fab=document.createElement('button');fab.id='noorAiFab';fab.className='noor-ai-fab';fab.type='button';fab.innerHTML='<span>✦</span><b>اسأل المساعد الذكي</b>';document.body.appendChild(fab);
   m=document.createElement('section');m.id='noorAiModal';m.className='noor-ai-modal';m.hidden=true;
   m.innerHTML=`<div class="noor-ai-card" role="dialog" aria-modal="true" aria-labelledby="noorAiTitle">
     <div class="noor-ai-head"><div><h2 id="noorAiTitle">المساعد الذكي لنور الذكر</h2><small id="noorAiContext">اسأل عن أي قسم في الموقع</small></div><button class="noor-ai-close" aria-label="إغلاق">×</button></div>
     <div><div class="noor-ai-messages" id="noorAiMessages"><div class="noor-ai-msg note">أستطيع المساعدة في الأسئلة الشرعية والفقهية، الأعراض، الرقية، الأحلام، والشرح العام. في المسائل الطبية لا أقدّم تشخيصًا، وفي الأحلام لا أقدّم حكمًا قطعيًا، وفي المسائل الشرعية أذكر حدود اليقين والخلاف إن وُجد.</div></div><div class="noor-ai-quick"><button data-q="عندي سؤال فقهي">سؤال فقهي</button><button data-q="أريد فهم عرض صحي">عرض صحي</button><button data-q="أريد سؤالًا عن الرقية">الرقية</button><button data-q="أريد فهم رؤيا">رؤيا أو حلم</button></div></div>
     <form class="noor-ai-form" id="noorAiForm"><textarea id="noorAiInput" required maxlength="3000" placeholder="اكتب سؤالك هنا…"></textarea><button type="submit">إرسال</button></form><div class="noor-ai-status" id="noorAiStatus"></div>
   </div>`;
   document.body.appendChild(m);
   fab.onclick=open;
   m.querySelector('.noor-ai-close').onclick=()=>m.hidden=true;
   m.onclick=e=>{if(e.target===m)m.hidden=true};
   m.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{m.querySelector('#noorAiInput').value=b.dataset.q;m.querySelector('#noorAiInput').focus()});
   m.querySelector('#noorAiForm').onsubmit=submit;
   return m;
 }
 function refreshAiShell(){
   const m=document.getElementById('noorAiModal'); if(!m)return;
   const a=aiCfg();
   const title=m.querySelector('#noorAiTitle'); if(title&&a.assistant_name)title.textContent=a.assistant_name;
   const input=m.querySelector('#noorAiInput'); if(input&&a.max_input_chars)input.maxLength=a.max_input_chars;
   const note=m.querySelector('.noor-ai-msg.note'); if(note&&a.safety_notice)note.textContent=a.safety_notice;
   const qbox=m.querySelector('.noor-ai-quick');
   if(qbox&&Array.isArray(a.quick_prompts)){qbox.innerHTML='';a.quick_prompts.slice(0,8).forEach(q=>{const b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=()=>{input.value=q;input.focus()};qbox.appendChild(b)})}
 }
 function open(){
   if(window.NOOR_AI_ENABLED===false){return;}
   const m=shell();refreshAiShell();const ctx=activeContext();m.hidden=false;
   m.querySelector('#noorAiContext').textContent=`أنت الآن في: ${ctx.title}`;
   setTimeout(()=>m.querySelector('#noorAiInput').focus(),80);
 }
 function add(text,kind='ai'){
   const h=document.getElementById('noorAiMessages'),d=document.createElement('div');d.className=`noor-ai-msg ${kind}`;d.textContent=text;h.appendChild(d);h.scrollTop=h.scrollHeight;return d;
 }
 async function submit(e){
   e.preventDefault();const input=document.getElementById('noorAiInput'),q=input.value.trim();if(!q)return;
   add(q,'user');input.value='';const status=document.getElementById('noorAiStatus');status.textContent='جاري إعداد الإجابة…';
   const pending=add('…','ai');
   try{
     if(window.NOOR_AI_ENABLED===false)throw new Error('AI_DISABLED');const url=functionUrl();if(!url)throw new Error('AI_NOT_CONFIGURED');
     const ctx=activeContext();
     const headers={'Content-Type':'application/json'};
     try{const {data:{session}}=await (window.supabaseClient?.auth?.getSession?.()||Promise.resolve({data:{session:null}}));if(session?.access_token)headers.Authorization=`Bearer ${session.access_token}`;}catch(e){}
     if(CFG.publishableKey)headers.apikey=CFG.publishableKey
     const r=await fetch(url,{method:'POST',headers,body:JSON.stringify({question:q,context:ctx,settings:{model:aiCfg().model_label,temperature:aiCfg().temperature,maxDaily:aiCfg().max_daily_per_user}})});
     const data=await r.json().catch(()=>({}));
     if(!r.ok)throw new Error(data.error||`HTTP ${r.status}`);
     pending.textContent=data.answer||'لم تصل إجابة.';
     status.textContent=data.note||'';
   }catch(err){
     pending.textContent=err.message==='AI_DISABLED'?'المساعد الذكي متوقف حاليًا من لوحة المالك.':err.message==='AI_NOT_CONFIGURED'
       ?'المساعد الذكي موجود في الواجهة، لكن خدمة الذكاء الاصطناعي لم تُنشر بعد على Supabase. شغّل Edge Function المرفقة باسم noor-ai ثم سيعمل مباشرة.'
       :'تعذر الاتصال بالمساعد الذكي الآن. حاول مرة أخرى بعد قليل.';
     status.textContent='';
   }
 }
 document.addEventListener('DOMContentLoaded',shell);window.addEventListener('noor:runtime-ready',()=>{refreshAiShell();const f=document.getElementById('noorAiFab');if(f)f.hidden=window.NOOR_AI_ENABLED===false});
})();
