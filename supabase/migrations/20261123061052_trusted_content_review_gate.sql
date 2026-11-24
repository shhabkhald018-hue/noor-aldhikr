-- Noor AlDhikr V92.1 Trusted Content
-- Non-destructive review gate. No table or row is deleted by this migration.

begin;

-- Canonical knowledge and academy review metadata.
alter table public.knowledge_base
  add column if not exists review_status text not null default 'draft',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text not null default '',
  add column if not exists legacy_ai_knowledge_id uuid references public.ai_knowledge(id) on delete set null;

alter table public.academy_lessons
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text not null default '';

alter table public.academy_questions
  add column if not exists reference_text text not null default '',
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text not null default '';

-- New content starts inactive and must pass a separate review action.
alter table public.knowledge_base alter column active set default false;
alter table public.academy_lessons alter column active set default false;
alter table public.academy_questions alter column active set default false;

-- Keep the database release marker and AI safety switches aligned with the
-- central web release. These upserts do not remove any setting or history.
insert into public.app_settings(key, value, public)
values
  ('current_version', '92.1.0', true),
  ('cache_version', 'noor-aldhikr-v92-1-trusted-content', true),
  ('ai_mode', 'trusted-retrieval-only', true),
  ('v89_generation_enabled', 'false', true),
  ('v89_local_model_enabled', 'false', true),
  ('v90_generation_enabled', 'false', true)
on conflict (key) do update
set value = excluded.value,
    public = excluded.public,
    updated_at = now();

insert into public.app_versions(version, label, notes, active)
values (
  '92.1.0',
  'V92.1 TRUSTED CONTENT FREE AI',
  'بوابة مراجعة بشرية ومصادر دقيقة، ومساعد بحث موثق بلا توليد حر أو API مدفوع.',
  true
)
on conflict (version) do update
set label = excluded.label,
    notes = excluded.notes,
    active = true;

update public.app_versions
set active = false
where version <> '92.1.0' and active = true;

-- Link one deterministic canonical row to each matching legacy knowledge item.
-- Existing canonical answers always win; only blank metadata is filled.
with legacy as (
  select distinct on (normalized_question)
    id,
    normalized_question,
    keywords,
    category,
    source_text,
    source_type,
    source_label,
    trust_tier
  from (
    select
      a.*,
      lower(regexp_replace(btrim(coalesce(nullif(a.question, ''), a.title)), '\s+', ' ', 'g')) as normalized_question
    from public.ai_knowledge a
    where btrim(coalesce(nullif(a.question, ''), a.title)) <> ''
  ) rows
  order by normalized_question, active desc, updated_at desc nulls last, created_at desc
), targets as (
  select distinct on (normalized_question)
    id,
    normalized_question
  from (
    select
      k.id,
      lower(regexp_replace(btrim(k.question), '\s+', ' ', 'g')) as normalized_question,
      k.updated_at,
      k.created_at
    from public.knowledge_base k
    where btrim(k.question) <> ''
  ) rows
  order by normalized_question, updated_at desc nulls last, created_at desc
)
update public.knowledge_base k
set
  legacy_ai_knowledge_id = legacy.id,
  keywords = case when cardinality(k.keywords) = 0 then legacy.keywords else k.keywords end,
  category = case when btrim(k.category) = '' then legacy.category else k.category end,
  source_text = case when btrim(k.source_text) = '' then legacy.source_text else k.source_text end,
  source_type = case when btrim(k.source_type) = '' then legacy.source_type else k.source_type end,
  source_label = case when btrim(k.source_label) = '' then legacy.source_label else k.source_label end,
  trust_tier = case when k.trust_tier = 'review' and legacy.trust_tier in ('primary', 'verified') then legacy.trust_tier else k.trust_tier end
from targets
join legacy using (normalized_question)
where k.id = targets.id
  and k.legacy_ai_knowledge_id is null;

-- Preserve any legacy-only row as an inactive draft in the canonical table.
insert into public.knowledge_base (
  question,
  answer,
  keywords,
  category,
  priority,
  active,
  source_text,
  source_type,
  source_label,
  trust_tier,
  updated_by,
  created_at,
  updated_at,
  review_status,
  review_notes,
  legacy_ai_knowledge_id
)
select
  btrim(coalesce(nullif(a.question, ''), a.title)),
  a.answer,
  coalesce(a.keywords, '{}'::text[]),
  coalesce(nullif(btrim(a.category), ''), 'عام'),
  coalesce(a.priority, 100),
  false,
  coalesce(a.source_text, ''),
  coalesce(nullif(btrim(a.source_type), ''), 'owner'),
  coalesce(a.source_label, ''),
  case when a.trust_tier in ('primary', 'verified') then a.trust_tier else 'review' end,
  a.updated_by,
  coalesce(a.created_at, now()),
  coalesce(a.updated_at, a.created_at, now()),
  'draft',
  'مستورد بأمان من ai_knowledge ويحتاج مراجعة بشرية قبل النشر.',
  a.id
