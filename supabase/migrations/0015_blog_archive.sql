-- Blog posts are archived instead of deleted by marketing and designers.
--   admin + marketing + designer: archive      admin only: restore and delete for good
-- Archived posts disappear from the website straight away.

alter table public.blog_posts add column if not exists archived_at timestamptz;

-- Website visitors only see posts that are not archived; staff can see all of them (to restore).
drop policy if exists "public read" on public.blog_posts;
create policy "public read" on public.blog_posts for select to anon using (archived_at is null);
create policy "staff read" on public.blog_posts for select to authenticated
  using (archived_at is null or (select public.can_manage_content()));

-- Permanent delete is admin-only.
drop policy if exists "content delete" on public.blog_posts;
create policy "admin delete" on public.blog_posts for delete to authenticated using ((select public.is_admin()));

-- Only content staff may archive; only admins may restore.
create or replace function public.blog_posts_guard_archive() returns trigger
language plpgsql security definer set search_path to '' as $$
declare r text := coalesce((select public.staff_role()), '');
begin
  if new.archived_at is distinct from old.archived_at then
    if new.archived_at is not null and r not in ('admin', 'marketing', 'designer') then
      raise exception 'Not allowed to archive posts';
    end if;
    if new.archived_at is null and r <> 'admin' then
      raise exception 'Only an admin can restore posts';
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.blog_posts_guard_archive() from public, anon, authenticated;

drop trigger if exists blog_posts_guard_archive on public.blog_posts;
create trigger blog_posts_guard_archive before update on public.blog_posts
  for each row execute function public.blog_posts_guard_archive();
