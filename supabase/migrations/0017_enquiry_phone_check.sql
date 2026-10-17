-- Enquiry phone numbers are checked by the database too, so a made-up number can't get in even if the website form is bypassed.
-- Same rules as the form: +91, then 10 digits starting with 6-9, and not an obvious fake (one digit repeated, 6+ of the same
-- digit in a row, a short pattern repeated, or a run like 123456 / 987654).

create or replace function public.is_plausible_in_mobile(p text) returns boolean
language plpgsql immutable set search_path to '' as $$
declare n text; i int; d int; run int := 1; step int := 0;
begin
  if p is null or p !~ '^\+91[6-9][0-9]{9}$' then return false; end if;
  n := substr(p, 4);
  if n ~ '(\d)\1{5}' then return false; end if;
  if n ~ '^(\d\d)\1{4}$' or n ~ '^(\d{5})\1$' then return false; end if;
  for i in 2..length(n) loop
    d := substr(n, i, 1)::int - substr(n, i - 1, 1)::int;
    if (d = 1 or d = -1) and (run = 1 or d = step) then
      run := run + 1;
      step := d;
      if run >= 6 then return false; end if;
    elsif d = 1 or d = -1 then
      run := 2;
      step := d;
    else
      run := 1;
      step := 0;
    end if;
  end loop;
  return true;
end $$;

create or replace function public.check_enquiry_phone() returns trigger
language plpgsql security definer set search_path to '' as $$
begin
  if not public.is_plausible_in_mobile(new.phone) then
    raise exception 'That doesn''t look like a real mobile number. Please enter the number we can call you on.' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke all on function public.check_enquiry_phone() from public, anon, authenticated;

drop trigger if exists check_phone on public.applies;
create trigger check_phone before insert on public.applies
  for each row execute function public.check_enquiry_phone();
