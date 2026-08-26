
(function(){
'use strict';
const DATA={"eye": {"title": "تقييم أعراض العين والحسد", "source": "المصدر: الموقع الرسمي للشيخ خالد الحبيش، «أعراض وعلامات الإصابة بالعين» و«أعراض الإصابة بالحسد».", "items": ["هل يحدث لك تثاؤب متتابع دون وجود نعاس واضح؟", "هل تشعر بحرارة أو برودة متكررة دون سبب معروف؟", "هل يتكرر ضيق الصدر أو الخمول والكسل بصورة لافتة؟", "هل تعاني أرقًا أو صداعًا متكررًا؟", "هل تظهر كدمات زرقاء أو بنية دون سبب واضح؟", "هل يوجد تساقط شعر أو شحوب واضح دون تفسير معروف؟", "هل يتكرر العطاس دون زكام أو حساسية مشخصة؟", "هل تشعر بنعاس أو ضعف تركيز عند القراءة أو المذاكرة؟", "هل تتكرر الحكة أو ظهور حبوب ودمامل دون سبب معروف؟", "هل تتكرر أحلام مزعجة مرتبطة بعيون أو حيوانات أو أشخاص تعرفهم؟"]}, "magic": {"title": "تقييم أعراض السحر", "source": "المصدر: الموقع الرسمي للشيخ خالد الحبيش، «أعراض الإصابة بالسحر».", "items": ["هل حدث تغير حاد ومستمر في العلاقة الزوجية أو نفور شديد دون سبب واضح؟", "هل تتكرر تقلبات شديدة في المزاج أو غضب وبكاء بصورة غير معتادة؟", "هل يوجد صداع أو ألم متكرر لم يُعرف سببه بعد التقييم الطبي؟", "هل تتكرر أحلام عن عقد أو طلاسم أو رموز أو أشخاص يمارسون السحر؟", "هل عُثر فعلًا على مواد غريبة أو طلاسم أو عقد في المنزل أو المتعلقات؟", "هل سبق التعامل مع ساحر أو استخدام بخور أو ماء أو طلاسم منه؟", "هل تتكرر رغبة في القيء أو اضطراب شديد عند قراءة آيات السحر؟", "هل يتكرر الأرق الشديد أو الأحلام الكثيرة بصورة غير معتادة؟", "هل تظهر كدمات أو آلام متنقلة دون سبب طبي معروف؟", "هل توجد تهديدات سابقة موثقة مرتبطة بما يحدث لك الآن؟"]}, "touch": {"title": "تقييم أعراض المس", "source": "المصدر: الموقع الرسمي للشيخ خالد الحبيش، أبواب «أنواع المس» و«علاج المس» و«التحصين والوقاية من الإصابة بالمس».", "items": ["هل تتكرر حالة شلل النوم مع عدم القدرة على الحركة أو الكلام عند الاستيقاظ؟", "هل يتكرر شعور مفاجئ بثقل شديد أو صعوبة حركة عند النوم؟", "هل تتكرر وساوس أو خوف شديد بصورة تعطل حياتك؟", "هل يتكرر ضيق الصدر أو العصبية دون سبب واضح؟", "هل تحدث رعشة شديدة أو تشنجات تحتاج إلى تقييم طبي؟", "هل تتكرر أحلام أو فزع شديد يمنع النوم؟", "هل تشعر بأعراض قوية ومتكررة عند سماع الرقية؟", "هل توجد نوبات فقد وعي أو صرع غير مشخصة طبيًا؟", "هل تسمع أصواتًا لا يسمعها الآخرون أو ترى أشياء لا يرونها؟", "هل تسبب لك هذه الأعراض تعطيلًا واضحًا في العمل أو الدراسة أو العلاقات؟"]}};
const PROTECTION=[{"title": "الاستعاذة من همزات الشياطين", "text": "وَقُلْ رَبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ ۝ وَأَعُوذُ بِكَ رَبِّ أَنْ يَحْضُرُونِ", "source": "سورة المؤمنون، الآيتان 97–98."}, {"title": "الاستعاذة عند النزغ", "text": "وَإِمَّا يَنْزَغَنَّكَ مِنَ الشَّيْطَانِ نَزْغٌ فَاسْتَعِذْ بِاللَّهِ إِنَّهُ سَمِيعٌ عَلِيمٌ", "source": "سورة الأعراف، الآية 200."}, {"title": "أعوذ بكلمات الله التامات", "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", "source": "صحيح مسلم (2708)."}, {"title": "بسم الله الذي لا يضر", "text": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ", "source": "سنن أبي داود (5088)، والترمذي (3388)، ثلاث مرات صباحًا ومساءً."}, {"title": "أعوذ بكلمات الله التامة", "text": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ", "source": "صحيح البخاري (3371)."}, {"title": "المعوذات", "text": "قراءة سورة الإخلاص وسورتي الفلق والناس ثلاث مرات صباحًا ومساءً.", "source": "سنن أبي داود (5082)، والترمذي (3575)."}];
const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
let current=null,index=0,answers=[];

function start(type){
 current=type;index=0;answers=[];
 $('#assessmentHub').classList.add('hidden');
 $('#assessmentResult').classList.add('hidden');
 $('#assessmentRunner').classList.remove('hidden');
 $('#assessmentTitle').textContent=DATA[type].title;
 $('#assessmentSource').textContent=DATA[type].source;
 draw();
 window.scrollTo({top:0,behavior:'smooth'});
}
function draw(){
 const d=DATA[current],q=d.items[index];
 $('#assessmentProgressBar').style.width=((index/d.items.length)*100)+'%';
 $('#assessmentQuestion').innerHTML=`<div class="assessment-count">السؤال ${index+1} من ${d.items.length}</div>
 <h2>${q}</h2>
 <div class="assessment-answer-grid">
  <button data-score="0">لا</button>
  <button data-score="1">أحيانًا</button>
  <button data-score="2">نعم، يتكرر</button>
 </div>
 <p class="assessment-help">اختر الإجابة الأقرب، ولا تبنِ عليها حكمًا قطعيًا.</p>`;
 $$('.assessment-answer-grid button').forEach(b=>b.onclick=()=>answer(Number(b.dataset.score)));
}
function answer(score){
 answers.push(score);index++;
 if(index>=DATA[current].items.length)finish();else draw();
}
function finish(){
 $('#assessmentRunner').classList.add('hidden');
 const result=$('#assessmentResult');result.classList.remove('hidden');
 const max=DATA[current].items.length*2;
 const pct=Math.round(answers.reduce((a,b)=>a+b,0)/max*100);
 let label=pct<25?'تطابق منخفض':pct<50?'تطابق محدود':pct<75?'تطابق متوسط':'تطابق مرتفع';
 let note=pct<25?'الأجوبة لا تتشابه كثيرًا مع القائمة المذكورة في المرجع.':
          pct<50?'توجد بعض الأعراض المتشابهة، لكنها لا تكفي للحكم على السبب.':
          pct<75?'توجد عدة أعراض متشابهة، ويُنصح بالرقية الذاتية مع فحص الأسباب الطبية والنفسية.':
          'يوجد تشابه كبير مع القائمة المرجعية، لكنه ليس تشخيصًا ولا يثبت وجود إصابة روحية.';
 result.innerHTML=`<div class="result-gauge" style="--score:${pct}"><div><b>${pct}%</b><span>نسبة تطابق</span></div></div>
 <span class="result-label">${label}</span><h2>${note}</h2>
 <div class="result-disclaimer"><b>مهم:</b> هذه النسبة ليست احتمال الإصابة وليست تشخيصًا. لا تتهم شخصًا، ولا توقف علاجًا، وراجع الطبيب عند الأعراض المستمرة أو الشديدة.</div>
 <div class="result-source">${DATA[current].source}</div>
 <div class="result-actions"><button class="btn primary" onclick="navTo('ruqyah')">ابدأ الرقية</button><button id="redoAssessment" class="btn">إعادة التقييم</button><button id="allAssessments" class="btn">أنواع التقييم</button></div>`;
 $('#redoAssessment').onclick=()=>start(current);
 $('#allAssessments').onclick=showHub;
 window.scrollTo({top:0,behavior:'smooth'});
}
function showHub(){
 $('#assessmentRunner').classList.add('hidden');$('#assessmentResult').classList.add('hidden');$('#assessmentHub').classList.remove('hidden');
}
function patchRuqyahProtection(){
 const reader=$('#ruqyahReaderContent');
 const buttons=$$('[data-rq-open="protection"]');
 buttons.forEach(b=>b.onclick=()=>{
   $('#ruqyahHub').classList.add('hidden');$('#ruqyahReader').classList.remove('hidden');
   $('#rqReaderTitle').textContent='أدعية الاستعاذة وإبطال الأذى';
   $('#rqReaderKicker').textContent='القرآن والسنة الصحيحة';
   $('#rqReaderDescription').textContent='لا يوجد دعاء نبوي ثابت باسم «حرق الجن»؛ لذلك نعرض الأدعية والآيات الصحيحة للاستعاذة والحفظ.';
   reader.innerHTML=PROTECTION.map(d=>`<article class="rq-reading-card"><div class="rq-card-heading"><h3>${d.title}</h3></div><div class="rq-dua-text">${d.text}</div><div class="rq-source-line">المصدر: ${d.source}</div></article>`).join('');
   window.scrollTo({top:0,behavior:'smooth'});
 });
}
function hardNavFix(){
 const old=window.navTo;
 window.navTo=function(id){
   document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
   const page=document.getElementById(id);
   if(page)page.classList.add('active');
   document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
   document.body.classList.toggle('home-view',id==='home');
   document.body.classList.toggle('inner-view',id!=='home');
   document.getElementById('globalInnerBar')?.classList.toggle('hidden',id==='home');
   const title=document.getElementById('globalPageTitle');
   if(title)title.textContent={home:'الرئيسية',adhkar:'الأذكار',ruqyah:'الرقية الشرعية',assessment:'تقييم الأعراض',quran:'القرآن الكريم',library:'المراجع'}[id]||'القسم';
   history.replaceState(null,'','#'+id);
   if(id==='adhkar'&&window.showAdhkarCategories)window.showAdhkarCategories();
   window.scrollTo({top:0,behavior:'smooth'});
 };
}
document.addEventListener('DOMContentLoaded',()=>{
 $$('[data-assessment]').forEach(b=>b.onclick=()=>start(b.dataset.assessment));
 $('#assessmentBack')?.addEventListener('click',showHub);
 patchRuqyahProtection();hardNavFix();
});
})();
