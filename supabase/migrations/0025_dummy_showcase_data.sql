-- Dummy content for testimonials, video testimonials and CSR activities (replace from Admin > Showcase / Testimonials).

insert into public.testimonials (img, desription, client_img, client_name, client_designation)
select 'https://picsum.photos/seed/havitive-t' || n || '/900/600',
       d, 'https://i.pravatar.cc/120?img=' || (n + 10), nm, ds
from (values
 (1,'Havitive delivered our villa two weeks ahead of schedule and the finish quality is outstanding. Every promise was kept.','Rajesh Kumar','Villa Owner, Hyderabad'),
 (2,'Transparent pricing and weekly site updates made the whole construction journey stress free.','Anita Sharma','Homeowner'),
 (3,'The design team understood our vision for the office and turned it into a space our staff love.','Vikram Reddy','Director, Reddy Tech'),
 (4,'Excellent engineering and safety standards. We have trusted them with three projects now.','Suresh Patel','Developer'),
 (5,'From approvals to handover, the team handled everything. Truly a one-stop construction partner.','Priya Nair','Apartment Owner'),
 (6,'Our commercial complex was completed on budget and the quality has impressed every tenant.','Mohammed Irfan','Business Owner'),
 (7,'Professional, punctual and creative. The interiors exceeded what we imagined.','Lakshmi Devi','Homeowner'),
 (8,'They solved structural challenges on our site that other contractors would not touch.','Arun Verma','Industrialist'),
 (9,'Great communication and a very responsive team, even after handover.','Kavitha Rao','Villa Owner'),
 (10,'Havitive built our dream home exactly as designed. Highly recommended.','Sandeep Joshi','Homeowner')
) as v(n,d,nm,ds);

insert into public.showcase_items (section, title, description, image, image_alt, video_url, event_date)
select 'testimonial-videos', 'Client story: ' || nm, d,
       'https://picsum.photos/seed/havitive-v' || n || '/800/450', nm,
       'https://www.youtube.com/watch?v=' || vid, null
from (values
 (1,'Rajesh Kumar','A villa owner shares his experience building with Havitive.','aqz-KE-bpKQ'),
 (2,'Anita Sharma','How a first-time home builder felt supported at every step.','jNQXAC9IVRw'),
 (3,'Vikram Reddy','Director talks about his new office built by our team.','ScMzIvxBSi4'),
 (4,'Suresh Patel','A repeat client on why he keeps coming back.','YE7VzlLtp-4'),
 (5,'Priya Nair','Apartment owner on the handover experience.','LXb3EKWsInQ'),
 (6,'Mohammed Irfan','Commercial complex owner on quality and timelines.','M7lc1UVf-VE'),
 (7,'Lakshmi Devi','Homeowner reviews her interiors.','kJQP7kiw5Fk'),
 (8,'Arun Verma','Industrialist on solving tough structural problems.','9bZkp7q19f0'),
 (9,'Kavitha Rao','Villa owner on after-handover support.','dQw4w9WgXcQ'),
 (10,'Sandeep Joshi','A dream home delivered as designed.','tgbNymZ7vqY')
) as v(n,nm,d,vid);

insert into public.showcase_items (section, title, description, image, image_alt, event_date)
select 'csr', t, d, 'https://picsum.photos/seed/havitive-csr' || n || '/1200/800', t, dt
from (values
 (1,'Tree Plantation Drive','Our team planted 500 saplings with local volunteers to make the neighbourhood greener.','2026-01-12'),
 (2,'Free Medical Camp','Doctors examined over 300 villagers and gave free medicines at our health camp.','2026-02-08'),
 (3,'School Kits for Children','We handed out bags, books and stationery to 200 children in government schools.','2026-03-05'),
 (4,'Blood Donation Camp','Employees and neighbours donated blood to support local hospitals.','2026-03-22'),
 (5,'Food for the Needy','Hot meals were served to families at the shelter home every week this month.','2026-04-14'),
 (6,'Clean Lake Campaign','Volunteers cleared plastic and waste from the lake front in a one-day clean-up.','2026-05-02'),
 (7,'Winter Blankets Distribution','Warm blankets reached 400 people sleeping outdoors during the cold wave.','2026-06-18'),
 (8,'Village Borewell Project','We built a borewell and water tank giving a village clean drinking water.','2026-07-09'),
 (9,'Skill Training for Youth','Free masonry and electrical training for 60 young people from nearby areas.','2026-08-21'),
 (10,'Old Age Home Visit','Our team spent the day with elders, sharing meals, music and essentials.','2026-09-15')
) as v(n,t,d,dt);
