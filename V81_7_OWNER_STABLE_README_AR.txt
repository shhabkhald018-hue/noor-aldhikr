نور الذكر V81.7 — OWNER STABLE

ما تم إصلاحه:
- تشخيص حقيقي لاتصال Supabase قبل تسجيل الدخول مع مهلة Timeout ورسائل تفصل بين DNS/شبكة والمفتاح وRLS.
- إصلاح دورة تحميل Owner Studio: لم يعد يثبت نفسه قبل تسجيل المالك ثم يرفض تحميل البيانات بعد الدخول.
- ضبط NOOR_OWNER_ID مباشرة بعد التحقق من is_owner.
- فتح لوحة المالك فور نجاح الصلاحية، ثم تحميل بقية الجداول دون حبس الدخول بسبب جدول ثانوي.
- إضافة supabase-check.html لتشخيص config + CDN + نطاق Supabase بدون تعديل قاعدة البيانات.
- إضافة SUPABASE_V81_05_OWNER_STABILITY.sql للقاعدة الحالية بدون حذف بيانات.
- جعل سياسات ملف التثبيت V81_01 قابلة لإعادة التشغيل بدرجة أعلى عبر DROP POLICY IF EXISTS.
- نقل grant النهائي لـ service_role إلى ما بعد إنشاء جداول V81.
- تصحيح Manifest وPWA لمسار GitHub Pages /noor-aldhikr/.
- تحديث Service Worker وBootstrap إلى V81.7 بدل أرقام V69 القديمة.
- تحديث النصوص القديمة في صفحة المالك وسياسة الخصوصية للمساعد المجاني.

المشروع الحالي:
1) ارفع ملفات V81.7 إلى GitHub.
2) في Supabase SQL Editor شغّل SUPABASE_V81_05_OWNER_STABILITY.sql مرة واحدة.
3) افتح clear-cache.html?v=817 مرة واحدة.
4) افتح portal.html?v=817.
5) إذا لم تدخل، افتح supabase-check.html. إذا فشل اختبار نطاق Supabase فالمشكلة DNS/شبكة ولا يمكن إصلاحها من JavaScript أو RLS.

لا تشغّل ملفات V43/V49/V50 القديمة.
