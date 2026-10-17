-- Blog categories are archived instead of deleted by marketing and designers (same rules as blog posts).
--   admin + marketing + designer: archive      admin only: restore and delete for good

alter table public.blog_categories add column if not exists archived_at timestamptz;

drop policy if exists "public read" on public.blog_categories;
create policy "public read" on public.blog_categories for select to anon using (archived_at is null);
create policy "staff read" on public.blog_categories for select to authenticated
  using (archived_at is null or (select public.can_manage_content()));

drop policy if exists "content delete" on public.blog_categories;
create policy "admin delete" on public.blog_categories for delete to authenticated using ((select public.is_admin()));

create or replace function public.blog_categories_guard_archive() returns trigger
language plpgsql security definer set search_path to '' as $$
declare r text := coalesce((select public.staff_role()), '');
begin
  if new.archived_at is distinct from old.archived_at then
    if new.archived_at is not null and r not in ('admin', 'marketing', 'designer') then
      raise exception 'Not allowed to archive categories';
    end if;
    if new.archived_at is null and r <> 'admin' then
      raise exception 'Only an admin can restore categories';
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.blog_categories_guard_archive() from public, anon, authenticated;

drop trigger if exists blog_categories_guard_archive on public.blog_categories;
create trigger blog_categories_guard_archive before update on public.blog_categories
  for each row execute function public.blog_categories_guard_archive();
