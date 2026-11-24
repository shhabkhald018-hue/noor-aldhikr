'use strict';

const REVIEWER_ID = '11111111-1111-4111-8111-111111111111';
const REVIEWED_AT = '2026-11-23T00:00:00.000Z';

const trustedKnowledge = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    question: 'ما أركان الإيمان؟',
    title: 'ما أركان الإيمان؟',
    answer: 'أركان الإيمان ستة: الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره.',
    keywords: ['أركان الإيمان', 'مراتب الإيمان'],
    category: 'العقيدة',
    source_text: 'صحيح مسلم، حديث جبريل، كتاب الإيمان.',
    source_type: 'sunnah',
    source_label: 'حديث جبريل',
    trust_tier: 'primary',
    review_status: 'published',
    priority: 900,
    active: true,
    reviewed_by: REVIEWER_ID,
    reviewed_at: REVIEWED_AT
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    question: 'ما فضل آية الكرسي عند النوم؟',
    title: 'ما فضل آية الكرسي عند النوم؟',
    answer: 'ورد أن من قرأ آية الكرسي عند النوم لا يزال عليه من الله حافظ حتى يصبح.',
    keywords: ['آية الكرسي عند النوم', 'فضل آية الكرسي'],
    category: 'الأذكار',
    source_text: 'صحيح البخاري، كتاب الوكالة، قصة أبي هريرة رضي الله عنه.',
    source_type: 'sunnah',
    source_label: 'صحيح البخاري',
    trust_tier: 'primary',
    review_status: 'published',
    priority: 880,
    active: true,
    reviewed_by: REVIEWER_ID,
    reviewed_at: REVIEWED_AT
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    question: 'هل الشك وحده ينقض الوضوء؟',
    title: 'هل الشك وحده ينقض الوضوء؟',
    answer: 'من تيقن الطهارة ثم شك في الحدث يبقى على طهارته حتى يتيقن من الحدث.',
    keywords: ['الشك في الوضوء', 'اليقين لا يزول بالشك'],
    category: 'الفقه',
    source_text: 'صحيح مسلم، كتاب الحيض، باب الدليل على أن من تيقن الطهارة ثم شك في الحدث فهو على طهارته.',
    source_type: 'sunnah',
    source_label: 'صحيح مسلم',
    trust_tier: 'verified',
    review_status: 'published',
    priority: 850,
    active: true,
    reviewed_by: REVIEWER_ID,
    reviewed_at: REVIEWED_AT
  }
];

const trustedLessons = {
  creed: [
    {
      id: '00000000-0000-4000-8000-000000000101',
      title: 'أركان الإيمان',
      summary: 'تعريف موجز بأركان الإيمان الستة.',
      reference_text: 'صحيح مسلم، حديث جبريل، كتاب الإيمان.',
      review_status: 'published',
      active: true,
      reviewed_by: REVIEWER_ID,
      reviewed_at: REVIEWED_AT,
      sort_order: 1
    }
  ]
};

module.exports = { REVIEWER_ID, REVIEWED_AT, trustedKnowledge, trustedLessons };
