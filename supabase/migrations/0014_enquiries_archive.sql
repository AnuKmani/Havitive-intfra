-- Enquiries are archived instead of deleted by marketing: archived ones leave the inbox but can be restored.
--   admin + marketing: archive      admin: restore and delete for good

alter table public.applies add column if not exists archived_at timestamptz;

-- Permanent delete is admin-only again (marketing archives instead).
drop policy if exists "enquiries delete" on public.applies;
create policy "enquiries delete" on public.applies for delete to authenticated
  using ((select public.is_admin()));

-- Telecallers can mark as read but not archive; only admins can restore.
create or replace function public.applies_guard_archive() returns trigger
language plpgsql security definer set search_path to '' as $$
declare r text := coalesce((select public.staff_role()), '');
begin
  if new.archived_at is distinct from old.archived_at then
    if new.archived_at is not null and r not in ('admin', 'marketing') then
      raise exception 'Not allowed to archive enquiries';
    end if;
    if new.archived_at is null and r <> 'admin' then
      raise exception 'Only an admin can restore enquiries';
    end if;
  end if;
  return new;
end $$;
revoke execute on function public.applies_guard_archive() from public, anon, authenticated;

drop trigger if exists applies_guard_archive on public.applies;
create trigger applies_guard_archive before update on public.applies
  for each row execute function public.applies_guard_archive();
