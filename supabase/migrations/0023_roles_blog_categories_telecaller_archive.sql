-- 1. Blog categories are managed by admins only (marketing and designers keep writing blog posts).
drop policy if exists "content insert" on public.blog_categories;
drop policy if exists "content update" on public.blog_categories;
drop policy if exists "admin insert" on public.blog_categories;
drop policy if exists "admin update" on public.blog_categories;
create policy "admin insert" on public.blog_categories for insert to authenticated with check ((select public.is_admin()));
create policy "admin update" on public.blog_categories for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- 2. Telecallers can archive enquiries too (admins restore them).
create or replace function public.applies_guard_archive() returns trigger
language plpgsql security definer set search_path to '' as $$
declare r text := coalesce((select public.staff_role()), '');
begin
  if new.archived_at is distinct from old.archived_at then
    if new.archived_at is not null and r not in ('admin', 'marketing', 'telecaller') then
      raise exception 'Not allowed to archive enquiries';
    end if;
    if new.archived_at is null and r <> 'admin' then
      raise exception 'Only an admin can restore enquiries';
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.applies_guard_archive() from public, anon, authenticated;
