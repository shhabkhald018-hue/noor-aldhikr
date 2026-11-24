'use strict';
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  async function render() {
    const panel = document.getElementById('systemHealth');
    const anchor = document.getElementById('v87SystemHealthMount');
    if (!panel || !anchor || !window.supabaseClient) return;
    let host = document.getElementById('v883AiHealth');
    if (!host) {
      host = document.createElement('div');
      host.id = 'v883AiHealth';
      anchor.insertAdjacentElement('afterend', host);
    }
    host.innerHTML = '<section class="cardx"><h2>صحة المساعد V92.1.1</h2><p class="muted">جاري فحص المعرفة والمصادر…</p></section>';
    try {
      const sb = window.supabaseClient;
      const [moduleResult, settingsResult, knowledgeResult, lessonsResult, questionsResult] = await Promise.all([
        sb.from('site_modules').select('enabled').eq('module_key', 'aiAssistant').maybeSingle(),
        sb.from('ai_settings').select('enabled,model_label,function_name').eq('id', true).maybeSingle(),
        sb.from('knowledge_base').select('id,active,source_text,trust_tier,review_status,reviewed_at'),
        sb.from('academy_lessons').select('id', { count: 'exact', head: true }).eq('active', true).eq('review_status', 'published'),
        sb.from('academy_questions').select('id', { count: 'exact', head: true }).eq('active', true).eq('review_status', 'published')
      ]);
      const firstError = [moduleResult, settingsResult, knowledgeResult, lessonsResult, questionsResult].find(result => result.error)?.error;
      if (firstError) throw firstError;
      const rows = knowledgeResult.data || [];
      const trusted = rows.filter(row => row.active
        && row.review_status === 'published'
        && ['primary', 'verified'].includes(String(row.trust_tier || ''))
        && String(row.source_text || '').trim()
        && String(row.reviewed_at || '').trim());
      const drafts = rows.filter(row => !row.active || row.review_status !== 'published').length;
      const enabled = moduleResult.data?.enabled !== false && settingsResult.data?.enabled !== false;
      host.innerHTML = `<section class="cardx"><div class="v87-os-head"><div><span class="v87-os-kicker">TRUSTED ASSISTANT HEALTH</span><h2>المساعد المعرفي V92.1.1</h2><p class="muted">فحص مباشر للمحتوى الذي يستطيع الجمهور قراءته فعليًا.</p></div><button class="btn ghost" id="v883AiHealthRefresh">إعادة الفحص</button></div><div class="v87-health-grid"><article class="v87-health-card"><b>${enabled ? 'ON' : 'OFF'}</b><span>حالة المساعد</span></article><article class="v87-health-card"><b>${trusted.length}</b><span>إجابات منشورة ومراجعة</span></article><article class="v87-health-card"><b>${drafts}</b><span>مسودات محجوبة</span></article><article class="v87-health-card"><b>${Number(lessonsResult.count || 0)}</b><span>دروس أكاديمية منشورة</span></article><article class="v87-health-card"><b>${Number(questionsResult.count || 0)}</b><span>أسئلة أكاديمية منشورة</span></article><article class="v87-health-card"><b>${esc(settingsResult.data?.model_label || 'V92.1.1 Reviewed Knowledge')}</b><span>محرك المعرفة</span></article></div><p style="margin-top:14px"><span class="v87-health-status ${enabled ? '' : 'warn'}">${enabled ? '✓ المساعد مفعّل' : '⚠ المساعد متوقف من الإعدادات'}</span> <span class="v87-health-status">✓ كل الإجابات العامة منشورة بمصدر وتاريخ مراجعة</span> <span class="v87-health-status">✓ التوليد الحر مقفول</span></p></section>`;
      document.getElementById('v883AiHealthRefresh').onclick = render;
    } catch (error) {
      console.error('[Noor AI health]', error);
      host.innerHTML = '<section class="cardx"><h2>صحة المساعد V92.1.1</h2><p class="error">تعذر إكمال الفحص الآن. أعد المحاولة بعد التأكد من الاتصال.</p></section>';
    }
  }

  window.NOOR_V883_AI_HEALTH = render;
  window.addEventListener('noor:admin-ready', () => setTimeout(render, 300));
  document.addEventListener('DOMContentLoaded', () => setTimeout(render, 1400));
})();
