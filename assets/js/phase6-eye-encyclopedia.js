'use strict';

(() => {
  const TOPICS = [
    {
      id: 'definition', icon: '👁️', title: 'ما العين؟', summary: 'تعريف موجز يفرق بين ثبوت العين شرعًا وبين التشخيص القائم على الظن.',
      sections: [
        ['المعنى', 'العين أذى يقع بإذن الله بسبب نظر العائن وإعجابه، وقد ثبت أصلها في السنة الصحيحة.'],
        ['الاعتقاد الصحيح', 'العين لا تستقل بالتأثير، ولا تخرج عن قدر الله، ولا يجوز أن تتحول إلى خوف دائم أو تفسير لكل مشكلة.'],
        ['حدود المعرفة', 'لا يمكن الجزم بأن شخصًا مصاب بالعين من عرض عام أو حلم أو إحساس منفرد؛ فهذه أمور مشتركة مع أسباب صحية ونفسية كثيرة.']
      ],
      source: 'حديث «العين حق» في صحيحي البخاري ومسلم.'
    },
    {
      id: 'evidence', icon: '📜', title: 'الأدلة الشرعية', summary: 'أهم النصوص الثابتة في باب العين والرقية منها.',
      sections: [
        ['ثبوت العين', 'ثبت عن النبي ﷺ قوله: «العين حق»، وفي صحيح مسلم: «ولو كان شيء سابق القدر سبقته العين».'],
        ['مشروعية الرقية', 'أمر النبي ﷺ بالرقية من العين، وثبتت رقيته لأهل بيته وتعويذه لهم.'],
        ['الاستغسال', 'ثبت الأمر بالاغتسال عند طلب ذلك من العائن في الحالة المعروفة، ويُعمل به دون إيذاء أو فضيحة أو اتهام بلا بينة.'],
        ['الاستعاذة من الحسد', 'قال الله تعالى في سورة الفلق: ﴿وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾.']
      ],
      source: 'صحيح البخاري؛ صحيح مسلم؛ سورة الفلق: 5.'
    },
    {
      id: 'difference', icon: '⚖️', title: 'العين والحسد: ما الفرق؟', summary: 'العين والحسد قد يجتمعان، لكنهما ليسا لفظين متطابقين تمامًا.',
      sections: [
        ['الحسد', 'تمني زوال النعمة عن الغير أو كراهة بقائها له، وهو خلق محرم يجب علاجه بالإيمان والدعاء ومجاهدة النفس.'],
        ['العين', 'قد تقع من حاسد، وقد تقع بسبب إعجاب شديد دون قصد الأذى؛ لذلك شُرع التبريك عند رؤية ما يعجب.'],
        ['النتيجة العملية', 'لا يجوز البحث عن متهم أو تحميل قريب أو صديق مسؤولية مرض أو تعطل لمجرد الظن. المقصود التحصن والعلاج المشروع وحفظ الحقوق.']
      ],
      source: 'ملخص تعليمي مبني على شروح أهل العلم لأحاديث العين والحسد.'
    },
    {
      id: 'signs', icon: '🧭', title: 'الأعراض: كيف نفهمها؟', summary: 'الأعراض المتداولة ليست اختبارًا تشخيصيًا ولا دليلًا قطعيًا.',
      sections: [
        ['قاعدة أساسية', 'الصداع، الأرق، الخمول، تغير المزاج، تساقط الشعر، الكدمات أو الضيق أعراض لها أسباب طبية ونفسية ودوائية متعددة.'],
        ['متى أراجع الطبيب؟', 'عند الألم الشديد، الإغماء، التشنجات، ضيق النفس، ضعف مفاجئ، أفكار إيذاء النفس، أو استمرار الأعراض وتعطيلها للحياة.'],
        ['دور الرقية', 'يمكن قراءة الرقية مع متابعة التشخيص والعلاج، ولا يصح إيقاف دواء أو تأخير إسعاف بسبب تفسير غيبي.'],
        ['ما الذي لا يثبت الإصابة؟', 'التثاؤب أثناء القراءة، البكاء، الرعشة، الأحلام أو تغير الإحساس لا تثبت وحدها وجود عين.']
      ],
      source: 'توجيه سلامة شرعي وصحي عام؛ ليس تشخيصًا طبيًا.'
    },
    {
      id: 'protection', icon: '🛡️', title: 'الوقاية والتحصين', summary: 'أسباب يومية ثابتة بلا طقوس غامضة أو مبالغات.',
      sections: [
        ['الأذكار', 'المحافظة على أذكار الصباح والمساء والنوم، وقراءة الإخلاص والفلق والناس ثلاث مرات صباحًا ومساءً.'],
        ['التبريك', 'عند رؤية ما يعجب، يدعو المسلم بالبركة ولا يطلق عبارات التخويف أو الاتهام.'],
        ['التوكل', 'التحصين لا يعني الوسواس أو إخفاء كل نعمة؛ بل يجمع المسلم بين ذكر الله وحسن الظن والاعتدال.'],
        ['البيت', 'المحافظة على الصلاة وقراءة القرآن، وترك التمائم والطلاسم والبخور المجهول والممارسات غير المشروعة.']
      ],
      source: 'أحاديث أذكار الصباح والمساء والمعوذات، وقصة سهل بن حنيف في التبريك.'
    },
    {
      id: 'self-ruqyah', icon: '🤲', title: 'رقية النفس من العين', summary: 'خطوات عملية قصيرة يمكن تطبيقها بهدوء.',
      sections: [
        ['النية', 'يستحضر المسلم افتقاره إلى الله وأن القرآن والدعاء أسباب، والشفاء من الله وحده.'],
        ['القراءة', 'يقرأ الفاتحة، وآية الكرسي، وخواتيم البقرة، والإخلاص والفلق والناس، وما تيسر من القرآن.'],
        ['الأدعية', 'من الأدعية الثابتة: «باسم الله أرقيك، من كل شيء يؤذيك…» و«أذهب البأس رب الناس، اشف أنت الشافي…».'],
        ['النفث والمسح', 'ينفث نفثًا خفيفًا في يديه ويمسح جسده أو موضع الألم، دون ضرب أو صراخ أو إيذاء.'],
        ['الاستمرار', 'يكرر الرقية بقدر الحاجة دون التزام عدد لم يثبت، ومع الاستمرار في العلاج الطبي الموصوف.']
      ],
      source: 'صحيح البخاري وصحيح مسلم في أبواب الرقى والدعوات.'
    },
    {
      id: 'washing', icon: '💧', title: 'الاغتسال من أثر العائن', summary: 'حكمه وضوابطه العملية دون اتهام أو إذلال.',
      sections: [
        ['الأصل', 'ورد في السنة الأمر بالاغتسال إذا عُرف العائن وطلب منه ذلك، فيصب الماء على المصاب على الصفة المعروفة عند أهل العلم.'],
        ['الضوابط', 'لا يُجبر شخص بغير حق، ولا يُفتش في خصوصياته، ولا تُنشر التهمة بين الناس، ولا تُجمع آثار الأشخاص سرًا.'],
        ['عند عدم معرفة العائن', 'لا حاجة لمطاردة الناس أو الاشتباه فيهم؛ تُشرع الرقية والأذكار والدعاء مع أخذ الأسباب الصحية.'],
        ['الممارسات المرفوضة', 'لا أصل لسرقة الملابس أو الشعر، أو خلط مواد مجهولة، أو بيع ماء خاص بأسعار مبالغ فيها.']
      ],
      source: 'حديث سهل بن حنيف، وحديث «وإذا استغسلتم فاغسلوا» في صحيح مسلم.'
    },
    {
      id: 'mistakes', icon: '🚫', title: 'أخطاء ومخاطر شائعة', summary: 'علامات تستوجب التوقف والابتعاد عن الممارس.',
      sections: [
        ['التشخيص الجازم', 'من الخطأ الجزم بأن كل مرض عين، أو تحديد العائن بواسطة حلم أو اسم أو صورة.'],
        ['الدجل', 'طلب اسم الأم، الطلاسم، الأرقام والمربعات، ادعاء معرفة الغيب، الذبح لغير الله، الاستعانة بالجن أو التمائم.'],
        ['الإيذاء', 'الضرب والخنق والحرق والصعق والحرمان من الطعام أو الدواء ممارسات خطرة ومرفوضة.'],
        ['الخصوصية', 'الخلوة المحرمة، لمس العورات، تصوير المريض دون إذنه، أو ابتزازه ماليًا أو نفسيًا أسباب كافية للابتعاد والإبلاغ.']
      ],
      source: 'ضوابط الرقية الشرعية وقواعد منع الضرر وحفظ العرض والمال.'
    },
    {
      id: 'faq', icon: '❓', title: 'أسئلة شائعة', summary: 'إجابات مباشرة عن أكثر المسائل تداولًا.',
      sections: [
        ['هل يمكن أن أرقي نفسي؟', 'نعم، رقية الإنسان لنفسه مشروعة، ولا يشترط الذهاب إلى راقٍ.'],
        ['هل كل نعمة تحتاج إلى إخفاء؟', 'لا. المطلوب شكر الله والتبريك وحسن التصرف، لا العيش في خوف أو وسواس.'],
        ['هل الماء والزيت واجبان؟', 'لا. أصل الرقية القراءة والدعاء، وما عدا ذلك من الوسائل المباحة لا يُجعل شرطًا ولا علاجًا مضمونًا.'],
        ['هل أعرف العائن من المنام؟', 'لا. المنام لا يثبت تهمة ولا يُبنى عليه حكم على شخص.'],
        ['متى أطلب مساعدة؟', 'عند تعطل الحياة أو اشتداد القلق، اجمع بين طبيب أو معالج نفسي مؤهل وشيخ موثوق ملتزم بالضوابط إن احتجت.']
      ],
      source: 'إجابات تعليمية عامة ضمن ضوابط الرقية والسلامة.'
    }
  ];

  window.NOOR_EYE_TOPICS = TOPICS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ـ/g, '').replace(/\s+/g, ' ').trim();

  function hideOtherViews() {
    $('#ruqyahHub')?.classList.add('hidden');
    $('#ruqyahReader')?.classList.add('hidden');
    $('#ruqyahEncyclopedia')?.classList.add('hidden');
    $('#hasadEncyclopedia')?.classList.add('hidden');
  }

  function showHub() {
    $('#eyeEncyclopedia')?.classList.add('hidden');
    $('#ruqyahHub')?.classList.remove('hidden');
    $('#ruqyahHub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function topicCard(topic) {
    const searchable = [topic.title, topic.summary, ...topic.sections.flat()].join(' ');
    return `<button class="eye-topic-card" type="button" data-eye-topic="${esc(topic.id)}" data-eye-search="${esc(searchable)}"><span class="eye-topic-icon">${topic.icon}</span><span class="eye-topic-copy"><b>${esc(topic.title)}</b><small>${esc(topic.summary)}</small></span><span aria-hidden="true">←</span></button>`;
  }

  function renderHome() {
    return `<div class="eye-ency-head"><button class="btn" type="button" data-eye-back>← أقسام الرقية</button><div><span class="eyebrow">المرحلة السادسة · محتوى توعوي موثّق</span><h2>موسوعة العين</h2><p>تعريف وأدلة ووقاية ورقية ذاتية، مع فصل واضح بين الرقية والتشخيص الطبي.</p></div></div>
      <div class="eye-ency-alert"><b>تنبيه مهم</b><span>لا يثبت وجود العين بعرض منفرد أو حلم أو نتيجة اختبار. عند استمرار الأعراض أو شدتها راجع مختصًا.</span></div>
      <div class="eye-ency-tools"><label for="eyeEncySearch">ابحث داخل الموسوعة</label><div><input id="eyeEncySearch" type="search" autocomplete="off" placeholder="مثال: التبريك، الأعراض، الاغتسال، الرقية"><button id="eyeEncyClear" class="btn small" type="button">مسح</button></div><p id="eyeEncyCount">${TOPICS.length} موضوعات</p></div>
      <div id="eyeEncyGrid" class="eye-topic-grid">${TOPICS.map(topicCard).join('')}</div>
      <div id="eyeEncyEmpty" class="search-empty hidden"><span>⌕</span><p>لا توجد نتيجة مطابقة. جرّب كلمة أقصر.</p></div>
      <div class="eye-ency-actions"><button class="btn premium-primary" type="button" data-eye-open-ruqyah>فتح آيات العين والحسد</button><button class="btn premium-secondary" type="button" data-eye-open-assessment>فتح التقييم الإرشادي</button><a class="btn" href="#" onclick="event.preventDefault();window.navTo?.('library')" target="_blank" rel="noopener">عرض بيانات المرجع وسياسة النشر</a></div>`;
  }

  function renderTopic(topic) {
    return `<div class="eye-ency-head"><button class="btn" type="button" data-eye-home>← موسوعة العين</button><div><span class="eyebrow">${topic.icon} موسوعة العين</span><h2>${esc(topic.title)}</h2><p>${esc(topic.summary)}</p></div></div>
      <article class="eye-topic-article">${topic.sections.map(([title, body], index) => `<section><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></section>`).join('')}<footer><b>المصدر:</b> ${esc(topic.source)}</footer></article>
      <div class="eye-topic-bottom"><button class="btn premium-secondary" type="button" data-eye-home>عرض كل الموضوعات</button><button class="btn premium-primary" type="button" data-eye-open-ruqyah>قراءة آيات العين والحسد</button></div>`;
  }

  function show(html) {
    const root = $('#eyeEncyclopedia');
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

  function wire() {
    $$('[data-eye-back]').forEach(button => button.addEventListener('click', showHub));
    $$('[data-eye-home]').forEach(button => button.addEventListener('click', () => show(renderHome())));
    $$('[data-eye-topic]').forEach(button => button.addEventListener('click', () => openTopic(button.dataset.eyeTopic)));
    $$('[data-eye-open-ruqyah]').forEach(button => button.addEventListener('click', () => {
      $('#eyeEncyclopedia')?.classList.add('hidden');
      $('#ruqyahHub')?.classList.remove('hidden');
      setTimeout(() => document.querySelector('[data-rq-open="eye"]')?.click(), 60);
    }));
    $$('[data-eye-open-assessment]').forEach(button => button.addEventListener('click', () => window.navTo?.('assessment')));

    const input = $('#eyeEncySearch');
    const clear = $('#eyeEncyClear');
    const count = $('#eyeEncyCount');
    const empty = $('#eyeEncyEmpty');
    if (input) {
      const apply = () => {
        const query = normalize(input.value);
        let visible = 0;
        $$('[data-eye-topic]').forEach(card => {
          const match = !query || normalize(card.dataset.eyeSearch).includes(query);
          card.hidden = !match;
          if (match) visible += 1;
        });
        if (count) count.textContent = `${visible} من ${TOPICS.length} موضوعات`;
        empty?.classList.toggle('hidden', visible !== 0);
      };
      input.addEventListener('input', apply);
      clear?.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-eye-encyclopedia]').forEach(button => button.addEventListener('click', () => show(renderHome())));
  });
})();
