'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const STORAGE_KEY = 'noor-hasad-favorites-v1';
  const PAGE_SIZE = 18;

  const TOPICS = [
    {
      id: 'meaning',
      icon: '🧿',
      title: 'ما الحسد؟',
      summary: 'تعريف الحسد والغبطة والغيرة، وكيف يبدأ علاجه من القلب والسلوك.',
      sections: [
        ['التعريف', 'الحسد خلق مذموم يقوم على كراهة نعمة الغير أو تمني زوالها. أما الغبطة فهي تمني مثل الخير من غير زواله عن صاحبه.'],
        ['الموقف العملي', 'عند ظهور المقارنة أو الضيق، يرفض المسلم تمني الزوال، ويدعو لصاحب النعمة بالبركة، ويحوّل الشعور إلى سعي مشروع.'],
        ['الاعتدال', 'لا ينبغي تحويل الحسد إلى تفسير شامل لكل مرض أو فشل أو خلاف؛ فالأحداث لها أسباب واقعية متعددة، والأقدار بيد الله.']
      ],
      source: 'سورة النساء: 54؛ صحيح مسلم 2563.'
    },
    {
      id: 'evidence',
      icon: '📜',
      title: 'الأدلة من القرآن والسنة',
      summary: 'نصوص ثابتة في ذم الحسد والاستعاذة من شره والنهي عن التحاسد.',
      sections: [
        ['الاستعاذة', 'قال الله تعالى: ﴿وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾، وهي استعاذة بالله من الشر عند ظهوره وعمله.'],
        ['ذم الحسد', 'قال الله تعالى: ﴿أَمْ يَحْسُدُونَ النَّاسَ عَلَىٰ مَا آتَاهُمُ اللَّهُ مِن فَضْلِهِ﴾.'],
        ['النهي النبوي', 'قال النبي ﷺ: «لا تحاسدوا»، ضمن وصيته بالأخوة وترك التباغض والتجسس.'],
        ['ثبوت العين', 'ثبت في الصحيحين أن العين حق، لكن ثبوتها لا يجعل كل عرض أو خسارة دليلًا على إصابة، ولا يبيح اتهام شخص بعينه.']
      ],
      source: 'سورة الفلق: 5؛ سورة النساء: 54؛ صحيح مسلم 2563؛ صحيح البخاري 5740.'
    },
    {
      id: 'difference',
      icon: '⚖️',
      title: 'الحسد والعين: الفرق والالتقاء',
      summary: 'تفريق مبسط يمنع الخلط والاتهام والوسواس.',
      sections: [
        ['الحسد', 'خلق قلبي يتعلق بكراهة نعمة الغير أو تمني زوالها، وقد يتحول إلى قول أو فعل مؤذٍ.'],
        ['العين', 'أذى ثابت في السنة وقد يقع مع حسد أو إعجاب، مع بقاء كل شيء داخل قدر الله.'],
        ['النتيجة', 'لا توجد طريقة موثوقة لتعيين الحاسد من حلم أو تثاؤب أو شعور. المطلوب التحصين وحسن الظن والتعامل مع السلوك الظاهر فقط.']
      ],
      source: 'ملخص تعليمي من النصوص الصحيحة وشروح باب العين والحسد.'
    },
    {
      id: 'signs',
      icon: '🧭',
      title: 'الأعراض وحدود التشخيص',
      summary: 'لماذا لا تثبت الإصابة من الصداع أو الأحلام أو التثاؤب أو تعطل الأمور؟',
      sections: [
        ['قاعدة السلامة', 'الأعراض الجسدية والنفسية العامة لا تكشف سببًا غيبيًا. الصداع والخمول والقلق والكدمات واضطراب النوم لها أسباب كثيرة.'],
        ['الأحداث اليومية', 'فشل مشروع أو تأخر زواج أو خلاف أسري يحتاج تحليلًا واقعيًا، ولا يُنسب للحسد دون دليل.'],
        ['متى أراجع مختصًا؟', 'عند استمرار الأعراض أو شدتها أو تعطيلها للحياة، وعند الإغماء أو التشنج أو ضيق النفس أو أفكار إيذاء النفس تُطلب مساعدة عاجلة.'],
        ['الرقية مع العلاج', 'يمكن الجمع بين الدعاء والرقية وبين التشخيص والدواء، ولا يُوقف علاج موصوف بسبب تفسير غيبي.']
      ],
      source: 'توجيه سلامة شرعي وصحي عام؛ ليس تشخيصًا طبيًا.'
    },
    {
      id: 'heart',
      icon: '💚',
      title: 'تزكية النفس من الحسد',
      summary: 'برنامج عملي للرضا والشكر والدعاء بالبركة ووقف المقارنات.',
      sections: [
        ['الملاحظة', 'سمِّ الشعور بصدق دون تبريره، ولا تسمح له بالتحول إلى انتقاص أو تشويه أو أذى.'],
        ['البديل', 'ادع لصاحب النعمة بالبركة، واشكر الله على نعمك، واكتب هدفًا واقعيًا تتقدم نحوه.'],
        ['البيئة الرقمية', 'قلل الحسابات التي تزيد المقارنة، وحدد وقتًا لوسائل التواصل بدل التتبع المستمر.'],
        ['إصلاح الضرر', 'إن صدر منك أذى فتب، وأوقفه، واعتذر عند الحاجة، وأصلح ما أفسدت.']
      ],
      source: 'صحيح مسلم 2563؛ إرشادات تربوية وسلوكية عامة.'
    },
    {
      id: 'protection',
      icon: '🛡️',
      title: 'الوقاية والتحصين',
      summary: 'أذكار ثابتة وخصوصية متوازنة بلا تمائم أو طقوس مخترعة.',
      sections: [
        ['الأذكار', 'المحافظة على الصلاة وأذكار الصباح والمساء، وقراءة الإخلاص والفلق والناس ثلاث مرات صباحًا ومساءً.'],
        ['الدعاء بالبركة', 'عند رؤية ما يعجب، يدعو المسلم لصاحب النعمة بالبركة بدل التخويف أو الصمت القَلِق.'],
        ['الخصوصية', 'يجوز حفظ الخصوصيات وتجنب المباهاة، لكن لا يتحول ذلك إلى خوف دائم أو عزلة.'],
        ['ما يُترك', 'تُترك التمائم والخرز والطلاسم والبخور المرتبط بادعاءات غيبية والأعداد التي لم يثبت تخصيصها.']
      ],
      source: 'سورة الفلق؛ أحاديث المعوذات والدعاء بالبركة.'
    },
    {
      id: 'self-ruqyah',
      icon: '🤲',
      title: 'الرقية الذاتية',
      summary: 'قراءة مشروعة هادئة لا تحتاج طقوسًا ولا معالجًا بالضرورة.',
      sections: [
        ['النية', 'يستحضر المسلم أن الشفاء والحفظ من الله، وأن القراءة والدعاء أسباب مشروعة.'],
        ['القراءة', 'يقرأ الفاتحة وآية الكرسي وخواتيم البقرة والإخلاص والفلق والناس وما تيسر من القرآن.'],
        ['الطريقة', 'يجوز النفث الخفيف في اليدين ومسح الجسد أو موضع الألم، دون ضرب أو خنق أو صراخ.'],
        ['التكرار', 'تُكرر الرقية بقدر الحاجة دون التزام عدد لم يثبت، مع مواصلة العلاج الطبي عند وصفه.']
      ],
      source: 'صحيح البخاري 5017 و5736؛ صحيح مسلم 2200.'
    },
    {
      id: 'family',
      icon: '👨‍👩‍👧‍👦',
      title: 'الأسرة والمجتمع',
      summary: 'حماية العلاقات من الاتهام والقطيعة والخوف المتوارث.',
      sections: [
        ['منع الاتهام', 'لا يجوز اتهام قريب أو صديق بالحسد من موقف أو حلم أو شعور، ولا نشر اسمه أو صورته.'],
        ['الحدود الصحية', 'تُضبط العلاقة بناءً على السلوك الظاهر مثل الإساءة أو التدخل، لا بناءً على تشخيص غيبي.'],
        ['الأطفال', 'يُعلَّم الطفل الأذكار بطريقة مطمئنة، ولا يُربط كل مرض أو تعثر بالعين والحسد.'],
        ['الخلافات', 'المشاكل الزوجية والأسرية تُبحث أسبابها الواقعية، ويُستعان بمستشار عند الحاجة.']
      ],
      source: 'قواعد حفظ الحقوق وحسن الظن وإرشادات تربوية عامة.'
    },
    {
      id: 'myths',
      icon: '🚫',
      title: 'الخرافات وعلامات الخطر',
      summary: 'تمييز الرقية المشروعة من الاختبارات الوهمية والاستغلال.',
      sections: [
        ['اختبارات غير موثوقة', 'البيض والرصاص والملح ولون الدم والتطبيقات الإلكترونية لا تكشف الحسد.'],
        ['علامات الدجل', 'طلب اسم الأم أو الطلاسم أو ادعاء الغيب أو الخلوة أو لمس العورات أو طلب محرمات.'],
        ['الممارسات المؤذية', 'الضرب والخنق والحرق والصعق ومنع الدواء ممارسات خطيرة يجب الابتعاد عنها.'],
        ['الاستغلال المالي', 'احذر الوعود القطعية والأسعار المبالغ فيها وربط الشفاء بشراء منتجات محددة.']
      ],
      source: 'ضوابط الرقية الشرعية وإرشادات السلامة.'
    },
    {
      id: 'questions',
      icon: '❓',
      title: 'بنك أسئلة الحسد',
      summary: '125 سؤالًا وجوابًا مصنفًا، مع بحث ومفضلة وتحميل عند الطلب.',
      sections: [
        ['طريقة العمل', 'يُحمَّل بنك الأسئلة فقط عند فتحه لتقليل حجم التحميل الأولي للموقع.'],
        ['البحث', 'يمكن البحث بالجملة الطبيعية مثل: هل الصداع دليل؟ أو كيف أحصن أطفالي؟'],
        ['المفضلة', 'تُحفظ الأسئلة المفضلة محليًا على جهاز المستخدم ولا تُرسل إلى خادم.']
      ],
      source: 'محتوى تعليمي مبني على النصوص والضوابط المذكورة داخل الموسوعة.'
    }
  ];

  window.NOOR_HASAD_TOPICS = TOPICS;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

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
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const fallbackQuestions = [
    {id:'fallback-1',category:'الأساسيات',question:'ما الحسد؟',answer:'خلق مذموم يقوم على كراهة نعمة الغير أو تمني زوالها، ويعالج بالرضا والدعاء بالبركة.',source:'سورة النساء: 54؛ صحيح مسلم 2563',keywords:'تعريف'},
    {id:'fallback-2',category:'الوقاية والتحصين',question:'ما أهم تحصين يومي؟',answer:'الصلاة وأذكار الصباح والمساء والمعوذات وآية الكرسي في مواضعها الثابتة.',source:'أحاديث الأذكار الصحيحة',keywords:'أذكار'},
    {id:'fallback-3',category:'الفروق والتشخيص',question:'هل الصداع دليل على الحسد؟',answer:'لا. الصداع له أسباب طبية كثيرة ولا يثبت الحسد من عرض واحد.',source:'توجيه سلامة صحي',keywords:'صداع'},
    {id:'fallback-4',category:'الرقية والعلاج',question:'هل أستطيع رقية نفسي؟',answer:'نعم، رقية الإنسان لنفسه مشروعة، مع عدم إهمال التشخيص والعلاج.',source:'أبواب الرقى في الصحيحين',keywords:'رقية'},
    {id:'fallback-5',category:'الخرافات والسلامة',question:'هل البيض أو الملح يكشفان الحسد؟',answer:'لا توجد طريقة شرعية أو علمية تعتمد عليهما لتشخيص الحسد.',source:'إرشاد سلامة',keywords:'بيض ملح'},
    {id:'fallback-6',category:'الأسرة والمجتمع',question:'هل يجوز اتهام شخص بالحسد؟',answer:'لا يجوز اتهام شخص بلا بينة أو بناءً على حلم أو شعور.',source:'إرشاد شرعي واجتماعي',keywords:'اتهام'}
  ];

  let questions = null;
  let filteredQuestions = [];
  let visibleCount = PAGE_SIZE;
  let activeCategory = 'الكل';
  let showFavoritesOnly = false;

  function favorites() {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); }
    catch { return new Set(); }
  }

  function saveFavorites(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  }

  function hideOtherViews() {
    $('#ruqyahHub')?.classList.add('hidden');
    $('#ruqyahReader')?.classList.add('hidden');
    $('#ruqyahEncyclopedia')?.classList.add('hidden');
    $('#eyeEncyclopedia')?.classList.add('hidden');
  }

  function showHub() {
    $('#hasadEncyclopedia')?.classList.add('hidden');
    $('#ruqyahHub')?.classList.remove('hidden');
    $('#ruqyahHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function card(topic) {
    const searchable = [topic.title, topic.summary, ...topic.sections.flat()].join(' ');
    return `<button class="hasad-topic-card" type="button" data-hasad-topic="${esc(topic.id)}" data-hasad-search="${esc(searchable)}">
      <span class="hasad-topic-icon">${topic.icon}</span>
      <span class="hasad-topic-copy"><b>${esc(topic.title)}</b><small>${esc(topic.summary)}</small></span>
      <span aria-hidden="true">←</span>
    </button>`;
  }

  function homeView() {
    return `<div class="hasad-head">
      <button class="btn" type="button" data-hasad-back>← أقسام الرقية</button>
      <div><span class="eyebrow">المرحلة السابعة · موسوعة توعوية موثقة</span><h2>موسوعة الحسد</h2>
      <p>فهم الحسد وعلاجه وتزكية النفس والوقاية والرقية، دون تشخيص قطعي أو اتهام للناس.</p></div>
    </div>
    <div class="hasad-alert"><b>قاعدة أساسية</b><span>لا تكشف الأعراض أو الأحلام أو الاختبارات اسم الحاسد، ولا تُوقف علاجًا طبيًا بسبب تفسير غيبي.</span></div>
    <div class="hasad-tools"><label for="hasadSearch">ابحث داخل الموسوعة</label>
      <div><input id="hasadSearch" type="search" autocomplete="off" placeholder="مثال: الغبطة، الدعاء بالبركة، الأعراض، التمائم"><button id="hasadClear" class="btn small" type="button">مسح</button></div>
      <p id="hasadCount">${TOPICS.length} موضوعات</p>
    </div>
    <div id="hasadGrid" class="hasad-topic-grid">${TOPICS.map(card).join('')}</div>
    <div id="hasadEmpty" class="search-empty hidden"><span>⌕</span><p>لا توجد نتيجة مطابقة. جرّب كلمة أقصر.</p></div>
    <div class="hasad-actions">
      <button class="btn premium-primary" type="button" data-hasad-topic-jump="questions">فتح بنك الأسئلة</button>
      <button class="btn premium-secondary" type="button" data-hasad-open-eye>موسوعة العين</button>
      <button class="btn" type="button" data-hasad-open-ruqyah>آيات العين والحسد</button>
    </div>`;
  }

  function topicView(topic) {
    if (topic.id === 'questions') return questionsShell();
    return `<div class="hasad-head">
      <button class="btn" type="button" data-hasad-home>← موسوعة الحسد</button>
      <div><span class="eyebrow">${topic.icon} موسوعة الحسد</span><h2>${esc(topic.title)}</h2><p>${esc(topic.summary)}</p></div>
    </div>
    <article class="hasad-article">${topic.sections.map(([title, body], index) => `<section>
      <span>${String(index + 1).padStart(2, '0')}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div>
    </section>`).join('')}<footer><b>المصدر:</b> ${esc(topic.source)}</footer></article>
    <div class="hasad-actions"><button class="btn premium-secondary" type="button" data-hasad-home>عرض جميع الموضوعات</button>
    <button class="btn premium-primary" type="button" data-hasad-topic-jump="questions">بنك الأسئلة</button></div>`;
  }

  function questionsShell() {
    return `<div class="hasad-head">
      <button class="btn" type="button" data-hasad-home>← موسوعة الحسد</button>
      <div><span class="eyebrow">❓ تحميل ذكي عند الطلب</span><h2>بنك أسئلة الحسد</h2>
      <p>إجابات قصيرة موثقة مع بحث وتصنيفات ومفضلة محلية.</p></div>
    </div>
    <div class="hasad-question-toolbar">
      <div class="hasad-question-search"><input id="hasadQuestionSearch" type="search" autocomplete="off" placeholder="اكتب سؤالًا أو كلمة مثل: الصداع، الأطفال، الرقية"><button id="hasadQuestionClear" class="btn small" type="button">مسح</button></div>
      <div id="hasadQuestionCategories" class="hasad-question-categories" aria-label="تصنيفات الأسئلة"></div>
      <label class="hasad-fav-toggle"><input id="hasadFavoritesOnly" type="checkbox"> عرض المفضلة فقط</label>
      <p id="hasadQuestionStatus">جارٍ تحميل بنك الأسئلة…</p>
    </div>
    <div id="hasadQuestionList" class="hasad-question-list"><div class="search-loading"><span></span><p>جارٍ تحميل الأسئلة عند الطلب…</p></div></div>
    <button id="hasadLoadMore" class="btn premium-secondary hasad-load-more hidden" type="button">عرض المزيد</button>
    <div class="notice">الأسئلة للتوعية العامة وليست تشخيصًا طبيًا أو حكمًا على شخص بعينه.</div>`;
  }

  function show(html) {
    const root = $('#hasadEncyclopedia');
    if (!root) return;
    hideOtherViews();
    root.classList.remove('hidden');
    root.innerHTML = html;
    wireCommon();
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function loadQuestions() {
    if (questions) return questions;
    try {
      const response = await fetch('./assets/data/hasad_questions.json', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('load failed');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) throw new Error('invalid data');
      questions = data;
    } catch {
      questions = fallbackQuestions;
    }
    window.NOOR_HASAD_QUESTIONS = questions;
    return questions;
  }

  function renderQuestionCategories() {
    const root = $('#hasadQuestionCategories');
    if (!root || !questions) return;
    const categories = ['الكل', ...new Set(questions.map(item => item.category))];
    root.innerHTML = categories.map(category => `<button type="button" class="${category === activeCategory ? 'active' : ''}" data-hasad-category="${esc(category)}">${esc(category)}</button>`).join('');
    $$('[data-hasad-category]', root).forEach(button => button.addEventListener('click', () => {
      activeCategory = button.dataset.hasadCategory;
      visibleCount = PAGE_SIZE;
      renderQuestions();
      renderQuestionCategories();
    }));
  }

  function questionCard(item, favs) {
    const isFavorite = favs.has(item.id);
    return `<article class="hasad-question-card" data-question-id="${esc(item.id)}">
      <header><span>${esc(item.category)}</span><button type="button" class="hasad-fav-button ${isFavorite ? 'active' : ''}" data-hasad-favorite="${esc(item.id)}" aria-label="إضافة للمفضلة">${isFavorite ? '★' : '☆'}</button></header>
      <h3>${esc(item.question)}</h3><p>${esc(item.answer)}</p>
      <footer><small><b>المصدر:</b> ${esc(item.source)}</small>
      <button type="button" class="btn small" data-hasad-copy="${esc(item.id)}">نسخ</button></footer>
    </article>`;
  }

  function renderQuestions() {
    if (!questions) return;
    const input = $('#hasadQuestionSearch');
    const query = normalize(input?.value);
    const favs = favorites();

    filteredQuestions = questions.filter(item => {
      const categoryMatch = activeCategory === 'الكل' || item.category === activeCategory;
      const favoriteMatch = !showFavoritesOnly || favs.has(item.id);
      const haystack = normalize([item.question, item.answer, item.category, item.keywords, item.source].join(' '));
      const queryMatch = !query || query.split(' ').every(term => haystack.includes(term));
      return categoryMatch && favoriteMatch && queryMatch;
    });

    const list = $('#hasadQuestionList');
    const status = $('#hasadQuestionStatus');
    const loadMore = $('#hasadLoadMore');
    if (!list) return;

    const visible = filteredQuestions.slice(0, visibleCount);
    if (!visible.length) {
      list.innerHTML = '<div class="search-empty"><span>⌕</span><p>لا توجد أسئلة مطابقة.</p></div>';
    } else {
      list.innerHTML = visible.map(item => questionCard(item, favs)).join('');
    }

    if (status) {
      const mode = questions === fallbackQuestions ? 'نسخة مختصرة متاحة دون اتصال أولي' : 'تم تحميل البنك الكامل';
      status.textContent = `${filteredQuestions.length} سؤالًا مطابقًا · ${mode}`;
    }

    loadMore?.classList.toggle('hidden', visible.length >= filteredQuestions.length);
    wireQuestionCards();
  }

  function wireQuestionCards() {
    $$('[data-hasad-favorite]').forEach(button => button.addEventListener('click', () => {
      const set = favorites();
      const id = button.dataset.hasadFavorite;
      set.has(id) ? set.delete(id) : set.add(id);
      saveFavorites(set);
      renderQuestions();
    }));

    $$('[data-hasad-copy]').forEach(button => button.addEventListener('click', async () => {
      const item = questions?.find(question => question.id === button.dataset.hasadCopy);
      if (!item) return;
      const text = `${item.question}\n\n${item.answer}\n\nالمصدر: ${item.source}`;
      try {
        await navigator.clipboard.writeText(text);
        window.showToast?.('تم نسخ السؤال والإجابة');
      } catch {
        window.prompt?.('انسخ النص:', text);
      }
    }));
  }

  async function initQuestions() {
    await loadQuestions();
    renderQuestionCategories();
    renderQuestions();

    const input = $('#hasadQuestionSearch');
    input?.addEventListener('input', () => { visibleCount = PAGE_SIZE; renderQuestions(); });
    $('#hasadQuestionClear')?.addEventListener('click', () => {
      if (!input) return;
      input.value = '';
      visibleCount = PAGE_SIZE;
      renderQuestions();
      input.focus();
    });
    $('#hasadFavoritesOnly')?.addEventListener('change', event => {
      showFavoritesOnly = event.target.checked;
      visibleCount = PAGE_SIZE;
      renderQuestions();
    });
    $('#hasadLoadMore')?.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderQuestions();
    });
  }

  function openTopic(id) {
    const topic = TOPICS.find(item => item.id === id);
    if (!topic) return;
    show(topicView(topic));
    if (id === 'questions') initQuestions();
  }

  window.NOOR_OPEN_HASAD_TOPIC = openTopic;

  function wireCommon() {
    $$('[data-hasad-back]').forEach(button => button.addEventListener('click', showHub));
    $$('[data-hasad-home]').forEach(button => button.addEventListener('click', () => show(homeView())));
    $$('[data-hasad-topic]').forEach(button => button.addEventListener('click', () => openTopic(button.dataset.hasadTopic)));
    $$('[data-hasad-topic-jump]').forEach(button => button.addEventListener('click', () => openTopic(button.dataset.hasadTopicJump)));

    $$('[data-hasad-open-eye]').forEach(button => button.addEventListener('click', () => {
      $('#hasadEncyclopedia')?.classList.add('hidden');
      $('#ruqyahHub')?.classList.remove('hidden');
      setTimeout(() => document.querySelector('[data-eye-encyclopedia]')?.click(), 60);
    }));

    $$('[data-hasad-open-ruqyah]').forEach(button => button.addEventListener('click', () => {
      $('#hasadEncyclopedia')?.classList.add('hidden');
      $('#ruqyahHub')?.classList.remove('hidden');
      setTimeout(() => document.querySelector('[data-rq-open="eye"]')?.click(), 60);
    }));

    const input = $('#hasadSearch');
    const clear = $('#hasadClear');
    const count = $('#hasadCount');
    const empty = $('#hasadEmpty');
    if (input) {
      const apply = () => {
        const query = normalize(input.value);
        let visible = 0;
        $$('[data-hasad-topic]').forEach(topicCard => {
          const match = !query || normalize(topicCard.dataset.hasadSearch).includes(query);
          topicCard.hidden = !match;
          if (match) visible += 1;
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
  }

  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-hasad-encyclopedia]').forEach(button => button.addEventListener('click', () => show(homeView())));
  });
})();
