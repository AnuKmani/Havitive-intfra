-- Dummy content for Handing Over Events, Awards, Media and Project Videos (replace from Admin > Showcase).

insert into public.showcase_items (section, title, description, image, image_alt, event_date)
select 'handover', t, d, 'https://picsum.photos/seed/havitive-ho' || n || '/1000/700', t, dt
from (values
 (1,'Skyline Residency handed over','Keys to 48 apartments were handed to happy families with a traditional ceremony.','2026-01-20'),
 (2,'Green Valley Villas','All 20 villas were delivered on the promised date, with a welcome kit for each family.','2026-02-17'),
 (3,'Orchid Business Park','The owner received the completed 5-floor commercial block after a final walkthrough.','2026-03-12'),
 (4,'Lakeview Heights','Residents moved into their homes with the clubhouse and gardens ready.','2026-04-25'),
 (5,'Sunrise Apartments','A joyful key-handover day with sweets, flowers and a photo with the whole site team.','2026-05-30'),
 (6,'Palm Grove Plots','Development of the gated plot community was completed and handed to the association.','2026-06-27'),
 (7,'Ivory Towers Phase 1','The first tower was inaugurated and handed over a month ahead of schedule.','2026-08-08'),
 (8,'Meadows Row Houses','Twelve row houses were opened by their owners in a small family celebration.','2026-09-19')
) as v(n,t,d,dt);

insert into public.showcase_items (section, title, description, image, image_alt, event_date)
select 'awards', t, d, 'https://picsum.photos/seed/havitive-aw' || n || '/900/675', t, dt
from (values
 (1,'Best Residential Builder','Recognised for outstanding quality and customer satisfaction in residential construction.','2026'),
 (2,'Excellence in Safety','Awarded for zero-incident site operations across all running projects.','2025'),
 (3,'Emerging Construction Company','Honoured among the fastest growing infrastructure firms in the region.','2025'),
 (4,'Green Building Award','For sustainable design and energy efficient construction practices.','2025'),
 (5,'Customer Choice Award','Voted by homeowners for transparency and timely delivery.','2024'),
 (6,'Architectural Design Merit','Given for the elevation design of Lakeview Heights.','2024'),
 (7,'Quality Management Certificate','Certified for consistent quality systems in engineering and construction.','2023'),
 (8,'Best Employer in Construction','Recognised for a supportive workplace and skill development.','2023')
) as v(n,t,d,dt);

insert into public.showcase_items (section, title, description, image, image_alt, link_url, event_date)
select 'media', t, d, 'https://picsum.photos/seed/havitive-md' || n || '/800/600', t, 'https://example.com/news/havitive-' || n, dt
from (values
 (1,'Havitive Infra unveils its largest residential project','The Business Daily reports on the launch of a new township planned by Havitive.','Business Daily · 12 Jan 2026'),
 (2,'How modern builders are cutting construction time','An interview with our founder on technology and planning on site.','Construction Times · 03 Feb 2026'),
 (3,'Havitive wins Best Residential Builder','The regional edition covers the award ceremony and the team behind it.','City Herald · 21 Mar 2026'),
 (4,'Sustainable homes: a builder''s view','A feature on green materials used in Havitive villas.','Home & Living · 14 Apr 2026'),
 (5,'CSR drive plants 500 saplings','Local news covers the tree plantation drive led by Havitive volunteers.','Local Express · 02 May 2026'),
 (6,'Havitive on the future of affordable housing','Panel discussion highlights from the real estate summit.','Realty Review · 18 Jun 2026'),
 (7,'Behind the scenes at a Havitive site','A photo story of a day with the engineers and site crew.','Metro Weekly · 29 Jul 2026'),
 (8,'Havitive opens a new design studio','The company expands its architecture and interior design team.','Business Daily · 10 Sep 2026')
) as v(n,t,d,dt);

insert into public.showcase_items (section, title, description, image, image_alt, video_url)
select 'project-videos', t, d, 'https://picsum.photos/seed/havitive-pv' || n || '/800/450', t, 'https://www.youtube.com/watch?v=' || vid
from (values
 (1,'Skyline Residency walkthrough','A tour of the finished apartments, lobby and amenities.','aqz-KE-bpKQ'),
 (2,'Green Valley Villas drone view','An aerial look at the villa community and its landscaping.','jNQXAC9IVRw'),
 (3,'Orchid Business Park construction story','From foundation to finishing in two minutes.','ScMzIvxBSi4'),
 (4,'Lakeview Heights amenities','The clubhouse, pool and gardens at Lakeview Heights.','YE7VzlLtp-4'),
 (5,'Inside a Havitive model home','A guided tour of a fully furnished sample villa.','LXb3EKWsInQ'),
 (6,'Time-lapse: Ivory Towers','Months of work on the tower captured in a time-lapse.','M7lc1UVf-VE'),
 (7,'Palm Grove plots overview','Roads, parks and plots in the gated community.','kJQP7kiw5Fk'),
 (8,'Sunrise Apartments final look','The finished building on handover day.','9bZkp7q19f0')
) as v(n,t,d,vid);
