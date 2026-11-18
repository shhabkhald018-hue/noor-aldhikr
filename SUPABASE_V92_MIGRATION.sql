-- Noor AlDhikr V92.0 PRO FREE AI
-- Additive, idempotent, data-preserving migration. It never deletes users or rows.
begin;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null default '', display_name text not null default '',
 avatar_url text not null default '', role text not null default 'user',
 active boolean not null default true, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), last_seen_at timestamptz
);
alter table public.profiles add column if not exists avatar_url text not null default '';
alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists active boolean not null default true;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists last_seen_at timestamptz;

create table if not exists public.user_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'user', created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.adhkar_content (
 id uuid primary key default gen_random_uuid(), title text not null, text text not null,
 category text not null default 'عام', source text not null default '',
 active boolean not null default true, reviewed boolean not null default false,
 created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.announcements (
 id uuid primary key default gen_random_uuid(), title text not null, body text not null,
 active boolean not null default true, created_by uuid references auth.users(id) on delete set null,
 starts_at timestamptz, ends_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.app_settings (
 key text primary key, value text not null default '', public boolean not null default false,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.private_messages (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 sender_id uuid not null references auth.users(id) on delete cascade,
 sender_role text not null, body text not null,
 read_by_owner_at timestamptz, read_by_user_at timestamptz,
 created_at timestamptz not null default now()
);
create table if not exists public.site_modules (
 module_key text primary key, label text not null, enabled boolean not null default true,
 nav_visible boolean not null default true, sort_order integer not null default 100,
 title_override text not null default '', subtitle_override text not null default '',
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
create table if not exists public.site_texts (
 text_key text primary key, value text not null default '', public boolean not null default true,
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
create table if not exists public.custom_blocks (
 id uuid primary key default gen_random_uuid(), area_key text not null, title text not null,
 body text not null default '', button_label text not null default '',
 button_url text not null default '', style_key text not null default 'default',
 sort_order integer not null default 100, active boolean not null default true,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.ai_settings (
 id boolean primary key default true check (id = true), enabled boolean not null default true,
 assistant_name text not null default 'مساعد نور الذكر المجاني',
 function_name text not null default 'local-rag-webgpu',
 model_label text not null default 'V92 Free Local Knowledge AI',
 temperature numeric not null default 0.15, max_input_chars integer not null default 3000,
 max_daily_per_user integer not null default 200, system_prompt text not null default '',
 safety_notice text not null default '', quick_prompts jsonb not null default '[]'::jsonb,
 allowed_sections jsonb not null default '[]'::jsonb,
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
create table if not exists public.ui_settings (
 id boolean primary key default true check (id = true),
 accent text not null default '#466A80', accent2 text not null default '#7A8C99',
 light_bg text not null default '#F6F7F9', dark_bg text not null default '#0F1318',
 radius integer not null default 16, compact boolean not null default false,
 maintenance_mode boolean not null default false,
 maintenance_message text not null default 'الموقع تحت التحديث.',
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);
create table if not exists public.ai_knowledge (
 id uuid primary key default gen_random_uuid(), knowledge_key text unique,
 question text not null default '', title text not null default '', answer text not null,
 keywords text[] not null default '{}'::text[], category text not null default 'عام',
 source_text text not null default '', source_type text not null default 'owner',
 source_label text not null default '', trust_tier text not null default 'verified',
 priority integer not null default 100, active boolean not null default true,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.ai_knowledge add column if not exists question text not null default '';
alter table public.ai_knowledge add column if not exists source_text text not null default '';
alter table public.ai_knowledge add column if not exists source_type text not null default 'owner';
alter table public.ai_knowledge add column if not exists source_label text not null default '';
alter table public.ai_knowledge add column if not exists trust_tier text not null default 'verified';

create table if not exists public.knowledge_base (
 id uuid primary key default gen_random_uuid(), question text not null, answer text not null,
 keywords text[] not null default '{}'::text[], category text not null default 'عام',
 priority integer not null default 100, active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.academy_lessons (
 id uuid primary key default gen_random_uuid(), subject text not null, title text not null,
 summary text not null default '', body text not null, reference_text text not null default '',
 review_status text not null default 'draft', active boolean not null default true,
 sort_order integer not null default 100,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.academy_questions (
 id uuid primary key default gen_random_uuid(), subject text not null,
 lesson_id uuid references public.academy_lessons(id) on delete set null,
 question text not null, options jsonb not null default '[]'::jsonb,
 correct_index integer not null default 0, explanation text not null default '',
 difficulty text not null default 'متوسط', review_status text not null default 'draft',
 active boolean not null default true, updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.exam_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 scope text not null default 'all', difficulty text not null default 'all',
 score integer not null default 0, total integer not null default 0,
 percent numeric not null default 0, breakdown jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table public.exam_attempts add column if not exists breakdown jsonb not null default '{}'::jsonb;
create table if not exists public.learning_progress (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 subject text not null, lesson_key text not null, completed boolean not null default false,
 completed_at timestamptz, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique (user_id, subject, lesson_key)
);
create table if not exists public.reports (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 request_type text not null default 'issue', subject text not null, details text not null,
 status text not null default 'open', priority text not null default 'normal',
 category text not null default '', dhikr_id uuid references public.adhkar_content(id) on delete set null,
 dhikr_title text not null default '', proposed_text text not null default '',
 proposed_source text not null default '', proposed_repeat integer,
 metadata jsonb not null default '{}'::jsonb, admin_reply text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.security_audit (
 id bigint generated by default as identity primary key,
 actor_id uuid references auth.users(id) on delete set null,
 action text not null, entity_type text not null default '', entity_id text not null default '',
 details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.activity_logs (
 id bigint generated by default as identity primary key,
 actor_id uuid references auth.users(id) on delete set null,
 action text not null, entity_type text not null default '', entity_id text not null default '',
 details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.visit_events (
 id uuid primary key default gen_random_uuid(),
 user_id uuid references auth.users(id) on delete set null,
 path text not null default '',
 created_at timestamptz not null default now()
);
create table if not exists public.navigation_items (
 id uuid primary key default gen_random_uuid(), item_key text not null unique,
 label text not null, href text not null, sort_order integer not null default 100,
 visible boolean not null default true, requires_auth boolean not null default false,
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
 title text not null, body text not null, active boolean not null default true,
 read_at timestamptz, created_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
create table if not exists public.app_versions (
 version text primary key, label text not null, notes text not null default '',
 active boolean not null default false, released_at timestamptz not null default now()
);
create table if not exists public.ai_research_settings (
 id boolean primary key default true check (id = true), enabled boolean not null default false,
 dream_enabled boolean not null default false, model_label text not null default 'local-free-disabled',
 discovery_model_label text not null default 'local-free-disabled',
 final_model_label text not null default 'local-free-disabled',
 search_context_size text not null default 'low', min_trusted_sources integer not null default 2,
 max_sources integer not null default 8, require_citations boolean not null default true,
 allow_untrusted_discovery boolean not null default false,
 updated_by uuid references auth.users(id) on delete set null, updated_at timestamptz not null default now()
);
alter table public.ai_research_settings add column if not exists discovery_model_label text not null default 'local-free-disabled';
alter table public.ai_research_settings add column if not exists final_model_label text not null default 'local-free-disabled';
create table if not exists public.ai_trusted_sources (
 id uuid primary key default gen_random_uuid(), domain text not null unique, label text not null,
 scholar_name text not null default '', source_type text not null default 'official',
 trust_tier text not null default 'verified', priority integer not null default 100,
 allow_assistant boolean not null default true, allow_dreams boolean not null default false,
 active boolean not null default true, notes text not null default '',
 updated_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Complete columns that older releases may not have.
alter table public.user_roles add column if not exists updated_at timestamptz not null default now();
alter table public.visit_events add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.visit_events add column if not exists path text not null default '';
alter table public.visit_events add column if not exists created_at timestamptz not null default now();
alter table public.adhkar_content add column if not exists source text not null default '';
alter table public.adhkar_content add column if not exists active boolean not null default true;
alter table public.adhkar_content add column if not exists reviewed boolean not null default false;
alter table public.adhkar_content add column if not exists updated_at timestamptz not null default now();
alter table public.announcements add column if not exists updated_at timestamptz not null default now();
alter table public.app_settings add column if not exists public boolean not null default false;
alter table public.app_settings add column if not exists created_at timestamptz not null default now();
alter table public.app_settings add column if not exists updated_at timestamptz not null default now();
alter table public.app_settings add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.private_messages add column if not exists read_by_owner_at timestamptz;
alter table public.private_messages add column if not exists read_by_user_at timestamptz;
alter table public.reports add column if not exists admin_notes text not null default '';
alter table public.reports add column if not exists resolved_at timestamptz;

-- Indexes are created only after compatibility columns exist, so upgrades from older schemas stay safe.
create index if not exists profiles_role_active_idx on public.profiles (role, active);
create index if not exists user_roles_role_idx on public.user_roles (role, user_id);
create index if not exists private_messages_user_created_idx on public.private_messages (user_id, created_at desc);
create index if not exists private_messages_sender_idx on public.private_messages (sender_id);
create index if not exists exam_attempts_user_created_idx on public.exam_attempts (user_id, created_at desc);
create index if not exists learning_progress_user_idx on public.learning_progress (user_id, subject);
create index if not exists reports_user_created_idx on public.reports (user_id, created_at desc);
create index if not exists adhkar_content_public_idx on public.adhkar_content (active, reviewed, category);
create index if not exists adhkar_content_created_by_idx on public.adhkar_content (created_by);
create index if not exists announcements_public_idx on public.announcements (active, created_at desc);
create index if not exists announcements_created_by_idx on public.announcements (created_by);
create index if not exists app_settings_updated_by_idx on public.app_settings (updated_by);
create index if not exists custom_blocks_public_idx on public.custom_blocks (active, area_key, sort_order);
create index if not exists ai_knowledge_public_idx on public.ai_knowledge (active, priority desc);
create index if not exists knowledge_base_public_idx on public.knowledge_base (active, priority desc);
create index if not exists academy_lessons_public_idx on public.academy_lessons (active, review_status, subject, sort_order);
create index if not exists academy_questions_public_idx on public.academy_questions (active, review_status, subject);
create index if not exists academy_questions_lesson_idx on public.academy_questions (lesson_id);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists visit_events_created_idx on public.visit_events (created_at desc);
create index if not exists visit_events_user_idx on public.visit_events (user_id);
create index if not exists academy_lessons_updated_by_idx on public.academy_lessons (updated_by);
create index if not exists academy_questions_updated_by_idx on public.academy_questions (updated_by);
create index if not exists activity_logs_actor_idx on public.activity_logs (actor_id);
create index if not exists ai_knowledge_updated_by_idx on public.ai_knowledge (updated_by);
create index if not exists ai_research_settings_updated_by_idx on public.ai_research_settings (updated_by);
create index if not exists ai_settings_updated_by_idx on public.ai_settings (updated_by);
create index if not exists ai_trusted_sources_updated_by_idx on public.ai_trusted_sources (updated_by);
create index if not exists custom_blocks_updated_by_idx on public.custom_blocks (updated_by);
create index if not exists navigation_items_updated_by_idx on public.navigation_items (updated_by);
create index if not exists notifications_created_by_idx on public.notifications (created_by);
create index if not exists security_audit_actor_idx on public.security_audit (actor_id);
create index if not exists site_modules_updated_by_idx on public.site_modules (updated_by);
create index if not exists site_texts_updated_by_idx on public.site_texts (updated_by);
create index if not exists ui_settings_updated_by_idx on public.ui_settings (updated_by);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'adhkar_content' and column_name = 'reviewed_by'
  ) then
    execute 'create index if not exists adhkar_content_reviewed_by_idx on public.adhkar_content (reviewed_by)';
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'adhkar_content' and column_name = 'updated_by'
  ) then
    execute 'create index if not exists adhkar_content_updated_by_idx on public.adhkar_content (updated_by)';
  end if;
end;
$$;

-- Shared timestamp helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

-- The authoritative owner check. Client metadata is never trusted.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = (select auth.uid())
      and r.role = 'owner'
      and p.active = true
  );
$$;

create or replace function public.is_current_user_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$ select public.is_owner(); $$;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$ select public.is_owner(); $$;

-- Non-privileged account-state check used by personal-data policies.
create or replace function public.is_active_user()
returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.active = true
  );
$$;

revoke all on function public.is_owner() from public, anon;
revoke all on function public.is_current_user_owner() from public, anon;
revoke all on function public.is_current_user_admin() from public, anon;
revoke all on function public.is_active_user() from public, anon;
grant execute on function public.is_owner() to authenticated;
grant execute on function public.is_current_user_owner() to authenticated;
grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.is_active_user() to authenticated;

-- Trigger/RPC-safe profile bootstrap. It never accepts role, active, or email from the browser.
create or replace function public.ensure_my_profile(p_display_name text default '')
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_email text;
begin
  if caller_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select email into caller_email from auth.users where id = caller_id;

  if exists (
    select 1 from public.profiles where id = caller_id and active = false
  ) then
    raise exception 'INACTIVE_ACCOUNT';
  end if;

  insert into public.profiles(id, email, display_name, role, active, last_seen_at)
  values (
    caller_id,
    coalesce(caller_email, ''),
    left(btrim(coalesce(p_display_name, '')), 60),
    'user',
    true,
    now()
  )
  on conflict (id) do update
  set display_name = case
        when btrim(coalesce(excluded.display_name, '')) <> '' then excluded.display_name
        else public.profiles.display_name
      end,
      email = coalesce(caller_email, public.profiles.email),
      last_seen_at = now(),
      updated_at = now();

  insert into public.user_roles(user_id, role)
  values (caller_id, 'user')
  on conflict (user_id) do nothing;

  return caller_id;
end;
$$;

revoke all on function public.ensure_my_profile(text) from public, anon;
grant execute on function public.ensure_my_profile(text) to authenticated;

-- Protect privileged profile fields even if a client submits extra columns.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  caller_id uuid := (select auth.uid());
  caller_is_owner boolean := false;
begin
  if caller_id is not null then
    caller_is_owner := public.is_owner();
  end if;

  if tg_op = 'INSERT' and caller_id is not null and not caller_is_owner then
    new.id := caller_id;
    select coalesce(u.email, '') into new.email
    from auth.users u where u.id = caller_id;
    new.role := 'user';
    new.active := true;
  elsif tg_op = 'UPDATE' and caller_id is not null and not caller_is_owner then
    new.id := old.id;
    new.email := old.email;
    new.role := old.role;
    new.active := old.active;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.protect_profile_privileged_fields() from public, anon, authenticated;
drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
before insert or update on public.profiles
for each row execute function public.protect_profile_privileged_fields();

-- Owner-only user administration. The owner cannot disable or demote their own account.
create or replace function public.owner_update_user(
  p_user_id uuid,
  p_display_name text,
  p_role text,
  p_active boolean
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller_id uuid := (select auth.uid());
  safe_role text := case when p_role = 'owner' then 'owner' else 'user' end;
  updated_count integer := 0;
begin
  if caller_id is null or not public.is_owner() then
    raise exception 'OWNER_ONLY';
  end if;
  if p_user_id is null then
    raise exception 'INVALID_USER';
  end if;

  if p_user_id = caller_id then
    update public.profiles
    set display_name = left(btrim(coalesce(p_display_name, display_name, '')), 80),
        updated_at = now()
    where id = p_user_id;
    get diagnostics updated_count = row_count;
  else
    update public.profiles
    set display_name = left(btrim(coalesce(p_display_name, display_name, '')), 80),
        role = safe_role,
        active = coalesce(p_active, true),
        updated_at = now()
    where id = p_user_id;

    get diagnostics updated_count = row_count;

    if updated_count = 0 then
      raise exception 'USER_NOT_FOUND';
    end if;

    insert into public.user_roles(user_id, role, updated_at)
    values (p_user_id, safe_role, now())
    on conflict (user_id) do update
    set role = excluded.role, updated_at = now();
  end if;

  insert into public.activity_logs(actor_id, action, entity_type, entity_id)
  values (caller_id, 'owner_update_user', 'profile', p_user_id::text);
  return updated_count > 0;
end;
$$;

revoke all on function public.owner_update_user(uuid, text, text, boolean) from public, anon;
grant execute on function public.owner_update_user(uuid, text, text, boolean) to authenticated;

-- Auth trigger. New accounts are always users; owner assignment is never accepted from the browser.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  new_role text := 'user';
begin
  insert into public.profiles(id, email, display_name, role, active)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60),
    new_role,
    true
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = case
        when excluded.display_name <> '' then excluded.display_name
        else public.profiles.display_name
      end,
      updated_at = now();

  insert into public.user_roles(user_id, role, updated_at)
  values (new.id, new_role, now())
  on conflict (user_id) do update
  set role = case
        when public.user_roles.role = 'owner' then 'owner'
        else excluded.role
      end,
      updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Lock any legacy trigger function that previously appeared in the Data API.
do $$
begin
  if to_regprocedure('public.bootstrap_owner_role()') is not null then
    execute 'revoke all on function public.bootstrap_owner_role() from public, anon, authenticated';
  end if;
end;
$$;

-- Private messaging RPCs.
create or replace function public.send_my_private_message(message_text text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller_id uuid := (select auth.uid());
  message_id uuid;
  clean_text text := btrim(coalesce(message_text, ''));
begin
  if caller_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(clean_text) < 1 or char_length(clean_text) > 4000 then
    raise exception 'INVALID_MESSAGE_LENGTH';
  end if;
  if not exists (
    select 1 from public.profiles where id = caller_id and active = true
  ) then
    raise exception 'INACTIVE_ACCOUNT';
  end if;
  insert into public.private_messages(user_id, sender_id, sender_role, body, read_by_user_at)
  values (caller_id, caller_id, 'user', clean_text, now())
  returning id into message_id;
  return message_id;
end;
$$;

create or replace function public.send_owner_private_message(target_user_id uuid, message_text text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  caller_id uuid := (select auth.uid());
  message_id uuid;
  clean_text text := btrim(coalesce(message_text, ''));
begin
  if caller_id is null or not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if char_length(clean_text) < 1 or char_length(clean_text) > 4000 then
    raise exception 'INVALID_MESSAGE_LENGTH';
  end if;
  if target_user_id is null or target_user_id = caller_id then raise exception 'INVALID_TARGET'; end if;
  if not exists (
    select 1 from public.profiles where id = target_user_id and active = true
  ) then raise exception 'USER_NOT_FOUND'; end if;

  insert into public.private_messages(user_id, sender_id, sender_role, body, read_by_owner_at)
  values (target_user_id, caller_id, 'owner', clean_text, now())
  returning id into message_id;
  return message_id;
end;
$$;

create or replace function public.mark_my_private_messages_read()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_active_user() then raise exception 'INACTIVE_ACCOUNT'; end if;
  update public.private_messages
  set read_by_user_at = coalesce(read_by_user_at, now())
  where user_id = (select auth.uid())
    and sender_role = 'owner'
    and read_by_user_at is null;
end;
$$;

create or replace function public.mark_owner_private_messages_read(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  update public.private_messages
  set read_by_owner_at = coalesce(read_by_owner_at, now())
  where user_id = target_user_id
    and sender_role = 'user'
    and read_by_owner_at is null;
end;
$$;

create or replace function public.get_owner_unread_private_count()
returns bigint
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  return (
    select count(*) from public.private_messages
    where sender_role = 'user' and read_by_owner_at is null
  );
end;
$$;

-- Owner dashboard and academy RPCs.
create or replace function public.owner_learning_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  return jsonb_build_object(
    'students', (select count(*) from public.profiles where active = true),
    'completed_lessons', (select count(*) from public.learning_progress where completed = true),
    'exam_attempts', (select count(*) from public.exam_attempts),
    'avg_exam', coalesce((select round(avg(percent), 1) from public.exam_attempts), 0)
  );
end;
$$;

create or replace function public.set_content_review_state(
  p_kind text,
  p_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  safe_status text := case
    when p_status in ('draft', 'review', 'approved', 'published') then p_status
    else 'draft'
  end;
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  if p_kind = 'lesson' then
    update public.academy_lessons
    set review_status = safe_status,
        active = (safe_status = 'published'),
        updated_by = (select auth.uid()),
        updated_at = now()
    where id = p_id;
  elsif p_kind = 'question' then
    update public.academy_questions
    set review_status = safe_status,
        active = (safe_status = 'published'),
        updated_by = (select auth.uid()),
        updated_at = now()
    where id = p_id;
  else
    raise exception 'INVALID_CONTENT_KIND';
  end if;
  return found;
end;
$$;

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
    'knowledge', (select count(*) from public.ai_knowledge),
    'modules', (select count(*) from public.site_modules),
    'version', '92.0.2'
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
    then jsonb_build_object('owner', true, 'rls', true, 'version', '92.0.2')
    else jsonb_build_object('owner', false, 'rls', true, 'version', '92.0.2')
  end;
$$;

create or replace function public.get_admin_dashboard_summary()
returns table(total_members bigint, total_visits bigint, open_reports bigint, active_adhkar bigint)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'OWNER_ONLY'; end if;
  return query
  select
    (select count(*) from public.profiles where active),
    (select count(*) from public.visit_events),
    (select count(*) from public.reports where status in ('open', 'reviewing', 'needs_info')),
    (select count(*) from public.adhkar_content where active);
end;
$$;

revoke all on function public.send_my_private_message(text) from public, anon;
revoke all on function public.send_owner_private_message(uuid, text) from public, anon;
revoke all on function public.mark_my_private_messages_read() from public, anon;
revoke all on function public.mark_owner_private_messages_read(uuid) from public, anon;
revoke all on function public.get_owner_unread_private_count() from public, anon;
revoke all on function public.owner_learning_stats() from public, anon;
revoke all on function public.set_content_review_state(text, uuid, text) from public, anon;
revoke all on function public.owner_portal_diagnostics() from public, anon;
revoke all on function public.owner_rls_diagnostics() from public, anon;
revoke all on function public.get_admin_dashboard_summary() from public, anon;

grant execute on function public.send_my_private_message(text) to authenticated;
grant execute on function public.send_owner_private_message(uuid, text) to authenticated;
grant execute on function public.mark_my_private_messages_read() to authenticated;
grant execute on function public.mark_owner_private_messages_read(uuid) to authenticated;
grant execute on function public.get_owner_unread_private_count() to authenticated;
grant execute on function public.owner_learning_stats() to authenticated;
grant execute on function public.set_content_review_state(text, uuid, text) to authenticated;
grant execute on function public.owner_portal_diagnostics() to authenticated;
grant execute on function public.owner_rls_diagnostics() to authenticated;
grant execute on function public.get_admin_dashboard_summary() to authenticated;

-- Minimal audit trail: identifiers and action names only, never content or secrets.
create or replace function public.audit_owner_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  entity jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  entity_id text := coalesce(
    entity ->> 'id',
    entity ->> 'key',
    entity ->> 'module_key',
    entity ->> 'text_key',
    ''
  );
begin
  if (select auth.uid()) is not null and public.is_owner() then
    insert into public.activity_logs(actor_id, action, entity_type, entity_id)
    values ((select auth.uid()), lower(tg_op), tg_table_name, entity_id);
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function public.audit_owner_change() from public, anon, authenticated;

-- Updated-at and audit triggers are recreated safely; rows are untouched.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','user_roles','adhkar_content','announcements','app_settings',
    'site_modules','site_texts','custom_blocks','ai_settings','ui_settings',
    'ai_knowledge','knowledge_base','academy_lessons','academy_questions',
    'learning_progress','reports','navigation_items','ai_research_settings',
    'ai_trusted_sources'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;

  foreach table_name in array array[
    'adhkar_content','announcements','app_settings','site_modules','site_texts',
    'custom_blocks','ai_settings','ui_settings','ai_knowledge','knowledge_base',
    'academy_lessons','academy_questions','navigation_items','notifications',
    'app_versions'
  ]
  loop
    execute format('drop trigger if exists audit_owner_change on public.%I', table_name);
    execute format(
      'create trigger audit_owner_change after insert or update or delete on public.%I for each row execute function public.audit_owner_change()',
      table_name
    );
  end loop;

  -- Remove V91 per-table audit triggers before the unified V92 audit mechanism.
  drop trigger if exists ai_research_settings_audit on public.ai_research_settings;
  drop trigger if exists ai_trusted_sources_audit on public.ai_trusted_sources;
end;
$$;

-- Enable RLS everywhere exposed through the public schema.
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.adhkar_content enable row level security;
alter table public.announcements enable row level security;
alter table public.app_settings enable row level security;
alter table public.private_messages enable row level security;
alter table public.site_modules enable row level security;
alter table public.site_texts enable row level security;
alter table public.custom_blocks enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ui_settings enable row level security;
alter table public.ai_knowledge enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_questions enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.learning_progress enable row level security;
alter table public.reports enable row level security;
alter table public.security_audit enable row level security;
alter table public.activity_logs enable row level security;
alter table public.navigation_items enable row level security;
alter table public.notifications enable row level security;
alter table public.app_versions enable row level security;
alter table public.ai_research_settings enable row level security;
alter table public.ai_trusted_sources enable row level security;

-- Remove known legacy/duplicated policies before creating the V92 policy set.
-- All policies on the managed tables are replaced atomically inside this transaction.
-- This prevents an older permissive policy from silently widening the V92 rules and
-- also makes rerunning this file safe.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'profiles','user_roles','adhkar_content','announcements','app_settings',
        'private_messages','site_modules','site_texts','custom_blocks','ai_settings',
        'ui_settings','ai_knowledge','knowledge_base','academy_lessons',
        'academy_questions','exam_attempts','learning_progress','reports',
        'security_audit','activity_logs','navigation_items','notifications',
        'app_versions','ai_research_settings','ai_trusted_sources',
        'user_preferences','favorites','bookmarks','chat_messages','site_content',
        'site_settings','visit_events'
      ])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end;
$$;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
drop policy if exists "owner manages roles" on public.user_roles;
drop policy if exists "users read own role" on public.user_roles;
drop policy if exists "public read active adhkar" on public.adhkar_content;
drop policy if exists "admins manage adhkar" on public.adhkar_content;
drop policy if exists "public read announcements" on public.announcements;
drop policy if exists "admins manage announcements" on public.announcements;
drop policy if exists "public read settings" on public.app_settings;
drop policy if exists "admins manage settings" on public.app_settings;
drop policy if exists "users read only own private conversation" on public.private_messages;

create policy "v92 profiles select"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or public.is_owner());
create policy "v92 profiles insert own"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id and role = 'user' and active = true);
create policy "v92 profiles update own or owner"
on public.profiles for update to authenticated
using (((select auth.uid()) = id and active = true) or public.is_owner())
with check (((select auth.uid()) = id and active = true) or public.is_owner());

create policy "v92 roles select"
on public.user_roles for select to authenticated
using (((select auth.uid()) = user_id and public.is_active_user()) or public.is_owner());

create policy "v92 adhkar public read"
on public.adhkar_content for select to anon, authenticated
using (active = true and reviewed = true);
create policy "v92 adhkar owner manage"
on public.adhkar_content for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 announcements public read"
on public.announcements for select to anon, authenticated
using (
  active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);
create policy "v92 announcements owner manage"
on public.announcements for all to authenticated
using (public.is_owner()) with check (public.is_owner());

-- Public settings policies never call an owner function, preventing anon 42501 errors.
create policy "v92 app settings public read"
on public.app_settings for select to anon, authenticated
using (public = true);
create policy "v92 app settings owner manage"
on public.app_settings for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 private messages select"
on public.private_messages for select to authenticated
using ((user_id = (select auth.uid()) and public.is_active_user()) or public.is_owner());

create policy "v92 site modules public read"
on public.site_modules for select to anon, authenticated using (true);
create policy "v92 site modules owner manage"
on public.site_modules for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 site texts public read"
on public.site_texts for select to anon, authenticated using (public = true);
create policy "v92 site texts owner manage"
on public.site_texts for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 blocks public read"
on public.custom_blocks for select to anon, authenticated using (active = true);
create policy "v92 blocks owner manage"
on public.custom_blocks for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 ai settings public read"
on public.ai_settings for select to anon, authenticated using (true);
create policy "v92 ai settings owner manage"
on public.ai_settings for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 ui settings public read"
on public.ui_settings for select to anon, authenticated using (true);
create policy "v92 ui settings owner manage"
on public.ui_settings for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 ai knowledge public read"
on public.ai_knowledge for select to anon, authenticated
using (active = true and trust_tier <> 'review');
create policy "v92 ai knowledge owner manage"
on public.ai_knowledge for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 knowledge base public read"
on public.knowledge_base for select to anon, authenticated using (active = true);
create policy "v92 knowledge base owner manage"
on public.knowledge_base for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 lessons public read"
on public.academy_lessons for select to anon, authenticated
using (active = true and review_status = 'published');
create policy "v92 lessons owner manage"
on public.academy_lessons for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 questions public read"
on public.academy_questions for select to anon, authenticated
using (active = true and review_status = 'published');
create policy "v92 questions owner manage"
on public.academy_questions for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 attempts own select"
on public.exam_attempts for select to authenticated
using ((user_id = (select auth.uid()) and public.is_active_user()) or public.is_owner());
create policy "v92 attempts own insert"
on public.exam_attempts for insert to authenticated
with check (user_id = (select auth.uid()) and public.is_active_user());

create policy "v92 progress own select"
on public.learning_progress for select to authenticated
using ((user_id = (select auth.uid()) and public.is_active_user()) or public.is_owner());
create policy "v92 progress own insert"
on public.learning_progress for insert to authenticated
with check (user_id = (select auth.uid()) and public.is_active_user());
create policy "v92 progress own update"
on public.learning_progress for update to authenticated
using (user_id = (select auth.uid()) and public.is_active_user())
with check (user_id = (select auth.uid()) and public.is_active_user());

create policy "v92 reports anon insert"
on public.reports for insert to anon with check (user_id is null);
create policy "v92 reports user insert"
on public.reports for insert to authenticated
with check (user_id = (select auth.uid()) and public.is_active_user());
create policy "v92 reports select"
on public.reports for select to authenticated
using ((user_id = (select auth.uid()) and public.is_active_user()) or public.is_owner());
create policy "v92 reports owner update"
on public.reports for update to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 audits owner read"
on public.security_audit for select to authenticated using (public.is_owner());
create policy "v92 activity owner read"
on public.activity_logs for select to authenticated using (public.is_owner());

create policy "v92 navigation public read"
on public.navigation_items for select to anon, authenticated using (visible = true);
create policy "v92 navigation owner manage"
on public.navigation_items for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 notifications read"
on public.notifications for select to authenticated
using (
  (user_id is null and public.is_active_user())
  or (user_id = (select auth.uid()) and public.is_active_user())
  or public.is_owner()
);
create policy "v92 notifications owner manage"
on public.notifications for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 versions public read"
on public.app_versions for select to anon, authenticated using (active = true);
create policy "v92 versions owner manage"
on public.app_versions for all to authenticated
using (public.is_owner()) with check (public.is_owner());

create policy "v92 research settings owner"
on public.ai_research_settings for all to authenticated
using (public.is_owner()) with check (public.is_owner());
create policy "v92 trusted sources owner"
on public.ai_trusted_sources for all to authenticated
using (public.is_owner()) with check (public.is_owner());

-- Preserve and harden legacy user-owned tables if they exist.
do $$
begin
  if to_regclass('public.user_preferences') is not null then
    execute 'alter table public.user_preferences enable row level security';
    execute 'drop policy if exists "prefs_all_own" on public.user_preferences';
    execute 'create policy "v92 preferences own" on public.user_preferences for all to authenticated using (user_id = (select auth.uid()) and public.is_active_user()) with check (user_id = (select auth.uid()) and public.is_active_user())';
  end if;
  if to_regclass('public.favorites') is not null then
    execute 'alter table public.favorites enable row level security';
    execute 'drop policy if exists "favorites_all_own" on public.favorites';
    execute 'create policy "v92 favorites own" on public.favorites for all to authenticated using (user_id = (select auth.uid()) and public.is_active_user()) with check (user_id = (select auth.uid()) and public.is_active_user())';
  end if;
  if to_regclass('public.bookmarks') is not null then
    execute 'alter table public.bookmarks enable row level security';
    execute 'drop policy if exists "bookmarks_all_own" on public.bookmarks';
    execute 'create policy "v92 bookmarks own" on public.bookmarks for all to authenticated using (user_id = (select auth.uid()) and public.is_active_user()) with check (user_id = (select auth.uid()) and public.is_active_user())';
  end if;
  if to_regclass('public.chat_messages') is not null then
    execute 'alter table public.chat_messages enable row level security';
    execute 'drop policy if exists "chat_select_own" on public.chat_messages';
    execute 'drop policy if exists "chat_insert_own" on public.chat_messages';
    execute 'create policy "v92 chat select own" on public.chat_messages for select to authenticated using (user_id = (select auth.uid()) and public.is_active_user())';
    execute 'create policy "v92 chat insert own" on public.chat_messages for insert to authenticated with check (user_id = (select auth.uid()) and public.is_active_user())';
  end if;
  if to_regclass('public.site_content') is not null then
    execute 'alter table public.site_content enable row level security';
    execute 'drop policy if exists "public reads published content" on public.site_content';
    execute 'drop policy if exists "owner manages content" on public.site_content';
    execute 'drop policy if exists "owner updates content" on public.site_content';
    execute 'drop policy if exists "owner deletes content" on public.site_content';
    execute 'create policy "v92 site content public read" on public.site_content for select to anon, authenticated using (is_published = true)';
    execute 'create policy "v92 site content owner manage" on public.site_content for all to authenticated using (public.is_owner()) with check (public.is_owner())';
  end if;
  if to_regclass('public.site_settings') is not null then
    execute 'alter table public.site_settings enable row level security';
    execute 'drop policy if exists "public reads settings" on public.site_settings';
    execute 'drop policy if exists "owner manages settings" on public.site_settings';
    execute 'create policy "v92 site settings public read" on public.site_settings for select to anon, authenticated using (true)';
    execute 'create policy "v92 site settings owner manage" on public.site_settings for all to authenticated using (public.is_owner()) with check (public.is_owner())';
  end if;
  if to_regclass('public.visit_events') is not null then
    execute 'alter table public.visit_events enable row level security';
    execute 'drop policy if exists "insert visits" on public.visit_events';
    execute 'drop policy if exists "admins read visits" on public.visit_events';
    execute 'create policy "v92 visits insert" on public.visit_events for insert to anon, authenticated with check (user_id is null or user_id = (select auth.uid()))';
    execute 'create policy "v92 visits owner read" on public.visit_events for select to authenticated using (public.is_owner())';
  end if;
end;
$$;

-- Explicit Data API grants. RLS remains the row-level authority.
revoke all on table
  public.profiles, public.user_roles, public.adhkar_content, public.announcements,
  public.app_settings, public.private_messages, public.site_modules, public.site_texts,
  public.custom_blocks, public.ai_settings, public.ui_settings, public.ai_knowledge,
  public.knowledge_base, public.academy_lessons, public.academy_questions,
  public.exam_attempts, public.learning_progress, public.reports,
  public.security_audit, public.activity_logs, public.navigation_items,
  public.notifications, public.app_versions, public.ai_research_settings,
  public.ai_trusted_sources
from anon, authenticated;

grant select on public.adhkar_content, public.announcements, public.app_settings,
  public.site_modules, public.site_texts, public.custom_blocks, public.ai_settings,
  public.ui_settings, public.ai_knowledge, public.knowledge_base,
  public.academy_lessons, public.academy_questions, public.navigation_items,
  public.app_versions
to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.user_roles to authenticated;
grant insert, update, delete on public.adhkar_content, public.announcements,
  public.app_settings, public.site_modules, public.site_texts, public.custom_blocks,
  public.ai_settings, public.ui_settings, public.ai_knowledge, public.knowledge_base,
  public.academy_lessons, public.academy_questions, public.navigation_items,
  public.notifications, public.app_versions, public.ai_research_settings,
  public.ai_trusted_sources
to authenticated;
grant select on public.private_messages, public.exam_attempts, public.learning_progress,
  public.reports, public.security_audit, public.activity_logs, public.notifications,
  public.ai_research_settings, public.ai_trusted_sources
to authenticated;
grant insert on public.exam_attempts, public.learning_progress, public.reports to authenticated;
grant update on public.learning_progress, public.reports to authenticated;
grant insert on public.reports to anon;

do $$
begin
  if to_regclass('public.user_preferences') is not null then
    execute 'revoke all on table public.user_preferences from anon, authenticated';
    execute 'grant select, insert, update, delete on public.user_preferences to authenticated';
  end if;
  if to_regclass('public.favorites') is not null then
    execute 'revoke all on table public.favorites from anon, authenticated';
    execute 'grant select, insert, update, delete on public.favorites to authenticated';
  end if;
  if to_regclass('public.bookmarks') is not null then
    execute 'revoke all on table public.bookmarks from anon, authenticated';
    execute 'grant select, insert, update, delete on public.bookmarks to authenticated';
  end if;
  if to_regclass('public.chat_messages') is not null then
    execute 'revoke all on table public.chat_messages from anon, authenticated';
    execute 'grant select, insert on public.chat_messages to authenticated';
  end if;
  if to_regclass('public.site_content') is not null then
    execute 'revoke all on table public.site_content from anon, authenticated';
    execute 'grant select on public.site_content to anon, authenticated';
    execute 'grant insert, update, delete on public.site_content to authenticated';
  end if;
  if to_regclass('public.site_settings') is not null then
    execute 'revoke all on table public.site_settings from anon, authenticated';
    execute 'grant select on public.site_settings to anon, authenticated';
    execute 'grant insert, update, delete on public.site_settings to authenticated';
  end if;
  if to_regclass('public.visit_events') is not null then
    execute 'revoke all on table public.visit_events from anon, authenticated';
    execute 'grant insert on public.visit_events to anon, authenticated';
    execute 'grant select on public.visit_events to authenticated';
  end if;
end;
$$;

-- Remove inherited sequence privileges from legacy tables, then return only what inserts need.
do $$
declare
  item record;
  seq_name text;
begin
  for item in
    select * from (values
      ('favorites', 'id', 'authenticated'),
      ('bookmarks', 'id', 'authenticated'),
      ('chat_messages', 'id', 'authenticated'),
      ('site_content', 'id', 'authenticated'),
      ('visit_events', 'id', 'anon, authenticated')
    ) as x(table_name, column_name, grantees)
  loop
    if to_regclass(format('public.%I', item.table_name)) is not null then
      seq_name := pg_get_serial_sequence(format('public.%I', item.table_name), item.column_name);
      if seq_name is not null then
        execute format('revoke all on sequence %s from anon, authenticated', seq_name);
        execute format('grant usage, select on sequence %s to %s', seq_name, item.grantees);
      end if;
    end if;
  end loop;
end;
$$;

-- Non-destructive defaults. Existing custom values win; release markers update in place.
insert into public.ai_settings(id, enabled, safety_notice, quick_prompts)
values (
  true,
  true,
  'المساعد يسترجع إجابات موثقة فقط، ولا يقدم تشخيصًا طبيًا أو حكمًا قطعيًا على الرؤى.',
  '["كيف أرقي نفسي؟","متى أقرأ أذكار الصباح؟","ما أركان الإيمان؟"]'::jsonb
)
on conflict (id) do nothing;

insert into public.ui_settings(id) values (true) on conflict (id) do nothing;

insert into public.site_modules(module_key, label, enabled, nav_visible, sort_order)
values
  ('home','الرئيسية',true,true,10),
  ('quran','القرآن والتفسير',true,true,20),
  ('adhkar','الأذكار',true,true,30),
  ('ruqyah','الرقية الشرعية',true,true,40),
  ('dreams','تعبير الرؤى',true,true,50),
  ('creed','العقيدة',true,true,60),
  ('fiqh','الفقه',true,true,70),
  ('seerah','السيرة النبوية',true,true,80),
  ('hadith','الحديث',true,true,90),
  ('prayer','الصلاة',true,true,100),
  ('qibla','القبلة',true,true,110),
  ('tasbeeh','المسبحة',true,true,120),
  ('favorites','المفضلة',true,true,130),
  ('exams','الاختبارات الشرعية',true,true,140),
  ('aiAssistant','المساعد الذكي',true,true,150)
on conflict (module_key) do nothing;

insert into public.app_settings(key, value, public)
values
  ('site_name','نور الذكر',true),
  ('site_description','القرآن والأذكار والعلوم الشرعية في تجربة عربية موثقة.',true),
  ('home_message','',true),
  ('announcement','',true),
  ('current_version','92.0.2',true),
  ('ai_mode','local-free-knowledge-base',true),
  ('v89_generation_enabled','true',true),
  ('v89_local_model_enabled','true',true),
  ('cache_version','noor-aldhikr-v92-0-2',true)
on conflict (key) do update
set value = excluded.value,
    public = excluded.public,
    updated_at = now()
where excluded.key in ('current_version', 'cache_version');

insert into public.app_versions(version, label, notes, active)
values ('92.0.2', 'V92.0.2 PRO FREE AI', 'إصدار أمان واستقرار ومساعد معرفي مجاني دون API مدفوع.', true)
on conflict (version) do update
set label = excluded.label, notes = excluded.notes, active = true;

update public.app_versions
set active = false
where version <> '92.0.2' and active = true;

insert into public.navigation_items(item_key, label, href, sort_order, visible)
values
  ('home','الرئيسية','index.html',10,true),
  ('quran','القرآن والتفسير','mushaf.html',20,true),
  ('exams','الاختبارات الشرعية','exams.html',30,true),
  ('privacy','الخصوصية','privacy.html',900,true),
  ('terms','الشروط','terms.html',910,true)
on conflict (item_key) do nothing;

insert into public.ai_knowledge(
  knowledge_key, question, title, answer, keywords, category,
  source_text, source_type, source_label, trust_tier, priority, active
)
values
  (
    'v92-how-to-ruqyah',
    'كيف أرقي نفسي؟',
    'كيف أرقي نفسي؟',
    'اقرأ الفاتحة وآية الكرسي والإخلاص والفلق والناس والأدعية الصحيحة، مع التوكل على الله. الرقية سبب مشروع ولا تمنع مراجعة الطبيب عند الحاجة.',
    array['الرقية','أرقي نفسي','رقية شرعية'],
    'الرقية الشرعية',
    'القرآن الكريم وصحيح السنة — إرشاد عام لا يغني عن المختص.',
    'owner',
    'مصادر نور الذكر',
    'verified',
    900,
    true
  ),
  (
    'v92-morning-adhkar',
    'متى أقرأ أذكار الصباح؟',
    'وقت أذكار الصباح',
    'يبدأ وقت أذكار الصباح من طلوع الفجر، والأفضل أن تقرأها في أول النهار. إن فاتتك فاقرأها عند تذكرك.',
    array['أذكار الصباح','متى','وقت'],
    'الأذكار',
    'أذكار الصباح الصحيحة — إرشاد عام.',
    'owner',
    'مصادر نور الذكر',
    'verified',
    850,
    true
  ),
  (
    'v92-no-diagnosis',
    'هل الصداع وحده دليل على العين؟',
    'الصداع لا يثبت سببًا غيبيًا',
    'لا. الصداع عرض له أسباب كثيرة، ولا يثبت وحده عينًا أو سحرًا. اطلب تقييمًا طبيًا إذا كان شديدًا أو جديدًا أو مستمرًا، ويمكنك قراءة الرقية والأذكار دون ترك العلاج.',
    array['صداع','العين','السحر','تشخيص'],
    'السلامة',
    'قاعدة سلامة شرعية وصحية عامة.',
    'owner',
    'مصادر نور الذكر',
    'verified',
    1000,
    true
  )
on conflict (knowledge_key) do nothing;

insert into public.knowledge_base(question, answer, keywords, category, priority, active)
select question, answer, keywords, category, priority, active
from public.ai_knowledge
where knowledge_key in ('v92-how-to-ruqyah','v92-morning-adhkar','v92-no-diagnosis')
  and not exists (
    select 1 from public.knowledge_base kb
    where kb.question = public.ai_knowledge.question
  );

-- Paid/live AI stays disabled even if legacy rows already exist.
insert into public.ai_research_settings(id, enabled, dream_enabled, model_label, discovery_model_label, final_model_label)
values (true, false, false, 'local-free-disabled', 'local-free-disabled', 'local-free-disabled')
on conflict (id) do update
set enabled = false,
    dream_enabled = false,
    model_label = 'local-free-disabled',
    discovery_model_label = 'local-free-disabled',
    final_model_label = 'local-free-disabled',
    updated_at = now();

commit;
