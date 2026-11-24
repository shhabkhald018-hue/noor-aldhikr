-- Keep owner diagnostics on the active web release number.
-- Both functions retain database-side Owner checks and expose no public grant.

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

