-- Editable YouTube links for the play buttons on the home page banner, the home page
-- About section and the About page (Admin > Home page and Admin > About page).
-- Until a link is saved the website keeps using its built-in default video.

alter table public.homes add column if not exists video_url text;
alter table public.about_page add column if not exists video_url text;

-- The banner video lives in its own "hero_video" row of public.homes.
alter table public.homes drop constraint if exists homes_category_check;
alter table public.homes add constraint homes_category_check
  check (category = any (array['about', 'service', 'residence', 'latest', 'choose', 'projects', 'hero_video']));

insert into public.homes (category, main_content)
select 'hero_video', 'https://www.youtube.com/watch?v=_sI_Ps7JSEk'
where not exists (select 1 from public.homes where category = 'hero_video');

update public.homes set video_url = 'https://www.youtube.com/watch?v=_sI_Ps7JSEk'
where category = 'about' and video_url is null;

update public.about_page set video_url = 'https://www.youtube.com/watch?v=_sI_Ps7JSEk'
where video_url is null;
