-- =========================================================
-- Noor AlDhikr V80 — Fresh Secure Schema
-- مشروع Supabase جديد فقط.
-- المرحلة 1: شغّل هذا الملف أولًا، قبل إنشاء/ترقية حساب المالك.
-- =========================================================

begin;

create extension if not exists pgcrypto;

-- Types
do $$ begin
  create type public.noor_role as enum ('user','owner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.review_state as enum ('draft','review','approved','published');
exception when duplicate_object then null; end $$;

-- Core tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default '',
  role public.noor_role not null default 'user',
  active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_seen_at timestamptz
);

create table if not exists public.adhkar_content (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null,
  category text not null default 'general',
  repeat_count integer not null default 1 check(repeat_count between 1 and 1000),
  source text,
  benefit text,
  sort_order integer not null default 0,
  active boolean not null default true,
  reviewed boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value text not null default '',
  public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_role public.noor_role not null,
  body text not null check(char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_by_owner_at timestamptz,
  read_by_user_at timestamptz
);
create index if not exists private_messages_user_created_idx on public.private_messages(user_id,created_at desc);

create table if not exists public.learning_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check(subject in ('creed','fiqh','seerah','hadith')),
  lesson_key text not null,
  completed boolean not null default true,
  completed_at timestamptz not null default now(),
  primary key(user_id,subject,lesson_key)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null default 'all',
  difficulty text not null default 'all',
  score integer not null check(score>=0),
  total integer not null check(total>0),
  percent integer not null check(percent between 0 and 100),
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists exam_attempts_user_created_idx on public.exam_attempts(user_id,created_at desc);

create table if not exists public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  subject text not null check(subject in ('creed','fiqh','seerah','hadith')),
  title text not null,
  summary text not null default '',
  body text not null default '',
  reference_text text not null default '',
  sort_order integer not null default 0,
  active boolean not null default true,
  review_status public.review_state not null default 'draft',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_questions (
  id uuid primary key default gen_random_uuid(),
  subject text not null check(subject in ('creed','fiqh','seerah','hadith')),
  lesson_id uuid references public.academy_lessons(id) on delete set null,
  question text not null,
  options jsonb not null check(jsonb_typeof(options)='array' and jsonb_array_length(options)=4),
  correct_index integer not null check(correct_index between 0 and 3),
  explanation text not null default '',
  difficulty text not null default 'متوسط' check(difficulty in ('أساسي','متوسط','متقدم')),
  active boolean not null default true,
  review_status public.review_state not null default 'draft',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  request_type text not null default 'issue',
  subject text not null default '',
  details text not null default '',
  status text not null default 'open',
  priority text not null default 'normal',
  category text not null default '',
  dhikr_id text,
  dhikr_title text not null default '',
  proposed_text text not null default '',
  proposed_source text not null default '',
  proposed_repeat integer,
  metadata jsonb not null default '{}'::jsonb,
  admin_notes text not null default '',
  admin_reply text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists reports_user_created_idx on public.reports(user_id,created_at desc);
create index if not exists reports_status_created_idx on public.reports(status,created_at desc);

-- Audit: owner-visible only, no direct client writes
create table if not exists public.security_audit (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists security_audit_created_idx on public.security_audit(created_at desc);

-- =========================================================
-- Security helpers
-- =========================================================
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path=public,pg_temp
as $$
  select exists(
    select 1 from public.profiles p
    where p.id=auth.uid() and p.role='owner'::public.noor_role and p.active=true
  );
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon,authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path=public,pg_temp
as $$ select public.is_owner(); $$;
revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
  insert into public.profiles(id,email,display_name,role,active)
  values(
    new.id,
    new.email,
    left(coalesce(new.raw_user_meta_data->>'display_name',split_part(coalesce(new.email,''),'@',1)),80),
    'user'::public.noor_role,
    true
  )
  on conflict(id) do update set email=excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.protect_profile_security_fields()
returns trigger
language plpgsql
security definer
set search_path=public,auth,pg_temp
as $$
declare
  real_email text;
  privileged boolean :=
    coalesce(auth.role()='service_role',false)
    or current_user in ('postgres','supabase_admin');
  owners_left integer;
begin
  select u.email into real_email from auth.users u where u.id=new.id;
  new.email:=real_email;
  new.display_name:=left(coalesce(new.display_name,''),80);

  if tg_op='INSERT' then
    if not privileged and not public.is_owner() then
      new.role:='user'::public.noor_role;
      new.active:=true;
    end if;
  else
    if not privileged and not public.is_owner() then
      new.role:=old.role;
      new.active:=old.active;
    end if;

    -- لا يمكن للمالك إلغاء آخر مالك نشط من واجهة الموقع.
    if old.role='owner'::public.noor_role and old.active=true
       and (new.role<>'owner'::public.noor_role or new.active=false)
       and not privileged then
      select count(*) into owners_left
      from public.profiles
      where role='owner'::public.noor_role and active=true and id<>old.id;
      if owners_left=0 then
        raise exception 'last_active_owner_cannot_be_removed';
      end if;
    end if;
  end if;

  new.updated_at:=now();
  return new;
end;
$$;

drop trigger if exists protect_profiles_before_write on public.profiles;
create trigger protect_profiles_before_write
before insert or update on public.profiles
for each row execute function public.protect_profile_security_fields();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path=public,pg_temp
as $$
begin new.updated_at=now(); return new; end;
$$;

do $$ begin
  create trigger adhkar_touch_updated_at before update on public.adhkar_content for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger announcements_touch_updated_at before update on public.announcements for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger academy_lessons_touch_updated_at before update on public.academy_lessons for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger academy_questions_touch_updated_at before update on public.academy_questions for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger reports_touch_updated_at before update on public.reports for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- =========================================================
-- RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.adhkar_content enable row level security;
alter table public.announcements enable row level security;
alter table public.app_settings enable row level security;
alter table public.private_messages enable row level security;
alter table public.learning_progress enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_questions enable row level security;
alter table public.reports enable row level security;
alter table public.security_audit enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
using(id=auth.uid() or public.is_owner());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
with check(id=auth.uid() or public.is_owner());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
using(id=auth.uid() or public.is_owner())
with check(id=auth.uid() or public.is_owner());

drop policy if exists adhkar_public_read on public.adhkar_content;
create policy adhkar_public_read on public.adhkar_content for select to anon,authenticated
using(active=true or public.is_owner());
drop policy if exists adhkar_owner_insert on public.adhkar_content;
create policy adhkar_owner_insert on public.adhkar_content for insert to authenticated with check(public.is_owner());
drop policy if exists adhkar_owner_update on public.adhkar_content;
create policy adhkar_owner_update on public.adhkar_content for update to authenticated using(public.is_owner()) with check(public.is_owner());
drop policy if exists adhkar_owner_delete on public.adhkar_content;
create policy adhkar_owner_delete on public.adhkar_content for delete to authenticated using(public.is_owner());

drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read on public.announcements for select to anon,authenticated
using((active=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now())) or public.is_owner());
drop policy if exists announcements_owner_insert on public.announcements;
create policy announcements_owner_insert on public.announcements for insert to authenticated with check(public.is_owner());
drop policy if exists announcements_owner_update on public.announcements;
create policy announcements_owner_update on public.announcements for update to authenticated using(public.is_owner()) with check(public.is_owner());
drop policy if exists announcements_owner_delete on public.announcements;
create policy announcements_owner_delete on public.announcements for delete to authenticated using(public.is_owner());

drop policy if exists settings_public_read on public.app_settings;
create policy settings_public_read on public.app_settings for select to anon,authenticated
using(public=true or public.is_owner());
drop policy if exists settings_owner_insert on public.app_settings;
create policy settings_owner_insert on public.app_settings for insert to authenticated with check(public.is_owner());
drop policy if exists settings_owner_update on public.app_settings;
create policy settings_owner_update on public.app_settings for update to authenticated using(public.is_owner()) with check(public.is_owner());
drop policy if exists settings_owner_delete on public.app_settings;
create policy settings_owner_delete on public.app_settings for delete to authenticated using(public.is_owner());

drop policy if exists private_messages_read on public.private_messages;
create policy private_messages_read on public.private_messages for select to authenticated
using(user_id=auth.uid() or public.is_owner());

drop policy if exists learning_progress_select on public.learning_progress;
create policy learning_progress_select on public.learning_progress for select to authenticated
using(user_id=auth.uid() or public.is_owner());
drop policy if exists learning_progress_insert on public.learning_progress;
create policy learning_progress_insert on public.learning_progress for insert to authenticated
with check(user_id=auth.uid());
drop policy if exists learning_progress_update on public.learning_progress;
create policy learning_progress_update on public.learning_progress for update to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists learning_progress_delete on public.learning_progress;
create policy learning_progress_delete on public.learning_progress for delete to authenticated
using(user_id=auth.uid() or public.is_owner());

drop policy if exists exam_attempts_select on public.exam_attempts;
create policy exam_attempts_select on public.exam_attempts for select to authenticated
using(user_id=auth.uid() or public.is_owner());
drop policy if exists exam_attempts_insert on public.exam_attempts;
create policy exam_attempts_insert on public.exam_attempts for insert to authenticated
with check(user_id=auth.uid());
drop policy if exists exam_attempts_delete on public.exam_attempts;
create policy exam_attempts_delete on public.exam_attempts for delete to authenticated
using(user_id=auth.uid() or public.is_owner());

drop policy if exists academy_lessons_public on public.academy_lessons;
create policy academy_lessons_public on public.academy_lessons for select to anon,authenticated
using((active=true and review_status='published'::public.review_state) or public.is_owner());
drop policy if exists academy_lessons_owner_insert on public.academy_lessons;
create policy academy_lessons_owner_insert on public.academy_lessons for insert to authenticated with check(public.is_owner());
drop policy if exists academy_lessons_owner_update on public.academy_lessons;
create policy academy_lessons_owner_update on public.academy_lessons for update to authenticated using(public.is_owner()) with check(public.is_owner());
drop policy if exists academy_lessons_owner_delete on public.academy_lessons;
create policy academy_lessons_owner_delete on public.academy_lessons for delete to authenticated using(public.is_owner());

drop policy if exists academy_questions_public on public.academy_questions;
create policy academy_questions_public on public.academy_questions for select to anon,authenticated
using((active=true and review_status='published'::public.review_state) or public.is_owner());
drop policy if exists academy_questions_owner_insert on public.academy_questions;
create policy academy_questions_owner_insert on public.academy_questions for insert to authenticated with check(public.is_owner());
drop policy if exists academy_questions_owner_update on public.academy_questions;
create policy academy_questions_owner_update on public.academy_questions for update to authenticated using(public.is_owner()) with check(public.is_owner());
drop policy if exists academy_questions_owner_delete on public.academy_questions;
create policy academy_questions_owner_delete on public.academy_questions for delete to authenticated using(public.is_owner());

drop policy if exists reports_anon_insert on public.reports;
create policy reports_anon_insert on public.reports for insert to anon with check(user_id is null);
drop policy if exists reports_user_insert on public.reports;
create policy reports_user_insert on public.reports for insert to authenticated with check(user_id=auth.uid() or user_id is null);
drop policy if exists reports_user_read on public.reports;
create policy reports_user_read on public.reports for select to authenticated using(user_id=auth.uid() or public.is_owner());
drop policy if exists reports_owner_update on public.reports;
create policy reports_owner_update on public.reports for update to authenticated using(public.is_owner()) with check(public.is_owner());
drop policy if exists reports_owner_delete on public.reports;
create policy reports_owner_delete on public.reports for delete to authenticated using(public.is_owner());

drop policy if exists security_audit_owner_read on public.security_audit;
create policy security_audit_owner_read on public.security_audit for select to authenticated using(public.is_owner());

-- =========================================================
-- Secure RPCs
-- =========================================================
create or replace function public.send_my_private_message(message_text text)
returns uuid language plpgsql security definer set search_path=public,pg_temp
as $$
declare new_id uuid; body_clean text:=btrim(message_text);
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  if char_length(body_clean) not between 1 and 4000 then raise exception 'invalid_message_length'; end if;
  insert into public.private_messages(user_id,sender_id,sender_role,body)
  values(auth.uid(),auth.uid(),'user'::public.noor_role,body_clean) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.send_owner_private_message(target_user_id uuid,message_text text)
returns uuid language plpgsql security definer set search_path=public,pg_temp
as $$
declare new_id uuid; body_clean text:=btrim(message_text);
begin
  if not public.is_owner() then raise exception 'owner_required'; end if;
  if char_length(body_clean) not between 1 and 4000 then raise exception 'invalid_message_length'; end if;
  if not exists(select 1 from public.profiles where id=target_user_id) then raise exception 'target_user_not_found'; end if;
  insert into public.private_messages(user_id,sender_id,sender_role,body,read_by_owner_at)
  values(target_user_id,auth.uid(),'owner'::public.noor_role,body_clean,now()) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.mark_my_private_messages_read()
returns void language sql security definer set search_path=public,pg_temp
as $$
  update public.private_messages set read_by_user_at=coalesce(read_by_user_at,now())
  where user_id=auth.uid() and sender_role='owner'::public.noor_role and read_by_user_at is null;
$$;

create or replace function public.mark_owner_private_messages_read(target_user_id uuid)
returns void language plpgsql security definer set search_path=public,pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'owner_required'; end if;
  update public.private_messages set read_by_owner_at=coalesce(read_by_owner_at,now())
  where user_id=target_user_id and sender_role='user'::public.noor_role and read_by_owner_at is null;
end;
$$;

create or replace function public.get_owner_unread_private_count()
returns bigint language plpgsql security definer set search_path=public,pg_temp
as $$
declare n bigint;
begin
  if not public.is_owner() then raise exception 'owner_required'; end if;
  select count(*) into n from public.private_messages where sender_role='user'::public.noor_role and read_by_owner_at is null;
  return n;
end;
$$;

create or replace function public.owner_learning_stats()
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'owner_required'; end if;
  return jsonb_build_object(
    'students',(select count(*) from public.profiles where role='user'::public.noor_role and active=true),
    'completed_lessons',(select count(*) from public.learning_progress where completed=true),
    'exam_attempts',(select count(*) from public.exam_attempts),
    'avg_exam',(select coalesce(round(avg(percent)),0) from public.exam_attempts)
  );
end;
$$;

create or replace function public.set_content_review_state(p_kind text,p_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path=public,pg_temp
as $$
declare s public.review_state;
begin
  if not public.is_owner() then raise exception 'owner_required'; end if;
  s:=p_status::public.review_state;
  if p_kind='lesson' then
    update public.academy_lessons set review_status=s,
      reviewed_by=case when s in ('approved','published') then auth.uid() else reviewed_by end,
      reviewed_at=case when s in ('approved','published') then now() else reviewed_at end,
      published_at=case when s='published' then coalesce(published_at,now()) else published_at end
    where id=p_id;
  elsif p_kind='question' then
    update public.academy_questions set review_status=s,
      reviewed_by=case when s in ('approved','published') then auth.uid() else reviewed_by end,
      reviewed_at=case when s in ('approved','published') then now() else reviewed_at end,
      published_at=case when s='published' then coalesce(published_at,now()) else published_at end
    where id=p_id;
  else raise exception 'invalid_kind';
  end if;
  return found;
end;
$$;

create or replace function public.owner_rls_diagnostics()
returns jsonb language plpgsql security definer set search_path=public,pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'owner_required'; end if;
  return jsonb_build_object(
    'is_owner',true,
    'profiles',(select count(*) from public.profiles),
    'learning_progress',(select count(*) from public.learning_progress),
    'exam_attempts',(select count(*) from public.exam_attempts),
    'academy_lessons',(select count(*) from public.academy_lessons),
    'academy_questions',(select count(*) from public.academy_questions),
    'private_messages',(select count(*) from public.private_messages),
    'reports',(select count(*) from public.reports),
    'security_audit',(select count(*) from public.security_audit),
    'checked_at',now()
  );
end;
$$;

create or replace function public.get_admin_dashboard_summary()
returns table(total_members bigint,total_visits bigint,open_reports bigint,active_adhkar bigint)
language plpgsql security definer set search_path=public,pg_temp
as $$
begin
  if not public.is_owner() then raise exception 'owner_required'; end if;
  return query select
    (select count(*) from public.profiles where active=true),
    0::bigint,
    (select count(*) from public.reports where status not in ('resolved','published','rejected')),
    (select count(*) from public.adhkar_content where active=true);
end;
$$;

-- Audit owner changes without exposing direct INSERT permission.
create or replace function public.audit_owner_change()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare eid text;
begin
  if public.is_owner() then
    eid:=coalesce((to_jsonb(new)->>'id'),(to_jsonb(old)->>'id'));
    insert into public.security_audit(actor_id,action,entity,entity_id,metadata)
    values(auth.uid(),tg_op, tg_table_name, eid, jsonb_build_object('source','owner_portal'));
  end if;
  return coalesce(new,old);
end;
$$;

do $$ begin create trigger audit_profiles after update on public.profiles for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_adhkar after insert or update or delete on public.adhkar_content for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_announcements after insert or update or delete on public.announcements for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_settings after insert or update or delete on public.app_settings for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_lessons after insert or update or delete on public.academy_lessons for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_questions after insert or update or delete on public.academy_questions for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;

-- Function permissions
revoke all on function public.send_my_private_message(text) from public;
revoke all on function public.send_owner_private_message(uuid,text) from public;
revoke all on function public.mark_my_private_messages_read() from public;
revoke all on function public.mark_owner_private_messages_read(uuid) from public;
revoke all on function public.get_owner_unread_private_count() from public;
revoke all on function public.owner_learning_stats() from public;
revoke all on function public.set_content_review_state(text,uuid,text) from public;
revoke all on function public.owner_rls_diagnostics() from public;
revoke all on function public.get_admin_dashboard_summary() from public;

grant execute on function public.send_my_private_message(text) to authenticated;
grant execute on function public.send_owner_private_message(uuid,text) to authenticated;
grant execute on function public.mark_my_private_messages_read() to authenticated;
grant execute on function public.mark_owner_private_messages_read(uuid) to authenticated;
grant execute on function public.get_owner_unread_private_count() to authenticated;
grant execute on function public.owner_learning_stats() to authenticated;
grant execute on function public.set_content_review_state(text,uuid,text) to authenticated;
grant execute on function public.owner_rls_diagnostics() to authenticated;
grant execute on function public.get_admin_dashboard_summary() to authenticated;

-- Table grants; RLS remains the enforcement layer.
grant select,insert,update on public.profiles to authenticated;
grant select on public.adhkar_content,public.announcements,public.app_settings,public.academy_lessons,public.academy_questions to anon;
grant select,insert,update,delete on public.adhkar_content,public.announcements,public.app_settings,public.academy_lessons,public.academy_questions to authenticated;
grant select on public.private_messages to authenticated;
grant select,insert,update,delete on public.learning_progress to authenticated;
grant select,insert,delete on public.exam_attempts to authenticated;
grant select,insert,update,delete on public.reports to authenticated;
grant insert on public.reports to anon;
grant select on public.security_audit to authenticated;
grant all privileges on all tables in schema public to service_role;

insert into public.app_settings(key,value,public)
values
  ('home_message','',true),
  ('announcement','',true),
  ('security_owner_idle_minutes','30',false)
on conflict(key) do nothing;


-- =========================================================
-- V81 Owner Studio: إدارة تشغيل الموقع من لوحة المالك
-- =========================================================

create table if not exists public.site_modules (
  module_key text primary key,
  label text not null,
  enabled boolean not null default true,
  nav_visible boolean not null default true,
  sort_order integer not null default 100,
  title_override text not null default '',
  subtitle_override text not null default '',
  config jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_texts (
  text_key text primary key,
  value text not null default '',
  public boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_blocks (
  id uuid primary key default gen_random_uuid(),
  area_key text not null default 'home',
  title text not null,
  body text not null default '',
  button_label text not null default '',
  button_url text not null default '',
  style_key text not null default 'default',
  sort_order integer not null default 100,
  active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint custom_blocks_url_safe check(
    button_url='' or button_url ~ '^(https://|/|[A-Za-z0-9_.-]+\.html(?:[?#].*)?)'
  )
);

create table if not exists public.ai_settings (
  id boolean primary key default true check(id=true),
  enabled boolean not null default false,
  assistant_name text not null default 'المساعد الذكي لنور الذكر',
  function_name text not null default 'noor-ai',
  model_label text not null default 'default',
  system_prompt text not null default '',
  safety_notice text not null default 'المساعد للتثقيف والمساعدة ولا يقدّم تشخيصًا طبيًا أو حكمًا شرعيًا قطعيًا.',
  max_input_chars integer not null default 3000 check(max_input_chars between 200 and 12000),
  max_daily_per_user integer not null default 30 check(max_daily_per_user between 1 and 500),
  temperature numeric(3,2) not null default 0.25 check(temperature between 0 and 1),
  quick_prompts jsonb not null default '["سؤال فقهي","أريد فهم عرض صحي","سؤال عن الرقية","أريد فهم رؤيا"]'::jsonb,
  allowed_sections jsonb not null default '["home","adhkar","ruqyah","assessment","dreams","creed","fiqh","seerah","hadith","prayer","qibla","tasbeeh","memorization","studentDashboard"]'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ui_settings (
  id boolean primary key default true check(id=true),
  accent text not null default '#2f735e',
  accent2 text not null default '#b89a5a',
  light_bg text not null default '#f3f2ee',
  dark_bg text not null default '#0f1211',
  radius integer not null default 18 check(radius between 6 and 36),
  compact boolean not null default false,
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'الموقع تحت التحديث. نعود قريبًا بإذن الله.',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.site_modules enable row level security;
alter table public.site_texts enable row level security;
alter table public.custom_blocks enable row level security;
alter table public.ai_settings enable row level security;
alter table public.ui_settings enable row level security;

drop policy if exists site_modules_public_read on public.site_modules;
create policy site_modules_public_read on public.site_modules for select to anon,authenticated
using(true);
drop policy if exists site_modules_owner_all on public.site_modules;
create policy site_modules_owner_all on public.site_modules for all to authenticated
using(public.is_owner()) with check(public.is_owner());

drop policy if exists site_texts_public_read on public.site_texts;
create policy site_texts_public_read on public.site_texts for select to anon,authenticated
using(public=true or public.is_owner());
drop policy if exists site_texts_owner_all on public.site_texts;
create policy site_texts_owner_all on public.site_texts for all to authenticated
using(public.is_owner()) with check(public.is_owner());

drop policy if exists custom_blocks_public_read on public.custom_blocks;
create policy custom_blocks_public_read on public.custom_blocks for select to anon,authenticated
using(active=true or public.is_owner());
drop policy if exists custom_blocks_owner_all on public.custom_blocks;
create policy custom_blocks_owner_all on public.custom_blocks for all to authenticated
using(public.is_owner()) with check(public.is_owner());

drop policy if exists ai_settings_public_read on public.ai_settings;
create policy ai_settings_public_read on public.ai_settings for select to anon,authenticated
using(true);
drop policy if exists ai_settings_owner_all on public.ai_settings;
create policy ai_settings_owner_all on public.ai_settings for all to authenticated
using(public.is_owner()) with check(public.is_owner());

drop policy if exists ui_settings_public_read on public.ui_settings;
create policy ui_settings_public_read on public.ui_settings for select to anon,authenticated
using(true);
drop policy if exists ui_settings_owner_all on public.ui_settings;
create policy ui_settings_owner_all on public.ui_settings for all to authenticated
using(public.is_owner()) with check(public.is_owner());

grant select on public.site_modules,public.site_texts,public.custom_blocks,public.ai_settings,public.ui_settings to anon,authenticated;
grant insert,update,delete on public.site_modules,public.site_texts,public.custom_blocks to authenticated;
grant insert,update,delete on public.ai_settings,public.ui_settings to authenticated;

do $$ begin create trigger site_modules_touch before update on public.site_modules for each row execute function public.touch_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger site_texts_touch before update on public.site_texts for each row execute function public.touch_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger custom_blocks_touch before update on public.custom_blocks for each row execute function public.touch_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger ai_settings_touch before update on public.ai_settings for each row execute function public.touch_updated_at(); exception when duplicate_object then null; end $$;
do $$ begin create trigger ui_settings_touch before update on public.ui_settings for each row execute function public.touch_updated_at(); exception when duplicate_object then null; end $$;

do $$ begin create trigger audit_site_modules after insert or update or delete on public.site_modules for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_site_texts after insert or update or delete on public.site_texts for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_custom_blocks after insert or update or delete on public.custom_blocks for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_ai_settings after update on public.ai_settings for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;
do $$ begin create trigger audit_ui_settings after update on public.ui_settings for each row execute function public.audit_owner_change(); exception when duplicate_object then null; end $$;

insert into public.site_modules(module_key,label,enabled,nav_visible,sort_order) values
('home','الرئيسية',true,true,10),
('adhkar','الأذكار',true,true,20),
('quran','القرآن',true,true,30),
('ruqyah','الرقية الشرعية',true,true,40),
('assessment','تقييم الأعراض',true,true,50),
('dreams','تفسير الأحلام',true,true,60),
('creed','العقيدة',true,true,70),
('fiqh','الفقه',true,true,80),
('seerah','السيرة النبوية',true,true,90),
('hadith','الحديث',true,true,100),
('prayer','الصلاة',true,true,110),
('qibla','القبلة',true,true,120),
('tasbeeh','المسبحة',true,true,130),
('memorization','اختبارات الحفظ',true,true,140),
('studentDashboard','لوحة الطالب',true,true,150),
('privateChat','المحادثة الخاصة',true,true,160),
('support','الدعم والخصوصية',true,true,170),
('aiAssistant','المساعد الذكي',false,true,180)
on conflict(module_key) do nothing;

insert into public.site_texts(text_key,value,public) values
('hero.title','رفيقك اليومي للذكر والقرآن',true),
('hero.subtitle','أذكار، قرآن كريم، مواقيت الصلاة ومسبحة في مكان واحد.',true),
('home.cta.title','ابدأ اليوم بما تستطيع، وداوم عليه.',true),
('home.cta.body','نور الذكر يحفظ تقدمك على جهازك لتعود من حيث توقفت.',true),
('global.announcement','',true)
on conflict(text_key) do nothing;

insert into public.ai_settings(id) values(true) on conflict(id) do nothing;
insert into public.ui_settings(id) values(true) on conflict(id) do nothing;

-- V81.7: الصلاحيات النهائية تُنفّذ بعد إنشاء كل جداول V81.
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant usage,select on all sequences in schema public to service_role;



commit;

select
  'V81.7 SCHEMA READY' as status,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from public.security_audit) as audit_rows;
