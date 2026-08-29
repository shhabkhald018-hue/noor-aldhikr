'use strict';

(() => {
  const CMS_KEY = 'cms_state_v40_18';
  const HISTORY_KEY = 'cms_history_v40_18';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const html = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clone = value => JSON.parse(JSON.stringify(value));

  let state = null;
  let history = [];
  let selectedSectionId = 'home';
  let editingBlockId = '';
  let loaded = false;

  function client() {
    try { return typeof supabaseClient !== 'undefined' ? supabaseClient : null; } catch (_) { return null; }
  }

  function notify(message) {
    if (typeof toast === 'function') toast(message);
    else alert(message);
  }

  function mountUI() {
    const mount = $('#cmsAdminMount');
    if (!mount || mount.dataset.ready === 'true') return;
    mount.dataset.ready = 'true';
    mount.innerHTML = `
      <section class="card owner-section cms-admin-shell" id="cmsAdminSection">
        <div class="cms-admin-hero">
          <div>
            <span class="cms-kicker">مركز إدارة الموقع</span>
            <h2>محرر صفحة المستخدم الكامل</h2>
            <p>عدّل الهوية والصفحة الرئيسية، أخفِ أو أظهر الأقسام، غيّر ترتيب القائمة، وأنشئ صفحات ومحتوى جديدًا دون تعديل ملفات GitHub.</p>
          </div>
          <div class="cms-admin-actions">
          <button class="btn" id="cmsOpenPreview" type="button">فتح الموقع للمعاينة</button>
          <button class="btn" id="cmsHomeFirst" type="button">اجعل الرئيسية أولًا</button>
        
            <button class="btn" id="cmsOpenPublic" type="button">فتح صفحة المستخدم</button>
            <button class="btn gold" id="cmsPreviewDraft" type="button">معاينة المسودة</button>
            <button class="btn primary" id="cmsPublish" type="button">حفظ ونشر التغييرات</button>
          </div>
        </div>
        <div class="cms-save-state" id="cmsSaveState">لم يتم تحميل الإعدادات بعد.</div>
        <nav class="cms-admin-tabs" aria-label="أقسام محرر الموقع">
          <button class="active" data-cms-tab="identity" type="button">الهوية والرئيسية</button>
          <button data-cms-tab="sections" type="button">الأقسام والقائمة</button>
          <button data-cms-tab="content" type="button">منشئ المحتوى</button>
          <button data-cms-tab="preview" type="button">المعاينة</button>
          <button data-cms-tab="backup" type="button">النسخ والاستعادة</button>
        </nav>

        <div class="cms-admin-panel active" data-cms-panel="identity">
          <form id="cmsIdentityForm" class="cms-form-grid">
            <div class="cms-form-group cms-form-wide"><h3>هوية الموقع</h3><p class="muted">تنعكس هذه البيانات على اسم الموقع والألوان والعنوان الذي يظهر في المتصفح.</p></div>
            <div class="field"><label>اسم الموقع</label><input id="cmsSiteName" maxlength="80"></div>
            <div class="field"><label>رمز الشعار</label><input id="cmsBrandIcon" maxlength="12" placeholder="☾"></div>
            <div class="field cms-form-wide"><label>رابط صورة الشعار (اختياري)</label><input id="cmsLogoUrl" type="url" placeholder="https://..."></div>
            <div class="field cms-form-wide"><label>عنوان المتصفح ومحركات البحث</label><input id="cmsBrowserTitle" maxlength="180"></div>
            <div class="field cms-form-wide"><label>وصف الموقع لمحركات البحث</label><textarea id="cmsMetaDescription" rows="3" maxlength="320"></textarea></div>
            <div class="field cms-form-wide"><label>نص أسفل الموقع</label><input id="cmsFooterText" maxlength="220"></div>
            <div class="field"><label>اللون الأساسي</label><input id="cmsAccent" type="color"></div>
            <div class="field"><label>اللون الذهبي/الثانوي</label><input id="cmsAccent2" type="color"></div>
            <div class="field"><label>خلفية الوضع الفاتح</label><input id="cmsLightBg" type="color"></div>
            <div class="field"><label>خلفية الوضع الداكن</label><input id="cmsDarkBg" type="color"></div>
            <div class="field cms-form-wide">
              <label>ألوان جاهزة</label>
              <div class="cms-owner-presets">
                <button class="btn" type="button" data-theme-preset="balanced">متوازن</button>
                <button class="btn" type="button" data-theme-preset="green">أخضر هادئ</button>
                <button class="btn" type="button" data-theme-preset="gold">ذهبي دافئ</button>
                <button class="btn" type="button" data-theme-preset="charcoal">فحمي أنيق</button>
              </div>
            </div>
            <div class="cms-form-group cms-form-wide"><h3>شكل الموقع</h3><p class="muted">تحكم في الزوايا وحجم الخط وأعمدة القائمة والظل، مع CSS مخصص عند الحاجة.</p></div>
            <div class="field"><label>استدارة البطاقات</label><input id="cmsRadius" type="number" min="6" max="32"></div>
            <div class="field"><label>حجم الخط %</label><input id="cmsFontScale" type="number" min="85" max="120"></div>
            <div class="field"><label>أعمدة القائمة على الكمبيوتر</label><input id="cmsNavColumns" type="number" min="3" max="8"></div>
            <div class="field"><label>ظل البطاقات</label><select id="cmsShadow"><option value="none">بدون</option><option value="soft">خفيف</option><option value="medium">متوسط</option></select></div>
            <div class="field cms-form-wide"><label>CSS مخصص متقدم</label><textarea id="cmsCustomCss" rows="6" maxlength="12000"></textarea></div>
            <div class="cms-form-group cms-form-wide"><h3>واجهة الصفحة الرئيسية</h3></div>
            <div class="field cms-form-wide"><label>الجملة الصغيرة</label><input id="cmsHomeKicker" maxlength="160"></div>
            <div class="field cms-form-wide"><label>العنوان الرئيسي</label><input id="cmsHomeTitle" maxlength="220"></div>
            <div class="field cms-form-wide"><label>الوصف الرئيسي</label><textarea id="cmsHomeSubtitle" rows="4" maxlength="800"></textarea></div>
            <div class="field"><label>نص الزر الأول</label><input id="cmsPrimaryText" maxlength="100"></div>
            <div class="field"><label>يفتح قسم</label><select id="cmsPrimaryTarget"></select></div>
            <div class="field"><label>نص الزر الثاني</label><input id="cmsSecondaryText" maxlength="100"></div>
            <div class="field"><label>يفتح قسم</label><select id="cmsSecondaryTarget"></select></div>
            <div class="field"><label>عنوان بطاقات الأقسام</label><input id="cmsCardsTitle" maxlength="160"></div>
            <div class="field"><label>وصف بطاقات الأقسام</label><input id="cmsCardsSubtitle" maxlength="500"></div>
            <label class="check-line cms-form-wide"><input id="cmsUseManagedCards" type="checkbox"> استخدام الأقسام والترتيب المحددين من لوحة المالك بدل بطاقات الرئيسية الثابتة</label>

            <div class="cms-form-group cms-form-wide"><h3>الظهور ووضع الصيانة</h3></div>
            <label class="check-line"><input id="cmsShowTopbar" type="checkbox"> إظهار الشريط العلوي</label>
            <label class="check-line"><input id="cmsShowFooter" type="checkbox"> إظهار أسفل الموقع</label>
            <label class="check-line cms-warning-check"><input id="cmsMaintenance" type="checkbox"> تفعيل وضع الصيانة وحجب الموقع مؤقتًا عن المستخدمين</label>
            <div class="field"><label>عنوان الصيانة</label><input id="cmsMaintenanceTitle" maxlength="140"></div>
            <div class="field cms-form-wide"><label>رسالة الصيانة</label><textarea id="cmsMaintenanceMessage" rows="3" maxlength="1000"></textarea></div>
            <div class="cms-form-wide"><button class="btn primary" type="submit">تطبيق على المسودة</button></div>
          </form>
        </div>

        <div class="cms-admin-panel" data-cms-panel="sections">
          <div class="row between cms-panel-head">
            <div><h3>الأقسام والقائمة الرئيسية</h3><p class="muted">يمكنك تغيير الاسم والترتيب والظهور. الأقسام الأصلية لا تُحذف لحماية النظام، لكن يمكن إخفاؤها. الأقسام الجديدة يمكن حذفها.</p></div>
            <button class="btn primary" id="cmsAddSection" type="button">+ إضافة قسم جديد</button>
          </div>
          <div class="cms-section-layout">
            <div class="cms-section-list" id="cmsSectionList"></div>
            <form class="cms-section-editor" id="cmsSectionForm">
              <input id="cmsSectionId" type="hidden">
              <input id="cmsSectionType" type="hidden">
              <h3 id="cmsSectionFormTitle">إعداد القسم</h3>
              <div class="field"><label>اسم القسم داخل الصفحة</label><input id="cmsSectionTitle" maxlength="140" required></div>
              <div class="field"><label>اسم زر القائمة</label><input id="cmsSectionNavLabel" maxlength="80" required></div>
              <div class="field"><label>الرمز</label><input id="cmsSectionIcon" maxlength="12"></div>
              <div class="field"><label>الوصف المختصر</label><textarea id="cmsSectionSummary" rows="3" maxlength="500"></textarea></div>
              <div class="field"><label>ترتيب القسم</label><input id="cmsSectionOrder" type="number" step="1"></div>
              <div class="field"><label>عنوان بديل داخل القسم الأصلي (اختياري)</label><input id="cmsSectionTitleOverride" maxlength="140"></div>
              <div class="field"><label>وصف بديل داخل القسم الأصلي (اختياري)</label><textarea id="cmsSectionSummaryOverride" rows="2" maxlength="500"></textarea></div>
              <label class="check-line"><input id="cmsSectionActive" type="checkbox"> القسم مفعّل</label>
              <label class="check-line"><input id="cmsSectionNavVisible" type="checkbox"> يظهر في القائمة</label>
              <label class="check-line"><input id="cmsSectionHomeVisible" type="checkbox"> يظهر كبطاقة في الرئيسية عند تشغيل البطاقات المُدارة</label>
              <div class="row"><button class="btn primary" type="submit">حفظ إعداد القسم</button><button class="btn danger hidden" id="cmsDeleteSection" type="button">حذف القسم الجديد</button></div>
            </form>
          </div>
        </div>

        <div class="cms-admin-panel" data-cms-panel="content">
          <div class="cms-content-toolbar">
            <div class="field"><label>الصفحة التي تريد تعديل محتواها</label><select id="cmsContentTarget"></select></div>
            <button class="btn primary" id="cmsAddBlock" type="button">+ إضافة عنصر محتوى</button>
          </div>
          <div class="notice">يمكن تعديل محتوى الصفحة الرئيسية والأقسام الجديدة من هنا. محتوى الأقسام البرمجية الأصلية محفوظ لحماية القرآن والأذكار والوظائف الحساسة، ويمكن التحكم في اسمها وظهورها من تبويب الأقسام.</div>
          <div class="cms-block-layout">
            <div class="cms-block-list" id="cmsBlockList"></div>
            <form class="cms-block-editor" id="cmsBlockForm">
              <input id="cmsBlockId" type="hidden">
              <h3 id="cmsBlockFormTitle">إضافة عنصر</h3>
              <div class="field"><label>نوع العنصر</label><select id="cmsBlockType">
                <option value="heading">عنوان</option><option value="text">نص</option><option value="notice">مربع تنبيه</option>
                <option value="quote">اقتباس</option><option value="card">بطاقة محتوى</option><option value="button">زر</option>
                <option value="image">صورة من رابط</option><option value="video">فيديو يوتيوب</option><option value="divider">فاصل</option>
              </select></div>
              <div class="field"><label>العنوان</label><input id="cmsBlockTitle" maxlength="250"></div>
              <div class="field"><label>النص</label><textarea id="cmsBlockText" rows="6" maxlength="15000"></textarea></div>
              <div class="field"><label>نص الزر أو الرابط</label><input id="cmsBlockLabel" maxlength="120"></div>
              <div class="field"><label>رابط صورة/فيديو/صفحة خارجية</label><input id="cmsBlockUrl" placeholder="https://..."></div>
              <div class="field"><label>أو افتح قسمًا داخليًا</label><select id="cmsBlockTarget"><option value="">بدون رابط داخلي</option></select></div>
              <div class="field"><label>تعليق الصورة أو مصدر الاقتباس</label><input id="cmsBlockCaption" maxlength="500"></div>
              <div class="field"><label>المظهر</label><select id="cmsBlockStyle"><option value="default">عادي</option><option value="primary">أساسي</option><option value="gold">ذهبي</option><option value="soft">هادئ</option><option value="danger">تنبيه قوي</option></select></div>
              <div class="field"><label>المحاذاة</label><select id="cmsBlockAlign"><option value="right">يمين</option><option value="center">وسط</option><option value="left">يسار</option></select></div>
              <div class="field"><label>مستوى العنوان</label><select id="cmsBlockLevel"><option value="h2">عنوان رئيسي H2</option><option value="h3">عنوان فرعي H3</option><option value="h4">عنوان صغير H4</option></select></div>
              <div class="row"><button class="btn primary" type="submit">حفظ العنصر</button><button class="btn" id="cmsCancelBlock" type="button">إلغاء</button></div>
            </form>
          </div>
        </div>

        <div class="cms-admin-panel" data-cms-panel="preview">
          <div class="row between cms-panel-head"><div><h3>معاينة صفحة المستخدم</h3><p class="muted">تعرض المسودة الحالية قبل نشرها. وضع الصيانة لا يحجب هذه المعاينة.</p></div><button class="btn" id="cmsReloadPreview" type="button">تحديث المعاينة</button></div>
          <div class="cms-preview-frame-wrap"><iframe id="cmsPreviewFrame" title="معاينة صفحة المستخدم" src="index.html?ownerPreview=1"></iframe></div>
        </div>

        <div class="cms-admin-panel" data-cms-panel="backup">
          <div class="cms-backup-grid">
            <article class="cms-backup-card"><h3>تصدير نسخة احتياطية</h3><p>نزّل ملف JSON يحتوي على تصميم الموقع والأقسام والمحتوى المضاف.</p><button class="btn primary" id="cmsExport" type="button">تنزيل النسخة</button></article>
            <article class="cms-backup-card"><h3>استيراد نسخة</h3><p>اختر ملفًا سبق تصديره. سيتم تحميله كمسودة ولن يُنشر إلا بعد الضغط على حفظ ونشر.</p><input id="cmsImportFile" type="file" accept="application/json"><button class="btn" id="cmsImport" type="button">استيراد الملف</button></article>
            <article class="cms-backup-card cms-danger-card"><h3>إعادة الإعدادات الأصلية</h3><p>يعيد الهوية والأقسام إلى الوضع الافتراضي داخل المسودة. لا يحذف بيانات المستخدمين أو الأذكار أو الإعلانات.</p><button class="btn danger" id="cmsReset" type="button">إعادة الضبط</button></article>
          </div>
          <h3>سجل النسخ المنشورة</h3>
          <div class="cms-history-list" id="cmsHistoryList"></div>
        </div>
      </section>`;

    bindUI();
  }

  function bindUI() {
    $$('.cms-admin-tabs button').forEach(button => button.addEventListener('click', () => switchTab(button.dataset.cmsTab)));
    $('#cmsIdentityForm')?.addEventListener('submit', event => { event.preventDefault(); readIdentityForm(); renderAll(); markDraft(); notify('تم تطبيق التعديلات على المسودة'); });
    $('#cmsSectionForm')?.addEventListener('submit', saveSectionForm);
    $('#cmsAddSection')?.addEventListener('click', createSectionDraft);
    $('#cmsDeleteSection')?.addEventListener('click', deleteSelectedSection);
    $('#cmsContentTarget')?.addEventListener('change', event => { selectedSectionId = event.target.value; editingBlockId = ''; renderBlocksAdmin(); resetBlockForm(); });
    $('#cmsAddBlock')?.addEventListener('click', resetBlockForm);
    $('#cmsBlockForm')?.addEventListener('submit', saveBlockForm);
    $('#cmsCancelBlock')?.addEventListener('click', resetBlockForm);
    $('#cmsPublish')?.addEventListener('click', publishState);
    $$('.cms-owner-presets [data-theme-preset]').forEach(b=>b.addEventListener('click',()=>applyThemePreset(b.dataset.themePreset)));
    $('#cmsOpenPreview')?.addEventListener('click',()=>window.open('index.html?ownerPreview=1','_blank'));
    $('#cmsHomeFirst')?.addEventListener('click',forceHomeFirst);
    $('#cmsPreviewDraft')?.addEventListener('click', () => { switchTab('preview'); sendPreview(); });
    $('#cmsReloadPreview')?.addEventListener('click', reloadPreview);
    $('#cmsOpenPublic')?.addEventListener('click', () => window.open('index.html', '_blank', 'noopener'));
    $('#cmsExport')?.addEventListener('click', exportState);
    $('#cmsImport')?.addEventListener('click', importState);
    $('#cmsReset')?.addEventListener('click', resetState);
    $('#cmsPreviewFrame')?.addEventListener('load', sendPreview);
  }

  function switchTab(name) {
    $$('.cms-admin-tabs button').forEach(button => button.classList.toggle('active', button.dataset.cmsTab === name));
    $$('.cms-admin-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.cmsPanel === name));
    if (name === 'preview') setTimeout(sendPreview, 80);
  }

  function setSaveState(message, status = 'draft') {
    const box = $('#cmsSaveState');
    if (!box) return;
    box.textContent = message;
    box.dataset.status = status;
  }

  function markDraft() {
    setSaveState('توجد تعديلات في المسودة لم تُنشر بعد.', 'draft');
    sendPreview();
  }

  function allTargetOptions() {
    return state.sections.filter(section => section.active).sort((a,b) => a.sortOrder - b.sortOrder);
  }

  function fillSelect(select, value, includeEmpty = false) {
    if (!select) return;
    const options = [];
    if (includeEmpty) options.push('<option value="">بدون رابط داخلي</option>');
    allTargetOptions().forEach(section => options.push(`<option value="${html(section.id)}">${html(section.icon)} ${html(section.navLabel)}</option>`));
    select.innerHTML = options.join('');
    if ([...select.options].some(option => option.value === value)) select.value = value;
  }

  function renderIdentityForm() {
    const b = state.brand, h = state.home, behavior = state.behavior;
    $('#cmsSiteName').value = b.siteName;
    $('#cmsBrandIcon').value = b.brandIcon;
    $('#cmsLogoUrl').value = b.logoUrl;
    $('#cmsBrowserTitle').value = b.browserTitle;
    $('#cmsMetaDescription').value = b.metaDescription;
    $('#cmsFooterText').value = b.footerText;
    $('#cmsAccent').value = b.accent;
    $('#cmsAccent2').value = b.accent2;
    $('#cmsLightBg').value = b.lightBackground;
    $('#cmsDarkBg').value = b.darkBackground;const d=state.design||{};$('#cmsRadius').value=d.radius||16;$('#cmsFontScale').value=d.fontScale||100;$('#cmsNavColumns').value=d.navColumns||6;$('#cmsShadow').value=d.shadow||'soft';$('#cmsCustomCss').value=d.customCss||'';
    $('#cmsHomeKicker').value = h.kicker;
    $('#cmsHomeTitle').value = h.title;
    $('#cmsHomeSubtitle').value = h.subtitle;
    $('#cmsPrimaryText').value = h.primaryText;
    $('#cmsSecondaryText').value = h.secondaryText;
    fillSelect($('#cmsPrimaryTarget'), h.primaryTarget);
    fillSelect($('#cmsSecondaryTarget'), h.secondaryTarget);
    $('#cmsCardsTitle').value = h.cardsTitle;
    $('#cmsCardsSubtitle').value = h.cardsSubtitle;
    $('#cmsUseManagedCards').checked = h.useManagedCards;
    $('#cmsShowTopbar').checked = behavior.showTopbar;
    $('#cmsShowFooter').checked = behavior.showFooter;
    $('#cmsMaintenance').checked = behavior.maintenanceMode;
    $('#cmsMaintenanceTitle').value = behavior.maintenanceTitle;
    $('#cmsMaintenanceMessage').value = behavior.maintenanceMessage;
  }

  function readIdentityForm() {
    state.brand = {
      siteName: $('#cmsSiteName').value.trim(),
      brandIcon: $('#cmsBrandIcon').value.trim(),
      logoUrl: $('#cmsLogoUrl').value.trim(),
      browserTitle: $('#cmsBrowserTitle').value.trim(),
      metaDescription: $('#cmsMetaDescription').value.trim(),
      footerText: $('#cmsFooterText').value.trim(),
      accent: $('#cmsAccent').value,
      accent2: $('#cmsAccent2').value,
      lightBackground: $('#cmsLightBg').value,
      darkBackground: $('#cmsDarkBg').value
    };
    state.design={radius:Number($('#cmsRadius').value)||16,fontScale:Number($('#cmsFontScale').value)||100,navColumns:Number($('#cmsNavColumns').value)||6,shadow:$('#cmsShadow').value,customCss:$('#cmsCustomCss').value};
    state.home = {...state.home,
      kicker: $('#cmsHomeKicker').value.trim(),
      title: $('#cmsHomeTitle').value.trim(),
      subtitle: $('#cmsHomeSubtitle').value.trim(),
      primaryText: $('#cmsPrimaryText').value.trim(),
      primaryTarget: $('#cmsPrimaryTarget').value,
      secondaryText: $('#cmsSecondaryText').value.trim(),
      secondaryTarget: $('#cmsSecondaryTarget').value,
      cardsTitle: $('#cmsCardsTitle').value.trim(),
      cardsSubtitle: $('#cmsCardsSubtitle').value.trim(),
      useManagedCards: $('#cmsUseManagedCards').checked
    };
    state.behavior = {
      showTopbar: $('#cmsShowTopbar').checked,
      showFooter: $('#cmsShowFooter').checked,
      maintenanceMode: $('#cmsMaintenance').checked,
      maintenanceTitle: $('#cmsMaintenanceTitle').value.trim(),
      maintenanceMessage: $('#cmsMaintenanceMessage').value.trim()
    };
    state = window.NOOR_CMS.normalizeState(state);
  }

  function renderSections() {
    const list = $('#cmsSectionList');
    if (!list) return;
    const ordered = [...state.sections].sort((a,b) => a.sortOrder - b.sortOrder);
    list.innerHTML = ordered.map((section, index) => `
      <article class="cms-section-row ${section.id === selectedSectionId ? 'selected' : ''}" data-section-id="${html(section.id)}">
        <button class="cms-section-main" type="button" data-section-edit="${html(section.id)}">
          <span class="cms-section-icon">${html(section.icon)}</span>
          <span><b>${html(section.navLabel)}</b><small>${section.type === 'builtin' ? 'قسم أصلي محمي' : 'قسم مضاف من المالك'} · ترتيب ${section.sortOrder}</small></span>
        </button>
        <div class="cms-section-flags"><span class="${section.active ? 'on' : 'off'}">${section.active ? 'مفعّل' : 'مخفي'}</span><span>${section.navVisible ? 'في القائمة' : 'خارج القائمة'}</span></div>
        <div class="cms-row-actions">
          <button class="btn" type="button" data-section-up="${html(section.id)}" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn" type="button" data-section-down="${html(section.id)}" ${index === ordered.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="btn" type="button" data-section-toggle="${html(section.id)}">${section.active ? 'إخفاء' : 'إظهار'}</button>
          ${section.type === 'custom' ? `<button class="btn" type="button" data-section-copy="${html(section.id)}">نسخ</button>` : ''}
        </div>
      </article>`).join('');
    $$('[data-section-edit]', list).forEach(button => button.addEventListener('click', () => selectSection(button.dataset.sectionEdit)));
    $$('[data-section-up]', list).forEach(button => button.addEventListener('click', () => moveSection(button.dataset.sectionUp, -1)));
    $$('[data-section-down]', list).forEach(button => button.addEventListener('click', () => moveSection(button.dataset.sectionDown, 1)));
    $$('[data-section-toggle]', list).forEach(button => button.addEventListener('click', () => toggleSection(button.dataset.sectionToggle)));
    $$('[data-section-copy]', list).forEach(button => button.addEventListener('click', () => duplicateSection(button.dataset.sectionCopy)));
    if (!state.sections.some(section => section.id === selectedSectionId)) selectedSectionId = 'home';
    renderSectionForm();
  }

  function selectSection(id) {
    selectedSectionId = id;
    renderSections();
  }

  function renderSectionForm() {
    const section = state.sections.find(item => item.id === selectedSectionId) || state.sections[0];
    if (!section) return;
    $('#cmsSectionId').value = section.id;
    $('#cmsSectionType').value = section.type;
    $('#cmsSectionTitle').value = section.title;
    $('#cmsSectionNavLabel').value = section.navLabel;
    $('#cmsSectionIcon').value = section.icon;
    $('#cmsSectionSummary').value = section.summary;
    $('#cmsSectionOrder').value = section.sortOrder;
    $('#cmsSectionTitleOverride').value = section.titleOverride || '';
    $('#cmsSectionSummaryOverride').value = section.summaryOverride || '';
    $('#cmsSectionActive').checked = section.active;
    $('#cmsSectionActive').disabled = section.id === 'home';
    $('#cmsSectionNavVisible').checked = section.navVisible;
    $('#cmsSectionHomeVisible').checked = section.homeVisible;
    $('#cmsSectionFormTitle').textContent = section.type === 'builtin' ? `تعديل القسم الأصلي: ${section.navLabel}` : `تعديل القسم الجديد: ${section.navLabel}`;
    $('#cmsDeleteSection').classList.toggle('hidden', section.type !== 'custom');
    $('#cmsSectionTitleOverride').closest('.field').classList.toggle('hidden', section.type !== 'builtin');
    $('#cmsSectionSummaryOverride').closest('.field').classList.toggle('hidden', section.type !== 'builtin');
  }

  function saveSectionForm(event) {
    event.preventDefault();
    const id = $('#cmsSectionId').value;
    const section = state.sections.find(item => item.id === id);
    if (!section) return;
    section.title = $('#cmsSectionTitle').value.trim();
    section.navLabel = $('#cmsSectionNavLabel').value.trim();
    section.icon = $('#cmsSectionIcon').value.trim() || '◆';
    section.summary = $('#cmsSectionSummary').value.trim();
    section.sortOrder = Number($('#cmsSectionOrder').value) || 0;
    section.titleOverride = $('#cmsSectionTitleOverride').value.trim();
    section.summaryOverride = $('#cmsSectionSummaryOverride').value.trim();
    section.active = $('#cmsSectionActive').checked;
    section.navVisible = $('#cmsSectionNavVisible').checked;
    section.homeVisible = $('#cmsSectionHomeVisible').checked;
    state = window.NOOR_CMS.normalizeState(state);
    renderAll();
    markDraft();
    notify('تم حفظ إعداد القسم في المسودة');
  }

  function createSectionDraft() {
    const id = window.NOOR_CMS.uid('page');
    const maxOrder = Math.max(...state.sections.map(section => Number(section.sortOrder) || 0), 0);
    state.sections.push({id,type:'custom',navLabel:'قسم جديد',title:'قسم جديد',summary:'اكتب وصف القسم',icon:'◆',active:true,navVisible:true,homeVisible:true,sortOrder:maxOrder + 10,blocks:[]});
    state = window.NOOR_CMS.normalizeState(state);
    selectedSectionId = id;
    renderAll();
    markDraft();
    switchTab('sections');
    $('#cmsSectionTitle')?.focus();
  }

  function deleteSelectedSection() {
    const section = state.sections.find(item => item.id === selectedSectionId);
    if (!section || section.type !== 'custom') return;
    if (!confirm(`حذف قسم «${section.navLabel}» ومحتواه من المسودة؟`)) return;
    state.sections = state.sections.filter(item => item.id !== selectedSectionId);
    selectedSectionId = 'home';
    renderAll();
    markDraft();
  }

  function toggleSection(id) {
    const section = state.sections.find(item => item.id === id);
    if (!section || section.id === 'home') return;
    section.active = !section.active;
    renderAll();
    markDraft();
  }

  function moveSection(id, direction) {
    const ordered = [...state.sections].sort((a,b) => a.sortOrder - b.sortOrder);
    const index = ordered.findIndex(section => section.id === id);
    const otherIndex = index + direction;
    if (index < 0 || otherIndex < 0 || otherIndex >= ordered.length) return;
    const currentOrder = ordered[index].sortOrder;
    ordered[index].sortOrder = ordered[otherIndex].sortOrder;
    ordered[otherIndex].sortOrder = currentOrder;
    state.sections = ordered;
    renderAll();
    markDraft();
  }

  function duplicateSection(id) {
    const section = state.sections.find(item => item.id === id && item.type === 'custom');
    if (!section) return;
    const copy = clone(section);
    copy.id = window.NOOR_CMS.uid('page');
    copy.title += ' — نسخة';
    copy.navLabel += ' — نسخة';
    copy.sortOrder += 1;
    copy.blocks = copy.blocks.map(block => ({...block,id:window.NOOR_CMS.uid('block')}));
    state.sections.push(copy);
    selectedSectionId = copy.id;
    state = window.NOOR_CMS.normalizeState(state);
    renderAll();
    markDraft();
  }

  function editableTargets() {
    return [{id:'home',label:'الصفحة الرئيسية'}].concat(state.sections.filter(section => section.type === 'custom').map(section => ({id:section.id,label:`${section.icon} ${section.navLabel}`})));
  }

  function renderContentTarget() {
    const select = $('#cmsContentTarget');
    const targets = editableTargets();
    if (!targets.some(item => item.id === selectedSectionId)) selectedSectionId = 'home';
    select.innerHTML = targets.map(item => `<option value="${html(item.id)}">${html(item.label)}</option>`).join('');
    select.value = selectedSectionId;
    fillSelect($('#cmsBlockTarget'), $('#cmsBlockTarget')?.value || '', true);
  }

  function targetBlocks() {
    if (selectedSectionId === 'home') return state.home.blocks;
    return state.sections.find(section => section.id === selectedSectionId && section.type === 'custom')?.blocks || [];
  }

  function setTargetBlocks(blocks) {
    if (selectedSectionId === 'home') state.home.blocks = blocks;
    else {
      const section = state.sections.find(item => item.id === selectedSectionId && item.type === 'custom');
      if (section) section.blocks = blocks;
    }
  }

  function renderBlocksAdmin() {
    const list = $('#cmsBlockList');
    if (!list) return;
    const blocks = targetBlocks();
    const labels = {heading:'عنوان',text:'نص',notice:'تنبيه',quote:'اقتباس',button:'زر',image:'صورة',video:'فيديو',divider:'فاصل',card:'بطاقة'};
    list.innerHTML = blocks.map((block, index) => `
      <article class="cms-block-row ${block.id === editingBlockId ? 'selected' : ''}">
        <button class="cms-block-main" type="button" data-block-edit="${html(block.id)}"><span>${html(labels[block.type] || block.type)}</span><b>${html(block.title || block.label || block.text?.slice(0,90) || 'عنصر بدون عنوان')}</b></button>
        <div class="cms-row-actions"><button class="btn" type="button" data-block-up="${html(block.id)}" ${index === 0 ? 'disabled' : ''}>↑</button><button class="btn" type="button" data-block-down="${html(block.id)}" ${index === blocks.length - 1 ? 'disabled' : ''}>↓</button><button class="btn" type="button" data-block-copy="${html(block.id)}">نسخ</button><button class="btn danger" type="button" data-block-delete="${html(block.id)}">حذف</button></div>
      </article>`).join('') || '<div class="cms-empty-state"><b>لا يوجد محتوى مضاف بعد.</b><span>اضغط «إضافة عنصر محتوى» لإنشاء عنوان أو نص أو صورة أو زر أو بطاقة.</span></div>';
    $$('[data-block-edit]', list).forEach(button => button.addEventListener('click', () => editBlock(button.dataset.blockEdit)));
    $$('[data-block-up]', list).forEach(button => button.addEventListener('click', () => moveBlock(button.dataset.blockUp, -1)));
    $$('[data-block-down]', list).forEach(button => button.addEventListener('click', () => moveBlock(button.dataset.blockDown, 1)));
    $$('[data-block-copy]', list).forEach(button => button.addEventListener('click', () => copyBlock(button.dataset.blockCopy)));
    $$('[data-block-delete]', list).forEach(button => button.addEventListener('click', () => deleteBlock(button.dataset.blockDelete)));
  }

  function resetBlockForm() {
    editingBlockId = '';
    $('#cmsBlockForm')?.reset();
    $('#cmsBlockId').value = '';
    $('#cmsBlockType').value = 'heading';
    $('#cmsBlockStyle').value = 'default';
    $('#cmsBlockAlign').value = 'right';
    $('#cmsBlockLevel').value = 'h2';
    fillSelect($('#cmsBlockTarget'), '', true);
    $('#cmsBlockFormTitle').textContent = 'إضافة عنصر محتوى';
    renderBlocksAdmin();
  }

  function editBlock(id) {
    const block = targetBlocks().find(item => item.id === id);
    if (!block) return;
    editingBlockId = id;
    $('#cmsBlockId').value = block.id;
    $('#cmsBlockType').value = block.type;
    $('#cmsBlockTitle').value = block.title || '';
    $('#cmsBlockText').value = block.text || '';
    $('#cmsBlockLabel').value = block.label || '';
    $('#cmsBlockUrl').value = block.url || '';
    fillSelect($('#cmsBlockTarget'), block.target || '', true);
    $('#cmsBlockCaption').value = block.caption || '';
    $('#cmsBlockStyle').value = block.style || 'default';
    $('#cmsBlockAlign').value = block.align || 'right';
    $('#cmsBlockLevel').value = block.level || 'h2';
    $('#cmsBlockFormTitle').textContent = 'تعديل عنصر المحتوى';
    renderBlocksAdmin();
    $('#cmsBlockForm')?.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function saveBlockForm(event) {
    event.preventDefault();
    const id = $('#cmsBlockId').value || window.NOOR_CMS.uid('block');
    const block = window.NOOR_CMS.normalizeBlock({
      id,
      type: $('#cmsBlockType').value,
      title: $('#cmsBlockTitle').value.trim(),
      text: $('#cmsBlockText').value.trim(),
      label: $('#cmsBlockLabel').value.trim(),
      url: $('#cmsBlockUrl').value.trim(),
      target: $('#cmsBlockTarget').value,
      caption: $('#cmsBlockCaption').value.trim(),
      style: $('#cmsBlockStyle').value,
      align: $('#cmsBlockAlign').value,
      level: $('#cmsBlockLevel').value
    });
    const blocks = [...targetBlocks()];
    const index = blocks.findIndex(item => item.id === id);
    if (index >= 0) blocks[index] = block;
    else blocks.push(block);
    setTargetBlocks(blocks);
    state = window.NOOR_CMS.normalizeState(state);
    resetBlockForm();
    renderAll();
    markDraft();
    notify(index >= 0 ? 'تم تعديل العنصر في المسودة' : 'تمت إضافة العنصر إلى المسودة');
  }

  function moveBlock(id, direction) {
    const blocks = [...targetBlocks()];
    const index = blocks.findIndex(block => block.id === id);
    const other = index + direction;
    if (index < 0 || other < 0 || other >= blocks.length) return;
    [blocks[index], blocks[other]] = [blocks[other], blocks[index]];
    setTargetBlocks(blocks);
    renderAll();
    markDraft();
  }

  function copyBlock(id) {
    const blocks = [...targetBlocks()];
    const index = blocks.findIndex(block => block.id === id);
    if (index < 0) return;
    const copy = {...clone(blocks[index]),id:window.NOOR_CMS.uid('block')};
    blocks.splice(index + 1, 0, copy);
    setTargetBlocks(blocks);
    renderAll();
    markDraft();
  }

  function deleteBlock(id) {
    if (!confirm('حذف عنصر المحتوى من المسودة؟')) return;
    setTargetBlocks(targetBlocks().filter(block => block.id !== id));
    if (editingBlockId === id) resetBlockForm();
    renderAll();
    markDraft();
  }

  function renderHistory() {
    const box = $('#cmsHistoryList');
    if (!box) return;
    box.innerHTML = history.map((entry, index) => `
      <article class="cms-history-row"><div><b>الإصدار ${entry.revision || '—'}</b><span>${html(new Date(entry.savedAt || entry.updatedAt || Date.now()).toLocaleString('ar-EG'))}</span></div><button class="btn" type="button" data-history-restore="${index}">استعادة كمسودة</button></article>`).join('') || '<div class="muted">لا توجد نسخ منشورة سابقة بعد.</div>';
    $$('[data-history-restore]', box).forEach(button => button.addEventListener('click', () => restoreHistory(Number(button.dataset.historyRestore))));
  }

  function renderAll() {
    if (!state) return;
    state = window.NOOR_CMS.normalizeState(state);
    renderIdentityForm();
    renderSections();
    renderContentTarget();
    renderBlocksAdmin();
    renderHistory();
    sendPreview();
  }

  async function load() {
    if (loaded || !window.NOOR_CMS) return;
    loaded = true;
    mountUI();
    setSaveState('جاري تحميل إعدادات الموقع…', 'loading');
    const sb = client();
    if (!sb) {
      state = window.NOOR_CMS.getDefaultState();
      renderAll();
      setSaveState('تعذر الاتصال بقاعدة البيانات؛ تعرض الإعدادات الافتراضية.', 'error');
      return;
    }
    try {
      const {data, error} = await sb.from('app_settings').select('key,value,updated_at').in('key', [CMS_KEY,HISTORY_KEY]);
      if (error) throw error;
      const cmsRow = (data || []).find(row => row.key === CMS_KEY);
      const historyRow = (data || []).find(row => row.key === HISTORY_KEY);
      state = cmsRow?.value ? window.NOOR_CMS.normalizeState(JSON.parse(cmsRow.value)) : window.NOOR_CMS.getDefaultState();
      history = historyRow?.value ? JSON.parse(historyRow.value) : [];
      if (!Array.isArray(history)) history = [];
      renderAll();
      setSaveState(cmsRow ? `آخر نشر: ${new Date(cmsRow.updated_at).toLocaleString('ar-EG')} · الإصدار ${state.revision}` : 'يتم استخدام التصميم الافتراضي. اضغط حفظ ونشر لإنشاء إعدادات المالك.', 'saved');
    } catch (error) {
      console.error(error);
      state = window.NOOR_CMS.getDefaultState();
      history = [];
      renderAll();
      setSaveState('تعذر تحميل محرر الموقع: ' + (error?.message || error), 'error');
    }
  }


  function applyThemePreset(name){
    const presets={
      balanced:{accent:'#2f735e',accent2:'#b89a5a',light:'#f3f2ee',dark:'#0f1211'},
      green:{accent:'#2f735e',accent2:'#c1a35d',light:'#f2f5f2',dark:'#0d1512'},
      gold:{accent:'#58705f',accent2:'#b7924c',light:'#f5f1e8',dark:'#15130f'},
      charcoal:{accent:'#4d7466',accent2:'#b9a06a',light:'#f1f2f1',dark:'#111312'}
    };
    const p=presets[name]; if(!p)return;
    $('#cmsAccent').value=p.accent;$('#cmsAccent2').value=p.accent2;
    $('#cmsLightBg').value=p.light;$('#cmsDarkBg').value=p.dark;
    readIdentityForm(); markDraft(); renderIdentityForm(); sendPreview();
    notify('تم تطبيق مجموعة الألوان على المسودة');
  }
  function forceHomeFirst(){
    const home=state?.sections?.find(x=>x.id==='home'); if(!home)return;
    const min=Math.min(...state.sections.filter(x=>x.id!=='home').map(x=>Number(x.sortOrder)||0),10);
    home.sortOrder=Math.min(0,min-10);
    state.sections.filter(x=>x.id!=='home' && Number(x.sortOrder)<=home.sortOrder).forEach((x,i)=>x.sortOrder=(i+1)*10);
    renderSections();markDraft();sendPreview();notify('تم تثبيت الرئيسية كأول قسم');
  }

  async function publishState() {
    const sb = client();
    if (!sb || !state) return;
    readIdentityForm();
    const button = $('#cmsPublish');
    button.disabled = true;
    button.textContent = 'جاري النشر…';
    try {
      const previous = clone(state);
      previous.savedAt = new Date().toISOString();
      history = [previous, ...history].slice(0, 8);
      state.revision = (Number(state.revision) || 0) + 1;
      state.updatedAt = new Date().toISOString();
      state = window.NOOR_CMS.normalizeState(state);
      const rows = [
        {key:CMS_KEY,value:JSON.stringify(state),public:true,updated_by:window.adminUser?.id || null,updated_at:state.updatedAt},
        {key:HISTORY_KEY,value:JSON.stringify(history),public:false,updated_by:window.adminUser?.id || null,updated_at:state.updatedAt}
      ];
      let {error} = await sb.from('app_settings').upsert(rows, {onConflict:'key'});
      if(error && /updated_by|column .* does not exist|PGRST204/i.test(error.message||'')){
        const fallbackRows=rows.map(({updated_by,...rest})=>rest);
        ({error}=await sb.from('app_settings').upsert(fallbackRows,{onConflict:'key'}));
      }
      if (error) throw error;
      renderAll();
      setSaveState(`تم النشر الآن · الإصدار ${state.revision}. يصل التغيير للمستخدم عند تحديث الصفحة.`, 'saved');
      notify('تم حفظ ونشر واجهة المستخدم بنجاح');
      reloadPreview();
    } catch (error) {
      setSaveState('فشل النشر: ' + (error?.message || error), 'error');
      notify('تعذر نشر التغييرات: ' + (error?.message || error));
    } finally {
      button.disabled = false;
      button.textContent = 'حفظ ونشر التغييرات';
    }
  }

  function sendPreview() {
    const frame = $('#cmsPreviewFrame');
    if (!frame?.contentWindow || !state) return;
    try { frame.contentWindow.postMessage({type:'NOOR_CMS_PREVIEW',state:window.NOOR_CMS.normalizeState(state)}, location.origin); } catch (_) {}
  }

  function reloadPreview() {
    const frame = $('#cmsPreviewFrame');
    if (!frame) return;
    frame.src = `index.html?ownerPreview=1&v=${Date.now()}`;
  }

  function exportState() {
    if (!state) return;
    const payload = {exportedAt:new Date().toISOString(),application:'Noor AlDhikr',cms:window.NOOR_CMS.normalizeState(state)};
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noor-aldhikr-cms-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function importState() {
    const file = $('#cmsImportFile')?.files?.[0];
    if (!file) { notify('اختر ملف JSON أولًا'); return; }
    try {
      const parsed = JSON.parse(await file.text());
      state = window.NOOR_CMS.normalizeState(parsed.cms || parsed);
      selectedSectionId = 'home';
      editingBlockId = '';
      renderAll();
      markDraft();
      notify('تم استيراد النسخة كمسودة. راجعها ثم اضغط حفظ ونشر.');
    } catch (error) {
      notify('ملف النسخة غير صالح: ' + (error?.message || error));
    }
  }

  function resetState() {
    if (!confirm('إعادة إعدادات واجهة الموقع إلى الوضع الأصلي داخل المسودة؟')) return;
    state = window.NOOR_CMS.getDefaultState();
    selectedSectionId = 'home';
    editingBlockId = '';
    renderAll();
    markDraft();
    notify('تمت إعادة الإعدادات الأصلية داخل المسودة فقط');
  }

  function restoreHistory(index) {
    const entry = history[index];
    if (!entry) return;
    state = window.NOOR_CMS.normalizeState(entry);
    selectedSectionId = 'home';
    editingBlockId = '';
    renderAll();
    markDraft();
    notify('تمت استعادة النسخة كمسودة. اضغط حفظ ونشر لتطبيقها.');
  }

  window.NOOR_CMS_ADMIN = {load, getState:() => state};
  window.addEventListener('noor:admin-ready', load);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountUI, {once:true});
  else mountUI();
})();
