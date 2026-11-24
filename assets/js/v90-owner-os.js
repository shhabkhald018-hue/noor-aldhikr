'use strict';
(() => {
  const KEYS = ['v90_max_evidence', 'v90_allowed_source_types', 'v90_generation_enabled'];
  const REFUSAL = 'لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.';
  let sb = null;
  let ownerId = null;
  let retriever = null;

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  async function settings() {
    const output = {
      v90_max_evidence: '5',
      v90_allowed_source_types: 'quran,sunnah,scholar,book,owner,academy,other',
      v90_generation_enabled: 'false'
    };
    try {
      const { data, error } = await sb.from('app_settings').select('key,value').in('key', KEYS);
      if (!error) for (const row of data || []) output[row.key] = String(row.value);
    } catch (_) {}
    output.v90_generation_enabled = 'false';
    return output;
  }

  async function saveRows(rows) {
    const payload = rows.map(([key, value]) => ({ key, value: String(value), public: true, updated_by: ownerId }));
    const { error } = await sb.from('app_settings').upsert(payload);
    if (error) throw error;
  }

  async function buildEntries() {
    const { data, error } = await sb.from('knowledge_base')
      .select('id,question,answer,keywords,category,source_text,source_type,source_label,trust_tier,priority,active,review_status,reviewed_at,reviewed_by')
      .eq('active', true)
      .eq('review_status', 'published')
      .in('trust_tier', ['primary', 'verified'])
      .not('reviewed_at', 'is', null)
      .neq('source_text', '')
      .limit(1000);
    if (error) throw error;
    const cloud = (data || []).map(row => ({
      ...row,
      title: row.question,
      knowledge_key: `knowledge-base-${row.id}`
    }));
    return window.NOOR_AI_CORE.buildEntries({ cloud, canonical: [], lessons: {}, fallback: [] });
  }

  function ensureEngine() {
    if (retriever) return;
    retriever = window.NOOR_V89_RETRIEVER_FACTORY.create({
      core: window.NOOR_AI_CORE,
      loadEntries: buildEntries,
      fetcher: window.fetch.bind(window)
    });
  }

  async function render() {
    const host = $('aiQualityV90');
    if (!host) return;
    const config = await settings();
    host.innerHTML = `<section class="cardx v90-quality"><div class="v90q-head"><div><span class="v90q-kicker">V92.1.1 TRUSTED CONTENT</span><h2>استوديو جودة المساعد</h2><p class="muted">اضبط ترتيب الأدلة واختبر الإجابة المنشورة نفسها. التوليد الحر مقفول لمنع إضافة معلومات غير موجودة في المرجع.</p></div><span class="v90q-badge">Retrieval only</span></div><form id="v90QualityForm" class="v90q-grid"><label><span>أقصى عدد للأدلة</span><input id="v90MaxEvidence" type="number" min="1" max="10" value="${esc(config.v90_max_evidence)}"></label><label class="v90q-check"><input type="checkbox" disabled> التوليد المحلي مقفول أمنيًا</label><fieldset class="v90q-models v90q-sources"><legend>أنواع المصادر المسموح بعرضها</legend>${[['quran','القرآن'],['sunnah','السنة/الحديث'],['scholar','العلماء'],['book','الكتب'],['owner','محتوى المالك'],['academy','الأكاديمية'],['other','مصادر أخرى موثقة']].map(([value,label]) => `<label><input type="checkbox" data-v90-source="${value}" ${String(config.v90_allowed_source_types).includes(value) ? 'checked' : ''}> ${label}</label>`).join('')}</fieldset><div class="v90q-actions"><button class="btn primary" type="submit">حفظ الإعدادات</button><span id="v90QualityMsg"></span></div></form><div class="v90q-lab"><h3>اختبار السؤال قبل النشر</h3><textarea id="v90LabQuestion" rows="3" placeholder="مثال: هل الشك ينقض الوضوء؟"></textarea><div class="v90q-actions"><button class="btn ghost" id="v90TestRetrieve" type="button">اختبار الإجابة الموثقة</button></div><div class="v90q-preview"><div><h4>الإجابة</h4><pre id="v90LabAnswer">—</pre></div><div><h4>الأدلة المرتبة</h4><div id="v90LabEvidence">—</div></div></div></div></section>`;
    ensureEngine();
    $('v90QualityForm').onsubmit = save;
    $('v90TestRetrieve').onclick = runTest;
  }

  async function save(event) {
    event.preventDefault();
    const sourceTypes = [...document.querySelectorAll('[data-v90-source]:checked')].map(node => node.dataset.v90Source);
    const message = $('v90QualityMsg');
    try {
      message.textContent = 'جاري الحفظ…';
      if (!sourceTypes.length) throw new Error('اختر نوع مصدر واحدًا على الأقل.');
      await saveRows([
        ['v90_max_evidence', Math.max(1, Math.min(10, Number($('v90MaxEvidence').value) || 5))],
        ['v90_allowed_source_types', sourceTypes.join(',')],
        ['v90_generation_enabled', false]
      ]);
      message.textContent = 'تم حفظ إعدادات البحث الموثق.';
    } catch (error) {
      console.error('[Noor AI quality]', error);
      message.textContent = 'تعذر حفظ الإعدادات الآن.';
    }
  }

  async function runTest() {
    const question = $('v90LabQuestion').value.trim();
    if (!question) return;
    const answer = $('v90LabAnswer');
    const evidenceHost = $('v90LabEvidence');
    answer.textContent = 'جاري البحث…';
    try {
      const config = await settings();
      ensureEngine();
      const result = await retriever.ask(question, { page: 'owner-test', title: 'AI Quality Studio' });
      const ranked = window.NOOR_V90_EVIDENCE.rankEvidence(result.hits || [], {
        maxEvidence: Number(config.v90_max_evidence) || 5,
        allowedSourceTypes: String(config.v90_allowed_source_types || '').split(',').filter(Boolean)
      });
      evidenceHost.innerHTML = ranked.map((hit, index) => `<article><b>${index + 1}. ${esc(hit.title)}</b><small>${esc(hit.source || '')}</small><em>${esc(hit.trust_tier)} · ${esc(hit.source_type)} · ${esc(hit.evidenceScore)}</em></article>`).join('') || 'لا توجد أدلة كافية.';
      answer.textContent = ranked[0]?.answer || REFUSAL;
    } catch (error) {
      console.error('[Noor AI quality test]', error);
      answer.textContent = 'تعذر تشغيل الاختبار الآن.';
      evidenceHost.textContent = 'تعذر تحميل الأدلة.';
    }
  }

  function boot(event) {
    sb = window.supabaseClient;
    ownerId = window.NOOR_OWNER_ID || event?.detail?.user?.id;
    if (!sb || !ownerId) return;
    render();
    document.querySelectorAll('[data-tab="aiQualityV90"]').forEach(button => button.addEventListener('click', render));
  }

  window.addEventListener('noor:admin-ready', boot);
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    if (window.supabaseClient && window.NOOR_OWNER_ID) boot();
  }, 1600));
  window.NOOR_V90_OWNER = { render };
})();
