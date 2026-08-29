'use strict';

(function(){
  const escText=value=>String(value??'').replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':'&quot;',"'":'&#39;'}[ch]));

  function ensureAnnouncementHost(){
    let host=document.querySelector('#publicAnnouncements');
    if(host)return host;
    host=document.createElement('section');
    host.id='publicAnnouncements';
    host.className='public-announcements hidden';
    host.setAttribute('aria-label','إعلانات إدارة نور الذكر');
    const home=document.querySelector('#home');
    const hero=document.querySelector('main.container > .hero');
    if(home) home.prepend(host);
    else if(hero) hero.after(host);
    return host;
  }

  function dismissed(id){
    try{return sessionStorage.getItem(`noor_announcement_dismissed_${id}`)==='1'}catch{return false}
  }
  function dismiss(id){
    try{sessionStorage.setItem(`noor_announcement_dismissed_${id}`,'1')}catch{}
    document.querySelector(`[data-announcement-id="${CSS.escape(String(id))}"]`)?.remove();
    const host=document.querySelector('#publicAnnouncements');
    if(host&&!host.children.length)host.classList.add('hidden');
  }
  window.dismissNoorAnnouncement=dismiss;

  function renderAnnouncements(items){
    const host=ensureAnnouncementHost();
    const visible=(items||[]).filter(x=>!dismissed(x.id));
    host.innerHTML=visible.map(x=>`<article class="public-announcement" data-announcement-id="${escText(x.id)}">
      <div class="announcement-icon" aria-hidden="true">📢</div>
      <div class="announcement-copy"><strong>${escText(x.title||'تنبيه من إدارة نور الذكر')}</strong><p>${escText(x.body||'')}</p></div>
      <button class="announcement-close" type="button" aria-label="إخفاء الإعلان" onclick="dismissNoorAnnouncement('${escText(x.id)}')">×</button>
    </article>`).join('');
    host.classList.toggle('hidden',visible.length===0);
  }

  async function loadPublicAnnouncements(){
    if(typeof supabaseClient==='undefined'||!supabaseClient)return;
    try{
      const {data,error}=await supabaseClient.from('announcements')
        .select('id,title,body,starts_at,ends_at,created_at')
        .eq('active',true)
        .order('created_at',{ascending:false})
        .limit(3);
      if(error)throw error;
      if(data?.length){renderAnnouncements(data);return;}

      const {data:legacy}=await supabaseClient.from('app_settings')
        .select('value').eq('key','announcement').maybeSingle();
      const message=legacy?.value?.trim();
      if(message)renderAnnouncements([{id:'legacy-general',title:'تنبيه عام',body:message}]);
    }catch(error){
      console.warn('تعذر تحميل إعلانات المستخدمين:',error?.message||error);
    }
  }
  window.loadPublicAnnouncements=loadPublicAnnouncements;
  window.addEventListener('noor:user-ready',loadPublicAnnouncements);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(loadPublicAnnouncements,350));
})();
