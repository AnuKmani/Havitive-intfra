-- Marketing manager and designer / project manager roles.
--   marketing: website enquiries + blog posts, blog categories, projects, home page
--   designer:  blog posts, blog categories, projects, home page
-- Admins keep full access. Both roles are rows in public.admins and are created from Team logins, like HR and telecallers.

alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check
  check (role in ('admin', 'hr', 'telecaller', 'marketing', 'designer'));

-- Admins, marketing and designers: blog, projects (with galleries, floor plans, facilities) and the home page sections.
create or replace function public.can_manage_content() returns boolean
language sql stable security definer set search_path to '' as $$
  select coalesce((select public.staff_role()), '') in ('admin', 'marketing', 'designer');
$$;
revoke execute on function public.can_manage_content() from public, anon;
grant execute on function public.can_manage_content() to authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'blog_posts', 'blog_categories', 'latest_projects', 'galleries', 'floors', 'project_facitities',
    'home_banners', 'counters', 'homes', 'upcomming_projects', 'testimonials', 'clients', 'page_seo'
  ] loop
    execute format('drop policy if exists "admin insert" on public.%I', t);
    execute format('drop policy if exists "admin update" on public.%I', t);
    execute format('drop policy if exists "admin delete" on public.%I', t);
    execute format('create policy "content insert" on public.%I for insert to authenticated with check ((select public.can_manage_content()))', t);
    execute format('create policy "content update" on public.%I for update to authenticated using ((select public.can_manage_content())) with check ((select public.can_manage_content()))', t);
    execute format('create policy "content delete" on public.%I for delete to authenticated using ((select public.can_manage_content()))', t);
  end loop;
end $$;

-- Uploads: marketing and designers can add images everywhere except the careers folder.
create policy "content write upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'upload' and (select public.can_manage_content()) and name not like 'careers/%');

-- Website enquiries: admins, telecallers and marketing can read them; only admins can delete.
create or replace function public.can_view_enquiries() returns boolean
language sql stable security definer set search_path to '' as $$
  select coalesce((select public.staff_role()), '') in ('admin', 'telecaller', 'marketing');
$$;

-- Team logins now cover all four non-admin roles.
create or replace function public.request_password_reset(p_email text) returns void
language plpgsql security definer set search_path to '' as $$
declare v_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_email = '' or length(v_email) > 254 then return; end if;
  if (select count(*) from public.password_requests where created_at > now() - interval '1 hour') >= 20 then return; end if;
  if not exists (
    select 1 from public.admins a join auth.users u on u.id = a.user_id
    where a.role in ('hr', 'telecaller', 'marketing', 'designer') and lower(u.email) = v_email
  ) then return; end if;
  if exists (select 1 from public.password_requests where email = v_email and status = 'pending') then return; end if;
  insert into public.password_requests (email) values (v_email);
end $$;

create or replace function public.set_staff_password(p_user_id uuid, p_password text) returns void
language plpgsql security definer set search_path to '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  if p_password is null or length(p_password) < 10 or length(p_password) > 72 then
    raise exception 'Use a password of 10 to 72 characters.';
  end if;
  if not exists (select 1 from public.admins where user_id = p_user_id and role in ('hr', 'telecaller', 'marketing', 'designer')) then
    raise exception 'That login is not a team account.';
  end if;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = p_user_id;
  update public.admins set must_change_password = true where user_id = p_user_id;
  delete from auth.sessions where user_id = p_user_id;
  update public.password_requests set status = 'done', handled_at = now(),
    handled_by = (select email from auth.users where id = (select auth.uid()))
    where status = 'pending' and email = (select lower(email) from auth.users where id = p_user_id);
end $$;

create or replace function public.admin_set_temp_password(p_request_id bigint, p_password text) returns void
language plpgsql security definer set search_path to '' as $$
declare v_email text; v_uid uuid;
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  select email into v_email from public.password_requests where id = p_request_id and status = 'pending';
  if v_email is null then raise exception 'That request is no longer waiting.'; end if;
  select u.id into v_uid from auth.users u join public.admins a on a.user_id = u.id
    where lower(u.email) = v_email and a.role in ('hr', 'telecaller', 'marketing', 'designer');
  if v_uid is null then raise exception 'No team account with that email.'; end if;
  perform public.set_staff_password(v_uid, p_password);
end $$;

create or replace function public.admin_list_staff()
returns table (user_id uuid, email text, name text, role text, must_change_password boolean, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql stable security definer set search_path to '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  return query
    select a.user_id, u.email::text, (u.raw_user_meta_data ->> 'name'), a.role, a.must_change_password, a.created_at, u.last_sign_in_at
    from public.admins a join auth.users u on u.id = a.user_id
    where a.role in ('hr', 'telecaller', 'marketing', 'designer')
    order by a.role, u.email;
end $$;

create or replace function public.admin_create_staff(p_email text, p_password text, p_role text, p_name text) returns uuid
language plpgsql security definer set search_path to '' as $$
declare v_email text := lower(trim(coalesce(p_email, ''))); v_id uuid := gen_random_uuid();
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  if p_role not in ('hr', 'telecaller', 'marketing', 'designer') then raise exception 'Choose a role for this login.'; end if;
  if v_email !~ '^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$' then raise exception 'Enter a valid email address.'; end if;
  if p_password is null or length(p_password) < 10 or length(p_password) > 72 then
    raise exception 'Use a password of 10 to 72 characters.';
  end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then raise exception 'A login with that email already exists.'; end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('name', nullif(trim(coalesce(p_name, '')), '')), now(), now(),
    '', '', '', '', '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text, jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true), 'email', now(), now(), now());
  insert into public.admins (user_id, role, must_change_password) values (v_id, p_role, true);
  return v_id;
end $$;

create or replace function public.admin_remove_staff(p_user_id uuid) returns void
language plpgsql security definer set search_path to '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  if not exists (select 1 from public.admins where user_id = p_user_id and role in ('hr', 'telecaller', 'marketing', 'designer')) then
    raise exception 'That login is not a team account.';
  end if;
  delete from auth.users where id = p_user_id;
end $$;
