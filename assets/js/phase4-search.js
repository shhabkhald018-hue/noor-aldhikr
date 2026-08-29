'use strict';

(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const SURAH_NAMES = ["الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"];
  const diacritics=/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
  const norm=v=>String(v||'').toLowerCase().normalize('NFKD').replace(diacritics,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ة/g,'ه').replace(/ـ/g,'').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const score=(q,title,body='',extra='')=>{
    q=norm(q); const terms=q.split(' ').filter(Boolean),t=norm(title),b=norm(body),e=norm(extra); if(!terms.length)return 0;
    let s=0; if(t===q)s+=120;if(t.startsWith(q))s+=80;if(t.includes(q))s+=55;if(b.includes(q))s+=25;if(e.includes(q))s+=15;
    terms.forEach(x=>{if(t.includes(x))s+=16;if(b.includes(x))s+=7;if(e.includes(x))s+=4}); return s;
  };
  const snippet=(text,len=160)=>{text=String(text||'').replace(/\s+/g,' ').trim();return text.length>len?text.slice(0,len)+'…':text};

  function buildIndex(){
    const items=[];
    SURAH_NAMES.forEach((name,i)=>items.push({id:`surah-${i+1}`,type:'quran',title:`سورة ${name}`,body:`القرآن الكريم السورة رقم ${i+1}`,meta:`القرآن الكريم · السورة ${i+1}`,open(){window.navTo?.('quran');setTimeout(()=>window.openSurah?.(i+1),80)}}));
    (Array.isArray(window.allAdhkar)?window.allAdhkar:[]).forEach(x=>items.push({id:`dhikr-${x.id}`,type:x.cat==='ruqyah'?'ruqyah':'adhkar',title:x.title,body:`${x.text||''} ${x.benefit||''}`,extra:x.source||'',meta:`${window.categoryLabels?.[x.cat]||x.cat||'الأذكار'}${x.source?' · '+x.source:''}`,open(){window.openSearchDhikr?.(x.id)}}));
    $$('.library-topic').forEach((n,i)=>items.push({id:`library-${i}`,type:'library',title:$('h3,h2,b',n)?.textContent?.trim()||'موضوع من المكتبة',body:n.textContent.trim(),extra:n.dataset.search||'',meta:'المكتبة الإسلامية',open(){window.navTo?.('library');setTimeout(()=>n.scrollIntoView({behavior:'smooth',block:'center'}),120)}}));
    $$('#ruqyah [data-rq-open]').forEach((n,i)=>items.push({id:`ruqyah-${i}`,type:'ruqyah',title:$('h2,h3,b',n)?.textContent?.trim()||'قسم الرقية',body:n.textContent.trim(),extra:n.dataset.rqOpen||'',meta:'الرقية الشرعية',open(){window.navTo?.('ruqyah');setTimeout(()=>n.click(),120)}}));
    (Array.isArray(window.NOOR_EYE_TOPICS)?window.NOOR_EYE_TOPICS:[]).forEach(topic=>items.push({id:`eye-ency-${topic.id}`,type:'ruqyah',title:topic.title,body:[topic.summary,...topic.sections.flat()].join(' '),extra:'موسوعة العين',meta:'موسوعة العين',open(){window.navTo?.('ruqyah');setTimeout(()=>{document.querySelector('[data-eye-encyclopedia]')?.click();setTimeout(()=>document.querySelector(`[data-eye-topic="${topic.id}"]`)?.click(),80)},120)}}));
    (Array.isArray(window.NOOR_HASAD_TOPICS)?window.NOOR_HASAD_TOPICS:[]).forEach(topic=>items.push({id:`hasad-ency-${topic.id}`,type:'ruqyah',title:topic.title,body:[topic.summary,...topic.sections.flat()].join(' '),extra:'موسوعة الحسد',meta:'موسوعة الحسد',open(){window.navTo?.('ruqyah');setTimeout(()=>{document.querySelector('[data-hasad-encyclopedia]')?.click();setTimeout(()=>window.NOOR_OPEN_HASAD_TOPIC?.(topic.id),80)},120)}}));
    (Array.isArray(window.NOOR_HASAD_QUESTIONS)?window.NOOR_HASAD_QUESTIONS:[]).forEach(question=>items.push({id:`hasad-question-${question.id}`,type:'ruqyah',title:question.question,body:question.answer,extra:`${question.category||''} ${question.keywords||''}`,meta:'بنك أسئلة الحسد',open(){window.navTo?.('ruqyah');setTimeout(()=>{document.querySelector('[data-hasad-encyclopedia]')?.click();setTimeout(()=>window.NOOR_OPEN_HASAD_TOPIC?.('questions'),80)},120)}}));
    (Array.isArray(window.NOOR_MAGIC_TOPICS)?window.NOOR_MAGIC_TOPICS:[]).forEach(topic=>items.push({id:`magic-${topic.id}`,type:'ruqyah',title:topic.title,body:[topic.summary,...topic.sections.flat()].join(' '),meta:'موسوعة السحر',open(){window.navTo?.('ruqyah');setTimeout(()=>document.querySelector('[data-magic-encyclopedia]')?.click(),100)}}));
    (Array.isArray(window.NOOR_MAS_TOPICS)?window.NOOR_MAS_TOPICS:[]).forEach(topic=>items.push({id:`mas-${topic.id}`,type:'ruqyah',title:topic.title,body:[topic.summary,...topic.sections.flat()].join(' '),meta:'موسوعة المس',open(){window.navTo?.('ruqyah');setTimeout(()=>document.querySelector('[data-mas-encyclopedia]')?.click(),100)}}));
    (Array.isArray(window.NOOR_COMPLETE_RUQYAH)?window.NOOR_COMPLETE_RUQYAH:[]).forEach(item=>items.push({id:`complete-${item.id}`,type:'ruqyah',title:item.title,body:item.text,extra:item.source,meta:'الرقية الشاملة',open(){window.navTo?.('ruqyah');setTimeout(()=>document.querySelector('[data-rq-open="complete"]')?.click(),100)}}));
    Object.entries(window.NOOR_ISLAMIC_LIBRARY||{}).forEach(([pageId,page])=>{
      (Array.isArray(page?.items)?page.items:[]).forEach((item,i)=>items.push({
        id:`islamic-${pageId}-${i}`,type:'library',title:item.t||page.title||'مادة علمية',
        body:`${item.d||''} ${item.r||''}`,extra:`${item.c||''} ${page.kicker||''}`,
        meta:`${page.kicker||'المكتبة الإسلامية'} · ${item.c||'مادة'}`,
        open(){window.navTo?.(pageId);setTimeout(()=>document.getElementById(pageId)?.scrollIntoView({behavior:'smooth',block:'start'}),100)}
      }));
    });
    $$('main > section.page').forEach(n=>{if(['search','home','quran','adhkar','ruqyah','library'].includes(n.id))return;const title=$('h1,h2',n)?.textContent?.trim();if(title)items.push({id:`page-${n.id}`,type:'pages',title,body:n.textContent.trim().slice(0,3000),meta:'صفحة داخل التطبيق',open(){window.navTo?.(n.id)}})});
    return items;
  }

  const input=$('#globalSearch'),results=$('#globalSearchResults'),filters=$('#searchFilters'),count=$('#searchResultCount'),clear=$('#clearGlobalSearch'),quranBtn=$('#quranOnlineSearch');
  if(!input||!results)return;
  let active='all',idx=[],timer;
  const labels={quran:'القرآن',adhkar:'الأذكار',ruqyah:'الرقية',library:'المكتبة',pages:'صفحات'};
  function empty(msg='اكتب كلمتين على الأقل للبحث.'){results.innerHTML=`<div class="search-empty"><span>⌕</span><p>${esc(msg)}</p></div>`;if(count)count.textContent='0 نتيجة'}
  function render(q){
    q=q.trim(); if(q.length<2)return empty('اكتب كلمتين على الأقل للبحث في محتوى التطبيق.');
    idx=buildIndex();
    const rows=idx.map(item=>({item,s:score(q,item.title,item.body,item.extra)})).filter(x=>x.s>0&&(active==='all'||x.item.type===active)).sort((a,b)=>b.s-a.s).slice(0,60);
    if(count)count.textContent=`${rows.length} نتيجة`;
    if(!rows.length)return empty('لم نجد نتيجة مطابقة. جرّب كلمة أقصر أو استخدم البحث داخل نص القرآن.');
    results.innerHTML=rows.map(({item})=>`<button class="search-result search-result-v38" type="button" data-search-id="${esc(item.id)}"><span class="search-type-badge ${esc(item.type)}">${esc(labels[item.type]||'نتيجة')}</span><span class="search-result-copy"><b>${esc(item.title)}</b><small>${esc(item.meta||'')}</small><p>${esc(snippet(item.body))}</p></span><span class="search-open-arrow">←</span></button>`).join('');
    $$('[data-search-id]',results).forEach(b=>b.onclick=()=>idx.find(x=>x.id===b.dataset.searchId)?.open?.());
  }
  async function quranSearch(){
    const q=input.value.trim();if(q.length<2)return empty('اكتب كلمة أو عبارة للبحث داخل نص القرآن.');
    quranBtn.disabled=true;quranBtn.textContent='جارٍ البحث…';results.innerHTML='<div class="search-loading"><span></span><p>جارٍ البحث داخل نص القرآن الكريم…</p></div>';
    try{
      const r=await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/ar`,{headers:{Accept:'application/json'}});if(!r.ok)throw Error();
      const data=await r.json(),matches=data?.data?.matches||[];if(count)count.textContent=`${matches.length} نتيجة قرآنية`;
      if(!matches.length)return empty('لا توجد آيات مطابقة.');
      results.innerHTML=matches.slice(0,50).map(m=>`<button class="search-result search-result-v38 quran-online-result" type="button" data-surah="${Number(m.surah?.number||1)}"><span class="search-type-badge quran">القرآن</span><span class="search-result-copy"><b>${esc(m.surah?.name||'')} — الآية ${esc(m.numberInSurah||'')}</b><small>بحث مباشر في نص القرآن الكريم</small><p class="quran-search-text">${esc(m.text||'')}</p></span><span class="search-open-arrow">←</span></button>`).join('');
      $$('.quran-online-result',results).forEach(b=>b.onclick=()=>{window.navTo?.('quran');setTimeout(()=>window.openSurah?.(+b.dataset.surah),100)});
    }catch{results.innerHTML='<div class="search-empty"><span>⚠</span><p>تعذر الاتصال بخدمة البحث القرآني. البحث داخل محتوى التطبيق يعمل دون إنترنت.</p></div>'}
    finally{quranBtn.disabled=false;quranBtn.textContent='بحث داخل نص القرآن'}
  }
  filters?.addEventListener('click',e=>{const b=e.target.closest('[data-search-type]');if(!b)return;active=b.dataset.searchType;$$('[data-search-type]',filters).forEach(x=>x.classList.toggle('active',x===b));render(input.value)});
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>render(input.value),120)});
  clear?.addEventListener('click',()=>{input.value='';input.focus();empty()});
  quranBtn?.addEventListener('click',quranSearch);
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();window.navTo?.('search');setTimeout(()=>input.focus(),80)}});
  empty();
})();
