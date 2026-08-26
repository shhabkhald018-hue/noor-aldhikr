'use strict';
(() => {
  function addConsent(buttonId, inputId, mode){
    const button=document.getElementById(buttonId), input=document.getElementById(inputId); if(!button||!input||document.getElementById(buttonId+'Consent'))return;
    const label=document.createElement('label'); label.className='v4023-legal-consent';
    label.innerHTML=`<input id="${buttonId}Consent" type="checkbox"><span>أوافق على إرسال النص الذي أكتبه إلى Supabase وخدمة الذكاء الاصطناعي لمعالجة الطلب فقط. لن أكتب اسمي أو رقم هاتفي أو بيانات تعريفية، وأفهم أن ${mode==='dream'?'تعبير الرؤى اجتهاد ظني':'الإجابة إرشادية وليست تشخيصًا طبيًا أو غيبيًا'}.</span>`;
    const tools=button.closest('.smart-ai-tools'); tools?.parentElement?.insertBefore(label,tools);
    button.addEventListener('click',e=>{if(!label.querySelector('input').checked){e.preventDefault();e.stopImmediatePropagation();window.toast?.('يجب الموافقة على معالجة النص أولًا.');label.scrollIntoView({behavior:'smooth',block:'center'});}},true);
  }
  function init(){addConsent('ruqyahAiAnalyze','ruqyahAiInput','ruqyah');addConsent('dreamAiAnalyze','dreamAiInput','dream');}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250)); new MutationObserver(init).observe(document.documentElement,{childList:true,subtree:true}); init();
})();
