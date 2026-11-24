'use strict';
(()=>{
 const CORE=()=>window.NOOR_AI_CORE;
 const PAGE_LABELS={home:'الرئيسية',adhkar:'الأذكار',ruqyah:'الرقية الشرعية',assessment:'تقييم الأعراض',dreams:'فهم الرؤى',creed:'العقيدة',fiqh:'الفقه',seerah:'السيرة',hadith:'الحديث',prayer:'الصلاة',qibla:'القبلة',tasbeeh:'المسبحة',memorization:'اختبارات الحفظ',studentDashboard:'لوحة الطالب'};
 const FALLBACK=[
  {category:'عام',title:'ما الذي يستطيع المساعد فعله؟',keywords:['ماذا تستطيع','مساعدة','المساعد','كيف تستخدم'],answer:'أبحث داخل قاعدة معرفة نور الذكر التي راجعها المالك، وأعرض الإجابة الموثقة مع مرجعها. إذا لم توجد مادة مراجعة كافية فلن أخمّن، وسأطلب إعادة صياغة السؤال.',source_text:'وصف وظيفة مساعد نور الذكر V92.1.1 Trusted Content',priority:30},
  {category:'الرؤى',title:'كيف أتعامل مع حلم مزعج؟',keywords:['حلم مزعج','كابوس','رؤيا سيئة','حلم سيئ'],answer:'إذا رأيت ما تكره فاستعذ بالله من شرها، ولا تجعل المنام أساسًا لقرار مصيري أو اتهام شخص. فهم الرؤيا ظني، وقد تكون من حديث النفس أو مما يشغل الإنسان.',source_text:'صحيح مسلم — كتاب الرؤيا؛ إرشاد سلامة عام',priority:80},
  {category:'الصحة',title:'متى أطلب تقييمًا صحيًا؟',keywords:['عرض صحي','أعراض','مرض','دوخة','ألم','قلق','وسواس'],answer:'لا يمكن تشخيص حالة طبية من الأعراض وحدها. إذا كان العرض شديدًا أو جديدًا أو مستمرًا، أو صاحبه ألم صدر شديد أو صعوبة تنفس أو فقد وعي، فاطلب رعاية طبية مناسبة. ويمكن استخدام الأذكار والرقية كدعم روحي لا كبديل للتقييم الطبي.',source_text:'إرشاد سلامة صحي عام',priority:60}
 ];
 let kbCache=null,kbAt=0,memoryUsage={};
 const $=(s,r=document)=>r.querySelector(s);
 function activeContext(){const id=document.body.dataset.activePage||document.querySelector('main > section.page.active')?.id||'home';const title=PAGE_LABELS[id]||document.querySelector(`#${CSS.escape(id)} h1,#${CSS.escape(id)} h2`)?.textContent?.trim()||id;return {page:id,title}}
 function aiCfg(){return window.NOOR_RUNTIME?.ai||{}}
 function dbClient(){try{return window.NOOR_GET_SUPABASE_CLIENT?.()||window.supabaseClient||null}catch(e){return null}}
 async function loadCloud(){
   const sb=dbClient();if(!sb)return[];
   try{
     const res=await sb.from('knowledge_base')
       .select('id,question,answer,keywords,category,priority,active,source_text,source_type,source_label,trust_tier,review_status,reviewed_at,reviewed_by')
       .eq('active',true)
       .eq('review_status','published')
       .in('trust_tier',['primary','verified'])
       .not('reviewed_at','is',null)
       .neq('source_text','')
       .order('priority',{ascending:false})
       .limit(1000);
     if(res.error)throw res.error;
     return (Array.isArray(res.data)?res.data:[]).filter(row=>
       String(row.source_text||'').trim()
       && String(row.reviewed_at||'').trim()
       && row.review_status==='published'
       && ['primary','verified'].includes(String(row.trust_tier||''))
     ).map(row=>({
       id:row.id,
       knowledge_key:`knowledge-base-${row.id}`,
       question:row.question,
       title:row.question,
       answer:row.answer,
       keywords:row.keywords||[],
       category:row.category||'عام',
       priority:row.priority||100,
       active:true,
       source_text:row.source_text,
       source_type:row.source_type||'owner',
       source_label:row.source_label||'قاعدة معرفة نور الذكر',
       trust_tier:row.trust_tier,
       review_status:row.review_status,
       reviewed_at:row.reviewed_at,
       reviewed_by:row.reviewed_by
     }));
   }catch(error){console.warn('[Noor AI] reviewed knowledge_base unavailable:',error);return[]}
 }
 async function loadKnowledge(force=false){
   if(!force&&kbCache&&Date.now()-kbAt<60000)return kbCache;
   const core=CORE();if(!core){kbCache=[];return kbCache}
   const cloud=await loadCloud();
   kbCache=core.buildEntries({cloud,canonical:[],lessons:{},fallback:FALLBACK});kbAt=Date.now();return kbCache;
 }
 function assistantReady(){
   const expectsV90=!!document.querySelector('script[src*="v90-ai-runtime.js"]');
   const expectsV89=!!document.querySelector('script[src*="v89-ai-runtime.js"]');
   if(expectsV90)return !!window.NOOR_V90_AI;
   if(expectsV89)return !!window.NOOR_V89_AI;
   return !!CORE();
 }
 function setReadyState(ready=assistantReady()){
   const m=document.getElementById('noorAiModal');if(!m)return ready;
   const input=$('#noorAiInput',m),button=$('#noorAiForm button[type="submit"]',m),status=$('#noorAiStatus',m);
   if(input){input.disabled=!ready;input.setAttribute('aria-busy',String(!ready))}
   if(button){button.disabled=!ready;button.setAttribute('aria-busy',String(!ready));button.textContent=ready?(button.dataset.readyLabel||'إرسال'):'جاري تجهيز المساعد…'}
   m.querySelectorAll('.noor-ai-quick button').forEach(item=>item.disabled=!ready);
   if(status){
     if(!ready&&!status.textContent.trim())status.textContent='جاري تجهيز قاعدة المعرفة الموثقة…';
     if(ready&&status.textContent.trim()==='جاري تجهيز قاعدة المعرفة الموثقة…')status.textContent='المساعد الموثق جاهز.';
   }
   m.dataset.aiReady=String(ready);return ready;
 }
 function shell(){
   let m=document.getElementById('noorAiModal');if(m)return m;
   const fab=document.createElement('button');fab.id='noorAiFab';fab.className='noor-ai-fab';fab.type='button';fab.innerHTML='<span>✦</span><b>اسأل المساعد الذكي</b>';document.body.appendChild(fab);
   m=document.createElement('section');m.id='noorAiModal';m.className='noor-ai-modal';m.hidden=true;
   m.innerHTML=`<div class="noor-ai-card" role="dialog" aria-modal="true" aria-labelledby="noorAiTitle"><div class="noor-ai-head"><div><h2 id="noorAiTitle">مساعد نور الذكر الذكي</h2><small id="noorAiContext">بحث معرفي في محتوى منشور ومراجع — مجاني 100%</small></div><button class="noor-ai-close" aria-label="إغلاق">×</button></div><div><div class="noor-ai-messages" id="noorAiMessages"><div class="noor-ai-msg note">يعتمد المساعد على معرفة موثقة ومحتوى نور الذكر. لا يقدّم تشخيصًا طبيًا، ولا يجزم بسبب غيبي، ولا يحوّل الرؤى إلى اتهامات أو يقين.</div></div><div class="noor-ai-quick"></div></div><form class="noor-ai-form" id="noorAiForm"><textarea id="noorAiInput" required maxlength="3000" placeholder="اكتب سؤالك بوضوح…" disabled aria-busy="true"></textarea><button type="submit" data-ready-label="إرسال" disabled aria-busy="true">جاري تجهيز المساعد…</button></form><div class="noor-ai-status" id="noorAiStatus" role="status" aria-live="polite">جاري تجهيز قاعدة المعرفة الموثقة…</div></div>`;
   document.body.appendChild(m);fab.onclick=open;m.querySelector('.noor-ai-close').onclick=()=>m.hidden=true;m.onclick=e=>{if(e.target===m)m.hidden=true};m.querySelector('#noorAiForm').onsubmit=submit;refreshAiShell();setReadyState();return m;
 }
 function safePrompts(){return ['كيف أرقي نفسي؟','هل العين حق؟','ما فضل آية الكرسي عند النوم؟','الشك ينقض الوضوء؟','فاتتني الصلاة بسبب النوم، ماذا أفعل؟','ما أركان الإيمان؟','ماذا حدث في غزوة بدر؟','كيف أتعامل مع حلم مزعج؟']}
 function refreshAiShell(){const m=document.getElementById('noorAiModal');if(!m)return;const a=aiCfg();const title=$('#noorAiTitle',m);if(title&&a.assistant_name)title.textContent=a.assistant_name;const input=$('#noorAiInput',m);if(input&&a.max_input_chars)input.maxLength=a.max_input_chars;const note=$('.noor-ai-msg.note',m);if(note&&a.safety_notice)note.textContent=a.safety_notice;const qbox=$('.noor-ai-quick',m);if(qbox){qbox.innerHTML='';const cloudPrompts=Array.isArray(a.quick_prompts)?a.quick_prompts:[];const risky=/تفسير.*رؤ|سؤال فقهي$/;const qs=cloudPrompts.filter(q=>!risky.test(String(q))).concat(safePrompts()).filter((q,i,a)=>q&&a.indexOf(q)===i).slice(0,8);qs.forEach(q=>{const b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=()=>{input.value=q;input.focus()};qbox.appendChild(b)})}}
 function open(){if(window.NOOR_AI_ENABLED===false)return;const m=shell();refreshAiShell();setReadyState();const ctx=activeContext();m.hidden=false;m.querySelector('#noorAiContext').textContent=`أنت الآن في: ${ctx.title} — معرفة محلية ومراجع`;setTimeout(()=>{const input=m.querySelector('#noorAiInput');if(!input?.disabled)input.focus()},80)}
 function add(text,kind='ai'){const h=document.getElementById('noorAiMessages'),d=document.createElement('div');d.className=`noor-ai-msg ${kind}`;d.textContent=text;h.appendChild(d);h.scrollTop=h.scrollHeight;return d}
 function renderOut(node,out){node.textContent='';const body=document.createElement('div');body.className='noor-ai-answer-text';body.textContent=out.answer||'';node.appendChild(body);if(out.source){const src=document.createElement('div');src.className='noor-ai-source';const label=document.createElement('b'),value=document.createElement('span');label.textContent='المصدر / المرجع';value.textContent=out.source;src.append(label,value);node.appendChild(src)}if(Array.isArray(out.related)&&out.related.length){const rel=document.createElement('small');rel.className='noor-ai-related';rel.textContent=`موضوعات قريبة: ${out.related.join(' — ')}`;node.appendChild(rel)}}
 function localLimit(){const a=aiCfg(),lim=Math.max(1,Math.min(Number(a.max_daily_per_user||200),500)),day=new Date().toISOString().slice(0,10),key='noor-free-ai-usage';let obj={};try{obj=JSON.parse(localStorage.getItem(key)||'{}')}catch{obj=memoryUsage||{}}if(obj.day!==day)obj={day,count:0};if(obj.count>=lim)return {ok:false,remaining:0};obj.count++;memoryUsage=obj;try{localStorage.setItem(key,JSON.stringify(obj))}catch{}return {ok:true,remaining:Math.max(lim-obj.count,0)}}
 async function answerQuestion(q,ctx){
   const usage=localLimit();if(!usage.ok)return {answer:'وصلت للحد اليومي الذي حدده مالك الموقع لهذا الجهاز. يمكنك المحاولة غدًا.',source:'',note:'المساعد مجاني — الحد تنظيمي فقط.',related:[]};
   const core=CORE();if(!core)return {answer:'تعذر تحميل محرك المعرفة. أعد تحميل الصفحة وحاول مرة أخرى.',source:'',note:'',related:[]};
   const entries=await loadKnowledge();const hit=core.answer(q,ctx,entries,{threshold:6.2});
   if(hit.found){return {...hit,note:`${hit.origin==='cloud'?'إجابة معتمدة من معرفة المالك':hit.origin==='academy'?'إجابة من منهج الأكاديمية':hit.origin==='local'?'إجابة من البنك المحلي الموثق':'إجابة من قاعدة السلامة'} • متبقي اليوم: ${usage.remaining}`}}
   return {answer:'لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.',source:'',note:'المعالجة محلية داخل الموقع، ولم يُرسل سؤالك إلى مزود ذكاء اصطناعي خارجي.',related:hit.related||[]};
 }
 async function submit(e){e.preventDefault();if(!assistantReady()){setReadyState(false);return}const input=document.getElementById('noorAiInput'),q=input.value.trim();if(!q)return;add(q,'user');input.value='';const status=document.getElementById('noorAiStatus');status.textContent='أبحث في المعرفة والمراجع…';const pending=add('…','ai');try{if(window.NOOR_AI_ENABLED===false)throw new Error('AI_DISABLED');const out=await answerQuestion(q,activeContext());renderOut(pending,out);status.textContent=out.note||''}catch(err){pending.textContent=err.message==='AI_DISABLED'?'المساعد متوقف حاليًا من لوحة المالك.':'تعذر تشغيل المساعد المحلي الآن. أعد تحميل الصفحة وحاول مرة أخرى.';status.textContent=''}}
 document.addEventListener('DOMContentLoaded',shell);const syncEnabled=()=>{refreshAiShell();setReadyState();const f=document.getElementById('noorAiFab');if(f)f.hidden=window.NOOR_AI_ENABLED===false};window.addEventListener('noor:runtime-ready',syncEnabled);window.addEventListener('noor:ai-ready',syncEnabled);window.addEventListener('noor:v89-ai-status',syncEnabled);window.addEventListener('noor:v90-ready',syncEnabled);window.NOOR_FREE_AI_REFRESH=()=>loadKnowledge(true);
 window.NOOR_FREE_AI_ASK=async(question,context={})=>{if(window.NOOR_AI_ENABLED===false)throw new Error('المساعد متوقف حاليًا من لوحة المالك.');const q=String(question||'').trim();if(!q)return {answer:'اكتب سؤالك أولًا.',source:'',note:''};const base=activeContext();return answerQuestion(q,{page:context.page||base.page,title:context.title||base.title})};
 window.NOOR_AI_DEBUG={loadKnowledge,answerQuestion};
})();
