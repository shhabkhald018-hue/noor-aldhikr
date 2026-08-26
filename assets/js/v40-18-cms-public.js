'use strict';

(() => {
  const CMS_KEY = 'cms_state_v40_18';
  const CACHE_KEY = 'noor_cms_state_v40_18';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let currentState = null;
  const navButtonRegistry = new Map();

  function loadCachedState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return parsed ? window.NOOR_CMS.normalizeState(parsed) : null;
    } catch (_) {
      return null;
    }
  }

  function saveCachedState(state) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function applyBrand(state) {
    const {brand, behavior} = state;
    document.title = brand.browserTitle;
    let description = $('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.append(description);
    }
    description.content = brand.metaDescription;

    const root = document.documentElement;
    root.style.setProperty('--accent', brand.accent);
    root.style.setProperty('--accent2', brand.accent2);
    root.style.setProperty('--cms-accent', brand.accent);
    root.style.setProperty('--cms-accent-2', brand.accent2);
    root.style.setProperty('--cms-light-bg', brand.lightBackground);
    root.style.setProperty('--cms-dark-bg', brand.darkBackground);
    root.style.setProperty('--v40-green', brand.accent);
    root.style.setProperty('--v40-gold', brand.accent2);root.style.setProperty('--noor-green',brand.accent);root.style.setProperty('--noor-gold',brand.accent2);

    const brandBox = $('.topbar .brand');
    if (brandBox) {
      const mark = $('.mark', brandBox);
      if (mark) {
        mark.textContent = brand.brandIcon;
        if (brand.logoUrl) {
          mark.textContent = '';
          mark.style.backgroundImage = `url("${brand.logoUrl.replace(/"/g, '')}")`;
          mark.style.backgroundSize = 'cover';
          mark.style.backgroundPosition = 'center';
        } else {
          mark.style.backgroundImage = '';
        }
      }
      const textNodes = [...brandBox.childNodes].filter(node => node.nodeType === Node.TEXT_NODE);
      if (textNodes[0]) textNodes[0].nodeValue = brand.siteName + ' ';
    }

    const footer = $('.footer');
    if (footer) {
      footer.textContent = brand.footerText;
      footer.classList.toggle('hidden', !behavior.showFooter);
    }
    $('.topbar')?.classList.toggle('hidden', !behavior.showTopbar);
  }

  function applyHome(state) {
    const home = state.home;
    const kicker = $('#v38Greeting');
    if (kicker) kicker.textContent = home.kicker;
    const title = $('#v38HomeTitle');
    if (title) title.textContent = home.title;
    const heroText = $('.v38-home-copy > p');
    if (heroText) heroText.textContent = home.subtitle;

    const actions = $$('.v38-home-actions .btn');
    if (actions[0]) {
      actions[0].textContent = home.primaryText;
      actions[0].onclick = () => window.navTo?.(home.primaryTarget);
    }
    if (actions[1]) {
      actions[1].textContent = home.secondaryText;
      actions[1].onclick = () => window.navTo?.(home.secondaryTarget);
    }

    const startTitle = $('#v38StartTitle');
    if (startTitle) startTitle.textContent = home.cardsTitle;
    const startSubtitle = $('.v38-start-section .v38-section-head > p');
    if (startSubtitle) startSubtitle.textContent = home.cardsSubtitle;

    renderManagedCards(state);
    renderHomeBlocks(state);
  }

  function renderManagedCards(state) {
    const original = $('.v38-start-section');
    let managed = $('#cmsManagedHomeCards');
    if (!managed) {
      managed = document.createElement('section');
      managed.id = 'cmsManagedHomeCards';
      managed.className = 'cms-managed-home hidden';
      const anchor = $('.v38-home-hero');
      anchor?.insertAdjacentElement('afterend', managed);
    }

    if (!state.home.useManagedCards) {
      original?.classList.remove('hidden');
      managed.classList.add('hidden');
      managed.replaceChildren();
      return;
    }

    original?.classList.add('hidden');
    managed.classList.remove('hidden');
    managed.innerHTML = '<div class="v38-section-head"><div><span>الأقسام</span><h2></h2></div><p></p></div><div class="cms-home-card-grid"></div>';
    $('h2', managed).textContent = state.home.cardsTitle;
    $('.v38-section-head > p', managed).textContent = state.home.cardsSubtitle;
    const grid = $('.cms-home-card-grid', managed);
    state.sections
      .filter(section => section.active && section.homeVisible && section.id !== 'home')
      .sort((a,b) => a.sortOrder - b.sortOrder)
      .forEach(section => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cms-home-card';
        button.innerHTML = `<span class="cms-home-icon"></span><span class="cms-home-copy"><b></b><small></small></span><span class="cms-home-arrow">←</span>`;
        $('.cms-home-icon', button).textContent = section.icon || '◆';
        $('b', button).textContent = section.navLabel || section.title;
        $('small', button).textContent = section.summary || 'فتح القسم';
        button.addEventListener('click', () => window.navTo?.(section.id));
        grid.append(button);
      });
  }

  function renderHomeBlocks(state) {
    let section = $('#cmsHomeBlocks');
    if (!section) {
      section = document.createElement('section');
      section.id = 'cmsHomeBlocks';
      section.className = 'cms-home-blocks';
      const bottom = $('.home-bottom-services');
      if (bottom) bottom.insertAdjacentElement('beforebegin', section);
      else $('#home')?.append(section);
    }
    window.NOOR_CMS.renderBlocks(section, state.home.blocks, {page:'home'});
    section.classList.toggle('hidden', !state.home.blocks.length);
  }

  function setBuiltInTitle(section) {
    const page = document.getElementById(section.id);
    if (!page) return;
    page.classList.toggle('cms-disabled-page', !section.active);
    const title = page.querySelector(':scope > .section-title h1, :scope > .section-title h2, :scope > h1, :scope > h2');
    if (title) {
      if (!title.dataset.cmsOriginalText) title.dataset.cmsOriginalText = title.textContent.trim();
      title.textContent = section.titleOverride || title.dataset.cmsOriginalText;
    }
    const summary = page.querySelector(':scope > .section-title p, :scope > .section-title .muted');
    if (summary) {
      if (!summary.dataset.cmsOriginalText) summary.dataset.cmsOriginalText = summary.textContent.trim();
      summary.textContent = section.summaryOverride || summary.dataset.cmsOriginalText;
    }
  }

  function createCustomPage(section) {
    const page = document.createElement('section');
    page.id = section.id;
    page.className = 'page cms-generated-page';
    page.dataset.cmsPage = 'true';

    const head = document.createElement('div');
    head.className = 'section-title cms-page-head';
    const wrapper = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = section.title;
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = section.summary;
    wrapper.append(h2, p);
    const icon = document.createElement('span');
    icon.className = 'cms-page-icon';
    icon.textContent = section.icon || '◆';
    head.append(wrapper, icon);

    const blocks = document.createElement('div');
    blocks.className = 'cms-page-blocks';
    window.NOOR_CMS.renderBlocks(blocks, section.blocks, {page:section.id});
    page.append(head, blocks);
    return page;
  }

  function applyDesign(state){
    const d=state.design||{},root=document.documentElement;
    root.style.setProperty('--cms-radius',`${d.radius||16}px`);
    root.style.setProperty('--cms-font-scale',`${(d.fontScale||100)/100}`);
    root.style.setProperty('--cms-nav-cols',String(d.navColumns||6));
    const sh=d.shadow==='none'?'none':d.shadow==='medium'?'0 16px 42px rgba(0,0,0,.16)':'0 10px 30px rgba(32,45,39,.08)';
    root.style.setProperty('--cms-card-shadow',sh);
    let st=document.getElementById('cmsOwnerCustomCss');if(!st){st=document.createElement('style');st.id='cmsOwnerCustomCss';document.head.append(st)}st.textContent=String(d.customCss||'').slice(0,12000);
  }

  function applySections(state) {
    $$('.cms-generated-page').forEach(node => node.remove());
    const main = $('main.container');
    state.sections.filter(section => section.type === 'builtin').forEach(setBuiltInTitle);
    state.sections
      .filter(section => section.type === 'custom' && section.active)
      .sort((a,b) => a.sortOrder - b.sortOrder)
      .forEach(section => main?.append(createCustomPage(section)));

    const nav = $('.nav');
    if (!nav) return;
    $$('button[data-page]', nav).forEach(button => {if(!navButtonRegistry.has(button.dataset.page))navButtonRegistry.set(button.dataset.page,button)});
    $$('a.nav-direct-link',nav).forEach(link=>{const href=(link.getAttribute('href')||'').split('?')[0].split('#')[0];const id=href.endsWith('mushaf.html')?'quran':href.endsWith('exams.html')?'academyExams':'';if(id){link.dataset.cmsSection=id;if(!navButtonRegistry.has(id))navButtonRegistry.set(id,link)}});
    $('.nav-utility-divider', nav)?.remove();

    state.sections.forEach(section => {
      let button = navButtonRegistry.get(section.id);
      if (!button && section.type === 'custom') {
        button = document.createElement('button');
        button.type = 'button';
        button.dataset.page = section.id;
        button.className = 'cms-nav-button';
        navButtonRegistry.set(section.id, button);
      }
      if (button) {
        button.textContent = section.navLabel;
        button.hidden = !(section.active && section.navVisible);
        if(button.tagName==='BUTTON')button.onclick = () => window.navTo?.(section.id);
      }
    });

    [...nav.querySelectorAll('button[data-page],a[data-cms-section]')].forEach(button => button.remove());
    const visible = state.sections
      .filter(section => section.active && section.navVisible)
      .sort((a,b) => a.sortOrder - b.sortOrder);
    let dividerAdded = false;
    visible.forEach(section => {
      if (section.utility && !dividerAdded) {
        const divider = document.createElement('span');
        divider.className = 'nav-utility-divider';
        divider.setAttribute('aria-hidden','true');
        nav.append(divider);
        dividerAdded = true;
      }
      const button = navButtonRegistry.get(section.id);
      if (button) nav.append(button);
    });

    const active = $('.page.active');
    if (active) {
      const config = state.sections.find(section => section.id === active.id);
      if (config && !config.active) window.navTo?.('home');
    }
  }

  function applyMaintenance(state) {
    let overlay = $('#cmsMaintenanceOverlay');
    const bypass = new URLSearchParams(location.search).get('ownerPreview') === '1';
    if (!state.behavior.maintenanceMode || bypass) {
      overlay?.remove();
      return;
    }
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'cmsMaintenanceOverlay';
      overlay.className = 'cms-maintenance-overlay';
      overlay.innerHTML = '<div class="cms-maintenance-card"><span class="cms-maintenance-icon">☾</span><h1></h1><p></p></div>';
      document.body.append(overlay);
    }
    $('h1', overlay).textContent = state.behavior.maintenanceTitle;
    $('p', overlay).textContent = state.behavior.maintenanceMessage;
  }

  function applyState(input) {
    const state = window.NOOR_CMS.normalizeState(input);
    currentState = state;
    applyBrand(state);
    applyDesign(state);
    applySections(state);
    applyHome(state);
    applyMaintenance(state);
    document.documentElement.dataset.cmsRevision = String(state.revision || 0);
    window.dispatchEvent(new CustomEvent('noor:cms-applied', {detail:{state}}));
  }

  async function fetchRemoteState() {
    if (!window.supabaseClient && typeof supabaseClient === 'undefined') return;
    const client = window.supabaseClient || supabaseClient;
    if (!client) return;
    try {
      const {data, error} = await client.from('app_settings').select('value,updated_at').eq('key', CMS_KEY).maybeSingle();
      if (error) throw error;
      if (!data?.value) return;
      const state = window.NOOR_CMS.normalizeState(JSON.parse(data.value));
      const cachedRevision = Number(currentState?.revision || 0);
      if (!currentState || state.revision >= cachedRevision) applyState(state);
      saveCachedState(state);
    } catch (error) {
      console.warn('تعذر تحميل إعدادات واجهة المالك:', error?.message || error);
    }
  }

  function init() {
    if (!window.NOOR_CMS) return;
    const cached = loadCachedState();
    applyState(cached || window.NOOR_CMS.getDefaultState());
    fetchRemoteState();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchRemoteState();
    });
    window.addEventListener('focus', fetchRemoteState);
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.data?.type !== 'NOOR_CMS_PREVIEW' || !event.data?.state) return;
      applyState(event.data.state);
    });
    window.NOOR_CMS_PUBLIC = {applyState, fetchRemoteState, getState:() => currentState};
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
