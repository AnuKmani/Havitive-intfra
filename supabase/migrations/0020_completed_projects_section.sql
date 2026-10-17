-- The home page slider that used to show "Our Future Projects" now shows completed projects.
-- Its heading, small background word, text and button are editable from Admin > Home page.

alter table public.homes add column if not exists shadow_text text;
alter table public.homes add column if not exists button_link text;

alter table public.homes drop constraint if exists homes_category_check;
alter table public.homes add constraint homes_category_check
  check (category = any (array['about', 'service', 'residence', 'latest', 'choose', 'projects']));

insert into public.homes (category, heading, shadow_text, main_content, button_text, button_link)
select 'projects', 'Our Completed Projects', 'PROJECTS',
  'A look at the projects we have delivered, built with quality, creativity and care.',
  'Explore More', 'https://www.instagram.com/havitive_architectural_studio/'
where not exists (select 1 from public.homes where category = 'projects');
