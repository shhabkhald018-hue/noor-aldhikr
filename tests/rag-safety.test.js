'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const ragFactory = require('../assets/js/v89-rag-orchestrator.js');
const v90RagFactory = require('../assets/js/v90-rag-orchestrator.js');
const v90Evidence = require('../assets/js/v90-evidence.js');

const TRUSTED_HIT = {
  id: 'trusted-1',
  title: 'جواب موثق',
  answer: 'هذه إجابة موثقة من المرجع المسترجع.',
  source: 'مرجع موثق، الجزء الأول، الصفحة 10.',
  source_text: 'مرجع موثق، الجزء الأول، الصفحة 10.',
  source_type: 'book',
  origin: 'cloud',
  trust_tier: 'verified',
  review_status: 'published',
  reviewed_by: '11111111-1111-4111-8111-111111111111',
  reviewed_at: '2026-11-23T00:00:00.000Z',
  category: 'عام',
  confidence: 12,
  strongMatch: true,
  matchCoverage: 1
};

function retrieverReturning(value) {
  return { ask: async () => value };
}

test('the refusal message remains exact when no trustworthy evidence exists', async () => {
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: false, hits: [], related: [] }),
    generationEnabled: () => false
  });
  const result = await rag.ask('سؤال غير موجود');
  assert.equal(result.found, false);
  assert.equal(result.answer, 'لم أجد إجابة موثوقة كافية لهذا السؤال حاليًا. يمكنك إعادة صياغة السؤال أو اختيار أحد الاقتراحات.');
  assert.deepEqual(result.sources, []);
});

test('a hit without a source is refused', async () => {
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: true, answer: 'لا ينبغي عرضه', hits: [{ ...TRUSTED_HIT, source: '', source_text: '' }] }),
    generationEnabled: () => false
  });
  const result = await rag.ask('سؤال');
  assert.equal(result.found, false);
  assert.equal(result.answer, ragFactory.NO_ANSWER);
});

test('a review-tier hit is refused even when it has text and a source', async () => {
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: true, answer: 'مسودة', hits: [{ ...TRUSTED_HIT, trust_tier: 'review' }] }),
    generationEnabled: () => false
  });
  const result = await rag.ask('سؤال');
  assert.equal(result.found, false);
  assert.equal(result.answer, ragFactory.NO_ANSWER);
});

test('an unreviewed local draft is refused by the final RAG gate', async () => {
  const localDraft = {
    ...TRUSTED_HIT,
    origin: 'local',
    trust_tier: 'curated',
    review_status: 'draft',
    reviewed_by: null,
    reviewed_at: null
  };
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: true, answer: localDraft.answer, hits: [localDraft] }),
    generationEnabled: () => false
  });
  const result = await rag.ask('مسودة محلية');
  assert.equal(result.found, false);
  assert.equal(result.answer, ragFactory.NO_ANSWER);
});

test('a human-reviewed local entry may pass without using generation', async () => {
  const reviewedLocal = { ...TRUSTED_HIT, origin: 'local', trust_tier: 'curated' };
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: true, answer: reviewedLocal.answer, hits: [reviewedLocal] }),
    generationEnabled: () => false
  });
  const result = await rag.ask('محتوى محلي مراجع');
  assert.equal(result.found, true);
  assert.equal(result.answer, reviewedLocal.answer);
  assert.equal(result.mode, 'fallback');
});

test('a legacy published cloud hit may omit reviewer identity when review date exists', async () => {
  const legacyHit = { ...TRUSTED_HIT, reviewed_by: null, review_status: 'published' };
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: true, answer: legacyHit.answer, hits: [legacyHit] }),
    generationEnabled: () => false
  });
  const result = await rag.ask('سؤال موثق قديم');
  assert.equal(result.found, true);
  assert.equal(result.answer, legacyHit.answer);
});

test('retrieval-only mode returns the reviewed text without generating new claims', async () => {
  let generated = false;
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: true, answer: TRUSTED_HIT.answer, hits: [TRUSTED_HIT] }),
    llm: {
      isSupported: () => true,
      generate: async () => { generated = true; return 'نص مولد'; }
    },
    generationEnabled: () => false
  });
  const result = await rag.ask('سؤال موثق');
  assert.equal(result.answer, TRUSTED_HIT.answer);
  assert.equal(result.mode, 'fallback');
  assert.equal(generated, false);
});

test('V90 retrieval-only returns the exact reviewed answer without composing new text', async () => {
  const rag = v90RagFactory.create({
    retriever: retrieverReturning({ found: true, answer: TRUSTED_HIT.answer, hits: [TRUSTED_HIT] }),
    model: { status: () => ({ loaded: false }) },
    evidence: v90Evidence,
    composer: { compose: () => 'نص جديد لا يجوز استخدامه في وضع البحث فقط.' }
  });
  const result = await rag.ask('سؤال موثق', { settings: { generationEnabled: false } });
  assert.equal(result.found, true);
  assert.equal(result.answer, TRUSTED_HIT.answer);
  assert.equal(result.mode, 'knowledge-fallback');
});

test('unsupported generated hadith attribution is rejected in favor of retrieved text', async () => {
  const rag = ragFactory.create({
    retriever: retrieverReturning({ found: true, answer: TRUSTED_HIT.answer, hits: [TRUSTED_HIT] }),
    llm: {
      isSupported: () => true,
      status: () => ({ model: 'fixture-model' }),
      generate: async () => 'رواه البخاري، وهذه نسبة غير موجودة في المصدر.'
    },
    generationEnabled: () => true
  });
  const result = await rag.ask('سؤال موثق');
  assert.equal(result.mode, 'fallback');
  assert.equal(result.answer, TRUSTED_HIT.answer);
  assert.equal(result.guardRejected, true);
  assert.ok(result.guardClaims.includes('UNSUPPORTED_BUKHARI'));
});

test('grounded prompt forbids inventing religious citations', () => {
  const messages = ragFactory.buildGroundedPrompt('ما الجواب؟', [TRUSTED_HIT], { page: 'fiqh' });
  assert.equal(messages.length, 2);
  assert.match(messages[0].content, /لا تضف آية أو حديثًا أو قول عالم غير موجود في السياق/);
  assert.match(messages[1].content, /مرجع موثق/);
});
