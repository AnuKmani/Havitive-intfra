export type Timestamps = { created_at: string | null; updated_at: string | null };

export type Home = Timestamps & {
  id: number; home_images_alt?: string | null; category: string | null; main_content: string | null; meta_title: string | null;
  meta_descp: string | null; home_images: string | null; description: string | null;
  description_head: string | null; icon: string | null;
};
export type HomeBanner = Timestamps & { id: number; home_images_alt?: string | null; home_images: string | null; heading: string | null; description: string | null };
export type Counter = Timestamps & { id: number; counter_name: string | null; counter: string | null };
export type Sector = Timestamps & { id: number; sector_name: string | null; category: number | null };
export type Amenity = Timestamps & { id: number; aminity_name: string | null };
export type Project = Timestamps & {
  id: number; project_image_alt?: string | null; meta_title: string | null; meta_descp: string | null; project_name: string | null;
  project_image: string | null; sector_id: number | null; aminities_id: string | null; location: string | null;
  main_content: string | null; main_description: string | null; project_image_one: string | null;
  project_heading: string | null; description: string | null;
};
export type Floor = Timestamps & { id: number; image_alt?: string | null; project_id: number | null; floor_name: string | null; description: string | null; image: string | null };
export type Facility = Timestamps & { id: number; facility_image_alt?: string | null; project_id: number | null; facility_name: string | null; facility_description: string | null; facility_image: string | null };
export type Gallery = Timestamps & { id: number; gallery_alt?: string | null; project_id: number | null; gallery: string | null };
export type ShowcaseProject = Timestamps & {
  id: number; residence_image_one_alt?: string | null; residence_image_two_alt?: string | null; meta_title?: string | null; meta_descp?: string | null; main_content: string | null; sector_id: number | null;
  main_description: string | null; residence_image_one: string | null; residence_image_two: string | null;
  project_heading: string | null; project_descp: string | null; project_category: string | null;
  client_name: string | null; project_date: string | null; location: string | null; project_dec_two: string | null;
};
export type Company = Timestamps & { id: number; compani_img_alt?: string | null; compani_logo_alt?: string | null; company_name: string | null; company_description: string | null; compani_img: string | null; compani_logo: string | null; link: string | null };
export type TeamMember = Timestamps & {
  id: number; img_alt?: string | null; name: string | null; category: "management" | "team" | null; linkedin: string | null; designation: string | null;
  img: string | null; experience: string | null; location: string | null; practice_area: string | null;
  project_done: string | null; phone: string | null; email: string | null; about: string | null;
};
export type Section = Timestamps & { id: number; img_alt?: string | null; icon_alt?: string | null; section_name: string | null; img: string | null; icon: string | null };
export type Service = Timestamps & { id: number; img_alt?: string | null; name: string | null; section_id: string | null; description: string | null; img: string | null; section: string | null };
export type Testimonial = Timestamps & { id: number; img_alt?: string | null; client_img_alt?: string | null; img: string | null; desription: string | null; client_img: string | null; client_name: string | null; client_designation: string | null };
export type Client = Timestamps & { id: number; img_alt?: string | null; img: string | null };
export type BlogCategory = Timestamps & { id: number; category_name: string; category_slug: string };
export type BlogPost = Timestamps & {
  id: number; post_image_alt?: string | null; blogcat_id: number; meta_title: string | null; meta_descp: string | null; post_title: string | null;
  post_slug: string | null; post_image: string | null; short_descp: string | null; long_descp: string | null; post_tags: string | null;
};
export type Job = Timestamps & { id: number; title: string; description: string };
export type Apply = Timestamps & { id: number; name: string | null; email: string | null; phone: string | null; service_type: string | null; message: string | null };
export type CareerApplication = Timestamps & {
  id: number; job_id: number | null; name: string; email: string; phone: string;
  cover_letter_path: string; cv_path: string; message: string | null;
};
