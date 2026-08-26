'use strict';
(function(){
  const $=(selector,root=document)=>root.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  const AREAS={
    eye:{
      icon:'👁️',
      title:'العين',
      short:'أسئلة مختصرة عن الأعراض المتداولة للعين واستجابة الجسد للرقية.',
      scholar:'خلاصة أهل الرقية: العين ثابتة في السنة، لكن الأعراض وحدها لا تثبت الإصابة ولا تحدد شخصًا بعينه. المشروع هو الرقية والدعاء بالبركة وترك الاتهام والوسواس.',
      sources:['صحيح البخاري وصحيح مسلم: «العين حق»','آيات العين والحسد — الموقع الرسمي للشيخ خالد الحبشي','وقاية الإنسان من الجن والشيطان — وحيد عبدالسلام بالي'],
      treatment:[
        'اقرأ الفاتحة وآية الكرسي والإخلاص والفلق والناس بتدبر وهدوء.',
        'قل: «بسم الله أرقيك، من كل شيء يؤذيك…» و«أعوذ بكلمات الله التامة من كل شيطان وهامة ومن كل عين لامة».',
        'حافظ على أذكار الصباح والمساء والنوم، وادعُ بالبركة عند الإعجاب.',
        'لا تتهم أحدًا ولا توقف علاجًا طبيًا، وراجع المختص عند استمرار الأعراض.'
      ],
      questions:[
        {text:'هل تشعر بخمول أو ثقل غير معتاد يتكرر دون سبب واضح؟'},
        {text:'هل يتكرر الصداع أو ضغط الرأس بصورة لافتة؟'},
        {text:'هل يكثر التثاؤب أو الدموع أثناء قراءة الرقية؟'},
        {text:'هل تشعر بحرارة أو برودة مفاجئة أثناء الرقية؟'},
        {text:'هل تظهر آلام متنقلة أو تنميل متكرر دون تفسير معروف؟'},
        {text:'هل تلاحظ ضيقًا أو خفقانًا عند سماع الرقية ثم يهدأ بعد ذلك؟'},
        {text:'هل تكررت كوابيس أو اضطرابات نوم مع بداية الأعراض؟'},
        {text:'هل بدأ التغير بصورة مفاجئة بعد فترة استقرار؟'},
        {text:'هل تشعر بتحسن ملحوظ بعد الفاتحة والمعوذات والأذكار؟'},
        {text:'هل استمرت الأعراض رغم تنظيم النوم والغذاء ومراجعة الأسباب المعتادة؟'}
      ]
    },
    hasad:{
      icon:'🛡️',
      title:'الحسد',
      short:'أسئلة عن الأعراض المتداولة للحسد من غير اتهام شخص أو بناء حكم على الظن.',
      scholar:'خلاصة أهل العلم: يُستعاذ بالله من شر الحاسد، لكن لا يجوز تفسير كل تعطل أو مرض بالحسد، ولا اتهام الناس بلا بينة. التحصين والرقية مع حسن الظن ومعالجة الأسباب الواقعية هو المنهج الآمن.',
      sources:['سورة الفلق: ﴿ومن شر حاسد إذا حسد﴾','آيات العين والحسد — الشيخ خالد الحبشي','وقاية الإنسان من الجن والشيطان — وحيد عبدالسلام بالي'],
      treatment:[
        'اقرأ الفاتحة والمعوذات وآية الكرسي، وحافظ على أذكار الصباح والمساء.',
        'أكثر من الشكر والدعاء بالبركة، ولا تنشر كل نعمة أو تفاصيل خاصة بلا حاجة.',
        'اقطع التفكير في تحديد الحاسد أو مراقبة الناس؛ فهذا يفتح باب الوسواس والخصومة.',
        'عالج أسباب التعطل الواقعية بالتوازي مع الرقية، واستعن بمختص عند الحاجة.'
      ],
      questions:[
        {text:'هل حدث خمول أو فتور مفاجئ بعد فترة نشاط واستقرار؟'},
        {text:'هل تشعر بضيق متكرر أو انقباض دون سبب واضح؟'},
        {text:'هل تتكرر آلام الرأس أو الكتفين مع الإرهاق والثقل؟'},
        {text:'هل زادت اضطرابات النوم أو الكوابيس مع بداية المشكلة؟'},
        {text:'هل تشعر بنفور غير معتاد من عمل أو دراسة أو نشاط كنت تحبه؟'},
        {text:'هل يتكرر التثاؤب أو الدموع عند قراءة المعوذات والرقية؟'},
        {text:'هل تلاحظ تحسنًا بعد المحافظة على الأذكار والرقية الذاتية؟'},
        {text:'هل طرأ تعطّل مفاجئ في أكثر من جانب دون سبب واحد واضح؟'},
        {text:'هل استبعدت قدر الإمكان الأسباب العملية أو الصحية الواضحة؟'},
        {text:'هل تمنعك الأعراض من أداء يومك بصورة طبيعية؟'}
      ]
    },
    magic:{
      icon:'🪢',
      title:'السحر',
      short:'أسئلة مركزة عن العلامات المتداولة في كتب الرقية، بلا طلاسم أو تشخيص قطعي.',
      scholar:'خلاصة أهل الرقية: السحر ثابت في النصوص، لكن لا يُحكم به من عرض واحد أو حلم. العلاج المشروع يكون بالقرآن والدعاء، مع منع الذهاب للسحرة والطلاسم والمواد المجهولة.',
      sources:['سورة البقرة: 102','تخصيص الآيات في الرقية من الأمراض — خالد بن إبراهيم الحبشي','الصارم البتار ووقاية الإنسان — وحيد عبدالسلام بالي'],
      treatment:[
        'اقرأ الفاتحة وآية الكرسي وخواتيم البقرة والمعوذات.',
        'اقرأ آيات إبطال السحر في الأعراف 117–122، ويونس 81–82، وطه 68–70.',
        'لا تستخدم طلاسم أو بخورًا مجهولًا ولا تذهب إلى ساحر أو كاهن.',
        'إذا عثرت على مادة خطرة أو مجهولة فلا تلمسها، واستعن بالجهة المختصة عند الاشتباه بجريمة أو خطر.'
      ],
      questions:[
        {text:'هل حدث نفور شديد ومفاجئ بين الزوجين أو أفراد الأسرة دون سبب واضح؟'},
        {text:'هل تتكرر أحلام عن عقد أو خيوط أو طلاسم بصورة ملحّة؟'},
        {text:'هل تشعر بغثيان أو ألم أو اضطراب قوي عند سماع آيات السحر؟'},
        {text:'هل تتكرر تقلبات حادة في المزاج بصورة غير معتادة؟'},
        {text:'هل ظهرت آلام متنقلة أو صداع شديد مع بداية المشكلة؟'},
        {text:'هل عُثر فعلًا على عقد أو أوراق أو مواد غريبة مشتبه بها؟'},
        {text:'هل سبق التعامل مع ساحر أو شخص أعطاك طلاسم أو مواد مجهولة؟'},
        {text:'هل وُجد تهديد موثق أو واقعة حقيقية مرتبطة ببداية الأعراض؟'},
        {text:'هل تشعر بتحسن واضح عند تكرار الرقية الشرعية المأثورة؟'},
        {text:'هل استمرت المشكلة رغم معالجة أسبابها الأسرية أو الصحية أو العملية؟'}
      ]
    },
    touch:{
      icon:'🌙',
      title:'المس',
      short:'أسئلة محدودة عن الأعراض التي تذكر في أبواب المس مع مراعاة السلامة الطبية.',
      scholar:'خلاصة أهل الرقية: يثبت أذى الشيطان ووسوسته، لكن الإغماء والتشنج وسماع الأصوات وأعراض النوم قد تكون لها أسباب طبية أو نفسية. الرقية لا تبرر الضرب أو الخنق أو إيقاف الدواء.',
      sources:['سورة الناس وسورة المؤمنون 97–98','أبواب علاج المس والتحصين — خالد الحبشي','وقاية الإنسان من الجن والشيطان — وحيد عبدالسلام بالي'],
      treatment:[
        'اقرأ الفاتحة وآية الكرسي وخواتيم البقرة والإخلاص والفلق والناس.',
        'قل أدعية الشفاء والاستعاذة الثابتة، مع النفث الخفيف من غير صراخ أو إيذاء.',
        'حافظ على النوم المنتظم والصلاة والأذكار، وتجنب العزلة والخوف ومتابعة المقاطع المرعبة.',
        'التشنج أو فقد الوعي أو سماع أصوات أو أفكار إيذاء النفس يستلزم تقييمًا طبيًا عاجلًا، مع جواز الرقية بالتوازي.'
      ],
      questions:[
        {text:'هل تتكرر حالة شلل النوم أو العجز عن الحركة عند الاستيقاظ؟'},
        {text:'هل تتكرر كوابيس وفزع شديد يمنعك من النوم الطبيعي؟'},
        {text:'هل تشعر برعشة أو حركة لا إرادية عند سماع الرقية؟'},
        {text:'هل يحدث ضيق أو بكاء شديد ومتكرر أثناء قراءة القرآن؟'},
        {text:'هل تشعر بنفور مفاجئ وقوي من الصلاة أو القرآن بصورة غير معتادة؟'},
        {text:'هل تظهر نوبات غضب أو خوف شديد لا تتذكر سببها بوضوح؟'},
        {text:'هل تشعر بثقل شديد أو آلام متنقلة تزداد وقت الرقية؟'},
        {text:'هل تتحسن الأعراض عند المحافظة على الأذكار والرقية الذاتية؟'},
        {text:'هل حدث تشنج أو فقد وعي أو سقوط مفاجئ؟',urgent:true},
        {text:'هل تسمع أصواتًا لا يسمعها الآخرون أو تراودك أفكار بإيذاء نفسك أو غيرك؟',urgent:true}
      ]
    },
    causes:{
      icon:'🔎',
      title:'أسباب الاشتباه',
      short:'أسئلة تساعدك تفرّق بين الاشتباه المنضبط والوسواس أو ربط كل شيء بالرقية.',
      scholar:'منهج الرقية الشرعية يقوم على الجمع بين التحصين والرقية وبين النظر في الأسباب الظاهرة. لا يصح جعل كل مرض أو تعطل دليلًا على عين أو سحر أو مس، ولا يصح اتهام أحد بلا بينة.',
      sources:['قاعدة التثبت وعدم اتباع الظن — الحجرات 6 والإسراء 36','ضوابط الرقية الشرعية — خالد بن إبراهيم الحبشي','وقاية الإنسان من الجن والشيطان — وحيد عبدالسلام بالي'],
      treatment:[
        'اكتب بداية الأعراض ومدتها وما يزيدها أو يخففها بدل الحكم السريع.',
        'راجع الأسباب الصحية والنفسية والأسرية والعملية بالتوازي مع الرقية.',
        'لا تبنِ اتهامًا على حلم أو شعور أو كلام الناس.',
        'اجعل الرقية عبادة وطلب شفاء لا بابًا للخوف والمراقبة والوسواس.'
      ],
      questions:[
        {text:'هل بدأت الأعراض فجأة بعد موقف محدد وتكررت بنفس النمط أكثر من مرة؟'},
        {text:'هل توجد أعراض قوية تظهر عند الرقية وتخف بعدها بوضوح؟'},
        {text:'هل استبعدت أسبابًا ظاهرة مثل قلة النوم أو الضغط أو المرض أو الخلافات؟'},
        {text:'هل تعتمد في الاشتباه على دليل حقيقي لا على حلم أو ظن أو كلام مرسل؟'},
        {text:'هل توقفت عن اتهام الأشخاص وركزت على التحصين والرقية؟'},
        {text:'هل تحافظ على الصلاة والأذكار قبل البحث عن تفسيرات غيبية؟'},
        {text:'هل سجلت الأعراض لمدة أسبوع لمعرفة نمطها الحقيقي؟'},
        {text:'هل يوجد خطر حالي مثل فقد وعي أو تشنج أو أفكار إيذاء؟',urgent:true}
      ]
    },
    treatmentPlan:{
      icon:'🌿',
      title:'طرق العلاج',
      short:'تقييم جاهزية خطة العلاج الشرعية الآمنة: قرآن، أذكار، دعاء، ماء مقروء عليه بلا ممارسات مؤذية.',
      scholar:'العلاج المشروع يكون بالقرآن والأدعية الثابتة والرقية الخالية من الشرك والطلاسم، مع اجتناب السحرة والكهنة، وعدم ترك العلاج الطبي النافع.',
      sources:['الفاتحة، آية الكرسي، خواتيم البقرة، الإخلاص والمعوذتان','صحيح مسلم: لا بأس بالرقى ما لم تكن شركًا','كتب الرقية والتحصين — خالد الحبشي ووحيد عبدالسلام بالي'],
      treatment:[
        'اقرأ الفاتحة سبعًا، وآية الكرسي، وخواتيم البقرة، والإخلاص والمعوذتين مع النفث الخفيف.',
        'اقرأ على ماء واشرب واغتسل عند الحاجة دون اعتقاد خاص في الماء نفسه.',
        'حافظ على أذكار الصباح والمساء والنوم، وأكثر من الدعاء والاستغفار.',
        'امتنع عن الطلاسم والبخور المجهول والضرب والخنق والعزل المخيف، واطلب مختصًا عند علامات الخطر.'
      ],
      questions:[
        {text:'هل تستطيع الالتزام برقية يومية قصيرة لمدة أسبوع دون مبالغة أو خوف؟'},
        {text:'هل تعرف الآيات والأدعية التي ستقرأها بوضوح؟'},
        {text:'هل ستتجنب الذهاب إلى ساحر أو قارئ يستخدم طلاسم أو أسماء مجهولة؟'},
        {text:'هل ستجمع بين الرقية والأخذ بالأسباب الطبية أو النفسية عند الحاجة؟'},
        {text:'هل ستتوقف عن متابعة المقاطع المخيفة التي تزيد القلق؟'},
        {text:'هل تستطيع جعل الرقية بهدوء وخشوع لا بصراخ أو إيذاء؟'},
        {text:'هل يوجد شخص موثوق يساعدك عند الخوف الشديد أو التعب؟'},
        {text:'هل ستطلب الطوارئ فورًا عند الإغماء أو التشنج أو خطر إيذاء النفس؟',urgent:true}
      ]
      }
  };

  let state={area:null,index:0,answers:[]};

  function getSection(){return $('#assessment');}

  function updateRuqyahCallout(){
    const callout=$('.v4019-assessment-callout');
    if(!callout)return;
    callout.innerHTML=`<div><span>تقييم الرقية الشرعية</span><h3>6 أقسام مركزة · أسئلة بنعم أو لا</h3><p>اختر العين أو الحسد أو السحر أو المس أو أسباب الاشتباه أو طرق العلاج، وأكمل تقييمًا واحدًا فقط في نحو دقيقة.</p></div><button type="button" id="v4022OpenAssessment">فتح التقييم <b>←</b></button>`;
    $('#v4022OpenAssessment')?.addEventListener('click',()=>window.navTo?.('assessment'));
  }

  function areaCards(){
    return Object.entries(AREAS).map(([key,area])=>`
      <article class="v4022-area-card" data-v4022-area="${key}" tabindex="0" role="button" aria-label="بدء تقييم ${esc(area.title)}">
        <div class="v4022-area-icon">${area.icon}</div>
        <div class="v4022-area-copy"><span>${area.questions.length} أسئلة · نعم أو لا</span><h2>${esc(area.title)}</h2><p>${esc(area.short)}</p></div>
        <button type="button">ابدأ التقييم <b>←</b></button>
      </article>`).join('');
  }

  function buildPage(){
    const sec=getSection();
    if(!sec)return;
    sec.className='page v4022-assessment-page';
    sec.innerHTML=`
      <div class="v4022-shell">
        <header class="v4022-hero">
          <div><span>تقييم الرقية الشرعية</span><h1>اختر قسم الرقية الذي تريد تقييمه</h1><p>كل قسم مستقل وأسئلته بنعم أو لا: العين، الحسد، السحر، المس، أسباب الاشتباه، وطرق العلاج الشرعية الآمنة. النتيجة إرشادية ولا تعد تشخيصًا قطعيًا.</p></div>
          <button type="button" onclick="navTo('ruqyah')">العودة لمساعد الرقية</button>
        </header>
        <section id="v4022Hub" class="v4022-area-grid">${areaCards()}</section>
        <section id="v4022Runner" class="v4022-runner hidden" aria-live="polite"></section>
        <section id="v4022Result" class="v4022-result hidden" aria-live="polite"></section>
        <div class="v4022-safety-note"><b>تنبيه:</b> لا تتهم شخصًا بعين أو حسد أو سحر، ولا توقف دواءً موصوفًا. يمكن الجمع بين الرقية الشرعية والفحص الطبي أو النفسي عند الحاجة.</div>
      </div>`;
    sec.querySelectorAll('[data-v4022-area]').forEach(card=>{
      const start=()=>begin(card.dataset.v4022Area);
      card.addEventListener('click',start);
      card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();start();}});
    });
  }

  function begin(key){
    if(!AREAS[key])return;
    state={area:key,index:0,answers:[]};
    $('#v4022Hub')?.classList.add('hidden');
    $('#v4022Result')?.classList.add('hidden');
    $('#v4022Runner')?.classList.remove('hidden');
    drawQuestion();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function drawQuestion(){
    const area=AREAS[state.area];
    const q=area.questions[state.index];
    const runner=$('#v4022Runner');
    if(!runner||!q)return;
    const progress=Math.round((state.index/area.questions.length)*100);
    runner.innerHTML=`
      <div class="v4022-runner-head">
        <button type="button" id="v4022BackToHub">إلغاء</button>
        <div><span>${area.icon} تقييم ${esc(area.title)}</span><b>السؤال ${state.index+1} من ${area.questions.length}</b></div>
      </div>
      <div class="v4022-progress"><i style="width:${progress}%"></i></div>
      <div class="v4022-question-number">${String(state.index+1).padStart(2,'0')}</div>
      <h2>${esc(q.text)}</h2>
      ${q.urgent?'<p class="v4022-urgent-question">هذه علامة سلامة مهمة؛ عند الإجابة بنعم ستظهر لك توصية عاجلة.</p>':''}
      <div class="v4022-yes-no">
        <button type="button" data-v4022-answer="yes" class="yes">نعم</button>
        <button type="button" data-v4022-answer="no" class="no">لا</button>
      </div>`;
    $('#v4022BackToHub')?.addEventListener('click',showHub);
    runner.querySelectorAll('[data-v4022-answer]').forEach(button=>button.addEventListener('click',()=>answer(button.dataset.v4022Answer==='yes')));
  }

  function answer(value){
    const area=AREAS[state.area];
    state.answers.push({question:area.questions[state.index],yes:value});
    state.index+=1;
    if(state.index>=area.questions.length)finish(); else drawQuestion();
  }

  function finish(){
    const area=AREAS[state.area];
    const yesCount=state.answers.filter(x=>x.yes).length;
    const urgent=state.answers.some(x=>x.yes&&x.question.urgent);
    const ratio=yesCount/area.questions.length;
    let level,summary;
    if(ratio<=0.2){level='توافق محدود';summary='إجابات نعم قليلة، ولا يظهر من هذا التقييم المختصر توافق واسع مع الأوصاف المتداولة.';}
    else if(ratio<=0.5){level='توافق متوسط';summary='توجد بعض الأعراض المشتركة. ابدأ بالرقية الذاتية الهادئة، وراجع الأسباب الصحية والنفسية والعملية.';}
    else {level='توافق مرتفع مع الأوصاف المذكورة';summary='عدد ملحوظ من الإجابات متوافق مع الأوصاف المتداولة، لكنه لا يثبت الإصابة ولا يغني عن التقييم المتخصص.';}
    const result=$('#v4022Result');
    $('#v4022Runner')?.classList.add('hidden');
    result?.classList.remove('hidden');
    if(!result)return;
    result.innerHTML=`
      <div class="v4022-result-top"><span>نتيجة تقييم ${esc(area.title)}</span><h2>${esc(level)}</h2><p>${esc(summary)}</p><div class="v4022-score"><b>${yesCount}</b><span>إجابة نعم من ${area.questions.length}</span></div></div>
      ${urgent?'<div class="v4022-urgent-alert"><b>تنبيه عاجل:</b> التشنج أو فقد الوعي أو سماع أصوات أو وجود أفكار لإيذاء النفس أو الآخرين يحتاج تقييمًا طبيًا عاجلًا. لا تؤخر المساعدة بسبب أي تفسير روحي.</div>':''}
      <article class="v4022-scholar-view"><span>رأي العلماء ومنهج أهل الرقية</span><p>${esc(area.scholar)}</p><details><summary>المراجع المستخدمة</summary><ul>${area.sources.map(source=>`<li>${esc(source)}</li>`).join('')}</ul></details></article>
      <article class="v4022-treatment"><span>كيف تبدأ الرقية لنفسك؟</span><ol>${area.treatment.map(step=>`<li>${esc(step)}</li>`).join('')}</ol></article>
      <div class="v4022-result-actions"><button type="button" class="primary" id="v4022OpenRuqyah">فتح الرقية الشرعية</button><button type="button" id="v4022Retry">إعادة تقييم ${esc(area.title)}</button><button type="button" id="v4022Other">اختيار قسم آخر</button></div>`;
    $('#v4022OpenRuqyah')?.addEventListener('click',()=>window.navTo?.('ruqyah'));
    $('#v4022Retry')?.addEventListener('click',()=>begin(state.area));
    $('#v4022Other')?.addEventListener('click',showHub);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function showHub(){
    state={area:null,index:0,answers:[]};
    $('#v4022Runner')?.classList.add('hidden');
    $('#v4022Result')?.classList.add('hidden');
    $('#v4022Hub')?.classList.remove('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function init(){
    buildPage();
    updateRuqyahCallout();
    setTimeout(updateRuqyahCallout,250);
    setTimeout(updateRuqyahCallout,900);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
  window.NOOR_V4022={AREAS,rebuild:init};
})();
