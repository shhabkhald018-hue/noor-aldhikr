-- Cover the reviewer foreign keys used by content moderation and user cleanup.

create index if not exists knowledge_base_reviewed_by_idx
  on public.knowledge_base(reviewed_by);
create index if not exists academy_lessons_reviewed_by_idx
  on public.academy_lessons(reviewed_by);
create index if not exists academy_questions_reviewed_by_idx
  on public.academy_questions(reviewed_by);

