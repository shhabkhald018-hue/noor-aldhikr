'use strict';

(() => {
  const TOPICS = [
    {
      id: 'definition', icon: '📖', title: 'ما السحر؟', summary: 'تعريف منضبط يثبت ما أثبته الشرع دون تهويل أو ادعاء معرفة الغيب.',
      sections: [
        ['المعنى العام', 'السحر اسم لأعمال محرمة تقوم على الخداع أو الاستعانة بوسائل باطلة لإيقاع الضرر، وقد ورد ذكره والتحذير منه في القرآن والسنة.'],
        ['الاعتقاد الصحيح', 'لا يقع شيء خارج قدر الله، ولا يملك الساحر نفعًا أو ضرًا مستقلًا. الواجب التوكل على الله مع أخذ الأسباب المشروعة.'],
        ['حدود التشخيص', 'لا يجوز الجزم بوجود السحر اعتمادًا على عرض عام أو حلم أو كلام شخص غير مختص؛ فكثير من الأعراض لها أسباب صحية أو نفسية أو اجتماعية معروفة.']
      ],
      source: 'القرآن الكريم: البقرة 102، يونس 81–82، طه 69.'
    },
    {
      id: 'evidence', icon: '🧾', title: 'الأدلة الشرعية', summary: 'مواضع قرآنية وأحاديث صحيحة تتعلق بالسحر والرقية المشروعة.',
      sections: [
        ['سورة البقرة', 'تذكر الآية 102 فتنة السحر وتقرر أن الضرر لا يقع إلا بإذن الله، وتحذر من تعلم ما يضر ولا ينفع.'],
        ['قصة موسى عليه السلام', 'ورد إبطال ما صنعه السحرة في الأعراف 117–122، ويونس 81–82، وطه 69، وفيها تقرير أن الباطل لا يثبت أمام الحق.'],
        ['الاستعاذة', 'في سورة الفلق استعاذة من شر النفاثات في العقد، وهي من السور العظيمة في التحصين والرقية.'],
        ['ضابط الرقية', 'ثبت في صحيح مسلم: «لا بأس بالرقى ما لم يكن فيه شرك»، وهو أصل جامع في منع الطلاسم والاستغاثة بغير الله.']
      ],
      source: 'القرآن الكريم: البقرة 102؛ الأعراف 117–122؛ يونس 81–82؛ طه 69؛ الفلق 4. صحيح مسلم (2200).'
    },
    {
      id: 'not-diagnosis', icon: '🧭', title: 'الأعراض ليست تشخيصًا', summary: 'كيف نتعامل مع القوائم المتداولة دون ظلم أو وسواس؟',
      sections: [
        ['أعراض مشتركة', 'الأرق، الصداع، الخوف، تغير الشهية، ضعف التركيز، الألم، الخلافات الزوجية أو التعثر المالي أمور قد تنشأ عن أسباب كثيرة، ولا تثبت السحر وحدها.'],
        ['القراءة لا تختبر الغيب', 'التثاؤب أو البكاء أو الرجفة أو الشعور بحرارة أثناء القراءة لا يكفي للحكم بوجود سحر، وقد يرتبط بالتوتر أو الإيحاء أو الحالة الصحية.'],
        ['لا تتهم أحدًا', 'لا يجوز اتهام قريب أو جار أو عامل بالسحر بناءً على حلم أو ظن أو كلام راقٍ؛ الاتهام بلا بينة يظلم الناس ويفسد العلاقات.'],
        ['التقييم الصحيح', 'ابدأ بالفحص الطبي والنفسي والاجتماعي عند الحاجة، ويمكن ممارسة الرقية الشرعية بالتوازي دون جعلها بديلًا عن التشخيص.']
      ],
      source: 'توجيه تعليمي للسلامة ومنع التشخيص القائم على الظن؛ ليس تشخيصًا طبيًا.'
    },
    {
      id: 'medical-care', icon: '🩺', title: 'متى أطلب مساعدة طبية؟', summary: 'علامات تستدعي طبيبًا أو طوارئ بدل تأخير العلاج.',
      sections: [
        ['الطوارئ', 'اطلب المساعدة العاجلة عند ألم الصدر، ضيق النفس، الإغماء، التشنجات، ضعف مفاجئ، نزيف، تسمم، أو أفكار إيذاء النفس أو الآخرين.'],
        ['الصحة النفسية', 'الهلوسة، الارتياب الشديد، نوبات الهلع، الاكتئاب أو الأرق الطويل تحتاج إلى تقييم مهني؛ طلب العلاج لا يتعارض مع الإيمان أو الرقية.'],
        ['الأدوية', 'لا توقف دواءً موصوفًا ولا تغيّر جرعته بسبب تفسير غيبي أو نصيحة غير مختصة.'],
        ['الجمع بين الأسباب', 'يجوز أن تقرأ القرآن وتدعو، وفي الوقت نفسه تراجع الطبيب وتلتزم بالخطة العلاجية.']
      ],
      source: 'إرشادات سلامة صحية عامة؛ عند الطوارئ اتصل بخدمات الطوارئ في بلدك.'
    },
    {
      id: 'self-ruqyah', icon: '🤲', title: 'الرقية الذاتية المشروعة', summary: 'برنامج بسيط قائم على القرآن والأدعية الصحيحة بلا طلاسم أو أعداد مخترعة.',
      sections: [
        ['النية والتوكل', 'ابدأ بالتوبة والدعاء وحسن الظن بالله، واعلم أن الشفاء من الله وأن الرقية سبب مشروع.'],
        ['القراءة', 'اقرأ الفاتحة، وآية الكرسي، وخواتيم البقرة، والإخلاص والفلق والناس، وآيات إبطال السحر في الأعراف ويونس وطه، وما تيسر من القرآن.'],
        ['الأدعية', 'ادعُ بالأدعية النبوية العامة للشفاء، مثل: «أذهب البأس رب الناس، اشف أنت الشافي…»، دون ألفاظ مجهولة أو ادعاء سر خاص.'],
        ['الطريقة', 'يجوز النفث الخفيف في اليدين ومسح الجسد أو موضع الألم، مع الهدوء ومنع الضرب والخنق والحرق والصعق.'],
        ['التكرار', 'كرر القراءة بقدر الحاجة دون اعتقاد عدد إلزامي لم يثبت، وحافظ على الصلاة والأذكار والعلاج الطبي الموصوف.']
      ],
      source: 'صحيح البخاري في أبواب الرقى؛ صحيح مسلم (2191، 2200)؛ آيات الرقية المذكورة.'
    },
    {
      id: 'protection', icon: '🛡️', title: 'الوقاية والتحصين', summary: 'أسباب يومية ثابتة بعيدًا عن الخوف والوسواس.',
      sections: [
        ['الفرائض', 'المحافظة على الصلاة والتوبة وترك المحرمات هي أساس الاستقامة، ولا تُستبدل بطقوس أو تمائم.'],
        ['الأذكار', 'حافظ على أذكار الصباح والمساء والنوم، واقرأ الإخلاص والفلق والناس ثلاث مرات صباحًا ومساءً.'],
        ['البيت', 'اقرأ القرآن في البيت، وتجنب الطلاسم والتمائم والبخور المجهول والمواد التي يزعم أصحابها أن لها قوة خفية.'],
        ['الاعتدال', 'التحصين لا يعني مراقبة كل شخص أو تفسير كل مشكلة بالسحر؛ المطلوب ذكر الله وحسن التدبير وطلب المساعدة المختصة عند الحاجة.']
      ],
      source: 'الأحاديث الصحيحة في أذكار الصباح والمساء والمعوذات وقراءة سورة البقرة.'
    },
    {
      id: 'suspicious-object', icon: '🧤', title: 'العثور على شيء مشتبه به', summary: 'تصرف آمن دون تعريض نفسك للخطر أو إتلاف دليل محتمل.',
      sections: [
        ['لا تلمس مادة خطرة', 'إذا وجدت مسحوقًا أو سائلًا أو إبرًا أو مادة كيميائية مجهولة، ابتعد عنها ولا تشمها أو تذقها، وأبعد الأطفال والحيوانات.'],
        ['احفظ السلامة والحقوق', 'لا تقتحم مكانًا ولا تتهم شخصًا ولا تنشر صورًا وأسماء. إذا كان الشيء داخل ممتلكاتك فصوّره من مسافة آمنة وسجّل مكانه ووقته.'],
        ['متى تتواصل مع الجهات المختصة؟', 'عند الاشتباه بجريمة أو مادة خطرة أو تهديد متعمد، تواصل مع الشرطة أو الدفاع المدني أو الجهة المختصة في بلدك بدل المعالجة الفردية.'],
        ['المواد العادية', 'قد تكون الخيوط أو الأوراق أو العقد أشياء عادية. لا تجعل الشك يقينًا، ولا تبدأ إجراءات مؤذية بناءً على الظن.']
      ],
      source: 'إرشاد سلامة عام لحفظ النفس والحقوق؛ لا يقدم طريقة لفك أو إتلاف مواد مجهولة.'
    },
    {
      id: 'fraud', icon: '🚫', title: 'علامات الدجل والابتزاز', summary: 'مؤشرات واضحة تستوجب التوقف والابتعاد والإبلاغ عند الضرورة.',
      sections: [
        ['الطلاسم والغيب', 'طلب اسم الأم، كتابة مربعات وحروف مجهولة، ادعاء معرفة الساحر أو مكان السحر بالغيب، والاستعانة بالجن كلها علامات خطر.'],
        ['الابتزاز', 'طلب مبالغ متزايدة، تخويف المريض من الموت أو الطلاق، أو ربط الشفاء بشراء منتج سري ممارسات استغلالية.'],
        ['انتهاك الجسد والخصوصية', 'الخلوة المحرمة، لمس العورات، التصوير دون إذن، الضرب والخنق والحرق والصعق ليست رقية شرعية.'],
        ['التحريض', 'من يطلب إيذاء شخص أو مراقبته أو سرقة أثره أو نشر اتهام عنه يجب الابتعاد عنه وحفظ الأدلة والإبلاغ عند وجود جريمة.']
      ],
      source: 'حديث ضابط الرقية في صحيح مسلم (2200)، وقواعد حفظ النفس والعرض والمال ومنع الضرر.'
    },
    {
      id: 'family', icon: '🏠', title: 'حماية الأسرة من الوسواس', summary: 'خطوات عملية تمنع تحول الاشتباه إلى أزمة أسرية.',
      sections: [
        ['الحوار الهادئ', 'ناقش الأعراض والمشكلات بلغة واقعية، وحدد ما يمكن فحصه طبيًا أو ماليًا أو اجتماعيًا بدل بناء استنتاجات غيبية.'],
        ['الأطفال', 'لا تخبر الطفل أنه مسحور أو ممسوس، ولا تعرضه لجلسات مخيفة أو صراخ أو ضرب؛ راجع طبيب الأطفال أو المختص عند تغير سلوكه أو صحته.'],
        ['الزواج', 'الخلافات الزوجية تحتاج إلى حوار واستشارة أسرية عند الحاجة، ولا يصح تفسير كل نزاع بسحر التفريق.'],
        ['خطة مشتركة', 'اتفقوا على أذكار وقراءة هادئة، مع مواعيد للفحوص والاستشارة، ومنع تداول الاتهامات داخل العائلة.']
      ],
      source: 'إرشاد أسري وقائي لمنع الضرر والوصم والتشخيص غير المهني.'
    },
    {
      id: 'faq', icon: '❓', title: 'أسئلة شائعة', summary: 'إجابات مختصرة عن أكثر الأسئلة تداولًا.',
      sections: [
        ['هل كل تعطل سببه سحر؟', 'لا. التعطل قد يكون له أسباب عملية أو صحية أو نفسية أو مالية، ولا يجوز القفز إلى تفسير غيبي بلا دليل.'],
        ['هل أحتاج إلى راقٍ؟', 'يمكن للمسلم أن يرقي نفسه وأهله. عند الاستعانة براقٍ يجب أن يكون معروفًا بالاستقامة، وألا يخلو أو يلمس العورات أو يطلب طلاسم وأموالًا مبالغًا فيها.'],
        ['هل توجد سورة سرية أو عدد مضمون؟', 'لا يوجد نص صحيح يجعل سورة سرية أو عددًا مبتكرًا ضمانًا لإبطال السحر. القرآن كله شفاء، وتُتبع النصوص الصحيحة دون ادعاءات.'],
        ['هل المنام يحدد الساحر؟', 'لا. المنام لا يثبت اتهامًا ولا يبيح التجسس أو القطيعة أو التشهير.'],
        ['هل الرقية تغني عن الطبيب؟', 'لا. الرقية دعاء وعبادة، والعلاج الطبي سبب مشروع، ويجمع المسلم بينهما عند الحاجة.']
      ],
      source: 'إجابات تعليمية عامة ضمن ضوابط الرقية والسلامة.'
    }
  ];

  window.NOOR_MAGIC_TOPICS = TOPICS;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  function hideOtherViews() {
    $('#ruqyahHub')?.classList.add('hidden');
    $('#ruqyahReader')?.classList.add('hidden');
    $('#ruqyahEncyclopedia')?.classList.add('hidden');
    $('#eyeEncyclopedia')?.classList.add('hidden');
  }

  function showHub() {
    $('#magicEncyclopedia')?.classList.add('hidden');
    $('#ruqyahHub')?.classList.remove('hidden');
    $('#ruqyahHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function topicCard(topic) {
    const searchable = [topic.title, topic.summary, ...topic.sections.flat(), topic.source].join(' ');
    return `<button class="magic-topic-card" type="button" data-magic-topic="${escapeHtml(topic.id)}" data-magic-search="${escapeHtml(searchable)}">
      <span class="magic-topic-icon">${topic.icon}</span>
      <span class="magic-topic-copy"><b>${escapeHtml(topic.title)}</b><small>${escapeHtml(topic.summary)}</small></span>
      <span aria-hidden="true">←</span>
    </button>`;
  }

  function renderHome() {
    return `<div class="magic-ency-head">
      <button class="btn" type="button" data-magic-back>← أقسام الرقية</button>
      <div><span class="eyebrow">المرحلة الثامنة · توعية شرعية وآمنة</span><h2>موسوعة السحر</h2><p>أدلة وضوابط ورقية ذاتية وتحذير من الدجل، مع منع التشخيص بالظن وحماية العلاج الطبي.</p></div>
    </div>
    <div class="magic-ency-alert"><b>قاعدة أساسية</b><span>لا يثبت السحر بعرض منفرد أو حلم أو نتيجة اختبار. لا تتهم أحدًا، وراجع المختصين عند الأعراض المستمرة أو الخطرة.</span></div>
    <div class="magic-ency-tools">
      <label for="magicEncySearch">ابحث داخل موسوعة السحر</label>
      <div><input id="magicEncySearch" type="search" autocomplete="off" placeholder="مثال: الرقية، الأعراض، الدجل، التحصين"><button id="magicEncyClear" class="btn small" type="button">مسح</button></div>
      <p id="magicEncyCount">${TOPICS.length} موضوعات</p>
    </div>
    <div id="magicEncyGrid" class="magic-topic-grid">${TOPICS.map(topicCard).join('')}</div>
    <div id="magicEncyEmpty" class="search-empty hidden"><span>⌕</span><p>لا توجد نتيجة مطابقة. جرّب كلمة أقصر أو مرادفًا آخر.</p></div>
    <div class="magic-ency-actions">
      <button class="btn premium-primary" type="button" data-magic-open-verses>فتح آيات السحر</button>
      <button class="btn premium-secondary" type="button" data-magic-open-assessment>فتح التقييم الإرشادي</button>
      <a class="btn" href="#" onclick="event.preventDefault();window.navTo?.('library')" target="_blank" rel="noopener">عرض بيانات المرجع وسياسة النشر</a>
    </div>`;
  }

  function renderTopic(topic) {
    return `<div class="magic-ency-head">
      <button class="btn" type="button" data-magic-home>← موسوعة السحر</button>
      <div><span class="eyebrow">${topic.icon} موسوعة السحر</span><h2>${escapeHtml(topic.title)}</h2><p>${escapeHtml(topic.summary)}</p></div>
    </div>
    <article class="magic-topic-article">
      ${topic.sections.map(([title, body], index) => `<section><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div></section>`).join('')}
      <footer><b>المصدر:</b> ${escapeHtml(topic.source)}</footer>
    </article>
    <div class="magic-topic-bottom"><button class="btn premium-secondary" type="button" data-magic-home>عرض كل الموضوعات</button><button class="btn premium-primary" type="button" data-magic-open-verses>قراءة آيات السحر</button></div>`;
  }

  function show(html) {
    const root = $('#magicEncyclopedia');
    if (!root) return;
    hideOtherViews();
    root.classList.remove('hidden');
    root.innerHTML = html;
    wire();
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openTopic(id) {
    const topic = TOPICS.find(item => item.id === id);
    if (topic) show(renderTopic(topic));
  }

  function openMagicVerses() {
    $('#magicEncyclopedia')?.classList.add('hidden');
    $('#ruqyahHub')?.classList.remove('hidden');
    setTimeout(() => document.querySelector('[data-rq-open="magic"]')?.click(), 60);
  }

  function wire() {
    $$('[data-magic-back]').forEach(button => button.addEventListener('click', showHub));
    $$('[data-magic-home]').forEach(button => button.addEventListener('click', () => show(renderHome())));
    $$('[data-magic-topic]').forEach(button => button.addEventListener('click', () => openTopic(button.dataset.magicTopic)));
    $$('[data-magic-open-verses]').forEach(button => button.addEventListener('click', openMagicVerses));
    $$('[data-magic-open-assessment]').forEach(button => button.addEventListener('click', () => window.navTo?.('assessment')));

    const input = $('#magicEncySearch');
    const clear = $('#magicEncyClear');
    const count = $('#magicEncyCount');
    const empty = $('#magicEncyEmpty');
    if (!input) return;

    const apply = () => {
      const query = normalize(input.value);
      const terms = query.split(' ').filter(Boolean);
      let visible = 0;
      $$('[data-magic-topic]').forEach(card => {
        const haystack = normalize(card.dataset.magicSearch);
        const matches = !terms.length || terms.every(term => haystack.includes(term));
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (count) count.textContent = `${visible} من ${TOPICS.length} موضوعات`;
      empty?.classList.toggle('hidden', visible !== 0);
    };

    input.addEventListener('input', apply);
    clear?.addEventListener('click', () => {
      input.value = '';
      apply();
      input.focus();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-magic-encyclopedia]').forEach(button => button.addEventListener('click', () => show(renderHome())));
  });
})();
