-- Noor AlDhikr V81 — Step 2: promote the owner
-- شغّل هذا الملف بعد إنشاء المستخدم في Authentication > Users.
begin;

do $$
declare
  target_email text := 'shhabkhald018@gmail.com';
  uid uuid;
begin
  select id into uid from auth.users where lower(email)=lower(target_email) limit 1;
  if uid is null then
    raise exception 'OWNER_AUTH_USER_NOT_FOUND: أنشئ المستخدم % في Authentication أولًا.',target_email;
  end if;

  insert into public.profiles(id,email,display_name,role,active)
  select u.id,u.email,left(coalesce(u.raw_user_meta_data->>'display_name',split_part(u.email,'@',1)),80),'owner'::public.noor_role,true
  from auth.users u where u.id=uid
  on conflict(id) do update
    set email=excluded.email,role='owner'::public.noor_role,active=true,updated_at=now();

  if not exists(select 1 from public.profiles where id=uid and role='owner'::public.noor_role and active=true) then
    raise exception 'OWNER_PROMOTION_FAILED';
  end if;
end $$;

commit;

select
  'V81 OWNER READY' as status,
  email,role,active
from public.profiles
where lower(email)=lower('shhabkhald018@gmail.com');
