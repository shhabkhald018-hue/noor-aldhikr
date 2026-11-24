'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../assets/js/v883-ai-core.js');
const { REVIEWER_ID, REVIEWED_AT, trustedKnowledge, trustedLessons } = require('./fixtures/trusted-knowledge.js');

test('Arabic normalization removes diacritics and unifies search variants', () => {
  assert.equal(core.norm('آيَةٌ في الهُدَى'), 'ايه في الهدي');
  assert.equal(core.norm('إيمان'), core.norm('ايمان'));
  assert.equal(core.norm('رحمة'), core.norm('رحمه'));
});

test('fuzzy matching tolerates a small Arabic spelling error', () => {
  assert.ok(core.fuzzySimilarity('الوضوء', 'الوضو') >= 0.8);
  assert.ok(core.fuzzySimilarity('الايمان', 'الايمن') >= 0.7);
});

test('cloud knowledge accepts only active, published, sourced, reviewed rows', () => {
  const base = trustedKnowledge[0];
  const rows = [
    base,
    { ...base, id: 'draft', trust_tier: 'review' },
    { ...base, id: 'unpublished', review_status: 'draft' },
    { ...base, id: 'inactive', active: false },
    { ...base, id: 'missing-source', source_text: '' },
    { ...base, id: 'missing-reviewer', reviewed_by: null },
    { ...base, id: 'missing-review-date', reviewed_at: null }
  ];
  const entries = core.cloudEntries(rows);
  assert.deepEqual(entries.map(entry => entry.id), [base.id, 'missing-reviewer']);
});

test('legacy published knowledge may omit reviewer identity but not review date', () => {
  const legacy = { ...trustedKnowledge[0], id: 'legacy-reviewed', reviewed_by: null };
  const entries = core.cloudEntries([legacy]);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].id, legacy.id);
});

test('academy knowledge accepts only published, active, sourced, human-reviewed lessons', () => {
  const base = trustedLessons.creed[0];
  const lessons = {
    creed: [
      base,
      { ...base, id: 'draft', title: 'مسودة', review_status: 'draft' },
      { ...base, id: 'inactive', title: 'متوقف', active: false },
      { ...base, id: 'missing-source', title: 'بلا مصدر', reference_text: '' },
      { ...base, id: 'missing-reviewer', title: 'بلا مراجع', reviewed_by: null },
      { ...base, id: 'missing-review-date', title: 'بلا تاريخ', reviewed_at: null }
    ]
  };
  const entries = core.academyEntries(lessons);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].title, base.title);
});

test('verified questions resolve to the reviewed answer and exact source', () => {
  const entries = core.buildEntries({ cloud: trustedKnowledge });
  const cases = [
    ['ما اركان الايمان؟', 'صحيح مسلم'],
    ['ما فضل ايه الكرسي عند النوم؟', 'صحيح البخاري'],
    ['هل الشك وحده ينقض الوضو؟', 'صحيح مسلم']
  ];
  for (const [question, sourceFragment] of cases) {
    const result = core.answer(question, {}, entries, { threshold: 6.2 });
    assert.equal(result.found, true, question);
    assert.ok(result.answer.length > 20, question);
    assert.match(result.source, new RegExp(sourceFragment), question);
    assert.equal(result.origin, 'cloud', question);
  }
});

test('unrelated or ambiguous questions do not receive an invented answer', () => {
  const entries = core.buildEntries({ cloud: trustedKnowledge });
  const result = core.answer('ما سعر رحلة إلى كوكب المريخ؟', {}, entries, { threshold: 6.2 });
  assert.equal(result.found, false);
  assert.equal(result.answer, '');
  assert.equal(result.source, '');
});

test('empty and review-only knowledge cannot become answer material', () => {
  const entries = core.buildEntries({
    cloud: [{
      ...trustedKnowledge[0],
      id: 'review-only',
      trust_tier: 'review'
    }]
  });
  assert.equal(entries.length, 0);
});

test('fixture keeps reviewer identity and review date on every trusted row', () => {
  for (const row of trustedKnowledge) {
    assert.equal(row.reviewed_by, REVIEWER_ID);
    assert.equal(row.reviewed_at, REVIEWED_AT);
    assert.ok(row.source_text.trim());
    assert.ok(['primary', 'verified'].includes(row.trust_tier));
  }
});
