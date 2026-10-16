-- Telecaller role, and admin-managed logins for HR and telecallers.
-- Admin creates the HR and telecaller logins; either of them can ask the admin for a password, and a temporary password
-- always has to be replaced at the next sign-in (must_change_password).

alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check check (role in ('admin', 'hr', 'telecaller'));

-- Website enquiries: admins and telecallers can read them; only admins can delete.
create or replace function public.can_view_enquiries() returns boolean
language sql stable security definer set search_path to '' as $$
  select coalesce((select public.staff_role()), '') in ('admin', 'telecaller');
$$;
revoke execute on function public.can_view_enquiries() from public, anon;
grant execute on function public.can_view_enquiries() to authenticated;

drop policy if exists "admin read" on public.applies;
create policy "enquiries read" on public.applies for select to authenticated using ((select public.can_view_enquiries()));

-- HR and telecallers can both ask for a password.
create or replace function public.request_password_reset(p_email text) returns void
language plpgsql security definer set search_path to '' as $$
declare v_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_email = '' or length(v_email) > 254 then return; end if;
  if (select count(*) from public.password_requests where created_at > now() - interval '1 hour') >= 20 then return; end if;
  if not exists (
    select 1 from public.admins a join auth.users u on u.id = a.user_id
    where a.role in ('hr', 'telecaller') and lower(u.email) = v_email
  ) then return; end if;
  if exists (select 1 from public.password_requests where email = v_email and status = 'pending') then return; end if;
  insert into public.password_requests (email) values (v_email);
end $$;

-- Shared: set a new temporary password for an HR / telecaller user and force a change at next sign-in.
create or replace function public.set_staff_password(p_user_id uuid, p_password text) returns void
language plpgsql security definer set search_path to '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  if p_password is null or length(p_password) < 10 or length(p_password) > 72 then
    raise exception 'Use a password of 10 to 72 characters.';
  end if;
  if not exists (select 1 from public.admins where user_id = p_user_id and role in ('hr', 'telecaller')) then
    raise exception 'That login is not an HR or telecaller account.';
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
    where lower(u.email) = v_email and a.role in ('hr', 'telecaller');
  if v_uid is null then raise exception 'No HR or telecaller account with that email.'; end if;
  perform public.set_staff_password(v_uid, p_password);
end $$;

-- The admin's list of HR and telecaller logins.
create or replace function public.admin_list_staff()
returns table (user_id uuid, email text, name text, role text, must_change_password boolean, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql stable security definer set search_path to '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  return query
    select a.user_id, u.email::text, (u.raw_user_meta_data ->> 'name'), a.role, a.must_change_password, a.created_at, u.last_sign_in_at
    from public.admins a join auth.users u on u.id = a.user_id
    where a.role in ('hr', 'telecaller')
    order by a.role, u.email;
end $$;

-- The admin creates a login. The person must choose their own password the first time they sign in.
create or replace function public.admin_create_staff(p_email text, p_password text, p_role text, p_name text) returns uuid
language plpgsql security definer set search_path to '' as $$
declare v_email text := lower(trim(coalesce(p_email, ''))); v_id uuid := gen_random_uuid();
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  if p_role not in ('hr', 'telecaller') then raise exception 'Choose HR or telecaller.'; end if;
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

-- Remove an HR or telecaller login.
create or replace function public.admin_remove_staff(p_user_id uuid) returns void
language plpgsql security definer set search_path to '' as $$
begin
  if not (select public.is_admin()) then raise exception 'Not allowed'; end if;
  if not exists (select 1 from public.admins where user_id = p_user_id and role in ('hr', 'telecaller')) then
    raise exception 'That login is not an HR or telecaller account.';
  end if;
  delete from auth.users where id = p_user_id;
end $$;

revoke all on function public.set_staff_password(uuid, text), public.admin_list_staff(),
  public.admin_create_staff(text, text, text, text), public.admin_remove_staff(uuid) from public, anon;
grant execute on function public.set_staff_password(uuid, text), public.admin_list_staff(),
  public.admin_create_staff(text, text, text, text), public.admin_remove_staff(uuid) to authenticated;
