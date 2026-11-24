-- Noor AlDhikr V92.1.1 release marker
-- Safe, idempotent data update. No users or content are deleted.

begin;

insert into public.app_settings(key, value, public)
values
  ('current_version', '92.1.1', true),
  ('cache_version', 'noor-aldhikr-v92-1-1-usability-safety', true)
on conflict (key) do update
set value = excluded.value,
    public = excluded.public,
    updated_at = now();

insert into public.app_versions(version, label, notes, active)
values (
  '92.1.1',
  'V92.1.1 TRUSTED CONTENT FREE AI',
  'إصلاح جاهزية أول ضغطة للمساعد والاختبارات، وإظهار حالة مراجعة المحتوى، وتحسين أداء الصفحة دون حذف أي بيانات.',
  true
)
on conflict (version) do update
set label = excluded.label,
    notes = excluded.notes,
    active = true;

update public.app_versions
set active = false
where version <> '92.1.1'
  and active = true;

commit;

