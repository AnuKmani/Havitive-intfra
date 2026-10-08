-- Admins who turned on two-step verification only count as admins after entering their code
-- (session assurance level aal2). Admins without it are unaffected.
create or replace function public.is_admin()
returns boolean
language sql
stable security definer
set search_path to ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
    and (
      coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f where f.user_id = (select auth.uid()) and f.status = 'verified'
      )
    );
$$;
