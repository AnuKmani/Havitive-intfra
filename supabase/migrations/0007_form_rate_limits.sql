-- Spam protection enforced by the database itself (works even if someone bypasses the website forms).
create or replace function public.limit_public_submissions() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  recent_same integer;
  recent_all integer;
begin
  -- Admin-side inserts are never limited.
  if (select public.is_admin()) then return new; end if;

  execute format('select count(*) from %I where email = $1 and created_at > now() - interval ''1 hour''', tg_table_name)
    into recent_same using new.email;
  if recent_same >= 3 then
    raise exception 'Too many submissions from this email address. Please try again later.' using errcode = 'P0001';
  end if;

  execute format('select count(*) from %I where created_at > now() - interval ''1 minute''', tg_table_name)
    into recent_all;
  if recent_all >= 20 then
    raise exception 'The form is busy. Please try again in a minute.' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke all on function public.limit_public_submissions() from public, anon, authenticated;

drop trigger if exists limit_submissions on public.applies;
create trigger limit_submissions before insert on public.applies
  for each row execute function public.limit_public_submissions();
drop trigger if exists limit_submissions on public.career_pages;
create trigger limit_submissions before insert on public.career_pages
  for each row execute function public.limit_public_submissions();