from public.ai_knowledge a
where btrim(coalesce(nullif(a.question, ''), a.title)) <> ''
  and not exists (
    select 1
    from public.knowledge_base k
    where k.legacy_ai_knowledge_id = a.id
       or lower(regexp_replace(btrim(k.question), '\s+', ' ', 'g')) =
          lower(regexp_replace(btrim(coalesce(nullif(a.question, ''), a.title)), '\s+', ' ', 'g'))
  );

create unique index if not exists knowledge_base_legacy_ai_knowledge_idx
  on public.knowledge_base (legacy_ai_knowledge_id)
  where legacy_ai_knowledge_id is not null;

-- Keep the 16 previously active, sourced seed answers available without
-- inventing a reviewer identity. Any future content edit resets them to draft.
update public.knowledge_base
set
  review_status = 'published',
  reviewed_at = coalesce(reviewed_at, updated_at, created_at, now()),
  review_notes = case
    when btrim(review_notes) = '' then 'عنصر Legacy موثق بالمصدر قبل V92.1؛ هوية المراجع القديمة غير مسجلة، وأي تعديل جديد يتطلب مراجعة مالك.'
    else review_notes
  end
where active = true
  and trust_tier in ('primary', 'verified')
  and btrim(source_text) <> ''
  and review_status <> 'published';

-- Unreviewed academy material stays stored, but never active.
update public.academy_lessons
set active = false
where active = true
  and (
    review_status <> 'published'
    or btrim(reference_text) = ''
    or reviewed_by is null
    or reviewed_at is null
  );

update public.academy_questions
set active = false
where active = true
  and (
    review_status <> 'published'
    or btrim(reference_text) = ''
    or reviewed_by is null
    or reviewed_at is null
  );

-- Every insert is a draft. A content edit revokes approval. Publishing is a
-- separate owner-only update that records the real reviewer and timestamp.
create or replace function public.enforce_trusted_content_review()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  new_payload jsonb := to_jsonb(new);
  old_payload jsonb;
  content_source text;
begin
  if tg_op = 'INSERT' then
    new.review_status := 'draft';
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.active := false;
    return new;
  end if;

  old_payload := to_jsonb(old);

  -- If a reviewer account is removed, preserve the content but immediately
  -- revoke publication instead of blocking the foreign-key SET NULL action.
  if new.reviewed_by is null and old.reviewed_by is not null then
    new.review_status := 'draft';
    new.reviewed_at := null;
    new.active := false;
    return new;
  end if;

  if new.review_status not in ('draft', 'review', 'approved', 'published', 'rejected', 'archived') then
    raise exception 'INVALID_REVIEW_STATUS' using errcode = '23514';
  end if;

  if (
    new_payload - array[
      'active','review_status','reviewed_by','reviewed_at','review_notes',
      'updated_at','updated_by','priority','sort_order'
    ]
  ) is distinct from (
    old_payload - array[
      'active','review_status','reviewed_by','reviewed_at','review_notes',
      'updated_at','updated_by','priority','sort_order'
    ]
  ) then
    new.review_status := 'draft';
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.active := false;
    return new;
  end if;

  if new.review_status in ('approved', 'published') then
    if not public.is_owner() then
      raise exception 'OWNER_REVIEW_REQUIRED' using errcode = '42501';
    end if;

    content_source := coalesce(new_payload ->> 'source_text', new_payload ->> 'reference_text', '');
    if btrim(content_source) = '' then
      raise exception 'PRECISE_SOURCE_REQUIRED' using errcode = '23514';
    end if;

    if new_payload ? 'trust_tier' and coalesce(new_payload ->> 'trust_tier', 'review') = 'review' then
      raise exception 'TRUST_TIER_REVIEW_CANNOT_PUBLISH' using errcode = '23514';
    end if;

    new.reviewed_by := (select auth.uid());
    new.reviewed_at := now();
    new.active := (new.review_status = 'published');
  else
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.active := false;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_trusted_content_review() from public, anon, authenticated;

create or replace trigger knowledge_base_review_state
before insert or update on public.knowledge_base
for each row execute function public.enforce_trusted_content_review();

create or replace trigger academy_lessons_review_state
before insert or update on public.academy_lessons
for each row execute function public.enforce_trusted_content_review();

create or replace trigger academy_questions_review_state
before insert or update on public.academy_questions
for each row execute function public.enforce_trusted_content_review();

