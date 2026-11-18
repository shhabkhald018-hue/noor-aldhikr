'use strict';
(() => {
  function addConsent(buttonId,inputId,mode){
    const button=document.getElementById(buttonId),input=document.getElementById(inputId);if(!button||!input||document.getElementById(buttonId+'Consent'))return;
    const actions=button.closest('.smart-ai-tools,.v4019-search-actions');if(!actions?.parentElement)return;
    const label=document.createElement('label');label.className='v4023-legal-consent';label.id=buttonId+'Consent';
    label.innerHTML=`<input type="checkbox"><span>أوافق على معالجة النص لهذا الطلب فقط، ولن أكتب اسمي أو رقم هاتفي أو بيانات تعريفية. أفهم أن ${mode==='ruqyah'?'الإجابة إرشادية وليست تشخيصًا طبيًا أو غيبيًا':'النتيجة إرشادية'}.</span>`;
    actions.parentElement.insertBefore(label,actions);
    button.addEventListener('click',e=>{if(!label.querySelector('input').checked){e.preventDefault();e.stopImmediatePropagation();window.toast?.('يجب الموافقة على معالجة النص أولًا.');label.scrollIntoView({behavior:'smooth',block:'center'});}},true);
  }
  function addLocalDreamNotice(){
    const button=document.getElementById('dreamAiAnalyze'),input=document.getElementById('dreamAiInput');if(!button||!input||document.getElementById('dreamAiAnalyzeLocalNotice'))return;
    const actions=button.closest('.smart-ai-tools,.v4019-search-actions');if(!actions?.parentElement)return;
    const note=document.createElement('div');note.id='dreamAiAnalyzeLocalNotice';note.className='v4023-local-processing-note';note.textContent='خصوصيتك محفوظة: تفسير الرؤيا في V92.0 يتم محليًا داخل المتصفح من قاموس نور الذكر، ولا يحتاج إرسال نص الحلم إلى خدمة ذكاء اصطناعي خارجية.';
    actions.parentElement.insertBefore(note,actions);
  }
  function init(){addConsent('ruqyahAiAnalyze','ruqyahAiInput','ruqyah');addLocalDreamNotice();}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true});init();
})();
