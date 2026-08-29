'use strict';

(() => {
  const BUILTIN_SECTIONS = [
    {id:'home',type:'builtin',navLabel:'الرئيسية',title:'الرئيسية',summary:'الصفحة الرئيسية',icon:'🏠',active:true,navVisible:true,homeVisible:false,sortOrder:0},
    {id:'adhkar',type:'builtin',navLabel:'الأذكار',title:'الأذكار',summary:'أذكار الصباح والمساء وسائر الأذكار',icon:'✨',active:true,navVisible:true,homeVisible:true,sortOrder:10},
    {id:'ruqyah',type:'builtin',navLabel:'الرقية الشرعية',title:'الرقية الشرعية',summary:'الرقية والموسوعات والمساعد الذكي',icon:'🤲',active:true,navVisible:true,homeVisible:true,sortOrder:20},
    {id:'assessment',type:'builtin',navLabel:'تقييم الأعراض',title:'تقييم الأعراض',summary:'موسوعة أسئلة وتقييم توعوي',icon:'🩺',active:true,navVisible:true,homeVisible:true,sortOrder:30},
    {id:'dreams',type:'builtin',navLabel:'تفسير الأحلام',title:'تفسير الأحلام',summary:'تعبير الرؤى من كتب أشهر علماء التعبير',icon:'🌙',active:true,navVisible:true,homeVisible:true,sortOrder:40},
    {id:'quran',type:'builtin',navLabel:'القرآن والتفسير',title:'القرآن والتفسير',summary:'المصحف والفهرس والتفسير',icon:'📖',active:true,navVisible:true,homeVisible:true,sortOrder:50},
    {id:'creed',type:'builtin',navLabel:'العقيدة',title:'مكتبة العقيدة',summary:'أصول الإيمان والتوحيد بمنهج تعليمي موثق',icon:'☝️',active:true,navVisible:true,homeVisible:true,sortOrder:52},
    {id:'fiqh',type:'builtin',navLabel:'الفقه',title:'مكتبة الفقه',summary:'العبادات والمعاملات والأسرة بملخصات تعليمية',icon:'⚖️',active:true,navVisible:true,homeVisible:true,sortOrder:54},
    {id:'seerah',type:'builtin',navLabel:'السيرة النبوية',title:'السيرة النبوية',summary:'خط زمني لأهم مراحل السيرة والدروس',icon:'🕌',active:true,navVisible:true,homeVisible:true,sortOrder:56},
    {id:'hadith',type:'builtin',navLabel:'الحديث',title:'مكتبة الحديث',summary:'أحاديث صحيحة وحسنة والتنبيه على الضعيف والمكذوب',icon:'📜',active:true,navVisible:true,homeVisible:true,sortOrder:58},
    {id:'academyExams',type:'builtin',navLabel:'الاختبارات الشرعية',title:'الاختبارات الشرعية',summary:'اختبارات العقيدة والفقه والسيرة والحديث والاختبار الشامل',icon:'📝',active:true,navVisible:true,homeVisible:true,sortOrder:59},
    {id:'memorization',type:'builtin',navLabel:'اختبارات الحفظ',title:'اختبارات الحفظ',summary:'اختبارات مرنة لمراجعة الحفظ',icon:'🧠',active:true,navVisible:true,homeVisible:true,sortOrder:60},
    {id:'prayer',type:'builtin',navLabel:'الصلاة',title:'مواقيت الصلاة',summary:'المواقيت حسب الدولة والمدينة',icon:'🕌',active:true,navVisible:true,homeVisible:true,sortOrder:70},
    {id:'qibla',type:'builtin',navLabel:'القبلة',title:'اتجاه القبلة',summary:'تحديد اتجاه القبلة',icon:'🕋',active:true,navVisible:true,homeVisible:true,sortOrder:80},
    {id:'tasbeeh',type:'builtin',navLabel:'المسبحة',title:'المسبحة',summary:'عداد تسبيح يحفظ تقدمك',icon:'◉',active:true,navVisible:true,homeVisible:true,sortOrder:90},
    {id:'khatma',type:'builtin',navLabel:'الختمات',title:'الختمات',summary:'خطط ختم القرآن ومتابعة التقدم',icon:'✅',active:true,navVisible:false,homeVisible:false,sortOrder:100},
    {id:'favorites',type:'builtin',navLabel:'المفضلة',title:'المفضلة',summary:'المحتوى الذي حفظه المستخدم',icon:'★',active:true,navVisible:true,homeVisible:false,sortOrder:110},
    {id:'library',type:'builtin',navLabel:'المراجع والمصادر',title:'المراجع وسياسة المصادر',summary:'الكتب والمراجع ومنهج التوثيق',icon:'📚',active:true,navVisible:true,homeVisible:false,sortOrder:900,utility:true},
    {id:'support',type:'builtin',navLabel:'الدعم والخصوصية',title:'الدعم والخصوصية',summary:'البلاغات والاقتراحات وسياسة الخصوصية',icon:'🛡️',active:true,navVisible:true,homeVisible:false,sortOrder:910,utility:true}
  ];

  const DEFAULT_STATE = {
    schemaVersion: 2,
    revision: 0,
    updatedAt: null,
    brand: {
      siteName: 'نور الذكر',
      brandIcon: '☾',
      logoUrl: '',
      browserTitle: 'نور الذكر | القرآن والأذكار والرقية الشرعية',
      metaDescription: 'نور الذكر: القرآن الكريم والتفسير والأذكار والرقية الشرعية ومواقيت الصلاة في تطبيق عربي.',
      footerText: 'نور الذكر · القرآن والأذكار والرقية الشرعية',
      accent: '#2f735e',
      accent2: '#b89a5a',
      lightBackground: '#f3f2ee',
      darkBackground: '#0f1211'
    },
    home: {
      kicker: 'السلام عليكم ورحمة الله',
      title: 'قلبٌ يذكر، ويومٌ يطمئن.',
      subtitle: 'ابدأ وردك اليومي من مكان واحد: القرآن الكريم، الأذكار الصحيحة، الرقية الشرعية، مواقيت الصلاة، ومراجعة الحفظ.',
      primaryText: 'ابدأ أذكار اليوم',
      primaryTarget: 'adhkar',
      secondaryText: 'متابعة قراءة القرآن',
      secondaryTarget: 'quran',
      cardsTitle: 'ما الذي تحتاجه اليوم؟',
      cardsSubtitle: 'اختصارات واضحة توصلك مباشرة إلى أهم أقسام نور الذكر.',
      useManagedCards: false,
      blocks: []
    },
    design: {radius:16,fontScale:100,navColumns:6,shadow:'soft',customCss:''},
    behavior: {
      showTopbar: true,
      showFooter: true,
      maintenanceMode: false,
      maintenanceTitle: 'الموقع تحت التحديث',
      maintenanceMessage: 'نعمل الآن على تحسين نور الذكر. حاول مرة أخرى بعد قليل.'
    },
    sections: BUILTIN_SECTIONS
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => `${prefix || 'item'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeText = (value, max = 10000) => String(value ?? '').slice(0, max);
  const safeColor = (value, fallback) => /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback;
  const safeUrl = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^(https?:\/\/|mailto:|tel:|\.\/|\.\.\/|\/)/i.test(raw)) return raw;
    return '';
  };
  const validPageId = value => /^[a-z][a-z0-9-]{1,60}$/i.test(String(value || ''));

  function normalizeSection(section, fallback = {}) {
    const type = section?.type === 'custom' ? 'custom' : 'builtin';
    const id = type === 'builtin' ? String(section?.id || fallback.id || '') : String(section?.id || uid('page'));
    return {
      id: validPageId(id) ? id : uid('page'),
      type,
      navLabel: safeText(section?.navLabel || fallback.navLabel || section?.title || 'قسم', 80),
      title: safeText(section?.title || fallback.title || section?.navLabel || 'قسم', 140),
      summary: safeText(section?.summary || fallback.summary || '', 500),
      icon: safeText(section?.icon || fallback.icon || '◆', 12),
      active: section?.active !== false,
      navVisible: section?.navVisible !== false,
      homeVisible: Boolean(section?.homeVisible),
      sortOrder: Number.isFinite(Number(section?.sortOrder)) ? Number(section.sortOrder) : Number(fallback.sortOrder || 0),
      utility: type === 'builtin' ? Boolean(section?.utility ?? fallback.utility) : false,
      titleOverride: safeText(section?.titleOverride || '', 140),
      summaryOverride: safeText(section?.summaryOverride || '', 500),
      blocks: type === 'custom' ? normalizeBlocks(section?.blocks) : []
    };
  }

  function normalizeBlock(block) {
    const allowed = new Set(['heading','text','notice','quote','button','image','video','divider','card']);
    const type = allowed.has(block?.type) ? block.type : 'text';
    return {
      id: String(block?.id || uid('block')),
      type,
      title: safeText(block?.title || '', 250),
      text: safeText(block?.text || '', 15000),
      url: safeUrl(block?.url),
      target: validPageId(block?.target) ? block.target : '',
      label: safeText(block?.label || '', 120),
      caption: safeText(block?.caption || '', 500),
      level: ['h2','h3','h4'].includes(block?.level) ? block.level : 'h2',
      style: ['default','primary','gold','danger','soft'].includes(block?.style) ? block.style : 'default',
      align: ['right','center','left'].includes(block?.align) ? block.align : 'right'
    };
  }

  function normalizeBlocks(blocks) {
    return (Array.isArray(blocks) ? blocks : []).slice(0, 250).map(normalizeBlock);
  }

  function normalizeState(input) {
    const raw = input && typeof input === 'object' ? input : {};
    const defaultById = Object.fromEntries(BUILTIN_SECTIONS.map(item => [item.id, item]));
    const incoming = Array.isArray(raw.sections) ? raw.sections : [];
    const incomingById = Object.fromEntries(incoming.filter(item => item?.type !== 'custom').map(item => [item.id, item]));
    const builtins = BUILTIN_SECTIONS.map(item => normalizeSection({...item, ...(incomingById[item.id] || {})}, item));
    const legacySchema=Number(raw.schemaVersion||0)<2;
    const homeSection = builtins.find(item => item.id === 'home');
    if (homeSection) {homeSection.active=true;if(legacySchema)homeSection.sortOrder=0}
    if(legacySchema){const k=builtins.find(x=>x.id==='khatma');if(k){k.navVisible=false;k.homeVisible=false}const e=builtins.find(x=>x.id==='academyExams');if(e)e.sortOrder=59;}
    const custom = incoming.filter(item => item?.type === 'custom').slice(0, 80).map(item => normalizeSection(item));
    const sections = [...builtins, ...custom].sort((a,b) => a.sortOrder - b.sortOrder);
    return {
      schemaVersion: 2,
      revision: Math.max(0, Number(raw.revision) || 0),
      updatedAt: raw.updatedAt || null,
      brand: {
        siteName: safeText(raw.brand?.siteName || DEFAULT_STATE.brand.siteName, 80),
        brandIcon: safeText(raw.brand?.brandIcon || DEFAULT_STATE.brand.brandIcon, 12),
        logoUrl: safeUrl(raw.brand?.logoUrl),
        browserTitle: safeText(raw.brand?.browserTitle || DEFAULT_STATE.brand.browserTitle, 180),
        metaDescription: safeText(raw.brand?.metaDescription || DEFAULT_STATE.brand.metaDescription, 320),
        footerText: safeText(raw.brand?.footerText || DEFAULT_STATE.brand.footerText, 220),
        accent: safeColor(raw.brand?.accent, DEFAULT_STATE.brand.accent),
        accent2: safeColor(raw.brand?.accent2, DEFAULT_STATE.brand.accent2),
        lightBackground: safeColor(raw.brand?.lightBackground, DEFAULT_STATE.brand.lightBackground),
        darkBackground: safeColor(raw.brand?.darkBackground, DEFAULT_STATE.brand.darkBackground)
      },
      home: {
        kicker: safeText(raw.home?.kicker || DEFAULT_STATE.home.kicker, 160),
        title: safeText(raw.home?.title || DEFAULT_STATE.home.title, 220),
        subtitle: safeText(raw.home?.subtitle || DEFAULT_STATE.home.subtitle, 800),
        primaryText: safeText(raw.home?.primaryText || DEFAULT_STATE.home.primaryText, 100),
        primaryTarget: validPageId(raw.home?.primaryTarget) ? raw.home.primaryTarget : DEFAULT_STATE.home.primaryTarget,
        secondaryText: safeText(raw.home?.secondaryText || DEFAULT_STATE.home.secondaryText, 100),
        secondaryTarget: validPageId(raw.home?.secondaryTarget) ? raw.home.secondaryTarget : DEFAULT_STATE.home.secondaryTarget,
        cardsTitle: safeText(raw.home?.cardsTitle || DEFAULT_STATE.home.cardsTitle, 160),
        cardsSubtitle: safeText(raw.home?.cardsSubtitle || DEFAULT_STATE.home.cardsSubtitle, 500),
        useManagedCards: Boolean(raw.home?.useManagedCards),
        blocks: normalizeBlocks(raw.home?.blocks)
      },
      design: {
        radius: Math.max(6,Math.min(32,Number(raw.design?.radius ?? DEFAULT_STATE.design.radius)||DEFAULT_STATE.design.radius)),
        fontScale: Math.max(85,Math.min(120,Number(raw.design?.fontScale ?? DEFAULT_STATE.design.fontScale)||DEFAULT_STATE.design.fontScale)),
        navColumns: Math.max(3,Math.min(8,Number(raw.design?.navColumns ?? DEFAULT_STATE.design.navColumns)||DEFAULT_STATE.design.navColumns)),
        shadow: ['none','soft','medium'].includes(raw.design?.shadow)?raw.design.shadow:DEFAULT_STATE.design.shadow,
        customCss: safeText(raw.design?.customCss||'',12000)
      },
      behavior: {
        showTopbar: raw.behavior?.showTopbar !== false,
        showFooter: raw.behavior?.showFooter !== false,
        maintenanceMode: Boolean(raw.behavior?.maintenanceMode),
        maintenanceTitle: safeText(raw.behavior?.maintenanceTitle || DEFAULT_STATE.behavior.maintenanceTitle, 140),
        maintenanceMessage: safeText(raw.behavior?.maintenanceMessage || DEFAULT_STATE.behavior.maintenanceMessage, 1000)
      },
      sections
    };
  }

  function textWithBreaks(element, text) {
    const lines = String(text || '').split(/\n/);
    lines.forEach((line, index) => {
      if (index) element.append(document.createElement('br'));
      element.append(document.createTextNode(line));
    });
  }

  function youtubeEmbed(url) {
    const raw = String(url || '');
    let id = '';
    try {
      const parsed = new URL(raw);
      if (parsed.hostname.includes('youtu.be')) id = parsed.pathname.split('/').filter(Boolean)[0] || '';
      if (parsed.hostname.includes('youtube.com')) id = parsed.searchParams.get('v') || parsed.pathname.split('/embed/')[1] || '';
    } catch (_) {}
    return /^[A-Za-z0-9_-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  }

  function renderBlock(block, context = {}) {
    const b = normalizeBlock(block);
    let node;
    if (b.type === 'heading') {
      node = document.createElement(b.level);
      node.className = 'cms-block cms-heading';
      node.textContent = b.title || b.text;
    } else if (b.type === 'text') {
      node = document.createElement('p');
      node.className = 'cms-block cms-text';
      textWithBreaks(node, b.text);
    } else if (b.type === 'notice') {
      node = document.createElement('aside');
      node.className = `cms-block cms-notice cms-style-${b.style}`;
      if (b.title) { const strong = document.createElement('strong'); strong.textContent = b.title; node.append(strong); }
      if (b.text) { const p = document.createElement('p'); textWithBreaks(p, b.text); node.append(p); }
    } else if (b.type === 'quote') {
      node = document.createElement('blockquote');
      node.className = 'cms-block cms-quote';
      textWithBreaks(node, b.text);
      if (b.caption) { const cite = document.createElement('cite'); cite.textContent = b.caption; node.append(cite); }
    } else if (b.type === 'button') {
      if (b.target) {
        node = document.createElement('button');
        node.type = 'button';
        node.addEventListener('click', () => window.navTo?.(b.target));
      } else {
        node = document.createElement('a');
        node.href = b.url || '#';
        if (/^https?:\/\//i.test(b.url)) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
      }
      node.className = `btn cms-block cms-button ${b.style === 'primary' ? 'primary' : b.style === 'gold' ? 'gold' : b.style === 'danger' ? 'danger' : ''}`;
      node.textContent = b.label || b.title || 'فتح';
    } else if (b.type === 'image') {
      node = document.createElement('figure');
      node.className = 'cms-block cms-image';
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = b.title || b.caption || 'صورة';
      img.src = b.url;
      node.append(img);
      if (b.caption || b.title) { const fig = document.createElement('figcaption'); fig.textContent = b.caption || b.title; node.append(fig); }
    } else if (b.type === 'video') {
      node = document.createElement('div');
      node.className = 'cms-block cms-video';
      const embed = youtubeEmbed(b.url);
      if (embed) {
        const frame = document.createElement('iframe');
        frame.src = embed;
        frame.title = b.title || 'فيديو';
        frame.loading = 'lazy';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        frame.allowFullscreen = true;
        node.append(frame);
      } else {
        const a = document.createElement('a');
        a.href = b.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.textContent = b.label || b.title || 'فتح الفيديو';
        node.append(a);
      }
    } else if (b.type === 'divider') {
      node = document.createElement('hr');
      node.className = 'cms-block cms-divider';
    } else {
      node = document.createElement('article');
      node.className = `cms-block cms-content-card cms-style-${b.style}`;
      if (b.title) { const h = document.createElement('h3'); h.textContent = b.title; node.append(h); }
      if (b.text) { const p = document.createElement('p'); textWithBreaks(p, b.text); node.append(p); }
      if (b.target || b.url) {
        const action = renderBlock({type:'button',label:b.label || 'عرض المزيد',target:b.target,url:b.url,style:b.style === 'gold' ? 'gold' : 'primary'}, context);
        node.append(action);
      }
    }
    node.dataset.cmsBlockId = b.id;
    node.style.textAlign = b.align;
    return node;
  }

  function renderBlocks(container, blocks, context = {}) {
    if (!container) return;
    container.replaceChildren();
    normalizeBlocks(blocks).forEach(block => container.append(renderBlock(block, context)));
  }

  window.NOOR_CMS = {
    BUILTIN_SECTIONS: clone(BUILTIN_SECTIONS),
    DEFAULT_STATE: clone(DEFAULT_STATE),
    getDefaultState: () => clone(DEFAULT_STATE),
    normalizeState,
    normalizeBlock,
    normalizeBlocks,
    uid,
    esc,
    safeUrl,
    validPageId,
    renderBlock,
    renderBlocks
  };
})();
