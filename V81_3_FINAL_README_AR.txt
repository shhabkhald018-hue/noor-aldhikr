نور الذكر V81.3 — النسخة النهائية المستقرة

تمت مراجعة الحزمة كاملة قبل ضغطها:
- Project URL مربوط بالمشروع الجديد.
- Publishable key مربوط بالمشروع الجديد.
- لا يوجد Secret key أو Service Role داخل ملفات الموقع.
- config.js لا يتم تخزينه في Service Worker cache.
- لوحة المالك تنظف Service Worker/caches القديمة تلقائيًا.
- clear-cache.html ينظف أي نسخة قديمة ثم يفتح portal.html تلقائيًا.
- جميع مراجع CSS/JS/الصور داخل صفحات HTML موجودة.
- جميع ملفات JavaScript اجتازت node --check بدون أخطاء syntax.
- أضيف .gitattributes لمنع مشكلة LF/CRLF قدر الإمكان.
- أضيف FIX_GIT_LOCK.bat لإصلاح خطأ .git/index.lock فقط، بدون حذف index نفسه.

طريقة الرفع الآمنة:
1) أغلق GitHub Desktop وVS Code.
2) انسخ كل محتويات هذه الحزمة إلى جذر مجلد noor-aldhikr واستبدل الملفات.
3) إذا كان GitHub Desktop أعطى سابقًا خطأ index.lock، شغّل FIX_GIT_LOCK.bat مرة واحدة.
4) افتح GitHub Desktop.
5) Commit all files ثم Push origin.
6) بعد اكتمال GitHub Pages افتح:
   https://shhabkhald018-hue.github.io/noor-aldhikr/clear-cache.html
7) ستنتقل تلقائيًا إلى صفحة المالك الجديدة.

لا تعِد تشغيل ملفات SQL V81؛ قاعدة البيانات وحساب Owner تم إنشاؤهما بالفعل.
