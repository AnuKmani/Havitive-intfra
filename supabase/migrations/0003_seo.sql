-- Per-page SEO settings managed from the admin, and alt text for every image.

create table public.page_seo (
  key text primary key,            -- e.g. 'page:home', 'project:5', 'post:2'
  meta_title text,
  meta_description text,
  canonical_url text,
  og_image text,
  og_image_alt text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.page_seo enable row level security;
create policy "public read" on public.page_seo for select to anon, authenticated using (true);
create policy "admin insert" on public.page_seo for insert to authenticated with check ((select public.is_admin()));
create policy "admin update" on public.page_seo for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin delete" on public.page_seo for delete to authenticated using ((select public.is_admin()));

-- Alt text next to each image column ("<column>_alt").
alter table public.home_banners add column home_images_alt text;
alter table public.homes add column home_images_alt text;  -- one line per image, same order as home_images
alter table public.latest_projects add column project_image_alt text;
alter table public.galleries add column gallery_alt text;
alter table public.floors add column image_alt text;
alter table public.project_facitities add column facility_image_alt text;
alter table public.residenceprojects add column residence_image_one_alt text, add column residence_image_two_alt text;
alter table public.upcomming_projects add column residence_image_one_alt text, add column residence_image_two_alt text;
alter table public.gropuof_companies add column compani_img_alt text, add column compani_logo_alt text;
alter table public.teams add column img_alt text;
alter table public.services add column img_alt text;
alter table public.sections add column img_alt text, add column icon_alt text;
alter table public.testimonials add column img_alt text, add column client_img_alt text;
alter table public.clients add column img_alt text;
alter table public.blog_posts add column post_image_alt text;

-- Carry over the SEO fields the Laravel admin stored on projects and posts.
insert into public.page_seo (key, meta_title, meta_description)
select 'project:' || id, meta_title, regexp_replace(meta_descp, '<[^>]*>', '', 'g')
from public.latest_projects where coalesce(meta_title, meta_descp) is not null
on conflict (key) do nothing;
insert into public.page_seo (key, meta_title, meta_description)
select 'post:' || id, meta_title, regexp_replace(meta_descp, '<[^>]*>', '', 'g')
from public.blog_posts where coalesce(meta_title, meta_descp) is not null
on conflict (key) do nothing;
