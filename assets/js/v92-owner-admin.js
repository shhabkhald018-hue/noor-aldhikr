'use strict';

(() => {
  const $ = id => document.getElementById(id);
  let sb = null;
  let ownerId = '';
  let knowledgeRows = [];

  const arError = error => {
    console.error('[Noor V92 owner admin]', error);
    return window.NOOR_ERROR_HANDLER?.toArabic?.(
      error,
      'تعذر تنفيذ العملية الآن. راجع سجل المتصفح للتفاصيل التقنية ثم أعد المحاولة.'
    ) || 'تعذر تنفيذ العملية الآن. حاول مجددًا.';
  };

  const setStatus = (id, value, ok = true) => {
    const node = $(id);
    if (!node) return;
    node.textContent = value || '';
    node.className = ok ? 'ok' : 'error';
  };

  const parseKeywords = value => String(value || '')
    .split(/[،,\n]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 30);

  const createButton = (label, className, onClick) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn ${className}`;
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  };

  function renderTable(host, headers, rows, emptyText) {
    host.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = emptyText;
      host.appendChild(empty);
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'tablewrap';
    const table = document.createElement('table');
    table.className = 'tbl';
    const head = document.createElement('tr');
    headers.forEach(label => {
      const th = document.createElement('th');
      th.textContent = label;
      head.appendChild(th);
    });
    table.appendChild(head);
    rows.forEach(cells => {
      const tr = document.createElement('tr');
      cells.forEach(cell => {
        const td = document.createElement('td');
        if (cell instanceof Node) td.appendChild(cell);
        else td.textContent = String(cell ?? '—');
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    wrap.appendChild(table);
    host.appendChild(wrap);
  }

  function mountPanels() {
    const kb = $('knowledgeBaseV92');
    if (kb && !kb.dataset.ready) {
      kb.dataset.ready = '1';
      kb.innerHTML = `<div class="cardx"><div class="toolbar"><div><h2>قاعدة المعرفة</h2><p class="muted">إدارة جدول knowledge_base المستخدم في البحث المحلي المجاني.</p></div><button class="btn ghost" id="v92KbReload" type="button">تحديث</button></div><form id="v92KbForm"><input id="v92KbId" type="hidden"><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:14px"><div class="field"><label for="v92KbQuestion">السؤال</label><input id="v92KbQuestion" maxlength="500" required></div><div class="field"><label for="v92KbCategory">التصنيف</label><input id="v92KbCategory" maxlength="100" value="عام"></div><div class="field" style="grid-column:1/-1"><label for="v92KbAnswer">الإجابة الموثوقة</label><textarea id="v92KbAnswer" rows="6" maxlength="12000" required></textarea></div><div class="field" style="grid-column:1/-1"><label for="v92KbKeywords">الكلمات المفتاحية</label><input id="v92KbKeywords" placeholder="افصل الكلمات بفاصلة"></div><div class="field"><label for="v92KbPriority">الأولوية</label><input id="v92KbPriority" type="number" min="0" max="1000" value="100"></div><label class="field"><span>الحالة</span><span><input id="v92KbActive" type="checkbox" checked> نشط</span></label></div><div class="toolbar" style="justify-content:flex-start"><button class="btn primary" type="submit">حفظ</button><button class="btn ghost" id="v92KbCancel" type="button">إلغاء التعديل</button><span id="v92KbStatus" class="ok"></span></div></form><div id="v92KbTable"></div></div>`;
    }

    const notifications = $('notificationsV92');
    if (notifications && !notifications.dataset.ready) {
      notifications.dataset.ready = '1';
      notifications.innerHTML = `<div class="cardx"><div class="toolbar"><div><h2>الإشعارات</h2><p class="muted">أرسل إشعارًا عامًا أو لمستخدم محدد.</p></div><button class="btn ghost" id="v92NotificationsReload" type="button">تحديث</button></div><form id="v92NotificationForm"><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:14px"><div class="field"><label for="v92NotificationTitle">العنوان</label><input id="v92NotificationTitle" maxlength="180" required></div><div class="field"><label for="v92NotificationUser">معرّف المستخدم (اختياري)</label><input id="v92NotificationUser" inputmode="text" placeholder="اتركه فارغًا للإشعار العام"></div><div class="field" style="grid-column:1/-1"><label for="v92NotificationBody">النص</label><textarea id="v92NotificationBody" rows="4" maxlength="2000" required></textarea></div></div><button class="btn primary" type="submit">نشر الإشعار</button><span id="v92NotificationStatus" class="ok"></span></form><div id="v92NotificationsTable"></div></div>`;
    }

    const activity = $('activityV92');
    if (activity && !activity.dataset.ready) {
      activity.dataset.ready = '1';
      activity.innerHTML = `<div class="cardx"><div class="toolbar"><div><h2>سجل النشاط</h2><p class="muted">آخر العمليات الإدارية المسجلة دون محتوى حساس.</p></div><button class="btn ghost" id="v92ActivityReload" type="button">تحديث</button></div><div id="v92ActivityTable"></div></div>`;
    }

    const security = $('securityV92');
    if (security && !security.dataset.ready) {
      security.dataset.ready = '1';
      security.innerHTML = `<div class="cardx"><div class="toolbar"><div><h2>مركز الأمان</h2><p class="muted">فحص الجلسة وصلاحية المالك وسياسات RLS من الاتصال الحالي.</p></div><button class="btn primary" id="v92SecurityRun" type="button">تشغيل الفحص</button></div><div id="v92SecurityResult" class="muted" style="margin-top:16px">لم يتم تشغيل الفحص بعد.</div></div>`;
    }

    const cache = $('cacheV92');
    if (cache && !cache.dataset.ready) {
      cache.dataset.ready = '1';
      cache.innerHTML = `<div class="cardx"><h2>إدارة الكاش</h2><p class="muted">الأوامر التالية تخص كاش نور الذكر فقط ولا تمس بيانات المواقع الأخرى أو جلسة Supabase.</p><div class="toolbar" style="justify-content:flex-start"><button class="btn ghost" id="v92CacheUpdate" type="button">فحص تحديث Service Worker</button><button class="btn danger" id="v92CacheClear" type="button">تنظيف كاش نور الذكر</button></div><div id="v92CacheStatus" class="muted" style="margin-top:14px"></div></div>`;
    }

    const maintenance = $('maintenanceV92');
    if (maintenance && !maintenance.dataset.ready) {
      maintenance.dataset.ready = '1';
      maintenance.innerHTML = `<div class="cardx"><div class="toolbar"><div><h2>الصيانة</h2><p class="muted">عند التشغيل تظهر الرسالة العامة للمستخدمين، وتبقى معاينة المالك متاحة.</p></div><button class="btn ghost" id="v92MaintenanceReload" type="button">تحديث</button></div><form id="v92MaintenanceForm"><label class="field"><span><input id="v92MaintenanceEnabled" type="checkbox"> تشغيل وضع الصيانة</span></label><div class="field"><label for="v92MaintenanceMessage">رسالة الصيانة</label><textarea id="v92MaintenanceMessage" rows="4" maxlength="500"></textarea></div><button class="btn primary" type="submit">حفظ حالة الصيانة</button><span id="v92MaintenanceStatus" class="ok"></span></form></div>`;
    }

    const versions = $('versionsV92');
    if (versions && !versions.dataset.ready) {
      versions.dataset.ready = '1';
      versions.innerHTML = `<div class="cardx"><div class="toolbar"><div><h2>الإصدارات</h2><p class="muted">سجل الإصدارات المنشورة وحدد الإصدار النشط.</p></div><button class="btn ghost" id="v92VersionsReload" type="button">تحديث</button></div><form id="v92VersionForm"><div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:14px"><div class="field"><label for="v92VersionNumber">الرقم</label><input id="v92VersionNumber" value="92.0.2" required></div><div class="field"><label for="v92VersionLabel">الاسم</label><input id="v92VersionLabel" value="V92.0 PRO FREE AI" required></div><div class="field" style="grid-column:1/-1"><label for="v92VersionNotes">ملاحظات</label><textarea id="v92VersionNotes" rows="3"></textarea></div><label class="field"><span><input id="v92VersionActive" type="checkbox" checked> الإصدار النشط</span></label></div><button class="btn primary" type="submit">حفظ الإصدار</button><span id="v92VersionStatus" class="ok"></span></form><div id="v92VersionsTable"></div></div>`;
    }
  }

  function resetKnowledgeForm() {
    $('v92KbForm')?.reset();
    if ($('v92KbId')) $('v92KbId').value = '';
    if ($('v92KbCategory')) $('v92KbCategory').value = 'عام';
    if ($('v92KbPriority')) $('v92KbPriority').value = '100';
    if ($('v92KbActive')) $('v92KbActive').checked = true;
    setStatus('v92KbStatus', '');
  }

  async function loadKnowledge() {
    const host = $('v92KbTable');
    if (!host || !sb) return;
    host.textContent = 'جاري تحميل قاعدة المعرفة…';
    const { data, error } = await sb.from('knowledge_base')
      .select('id,question,answer,keywords,category,priority,active,updated_at')
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(500);
    if (error) {
      host.textContent = arError(error);
      return;
    }
    knowledgeRows = data || [];
    const rows = knowledgeRows.map(item => {
      const actions = document.createElement('div');
      actions.className = 'actions';
      actions.append(
        createButton('تعديل', 'ghost', () => editKnowledge(item.id)),
        createButton(item.active ? 'إيقاف' : 'تفعيل', 'ghost', () => toggleKnowledge(item)),
        createButton('حذف', 'danger', () => deleteKnowledge(item.id))
      );
      return [item.question, item.category, item.priority, item.active ? 'نشط' : 'متوقف', actions];
    });
    renderTable(host, ['السؤال', 'التصنيف', 'الأولوية', 'الحالة', 'الإجراءات'], rows, 'لا توجد عناصر في قاعدة المعرفة.');
  }

  function editKnowledge(id) {
    const item = knowledgeRows.find(row => row.id === id);
    if (!item) return;
    $('v92KbId').value = item.id;
    $('v92KbQuestion').value = item.question || '';
    $('v92KbAnswer').value = item.answer || '';
    $('v92KbKeywords').value = (item.keywords || []).join('، ');
    $('v92KbCategory').value = item.category || 'عام';
    $('v92KbPriority').value = String(item.priority ?? 100);
    $('v92KbActive').checked = item.active !== false;
    setStatus('v92KbStatus', 'يتم الآن تعديل العنصر المحدد.');
    $('v92KbQuestion').focus();
  }

  async function saveKnowledge(event) {
    event.preventDefault();
    const id = $('v92KbId').value;
    const row = {
      question: $('v92KbQuestion').value.trim(),
      answer: $('v92KbAnswer').value.trim(),
      keywords: parseKeywords($('v92KbKeywords').value),
      category: $('v92KbCategory').value.trim() || 'عام',
      priority: Math.max(0, Math.min(1000, Number($('v92KbPriority').value) || 100)),
      active: $('v92KbActive').checked
    };
    if (!row.question || !row.answer) {
      setStatus('v92KbStatus', 'السؤال والإجابة مطلوبان.', false);
      return;
    }
    setStatus('v92KbStatus', 'جاري الحفظ…');
    const query = id
      ? sb.from('knowledge_base').update(row).eq('id', id)
      : sb.from('knowledge_base').insert(row);
    const { error } = await query;
    if (error) {
      setStatus('v92KbStatus', arError(error), false);
      return;
    }
    resetKnowledgeForm();
    setStatus('v92KbStatus', 'تم حفظ عنصر المعرفة.');
    await loadKnowledge();
    window.NOOR_FREE_AI_REFRESH?.();
  }

  async function toggleKnowledge(item) {
    const { error } = await sb.from('knowledge_base').update({ active: !item.active }).eq('id', item.id);
    if (error) alert(arError(error));
    else await loadKnowledge();
  }

  async function deleteKnowledge(id) {
    if (!confirm('حذف هذا السؤال وإجابته من قاعدة المعرفة؟')) return;
    const { error } = await sb.from('knowledge_base').delete().eq('id', id);
    if (error) alert(arError(error));
    else await loadKnowledge();
  }

  async function loadNotifications() {
    const host = $('v92NotificationsTable');
    if (!host || !sb) return;
    host.textContent = 'جاري تحميل الإشعارات…';
    const { data, error } = await sb.from('notifications')
      .select('id,user_id,title,body,active,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) {
      host.textContent = arError(error);
      return;
    }
    const rows = (data || []).map(item => {
      const actions = document.createElement('div');
      actions.append(
        createButton(item.active ? 'إيقاف' : 'تفعيل', 'ghost', async () => {
          const result = await sb.from('notifications').update({ active: !item.active }).eq('id', item.id);
          if (result.error) alert(arError(result.error)); else loadNotifications();
        }),
        document.createTextNode(' '),
        createButton('حذف', 'danger', async () => {
          if (!confirm('حذف هذا الإشعار؟')) return;
          const result = await sb.from('notifications').delete().eq('id', item.id);
          if (result.error) alert(arError(result.error)); else loadNotifications();
        })
      );
      return [item.title, item.user_id || 'عام', item.active ? 'نشط' : 'متوقف', new Date(item.created_at).toLocaleString('ar-SA'), actions];
    });
    renderTable(host, ['العنوان', 'المستلم', 'الحالة', 'التاريخ', 'الإجراءات'], rows, 'لا توجد إشعارات.');
  }

  async function saveNotification(event) {
    event.preventDefault();
    const userId = $('v92NotificationUser').value.trim();
    const row = {
      user_id: userId || null,
      title: $('v92NotificationTitle').value.trim(),
      body: $('v92NotificationBody').value.trim(),
      active: true,
      created_by: ownerId || null
    };
    const { error } = await sb.from('notifications').insert(row);
    if (error) {
      setStatus('v92NotificationStatus', arError(error), false);
      return;
    }
    event.currentTarget.reset();
    setStatus('v92NotificationStatus', 'تم نشر الإشعار.');
    await loadNotifications();
  }

  async function loadActivity() {
    const host = $('v92ActivityTable');
    if (!host || !sb) return;
    host.textContent = 'جاري تحميل السجل…';
    const { data, error } = await sb.from('activity_logs')
      .select('id,actor_id,action,entity_type,entity_id,created_at')
      .order('created_at', { ascending: false })
      .limit(150);
    if (error) {
      host.textContent = arError(error);
      return;
    }
    const rows = (data || []).map(item => [
      item.action,
      item.entity_type || '—',
      item.entity_id || '—',
      item.actor_id || 'النظام',
      new Date(item.created_at).toLocaleString('ar-SA')
    ]);
    renderTable(host, ['العملية', 'النوع', 'العنصر', 'المنفذ', 'التاريخ'], rows, 'لا توجد عمليات مسجلة بعد.');
  }

  async function runSecurityCheck() {
    const host = $('v92SecurityResult');
    if (!host || !sb) return;
    host.textContent = 'جاري فحص الجلسة والصلاحيات…';
    try {
      const [userResult, ownerResult, rlsResult] = await Promise.all([
        sb.auth.getUser(),
        sb.rpc('is_owner'),
        sb.rpc('owner_rls_diagnostics')
      ]);
      const errors = [userResult.error, ownerResult.error, rlsResult.error].filter(Boolean);
      if (errors.length) throw errors[0];
      const lines = [
        `الجلسة: ${userResult.data?.user ? 'صالحة' : 'غير متاحة'}`,
        `صلاحية المالك: ${ownerResult.data === true ? 'مؤكدة من قاعدة البيانات' : 'غير مؤكدة'}`,
        `تشخيص RLS: ${rlsResult.data ? 'اكتمل' : 'لم يرجع نتيجة'}`,
        'المفاتيح الحساسة: غير مستخدمة في الواجهة'
      ];
      host.replaceChildren();
      const list = document.createElement('ul');
      lines.forEach(line => {
        const item = document.createElement('li');
        item.textContent = line;
        list.appendChild(item);
      });
      host.className = ownerResult.data === true ? 'ok' : 'error';
      host.appendChild(list);
    } catch (error) {
      host.className = 'error';
      host.textContent = arError(error);
    }
  }

  async function updateServiceWorker() {
    setStatus('v92CacheStatus', 'جاري فحص التحديث…');
    try {
      if (!('serviceWorker' in navigator)) throw new Error('SERVICE_WORKER_UNSUPPORTED');
      const registration = await navigator.serviceWorker.getRegistration('./');
      if (!registration) throw new Error('SERVICE_WORKER_NOT_REGISTERED');
      await registration.update();
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      setStatus('v92CacheStatus', 'تم فحص التحديث. أعد تحميل الصفحة إذا ظهر إصدار جديد.');
    } catch (error) {
      setStatus('v92CacheStatus', arError(error), false);
    }
  }

  async function clearNoorCache() {
    if (!confirm('تنظيف ملفات كاش نور الذكر فقط؟ لن تُحذف الحسابات أو بيانات Supabase.')) return;
    setStatus('v92CacheStatus', 'جاري تنظيف الكاش…');
    try {
      const prefix = window.NOOR_VERSION?.cachePrefix || 'noor-aldhikr-';
      const keys = await caches.keys();
      const owned = keys.filter(key => key.startsWith(prefix));
      await Promise.all(owned.map(key => caches.delete(key)));
      const registration = await navigator.serviceWorker?.getRegistration?.('./');
      registration?.active?.postMessage({ type: 'CLEAR_CACHES' });
      setStatus('v92CacheStatus', `تم حذف ${owned.length} مخزن كاش تابع لنور الذكر. بيانات الحساب لم تتغير.`);
    } catch (error) {
      setStatus('v92CacheStatus', arError(error), false);
    }
  }

  async function loadMaintenance() {
    if (!sb) return;
    const { data, error } = await sb.from('ui_settings')
      .select('maintenance_mode,maintenance_message')
      .eq('id', true)
      .maybeSingle();
    if (error) {
      setStatus('v92MaintenanceStatus', arError(error), false);
      return;
    }
    $('v92MaintenanceEnabled').checked = data?.maintenance_mode === true;
    $('v92MaintenanceMessage').value = data?.maintenance_message || 'الموقع تحت التحديث. نعود إليك قريبًا.';
    setStatus('v92MaintenanceStatus', 'تم تحميل حالة الصيانة.');
  }

  async function saveMaintenance(event) {
    event.preventDefault();
    const row = {
      id: true,
      maintenance_mode: $('v92MaintenanceEnabled').checked,
      maintenance_message: $('v92MaintenanceMessage').value.trim() || 'الموقع تحت التحديث.',
      updated_by: ownerId || null
    };
    const { error } = await sb.from('ui_settings').upsert(row);
    setStatus('v92MaintenanceStatus', error ? arError(error) : 'تم حفظ حالة الصيانة.', !error);
  }

  async function loadVersions() {
    const host = $('v92VersionsTable');
    if (!host || !sb) return;
    host.textContent = 'جاري تحميل الإصدارات…';
    const { data, error } = await sb.from('app_versions')
      .select('version,label,notes,active,released_at')
      .order('released_at', { ascending: false });
    if (error) {
      host.textContent = arError(error);
      return;
    }
    const rows = (data || []).map(item => {
      const action = item.active
        ? document.createTextNode('النشط الآن')
        : createButton('تفعيل', 'ghost', async () => {
          const off = await sb.from('app_versions').update({ active: false }).eq('active', true);
          if (off.error) return alert(arError(off.error));
          const on = await sb.from('app_versions').update({ active: true }).eq('version', item.version);
          if (on.error) alert(arError(on.error)); else loadVersions();
        });
      return [item.version, item.label, item.active ? 'نشط' : 'مؤرشف', new Date(item.released_at).toLocaleDateString('ar-SA'), action];
    });
    renderTable(host, ['الرقم', 'الاسم', 'الحالة', 'تاريخ النشر', 'الإجراء'], rows, 'لا يوجد سجل إصدارات.');
  }

  async function saveVersion(event) {
    event.preventDefault();
    const row = {
      version: $('v92VersionNumber').value.trim(),
      label: $('v92VersionLabel').value.trim(),
      notes: $('v92VersionNotes').value.trim(),
      active: $('v92VersionActive').checked
    };
    if (row.active) {
      const off = await sb.from('app_versions').update({ active: false }).eq('active', true);
      if (off.error) {
        setStatus('v92VersionStatus', arError(off.error), false);
        return;
      }
    }
    const { error } = await sb.from('app_versions').upsert(row, { onConflict: 'version' });
    setStatus('v92VersionStatus', error ? arError(error) : 'تم حفظ الإصدار.', !error);
    if (!error) await loadVersions();
  }

  function bind() {
    $('v92KbForm')?.addEventListener('submit', saveKnowledge);
    $('v92KbCancel')?.addEventListener('click', resetKnowledgeForm);
    $('v92KbReload')?.addEventListener('click', loadKnowledge);
    $('v92NotificationForm')?.addEventListener('submit', saveNotification);
    $('v92NotificationsReload')?.addEventListener('click', loadNotifications);
    $('v92ActivityReload')?.addEventListener('click', loadActivity);
    $('v92SecurityRun')?.addEventListener('click', runSecurityCheck);
    $('v92CacheUpdate')?.addEventListener('click', updateServiceWorker);
    $('v92CacheClear')?.addEventListener('click', clearNoorCache);
    $('v92MaintenanceReload')?.addEventListener('click', loadMaintenance);
    $('v92MaintenanceForm')?.addEventListener('submit', saveMaintenance);
    $('v92VersionsReload')?.addEventListener('click', loadVersions);
    $('v92VersionForm')?.addEventListener('submit', saveVersion);

    const loaders = {
      knowledgeBaseV92: loadKnowledge,
      notificationsV92: loadNotifications,
      activityV92: loadActivity,
      securityV92: runSecurityCheck,
      maintenanceV92: loadMaintenance,
      versionsV92: loadVersions
    };
    Object.entries(loaders).forEach(([tab, loader]) => {
      document.querySelectorAll(`[data-tab="${tab}"]`).forEach(button => {
        button.addEventListener('click', () => loader());
      });
    });
  }

  function ready(event) {
    ownerId = event?.detail?.user?.id || window.NOOR_OWNER_ID || '';
    sb = window.NOOR_GET_SUPABASE_CLIENT?.() || window.supabaseClient;
    if (!sb) return;
    mountPanels();
    bind();
  }

  window.addEventListener('noor:admin-ready', ready);
  if (window.NOOR_OWNER_ID) ready({ detail: { user: { id: window.NOOR_OWNER_ID } } });
})();
