-- Leftover column from the first version of 0004 (alert emails now use the NOTIFY_EMAIL setting).
alter table public.careers_page drop column if exists notify_email;
