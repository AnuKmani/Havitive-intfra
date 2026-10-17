-- Enquiries get a read/unread state so the sidebar number goes down once they have been read,
-- and marketing managers can delete them (as admins can).

alter table public.applies add column if not exists read_at timestamptz;
-- Everything already in the inbox counts as read; only new enquiries start as unread.
update public.applies set read_at = now() where read_at is null;

-- Anyone who can see enquiries can mark them as read.
drop policy if exists "enquiries update" on public.applies;
create policy "enquiries update" on public.applies for update to authenticated
  using ((select public.can_view_enquiries())) with check ((select public.can_view_enquiries()));

-- Delete: admins and marketing.
drop policy if exists "admin delete" on public.applies;
drop policy if exists "enquiries delete" on public.applies;
create policy "enquiries delete" on public.applies for delete to authenticated
  using (coalesce((select public.staff_role()), '') in ('admin', 'marketing'));
