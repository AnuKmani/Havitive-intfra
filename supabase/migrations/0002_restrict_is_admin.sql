-- Only signed-in users need to call is_admin() (the admin panel and RLS policies).
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
