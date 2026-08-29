نور الذكر V82.0 — OWNER PORTAL FIX

أهم إصلاح حاسم:
كان رابط Supabase في assets/js/config.js يشير إلى Project Ref خاطئ.
القديم: yankugxforcedvnatknhs
الصحيح: yankugxfocedvnatknhs

تم التحقق مباشرة من Supabase:
- المشروع ACTIVE_HEALTHY.
- حساب المالك موجود ونشط وبريده مؤكد.
- role = owner.
- RLS مفعّل على الجداول.
- ai_knowledge أُنشئ وأصبح متاحًا للمساعد المجاني.
- Migration V82.0 تم تطبيقه على قاعدة البيانات بالفعل.

لا تمسح قاعدة Supabase ولا المستخدم.
ارفع هذه النسخة على GitHub بدل النسخة القديمة، ثم افتح:
supabase-check.html?v=820
وبعد نجاح الاختبارات افتح:
portal.html?v=820
