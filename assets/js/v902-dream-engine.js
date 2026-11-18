'use strict';
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NOOR_V902_DREAM_ENGINE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function norm(v){return String(v??'').toLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/ة/g,'ه').replace(/[^\u0600-\u06ff0-9a-z\s]/gi,' ').replace(/\s+/g,' ').trim()}
  function has(text,words){const n=norm(text);return words.some(w=>n.includes(norm(w)))}
  function detectTone(text){
    const distress=['خوف','خائف','خايف','فزع','مرعوب','رعب','كابوس','مطاردة','يطاردني','اهرب','هربت','بكاء شديد','صرخ'];
    const positive=['راحة','مرتاح','فرح','سعيد','طمأنينة','اطمئنان','نور','هدوء','ابتسام'];
    const d=distress.reduce((n,w)=>n+(has(text,[w])?1:0),0),p=positive.reduce((n,w)=>n+(has(text,[w])?1:0),0);
    if(d>p&&d>0)return 'distressing';
    if(p>d&&p>0)return 'positive';
    return 'neutral';
  }
  function symbolPresent(textNorm,symbol){
    const s=norm(symbol);if(!s)return false;if(textNorm.includes(s))return true;
    const base=s.replace(/^ال/,'');if(base.length<2)return false;
    const words=textNorm.split(' ');
    return words.some(w=>{const direct=w.replace(/^ال/,'');if(direct===base||direct.startsWith(base)||base.startsWith(direct))return true;const prefixed=direct.replace(/^[وفبكل]/,'').replace(/^ال/,'');return prefixed===base||prefixed.startsWith(base)||base.startsWith(prefixed)});
  }
  function extractSymbols(text,dictionary=[]){
    const n=norm(text),out=[];
    for(const row of dictionary||[]){
      if(!symbolPresent(n,row?.symbol))continue;
      out.push({symbol:String(row.symbol),category:String(row.category||'رمز'),meaning:String(row.meaning||'').trim()});
    }
    return out;
  }
  function toneLabel(tone){return tone==='distressing'?'المشاعر الظاهرة في وصفك تميل إلى الخوف أو الانزعاج.':tone==='positive'?'المشاعر الظاهرة في وصفك تميل إلى الراحة أو الطمأنينة.':'المشاعر في الوصف غير حاسمة أو مختلطة.'}
  function etiquette(tone){
    if(tone==='distressing')return 'إذا كان المنام مما تكره: يستعيذ بالله من شره ومن الشيطان، وينفث عن يساره ثلاثًا، ولا يحدث بها أحدًا.';
    if(tone==='positive')return 'إذا كانت رؤيا حسنة يحبها الرائي: يحمد الله عليها، ويحدّث بها من يحب أو من يحسن التعبير.';
    return 'إن كان المنام حسنًا فاحمد الله، وإن كان مكروهًا فاستعذ بالله من شره ومن الشيطان ولا تبنِ عليه قرارًا أو حكمًا.';
  }
  function possibilities(symbols){
    if(!symbols.length)return 'لم أجد رمزًا مطابقًا بوضوح داخل قاموس نور الذكر الحالي، لذلك لا يصح اختراع معنى محدد لهذا المنام. يمكن فقط النظر إلى الشعور العام والظروف المحيطة بالحلم.';
    return symbols.slice(0,5).map(x=>`- **${x.symbol}**: ${x.meaning} هذا معنى استئناسي يتغير بالسياق ولا يُعد حكمًا قطعيًا.`).join('\n');
  }
  function analyze(text,{dictionary}={}){
    const raw=String(text||'').trim();
    if(raw.length<8)return {mode:'local-dream-engine',answer:'اكتب تفاصيل أكثر عن الحلم: ترتيب الأحداث، المكان، الأشخاص، وما شعرت به أثناءه.',sections:[],sources:[],symbols:[],confidence:0,tone:'neutral'};
    const dict=Array.isArray(dictionary)?dictionary:[];
    const symbols=extractSymbols(raw,dict),tone=detectTone(raw);
    const confidence=Math.min(0.86,0.35+Math.min(symbols.length,4)*0.1+(tone!=='neutral'?0.08:0));
    const sections=[
      {id:'summary',title:'قراءة أولية',text:symbols.length?`ظهر في الحلم ${symbols.length} رمز${symbols.length===1?'':'/رموز'} يمكن مقارنته بمعانٍ استئناسية، لكن معنى الرؤيا يتغير بحال الرائي وسياق الأحداث.`:'لا توجد رموز مطابقة بوضوح في القاموس الحالي، لذلك سيكون التحليل محدودًا بالسياق والشعور فقط.'},
      {id:'symbols',title:'الرموز التي ظهرت',text:possibilities(symbols)},
      {id:'context',title:'السياق والشعور',text:toneLabel(tone)},
      {id:'possibilities',title:'احتمالات استئناسية',text:symbols.length?'يمكن جمع هذه الرموز كإشارات محتملة فقط، لا كرسالة مؤكدة. الأقرب هو النظر إلى المعاني المشتركة بينها مع ظروفك الواقعية دون اتخاذ قرار مصيري اعتمادًا على المنام.':'لم أجد رمزًا مطابقًا بوضوح؛ وقد يكون المنام انعكاسًا لضغط يومي أو أفكار سابقة أو تفاصيل نوم عادية، ولا يمكن تعيين معنى خاص بلا قرائن.'},
      {id:'limits',title:'ما لا يمكن الجزم به',text:'لا يمكن الجزم من المنام بوقوع حدث في المستقبل، ولا بوجود سحر أو حسد أو مس، ولا بإدانة شخص أو إثبات مرض أو حكم شرعي.'},
      {id:'etiquette',title:'ما يشرع فعله بعد الرؤيا',text:etiquette(tone)}
    ];
    const answer=sections.map(s=>`**${s.title}**\n${s.text}`).join('\n\n');
    const sources=[
      {title:'آداب الرؤيا والحلم',source:'صحيح البخاري وصحيح مسلم',source_type:'sunnah',trust_tier:'primary'},
      ...(symbols.length?[{title:'قاموس رموز نور الذكر',source:'معانٍ استئناسية داخلية غير قطعية',source_type:'other',trust_tier:'curated'}]:[])
    ];
    return {mode:'local-dream-engine',answer,sections,sources,symbols,confidence:+confidence.toFixed(2),tone};
  }
  return {analyze,extractSymbols,detectTone,norm};
});
