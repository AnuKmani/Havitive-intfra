-- HR role: a separate login that can manage job openings, the careers page and job applications, and nothing else.
-- Existing admins keep full access. HR users are rows in public.admins with role = 'hr'.

alter table public.admins add column if not exists role text not null default 'admin';
alter table public.admins drop constraint if exists admins_role_check;
alter table public.admins add constraint admins_role_check check (role in ('admin', 'hr'));

-- The signed-in user's role, or null. Same two-step-verification rule as before: a user who turned it on
-- only counts after entering their code (aal2).
create or replace function public.staff_role()
returns text
language sql
stable
security definer
set search_path to ''
as $$
  select a.role from public.admins a
  where a.user_id = (select auth.uid())
    and (
      coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f where f.user_id = (select auth.uid()) and f.status = 'verified'
      )
    );
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path to '' as $$
  select coalesce((select public.staff_role()), '') = 'admin';
$$;

-- Admins and HR: the careers tables, the applications bucket and careers images.
create or replace function public.can_manage_careers() returns boolean
language sql stable security definer set search_path to '' as $$
  select coalesce((select public.staff_role()), '') in ('admin', 'hr');
$$;

revoke execute on function public.staff_role(), public.can_manage_careers() from public, anon;
grant execute on function public.staff_role(), public.can_manage_careers() to authenticated;

-- Job openings
drop policy if exists "admin insert" on public.alljobs;
drop policy if exists "admin update" on public.alljobs;
drop policy if exists "admin delete" on public.alljobs;
create policy "careers insert" on public.alljobs for insert to authenticated with check ((select public.can_manage_careers()));
create policy "careers update" on public.alljobs for update to authenticated using ((select public.can_manage_careers())) with check ((select public.can_manage_careers()));
create policy "careers delete" on public.alljobs for delete to authenticated using ((select public.can_manage_careers()));

-- Careers page texts
drop policy if exists "admin insert" on public.careers_page;
drop policy if exists "admin update" on public.careers_page;
drop policy if exists "admin delete" on public.careers_page;
create policy "careers insert" on public.careers_page for insert to authenticated with check ((select public.can_manage_careers()));
create policy "careers update" on public.careers_page for update to authenticated using ((select public.can_manage_careers())) with check ((select public.can_manage_careers()));
create policy "careers delete" on public.careers_page for delete to authenticated using ((select public.can_manage_careers()));

-- Job applications (also adds the missing update policy, so status and notes can be saved)
drop policy if exists "admin read" on public.career_pages;
drop policy if exists "admin delete" on public.career_pages;
create policy "careers read" on public.career_pages for select to authenticated using ((select public.can_manage_careers()));
create policy "careers update" on public.career_pages for update to authenticated using ((select public.can_manage_careers())) with check ((select public.can_manage_careers()));
create policy "careers delete" on public.career_pages for delete to authenticated using ((select public.can_manage_careers()));

drop policy if exists "admin all" on public.application_replies;
create policy "careers all" on public.application_replies for all to authenticated
  using ((select public.can_manage_careers())) with check ((select public.can_manage_careers()));

-- Storage: CVs for HR, and uploads only into the careers and profile-photo folders
drop policy if exists "admin reads applications" on storage.objects;
drop policy if exists "admin deletes applications" on storage.objects;
create policy "careers reads applications" on storage.objects for select to authenticated
  using (bucket_id = 'applications' and (select public.can_manage_careers()));
create policy "careers deletes applications" on storage.objects for delete to authenticated
  using (bucket_id = 'applications' and (select public.can_manage_careers()));
create policy "hr write upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'upload' and (select public.can_manage_careers()) and (name like 'careers/%' or name like 'admin_images/%'));
