-- ============================================================
-- Noor AlDhikr V81.7 — OWNER STABILITY MIGRATION
-- آمن على القاعدة الحالية: لا DROP TABLE ولا حذف مستخدمين أو محتوى.
-- شغّله مرة واحدة بعد V81.6 إذا كانت صفحة المالك/الصلاحيات غير مستقرة.
-- ============================================================

begin;

grant usage on schema public to anon,authenticated,service_role;
grant all privileges on all tables in schema public to service_role;
grant usage,select on all sequences in schema public to service_role;

-- التحقق من المالك يعتمد فقط على auth.uid + profiles، وليس app_metadata.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path=public,pg_temp
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id=auth.uid()
      and p.role='owner'::public.noor_role
      and p.active=true
  );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon,authenticated;

-- تشخيص موحد للوحة المالك بعد تسجيل الدخول.
create or replace function public.owner_portal_diagnostics()
returns jsonb
language plpgsql
stable
security definer
set search_path=public,pg_temp
as $$
declare
  uid uuid:=auth.uid();
  result jsonb;
begin
  if uid is null then raise exception 'authentication_required'; end if;
  if not public.is_owner() then raise exception 'owner_required'; end if;
  select jsonb_build_object(
    'ok',true,
    'user_id',uid,
    'profiles',(select count(*) from public.profiles),
    'active_owners',(select count(*) from public.profiles where role='owner'::public.noor_role and active=true),
    'site_modules',(select count(*) from public.site_modules),
    'ai_knowledge_exists',to_regclass('public.ai_knowledge') is not null,
    'checked_at',now()
  ) into result;
  return result;
end;
$$;
revoke all on function public.owner_portal_diagnostics() from public;
grant execute on function public.owner_portal_diagnostics() to authenticated;

-- إعادة تأكيد صلاحيات الجداول التي أُنشئت في آخر ملف V81 بعد grant القديم.
do $$
begin
  if to_regclass('public.site_modules') is not null then execute 'grant all on public.site_modules to service_role'; end if;
  if to_regclass('public.site_texts') is not null then execute 'grant all on public.site_texts to service_role'; end if;
  if to_regclass('public.custom_blocks') is not null then execute 'grant all on public.custom_blocks to service_role'; end if;
  if to_regclass('public.ai_settings') is not null then execute 'grant all on public.ai_settings to service_role'; end if;
  if to_regclass('public.ui_settings') is not null then execute 'grant all on public.ui_settings to service_role'; end if;
  if to_regclass('public.ai_knowledge') is not null then execute 'grant all on public.ai_knowledge to service_role'; end if;
end $$;

commit;

select
  'V81.7 OWNER STABILITY READY' as status,
  (select count(*) from public.profiles where role='owner'::public.noor_role and active=true) as active_owners,
  to_regprocedure('public.is_owner()') is not null as is_owner_ready,
  to_regprocedure('public.owner_portal_diagnostics()') is not null as diagnostics_ready;
