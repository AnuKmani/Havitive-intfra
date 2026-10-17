-- Projects get a status (Ongoing, Completed or Handing over) that can be changed from the admin project list.
-- Projects that already exist count as completed.

alter table public.latest_projects add column if not exists status text not null default 'completed';
alter table public.latest_projects drop constraint if exists latest_projects_status_check;
alter table public.latest_projects add constraint latest_projects_status_check check (status in ('ongoing', 'completed', 'handing_over'));
