import { routes } from "@/lib/routes";

export type Option = { value: string; label: string };
export type OptionSource = "sectors" | "sections" | "amenities" | "blog_categories" | Option[];

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "html" | "image" | "images" | "select" | "multiselect" | "number" | "url" | "email";
  required?: boolean;
  options?: OptionSource;
  help?: string;
  /** Upload folder inside the Storage bucket. */
  folder?: string;
  /** Folder that bare legacy file names live in (homes.home_images). */
  legacyFolder?: string;
};

export type Child = { key: string; table: string; label: string; foreignKey: string; fields: Field[]; title: string };

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  group: "Home page" | "Projects" | "Company" | "Content";
  /** Icon name from components/admin/Icon. */
  icon: string;
  /** One-line hint shown on the dashboard. */
  hint: string;
  fields: Field[];
  /** Columns shown in the list (first is the link). */
  columns: string[];
  /** Image column for list thumbnails. */
  thumb?: string;
  /** Fixed column values (also used to filter the list). */
  fixed?: Record<string, string>;
  /** Only one record (edit-only, no add/delete). */
  singleton?: boolean;
  children?: Child[];
  /** Fill derived columns before saving. */
  derive?: (values: Record<string, string | null>, isNew: boolean) => Record<string, string | null>;
  /** Edited on the combined Home page editor instead of its own sidebar entry. */
  home?: boolean;
  /** page_seo key when the record has its own page on the site. */
  seoKey?: (row: Row) => string;
  /** Public page where the record can be seen. */
  viewUrl?: (row: Row) => string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>;

/** Image fields store their alt text in "<column>_alt" (one line per image for "images" fields). */
export const altName = (field: Field) => `${field.name}_alt`;

const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const SHOWCASE_FIELDS: Field[] = [
  { name: "project_heading", label: "Project name", type: "text", required: true },
  { name: "sector_id", label: "Sector", type: "select", options: "sectors" },
  { name: "main_content", label: "Section heading", type: "text", help: "Shown as the sector page heading." },
  { name: "main_description", label: "Section intro", type: "textarea" },
  { name: "project_descp", label: "Description", type: "textarea" },
  { name: "project_category", label: "Service category", type: "text" },
  { name: "client_name", label: "Client", type: "text" },
  { name: "project_date", label: "Project date", type: "text" },
  { name: "location", label: "Location", type: "text" },
  { name: "project_dec_two", label: "Second description", type: "textarea" },
  { name: "residence_image_one", label: "Main image", type: "image", folder: "residence_img" },
  { name: "residence_image_two", label: "Second image", type: "image", folder: "residence_img" },
];

const TEAM_FIELDS: Field[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "designation", label: "Designation", type: "text" },
  { name: "img", label: "Photo", type: "image", folder: "team" },
  { name: "experience", label: "Experience", type: "text" },
  { name: "location", label: "Specialisation", type: "text" },
  { name: "practice_area", label: "Practice area", type: "text" },
  { name: "project_done", label: "Projects done", type: "text" },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "linkedin", label: "LinkedIn URL", type: "url" },
  { name: "about", label: "About", type: "textarea" },
];

