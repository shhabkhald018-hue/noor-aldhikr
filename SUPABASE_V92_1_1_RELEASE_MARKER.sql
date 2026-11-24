-- Noor AlDhikr V92.1.1 release marker
-- Safe, idempotent release update. No users or content are deleted.

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

create or replace function public.owner_portal_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  return jsonb_build_object(
    'owner', true,
    'profiles', (select count(*) from public.profiles),
    'knowledge', (select count(*) from public.knowledge_base),
    'trusted_published', (
      select count(*) from public.knowledge_base
      where active = true
        and review_status = 'published'
        and trust_tier in ('primary', 'verified')
        and btrim(source_text) <> ''
        and reviewed_at is not null
    ),
    'modules', (select count(*) from public.site_modules),
    'version', '92.1.1'
  );
end;
$$;

create or replace function public.owner_rls_diagnostics()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case when public.is_owner()
    then jsonb_build_object('owner', true, 'rls', true, 'version', '92.1.1')
    else jsonb_build_object('owner', false, 'rls', true, 'version', '92.1.1')
  end;
$$;

revoke all on function public.owner_portal_diagnostics() from public, anon;
revoke all on function public.owner_rls_diagnostics() from public, anon;
grant execute on function public.owner_portal_diagnostics() to authenticated;
grant execute on function public.owner_rls_diagnostics() to authenticated;

create index if not exists knowledge_base_reviewed_by_idx
  on public.knowledge_base(reviewed_by);
create index if not exists academy_lessons_reviewed_by_idx
  on public.academy_lessons(reviewed_by);
create index if not exists academy_questions_reviewed_by_idx
  on public.academy_questions(reviewed_by);

commit;