-- Database-level guarantees. NOT VALID preserves legacy rows while still
-- enforcing the rule for every new or updated row.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.knowledge_base'::regclass
      and conname = 'knowledge_base_review_status_check'
  ) then
    alter table public.knowledge_base
      add constraint knowledge_base_review_status_check
      check (review_status in ('draft', 'review', 'approved', 'published', 'rejected', 'archived')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.knowledge_base'::regclass
      and conname = 'knowledge_base_trusted_publication_check'
  ) then
    alter table public.knowledge_base
      add constraint knowledge_base_trusted_publication_check
      check (
        active = false
        or (
          review_status = 'published'
          and trust_tier in ('primary', 'verified')
          and btrim(source_text) <> ''
          and reviewed_at is not null
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.academy_lessons'::regclass
      and conname = 'academy_lessons_review_status_check'
  ) then
    alter table public.academy_lessons
      add constraint academy_lessons_review_status_check
      check (review_status in ('draft', 'review', 'approved', 'published', 'rejected', 'archived')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.academy_lessons'::regclass
      and conname = 'academy_lessons_trusted_publication_check'
  ) then
    alter table public.academy_lessons
      add constraint academy_lessons_trusted_publication_check
      check (
        active = false
        or (
          review_status = 'published'
          and btrim(reference_text) <> ''
          and reviewed_by is not null
          and reviewed_at is not null
        )
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.academy_questions'::regclass
      and conname = 'academy_questions_review_status_check'
  ) then
    alter table public.academy_questions
      add constraint academy_questions_review_status_check
      check (review_status in ('draft', 'review', 'approved', 'published', 'rejected', 'archived')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.academy_questions'::regclass
      and conname = 'academy_questions_trusted_publication_check'
  ) then
    alter table public.academy_questions
      add constraint academy_questions_trusted_publication_check
      check (
        active = false
        or (
          review_status = 'published'
          and btrim(reference_text) <> ''
          and reviewed_by is not null
          and reviewed_at is not null
        )
      ) not valid;
  end if;
end;
$$;

create index if not exists knowledge_base_review_queue_idx
  on public.knowledge_base (review_status, updated_at desc);
create index if not exists knowledge_base_trusted_public_idx
  on public.knowledge_base (priority desc, updated_at desc)
  where active = true and review_status = 'published';
create index if not exists academy_lessons_review_queue_idx
  on public.academy_lessons (review_status, subject, sort_order);
create index if not exists academy_questions_review_queue_idx
  on public.academy_questions (review_status, subject, updated_at desc);

alter table public.knowledge_base enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_questions enable row level security;
alter table public.ai_knowledge enable row level security;

-- Tighten existing policies in place; no policy is dropped.
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'knowledge_base'
      and policyname = 'v92 knowledge base public read'
  ) then
    execute 'alter policy "v92 knowledge base public read" on public.knowledge_base to anon, authenticated using (active = true and review_status = ''published'' and trust_tier in (''primary'', ''verified'') and btrim(source_text) <> '''' and reviewed_at is not null)';
  else
    execute 'create policy "v92 knowledge base public read" on public.knowledge_base for select to anon, authenticated using (active = true and review_status = ''published'' and trust_tier in (''primary'', ''verified'') and btrim(source_text) <> '''' and reviewed_at is not null)';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'academy_lessons'
      and policyname = 'v92 lessons public read'
  ) then
    execute 'alter policy "v92 lessons public read" on public.academy_lessons to anon, authenticated using (active = true and review_status = ''published'' and btrim(reference_text) <> '''' and reviewed_by is not null and reviewed_at is not null)';
  else
    execute 'create policy "v92 lessons public read" on public.academy_lessons for select to anon, authenticated using (active = true and review_status = ''published'' and btrim(reference_text) <> '''' and reviewed_by is not null and reviewed_at is not null)';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'academy_questions'
      and policyname = 'v92 questions public read'
  ) then
    execute 'alter policy "v92 questions public read" on public.academy_questions to anon, authenticated using (active = true and review_status = ''published'' and btrim(reference_text) <> '''' and reviewed_by is not null and reviewed_at is not null)';
  else
    execute 'create policy "v92 questions public read" on public.academy_questions for select to anon, authenticated using (active = true and review_status = ''published'' and btrim(reference_text) <> '''' and reviewed_by is not null and reviewed_at is not null)';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_knowledge'
      and policyname = 'v92 ai knowledge public read'
  ) then
    execute 'alter policy "v92 ai knowledge public read" on public.ai_knowledge to anon, authenticated using (false)';
  end if;
end;
$$;

-- Explicit Data API grants. RLS remains the row-level authority.
grant select on public.knowledge_base, public.academy_lessons, public.academy_questions
  to anon, authenticated;
grant insert, update, delete on public.knowledge_base, public.academy_lessons, public.academy_questions
  to authenticated;

comment on column public.knowledge_base.review_status is 'V92.1 review state. Only published, sourced rows are public.';
comment on column public.knowledge_base.legacy_ai_knowledge_id is 'Traceability link to the preserved legacy ai_knowledge row.';
comment on column public.academy_questions.reference_text is 'Exact source required before a question can be published.';
comment on function public.enforce_trusted_content_review() is 'Forces draft-first writes, revokes approval after content edits, and records owner review/publication.';

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
    'version', '92.1.0'
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
    then jsonb_build_object('owner', true, 'rls', true, 'version', '92.1.0')
    else jsonb_build_object('owner', false, 'rls', true, 'version', '92.1.0')
  end;
$$;

revoke all on function public.owner_portal_diagnostics() from public, anon;
revoke all on function public.owner_rls_diagnostics() from public, anon;
grant execute on function public.owner_portal_diagnostics() to authenticated;
grant execute on function public.owner_rls_diagnostics() to authenticated;

commit;