export const RESOURCES: Resource[] = [
  {
    key: "banners", home: true, icon: "image", hint: "Big slideshow at the top of the home page", table: "home_banners", label: "Hero banners", singular: "Banner", group: "Home page",
    columns: ["heading", "description"], thumb: "home_images",
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "description", label: "Text", type: "textarea" },
      { name: "home_images", label: "Background image", type: "image", folder: "banner_images", required: true },
    ],
  },
  {
    key: "counters", home: true, icon: "hash", hint: "Numbers like “99+ projects”", table: "counters", label: "Counters", singular: "Counter", group: "Home page",
    columns: ["counter_name", "counter"],
    fields: [
      { name: "counter_name", label: "Label", type: "text", required: true },
      { name: "counter", label: "Number", type: "text", required: true },
    ],
  },
  {
    key: "home-about", home: true, icon: "info", hint: "Home page about text and photos", table: "homes", label: "About section", singular: "About section", group: "Home page",
    fixed: { category: "about" }, singleton: true, columns: ["main_content"],
    fields: [
      { name: "main_content", label: "About text", type: "textarea", required: true },
      { name: "home_images", label: "Slider images", type: "images", folder: "home_img", legacyFolder: "upload/home_img" },
    ],
  },
  {
    key: "home-service", home: true, icon: "sparkles", hint: "Intro for “What we offer”", table: "homes", label: "“What we offer” intro", singular: "Intro", group: "Home page",
    fixed: { category: "service" }, singleton: true, columns: ["main_content"],
    fields: [{ name: "main_content", label: "Intro text", type: "textarea", required: true }],
  },
  {
    key: "home-residence", home: true, icon: "building", hint: "Residence project section (kept from the Laravel admin)", table: "homes", label: "Residence project section", singular: "Residence section", group: "Home page",
    fixed: { category: "residence" }, singleton: true, columns: ["main_content"],
    fields: [
      { name: "main_content", label: "Heading", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "home_images", label: "Images", type: "images", folder: "home_img", legacyFolder: "upload/home_img" },
    ],
  },
  {
    key: "projects", seoKey: (r) => `project:${r.id}`, viewUrl: (r) => routes.project({ id: r.id, project_name: r.project_name }), icon: "building", hint: "Completed projects, galleries, floor plans", table: "latest_projects", label: "Projects", singular: "Project", group: "Projects",
    columns: ["project_name", "project_heading"], thumb: "project_image",
    fields: [
      { name: "project_name", label: "Project name", type: "text", required: true },
      { name: "project_heading", label: "Headline", type: "text" },
      { name: "sector_id", label: "Sector", type: "select", options: "sectors" },
      { name: "location", label: "Location", type: "text" },
      { name: "project_image", label: "Cover image", type: "image", folder: "project_image", required: true },
      { name: "description", label: "Description", type: "html" },
      { name: "main_description", label: "Floor plans heading", type: "text" },
      { name: "main_content", label: "Project video URL", type: "url", help: "YouTube link shown in the Project Video box." },
      { name: "aminities_id", label: "Amenities", type: "multiselect", options: "amenities" },
    ],
    children: [
      {
        key: "gallery", table: "galleries", label: "Gallery", foreignKey: "project_id", title: "gallery",
        fields: [{ name: "gallery", label: "Image", type: "image", folder: "project_gallery", required: true }],
      },
      {
        key: "floors", table: "floors", label: "Floor plans", foreignKey: "project_id", title: "floor_name",
        fields: [
          { name: "floor_name", label: "Floor name", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "image", label: "Plan image", type: "image", folder: "floor_image" },
        ],
      },
      {
        key: "facilities", table: "project_facitities", label: "Facilities", foreignKey: "project_id", title: "facility_name",
        fields: [
          { name: "facility_name", label: "Facility", type: "text", required: true },
          { name: "facility_description", label: "Description", type: "textarea" },
          { name: "facility_image", label: "Image", type: "image", folder: "project_facility_images" },
        ],
      },
    ],
  },
  {
    key: "sectors", seoKey: (r) => `sector:${r.id}`, viewUrl: (r) => routes.sector({ id: r.id, sector_name: r.sector_name }), icon: "layers", hint: "Project categories in the menu", table: "sectors", label: "Sectors", singular: "Sector", group: "Projects",
    columns: ["sector_name", "category"],
    fields: [
      { name: "sector_name", label: "Sector name", type: "text", required: true },
      { name: "category", label: "Menu group", type: "select", required: true, options: [{ value: "0", label: "Government" }, { value: "1", label: "Private" }] },
    ],
  },
  { key: "showcase", viewUrl: (r) => (r.sector_id ? `/sectors/${r.sector_id}` : "/"), icon: "star", hint: "Featured work on sector pages", table: "residenceprojects", label: "Sector showcase", singular: "Showcase project", group: "Projects", columns: ["project_heading", "client_name"], thumb: "residence_image_one", fields: SHOWCASE_FIELDS },
  { key: "upcoming", home: true, viewUrl: () => "/#upcoming", icon: "clock", hint: "“Our Future Projects” slider", table: "upcomming_projects", label: "Upcoming projects", singular: "Upcoming project", group: "Projects", columns: ["project_heading", "location"], thumb: "residence_image_one", fields: SHOWCASE_FIELDS },
  {
    key: "amenities", viewUrl: () => "/", icon: "check", hint: "Amenities you can tag on projects", table: "project_aminities", label: "Amenities", singular: "Amenity", group: "Projects",
    columns: ["aminity_name"], fields: [{ name: "aminity_name", label: "Amenity", type: "text", required: true }],
  },
  {
    key: "services", seoKey: (r) => `service:${r.id}`, viewUrl: (r) => routes.service({ id: r.id, name: r.name }), icon: "tool", hint: "Services and their detail pages", table: "services", label: "Services", singular: "Service", group: "Company",
    columns: ["name"], thumb: "img",
    fields: [
      { name: "name", label: "Service name", type: "text", required: true },
      { name: "img", label: "Image", type: "image", folder: "service" },
      { name: "description", label: "Description", type: "html" },
      { name: "section_id", label: "Strength cards", type: "multiselect", options: "sections" },
    ],
  },
  {
    key: "sections", viewUrl: () => "/", icon: "grid", hint: "Cards on service pages", table: "sections", label: "Service strength cards", singular: "Card", group: "Company",
    columns: ["section_name"], thumb: "img",
    fields: [
      { name: "section_name", label: "Title", type: "text", required: true },
      { name: "img", label: "Image", type: "image", folder: "service_sections" },
      { name: "icon", label: "Icon", type: "image", folder: "service_sections" },
    ],
  },
  {
    key: "companies", viewUrl: () => "/about#group-of-companies", icon: "globe", hint: "Havitive group companies", table: "gropuof_companies", label: "Group companies", singular: "Company", group: "Company",
    columns: ["company_name"], thumb: "compani_img",
    fields: [
      { name: "company_name", label: "Company name", type: "text", required: true },
      { name: "company_description", label: "Description", type: "textarea" },
      { name: "compani_img", label: "Image", type: "image", folder: "company_img" },
      { name: "compani_logo", label: "Logo", type: "image", folder: "company_img" },
      { name: "link", label: "Website link", type: "url" },
    ],
  },
  { key: "management", seoKey: (r) => `team:${r.id}`, viewUrl: (r) => routes.team({ id: r.id, name: r.name }), icon: "users", hint: "Directors and leadership", table: "teams", label: "Management team", singular: "Manager", group: "Company", fixed: { category: "management" }, columns: ["name", "designation"], thumb: "img", fields: TEAM_FIELDS },
  { key: "team", seoKey: (r) => `team:${r.id}`, viewUrl: (r) => routes.team({ id: r.id, name: r.name }), icon: "user", hint: "Architects, engineers and staff", table: "teams", label: "Team members", singular: "Team member", group: "Company", fixed: { category: "team" }, columns: ["name", "designation"], thumb: "img", fields: TEAM_FIELDS },
  {
    key: "testimonials", home: true, viewUrl: () => "/#testimonials", icon: "quote", hint: "Client reviews", table: "testimonials", label: "Testimonials", singular: "Testimonial", group: "Company",
    columns: ["client_name", "client_designation"], thumb: "client_img",
    fields: [
      { name: "client_name", label: "Client name", type: "text", required: true },
      { name: "client_designation", label: "Client role", type: "text" },
      { name: "desription", label: "Testimonial", type: "textarea", required: true },
      { name: "client_img", label: "Client photo", type: "image", folder: "testimonial" },
      { name: "img", label: "Project image", type: "image", folder: "testimonial" },
    ],
  },
  {
    key: "clients", home: true, viewUrl: () => "/#clients", icon: "award", hint: "Client logo strip", table: "clients", label: "Client logos", singular: "Client logo", group: "Company",
    columns: ["id"], thumb: "img", fields: [{ name: "img", label: "Logo", type: "image", folder: "clients", required: true }],
  },
  {
    key: "posts", seoKey: (r) => `post:${r.id}`, viewUrl: (r) => routes.post({ id: r.id, post_slug: r.post_slug }), icon: "pen", hint: "News & articles", table: "blog_posts", label: "Blog posts", singular: "Post", group: "Content",
    columns: ["post_title", "created_at"], thumb: "post_image",
    fields: [
      { name: "post_title", label: "Title", type: "text", required: true },
      { name: "post_slug", label: "URL slug", type: "text", help: "Leave empty to create it from the title. Changing it changes the page address." },
      { name: "blogcat_id", label: "Category", type: "select", options: "blog_categories", required: true },
      { name: "post_image", label: "Image", type: "image", folder: "post" },
      { name: "short_descp", label: "Summary", type: "textarea" },
      { name: "long_descp", label: "Article", type: "html" },
      { name: "post_tags", label: "Tags", type: "text", help: "Comma separated" },
    ],
    derive: (v) => ({ post_slug: v.post_slug ? slug(v.post_slug) : slug(v.post_title ?? "") }),
  },
  {
    key: "categories", seoKey: (r) => `blog-category:${r.id}`, viewUrl: (r) => routes.blogCategory({ category_slug: r.category_slug }), icon: "folder", hint: "Blog categories", table: "blog_categories", label: "Blog categories", singular: "Category", group: "Content",
    columns: ["category_name", "category_slug"],
    fields: [{ name: "category_name", label: "Category name", type: "text", required: true }],
    derive: (v) => ({ category_slug: slug(v.category_name ?? "") }),
  },
  {
    key: "jobs", viewUrl: () => "/careers", icon: "briefcase", hint: "Open positions on the careers page", table: "alljobs", label: "Job openings", singular: "Job", group: "Content",
    columns: ["title"],
    fields: [
      { name: "title", label: "Job title", type: "text", required: true },
      { name: "description", label: "Description", type: "html", required: true },
    ],
  },
];

export function getResource(key: string) {
  return RESOURCES.find((r) => r.key === key);
}
