import { routes } from "@/lib/routes";

export type Option = { value: string; label: string };
export type OptionSource = "sectors" | "blog_categories" | Option[];

/** Where a project is in its life: shown (and changeable) in the admin project list. */
export const PROJECT_STATUS: { value: string; label: string }[] = [
  { value: "ongoing", label: "Ongoing" },
  { value: "handing_over", label: "Handing over" },
  { value: "completed", label: "Completed" },
];
/** Colour of the status pill, by status value. */
export const STATUS_TONE: Record<string, string> = { ongoing: "pill-amber", handing_over: "pill-blue", completed: "pill-green" };

export type Field = {
  name: string;
  label: string;
  /** Pre-filled value for a new record. */
  defaultValue?: string;
  type: "text" | "textarea" | "html" | "image" | "images" | "select" | "multiselect" | "number" | "url" | "email" | "date";
  required?: boolean;
  options?: OptionSource;
  help?: string;
  /** Upload folder inside the Storage bucket. */
  folder?: string;
  /** Folder that bare legacy file names live in (homes.home_images). */
  legacyFolder?: string;
  /** Upload size rule when it differs from the folder's default (see lib/admin/imageRules). */
  size?: import("./imageRules").ImageKind;
};

export type Child = { key: string; table: string; label: string; foreignKey: string; fields: Field[]; title: string };

export type Resource = {
  key: string;
  table: string;
  label: string;
  singular: string;
  group: "Home page" | "Projects" | "Company" | "Showcase" | "Content" | "Careers";
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
  /** List the records as a table (thumbnail, details and a status dropdown) instead of picture cards. */
  asTable?: boolean;
  /** A status column that can be changed straight from the list. */
  statusField?: { name: string; options: Option[] };
  /** Non-admins archive instead of deleting; admins restore or delete archived records for good (needs an archived_at column). */
  archivable?: boolean;
  /** Column that must be unique (case-insensitive); saving a duplicate is refused with a message. */
  unique?: { column: string; label: string };
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
    key: "hero-video", home: true, icon: "play", hint: "The play button in the home page banner opens this YouTube video", table: "homes", label: "Banner YouTube video", singular: "Banner video", group: "Home page",
    fixed: { category: "hero_video" }, singleton: true, columns: ["main_content"],
    fields: [
      { name: "main_content", label: "YouTube video link", type: "url", help: "Paste the YouTube link, e.g. https://www.youtube.com/watch?v=… The play button then appears on the banner and plays it in a popup. Leave empty to hide the play button." },
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
      { name: "video_url", label: "YouTube video link", type: "url", help: "The play button on the About section opens this YouTube video in a popup. Leave empty to hide the play button." },
    ],
  },
  {
    key: "home-service", home: true, icon: "sparkles", hint: "Heading, intro and button of “What we offer”", table: "homes", label: "“What we offer” text", singular: "Intro", group: "Home page",
    fixed: { category: "service" }, singleton: true, columns: ["main_content"],
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "main_content", label: "Intro text", type: "textarea", required: true },
      { name: "button_text", label: "Button text", type: "text", help: "The button that calls the first phone number, e.g. Talk to Experts." },
    ],
  },
  {
    key: "home-projects", home: true, icon: "clock", hint: "Text of the completed projects slider. The projects themselves come from Projects with status “Completed”.", table: "homes", label: "Completed projects slider", singular: "Section", group: "Home page",
    fixed: { category: "projects" }, singleton: true, columns: ["heading"],
    fields: [
      { name: "shadow_text", label: "Big background word", type: "text", help: "Faint outlined word behind the heading, e.g. PROJECTS." },
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "main_content", label: "Text under the heading", type: "textarea" },
      { name: "button_text", label: "Button text", type: "text", help: "e.g. Explore More." },
      { name: "button_link", label: "Button link", type: "url", help: "Where the button goes. Use a full address starting with https://." },
    ],
  },
  {
    key: "offer-cards", home: true, icon: "grid", hint: "The cards under “What we offer”: title, text and image", table: "offer_cards", label: "“What we offer” cards", singular: "Card", group: "Home page",
    columns: ["title", "text"], thumb: "img",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "text", label: "Text", type: "textarea", required: true },
      { name: "img", label: "Image", type: "image", folder: "offer", required: true },
    ],
  },
  {
    key: "home-latest", home: true, icon: "clock", hint: "Heading, text and button above the “Browse our latest projects” slider", table: "homes", label: "“Browse our latest projects” text", singular: "Section", group: "Home page",
    fixed: { category: "latest" }, singleton: true, columns: ["heading"],
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "main_content", label: "Text under the heading", type: "textarea" },
      { name: "button_text", label: "Button text", type: "text", help: "e.g. Browse All Project." },
      { name: "button_link", label: "Button link", type: "url", help: "Use a full address starting with https://." },
    ],
  },
  {
    key: "home-choose", home: true, icon: "sparkles", hint: "Heading, text and button of “Why choose us”", table: "homes", label: "“Why choose us” text", singular: "Section", group: "Home page",
    fixed: { category: "choose" }, singleton: true, columns: ["heading"],
    fields: [
      { name: "heading", label: "Heading", type: "text", required: true },
      { name: "main_content", label: "Text under the heading", type: "textarea" },
      { name: "button_text", label: "Button text", type: "text", help: "e.g. Quick Connect." },
      { name: "button_link", label: "Button link", type: "url", help: "Leave empty to open WhatsApp." },
    ],
  },
  {
    key: "choose-cards", home: true, icon: "grid", hint: "The cards under “Why choose us”: title, text and image", table: "choose_cards", label: "“Why choose us” cards", singular: "Card", group: "Home page",
    columns: ["title", "text"], thumb: "img",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "text", label: "Text", type: "textarea", required: true },
      { name: "img", label: "Image", type: "image", folder: "choose", required: true },
    ],
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
    key: "projects", unique: { column: "project_name", label: "project" }, seoKey: (r) => `project:${r.id}`, viewUrl: (r) => routes.project({ id: r.id, project_name: r.project_name }), icon: "building", hint: "Completed projects, galleries, floor plans", table: "latest_projects", label: "Projects", singular: "Project", group: "Projects",
    columns: ["project_name", "sector_id", "location"], thumb: "project_image", asTable: true, statusField: { name: "status", options: PROJECT_STATUS },
    fields: [
      { name: "project_name", label: "Project name", type: "text", required: true },
      { name: "project_heading", label: "Headline", type: "text" },
      { name: "sector_id", label: "Category", type: "select", options: "sectors" },
      { name: "status", label: "Status", type: "select", required: true, options: PROJECT_STATUS, defaultValue: "ongoing" },
      { name: "location", label: "Location", type: "text" },
      { name: "main_content", label: "Project video link", type: "url", help: "Paste a YouTube or Vimeo link. It plays in a popup on the project page and in the project popup. Leave empty to show the company video." },
      { name: "client_name", label: "Client name", type: "text", help: "Shown in the project popup." },
      { name: "project_date", label: "Project date", type: "date", help: "Pick from the calendar. Shown in the project popup." },
      { name: "project_image", label: "Cover image", type: "image", folder: "project_image", required: true },
      { name: "description", label: "Description", type: "html" },
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
    key: "sectors", unique: { column: "sector_name", label: "project category" }, seoKey: (r) => `sector-projects:${r.id}`, viewUrl: (r) => routes.sectorProjects({ id: r.id, sector_name: r.sector_name }), icon: "layers", hint: "Categories in the Project menu", table: "sectors", label: "Project categories", singular: "Category", group: "Projects",
    columns: ["sector_name"],
    fields: [
      { name: "sector_name", label: "Category name", type: "text", required: true },
    ],
  },
  {
    key: "services", seoKey: (r) => `service:${r.id}`, viewUrl: (r) => routes.service({ id: r.id, name: r.name }), icon: "tool", hint: "Services and their detail pages", table: "services", label: "Services", singular: "Service", group: "Company",
    columns: ["name"], thumb: "img",
    fields: [
      { name: "name", label: "Service name", type: "text", required: true },
      { name: "img", label: "Image", type: "image", folder: "service" },
      { name: "description", label: "Description", type: "html" },
    ],
  },
  {
    key: "about-page", viewUrl: () => "/about", seoKey: () => "page:about", icon: "info", hint: "Every text and picture on the About page, the “Why Havitive” cards and SEO",
    table: "about_page", label: "About page", singular: "About page", group: "Company", singleton: true, columns: ["mission_title"],
    fields: [
      { name: "mission_title", label: "Vision & mission heading", type: "text", required: true },
      { name: "mission_text", label: "Vision text", type: "textarea", help: "Leave a blank line between paragraphs." },
      { name: "mission_image", label: "Vision picture (top right)", type: "image", folder: "about" },
      { name: "video_url", label: "YouTube video link", type: "url", help: "The play button on the Vision picture opens this YouTube video in a popup. Leave empty to hide the play button." },
      { name: "vision_image", label: "Mission picture (bottom left)", type: "image", folder: "about" },
      { name: "vision_text", label: "Mission text", type: "textarea", help: "Leave a blank line between paragraphs." },
      { name: "companies_kicker", label: "Group of companies: big background word", type: "text", help: "Faint word behind the heading, e.g. Havitive." },
      { name: "companies_title", label: "Group of companies: heading", type: "text" },
      { name: "companies_text", label: "Group of companies: text", type: "textarea", help: "The companies themselves are in Group companies." },
      { name: "why_title", label: "“Why Havitive” heading", type: "text", help: "The cards are added below, after saving." },
      { name: "why_text", label: "“Why Havitive” text", type: "textarea" },
      { name: "chairman_title", label: "Chairman message: heading", type: "text" },
      { name: "chairman_text", label: "Chairman message: text", type: "textarea" },
      { name: "chairman_button_text", label: "Chairman message: button text", type: "text", help: "e.g. Connect." },
      { name: "chairman_button_link", label: "Chairman message: button link", type: "url", help: "Use a full address starting with https://." },
      { name: "chairman_name", label: "Chairman name", type: "text" },
      { name: "chairman_role", label: "Chairman role", type: "text" },
      { name: "chairman_photo", label: "Chairman photo", type: "image", folder: "team" },
      { name: "management_kicker", label: "Management team: big background word", type: "text" },
      { name: "management_title", label: "Management team: heading", type: "text" },
      { name: "management_text", label: "Management team: text", type: "textarea", help: "The people are in Management team." },
      { name: "employees_title", label: "Employees: heading", type: "text" },
      { name: "employees_text", label: "Employees: text", type: "textarea", help: "The people are in Team members." },
      { name: "invest_kicker", label: "“Invest with us”: big background word", type: "text" },
      { name: "invest_title", label: "“Invest with us”: heading", type: "text" },
      { name: "invest_text", label: "“Invest with us”: text", type: "textarea" },
      { name: "invest_image", label: "“Invest with us”: picture", type: "image", folder: "about" },
    ],
    children: [
      {
        key: "strengths", table: "about_strengths", label: "Why Havitive cards", foreignKey: "page_id", title: "title",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "icon", label: "Icon", type: "image", folder: "about", size: "icon", required: true },
        ],
      },
    ],
  },
  {
    key: "companies", viewUrl: () => "/about#group-of-companies", icon: "globe", hint: "Havitive group companies", table: "gropuof_companies", label: "Group companies", singular: "Company", group: "Company",
    columns: ["company_name"], thumb: "compani_img",
    fields: [
      { name: "company_name", label: "Company name", type: "text", required: true },
      { name: "company_description", label: "Description", type: "textarea" },
      { name: "compani_img", label: "Image", type: "image", folder: "company_img" },
      { name: "compani_logo", label: "Logo", type: "image", folder: "company_img", size: "logo" },
      { name: "link", label: "Website link", type: "url" },
    ],
  },
  { key: "management", seoKey: (r) => `team:${r.id}`, viewUrl: (r) => routes.team({ id: r.id, name: r.name }), icon: "users", hint: "Directors and leadership", table: "teams", label: "Management team", singular: "Manager", group: "Company", fixed: { category: "management" }, columns: ["name", "designation"], thumb: "img", fields: TEAM_FIELDS },
  { key: "team", seoKey: (r) => `team:${r.id}`, viewUrl: (r) => routes.team({ id: r.id, name: r.name }), icon: "user", hint: "Architects, engineers and staff", table: "teams", label: "Team members", singular: "Team member", group: "Company", fixed: { category: "team" }, columns: ["name", "designation"], thumb: "img", fields: TEAM_FIELDS },
  {
    key: "testimonials", viewUrl: () => "/showcase/testimonials", icon: "quote", hint: "Written client reviews, shown on the Testimonials page", table: "testimonials", label: "Written testimonials", singular: "Testimonial", group: "Showcase",
    columns: ["client_name", "client_designation"], thumb: "client_img",
    fields: [
      { name: "client_name", label: "Client name", type: "text", required: true },
      { name: "client_designation", label: "Client role", type: "text" },
      { name: "desription", label: "Testimonial", type: "textarea", required: true },
      { name: "client_img", label: "Client photo", type: "image", folder: "testimonial", size: "photo" },
      { name: "img", label: "Project image", type: "image", folder: "testimonial" },
    ],
  },
  {
    key: "testimonial-videos", viewUrl: () => "/showcase/testimonials", icon: "play", hint: "YouTube links shown as video boxes on the Testimonials page", table: "showcase_items", label: "Video testimonials", singular: "Video testimonial", group: "Showcase",
    fixed: { section: "testimonial-videos" }, columns: ["title"], thumb: "image",
    fields: [
      { name: "title", label: "Client name", type: "text", required: true, help: "Shown under the video." },
      { name: "video_url", label: "YouTube video link", type: "url", required: true, help: "Paste the YouTube link. The video plays inside its box when a visitor presses play." },
      { name: "description", label: "Role or project", type: "textarea" },
      { name: "image", label: "Picture", type: "image", folder: "showcase", help: "Optional. Leave empty to use the YouTube thumbnail." },
    ],
  },
  {
    key: "csr", viewUrl: () => "/showcase/csr-activities", icon: "heart", hint: "Community and social initiatives", table: "showcase_items", label: "CSR activities", singular: "CSR activity", group: "Showcase",
    fixed: { section: "csr" }, columns: ["title", "event_date"], thumb: "image",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "event_date", label: "Date", type: "date", help: "Optional. Shown on the card." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Picture", type: "image", folder: "showcase", required: true },
      { name: "video_url", label: "YouTube video link", type: "url", help: "Optional. Adds a play button that plays in the card." },
    ],
  },
  {
    key: "handover", viewUrl: () => "/showcase/handing-over-events", icon: "key", hint: "Project handing over events", table: "showcase_items", label: "Handing over events", singular: "Event", group: "Showcase",
    fixed: { section: "handover" }, columns: ["title", "event_date"], thumb: "image",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, help: "e.g. Handing over of the Rejayi Residence" },
      { name: "event_date", label: "Date", type: "date", help: "Optional. Shown on the card." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Picture", type: "image", folder: "showcase", required: true },
      { name: "video_url", label: "YouTube video link", type: "url", help: "Optional. Adds a play button that plays in the card." },
    ],
  },
  {
    key: "awards", viewUrl: () => "/showcase/awards-and-recognition", icon: "award", hint: "Awards and recognition received", table: "showcase_items", label: "Awards & recognition", singular: "Award", group: "Showcase",
    fixed: { section: "awards" }, columns: ["title", "event_date"], thumb: "image",
    fields: [
      { name: "title", label: "Award", type: "text", required: true },
      { name: "event_date", label: "Date", type: "date", help: "Optional. Shown on the card." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Picture", type: "image", folder: "showcase", required: true, help: "A photo of the award or certificate." },
    ],
  },
  {
    key: "media", viewUrl: () => "/showcase/media", icon: "globe", hint: "News coverage, features and interviews", table: "showcase_items", label: "Media", singular: "Media item", group: "Showcase",
    fixed: { section: "media" }, columns: ["title", "event_date"], thumb: "image",
    fields: [
      { name: "title", label: "Headline", type: "text", required: true, help: "e.g. the title of the article" },
      { name: "event_date", label: "Date", type: "date", help: "Optional. Shown on the card." },
      { name: "description", label: "Newspaper / channel and a short summary", type: "textarea" },
      { name: "image", label: "Picture", type: "image", folder: "showcase" },
      { name: "link_url", label: "Article link", type: "url", help: "Link to the news article. Shown as “Read more”." },
      { name: "video_url", label: "YouTube video link", type: "url", help: "Optional. For a TV or online interview." },
    ],
  },
  {
    key: "project-videos", viewUrl: () => "/showcase/project-videos", icon: "play", hint: "YouTube videos of projects", table: "showcase_items", label: "Project videos", singular: "Project video", group: "Showcase",
    fixed: { section: "project-videos" }, columns: ["title", "event_date"], thumb: "image",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, help: "e.g. Walkthrough of the Shiljith Residence" },
      { name: "video_url", label: "YouTube video link", type: "url", required: true, help: "Paste the YouTube link. The video plays inside its box when a visitor presses play." },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Picture", type: "image", folder: "showcase", help: "Optional. Leave empty to use the YouTube thumbnail." },
      { name: "event_date", label: "Date", type: "date", help: "Optional. Shown on the card." },
    ],
  },
  {
    key: "clients", home: true, viewUrl: () => "/#clients", icon: "award", hint: "Client logo strip", table: "clients", label: "Client logos", singular: "Client logo", group: "Company",
    columns: ["id"], thumb: "img", fields: [{ name: "img", label: "Logo", type: "image", folder: "clients", required: true }],
  },
  {
    key: "posts", archivable: true, unique: { column: "post_slug", label: "blog post" }, seoKey: (r) => `post:${r.id}`, viewUrl: (r) => routes.post({ id: r.id, post_slug: r.post_slug }), icon: "pen", hint: "News & articles", table: "blog_posts", label: "Blog posts", singular: "Post", group: "Content",
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
    key: "categories", archivable: true, unique: { column: "category_slug", label: "blog category" }, seoKey: (r) => `blog-category:${r.id}`, viewUrl: (r) => routes.blogCategory({ category_slug: r.category_slug }), icon: "folder", hint: "Blog categories", table: "blog_categories", label: "Blog categories", singular: "Category", group: "Content",
    columns: ["category_name", "category_slug"],
    fields: [{ name: "category_name", label: "Category name", type: "text", required: true }],
    derive: (v) => ({ category_slug: slug(v.category_name ?? "") }),
  },
  {
    key: "jobs", viewUrl: () => "/careers", icon: "briefcase", hint: "Open positions and job descriptions on the careers page",
    table: "alljobs", label: "Job openings", singular: "Job", group: "Careers",
    derive: (v): Record<string, string | null> => (v.sort_order == null ? { sort_order: "0" } : {}),
    columns: ["title", "department", "location", "status"],
    fields: [
      { name: "title", label: "Job title", type: "text", required: true },
      { name: "code", label: "Job code", type: "text", help: "Shown on the job card, e.g. HAV-001. Leave empty to use HAV-<number>." },
      { name: "department", label: "Department", type: "text", help: "e.g. Architecture, Structural Engineering, Interiors, Site Execution" },
      { name: "location", label: "Location", type: "text", help: "e.g. Thiruvananthapuram, Kerala" },
      { name: "employment_type", label: "Employment type", type: "select", options: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"].map((v) => ({ value: v, label: v })) },
      { name: "experience", label: "Experience", type: "text", help: "e.g. 2–4 years" },
      { name: "status", label: "Status", type: "select", required: true, options: [{ value: "open", label: "Open – shown on the website" }, { value: "closed", label: "Closed – hidden from the website" }] },
      { name: "sort_order", label: "Order", type: "number", help: "Lower numbers are shown first. Leave 0 to show newest first." },
      { name: "summary", label: "Short summary", type: "textarea", help: "One or two lines shown at the top of the job description." },
      { name: "description", label: "Job description", type: "html", required: true, help: "Responsibilities, requirements, skills, benefits… Use headings and bullet lists." },
    ],
  },
  {
    key: "careers-page", viewUrl: () => "/careers", seoKey: () => "page:careers", icon: "file", hint: "Careers page banner, “Life at Havitive” and talent network texts",
    table: "careers_page", label: "Careers page", singular: "Careers page", group: "Careers", singleton: true, columns: ["hero_title"],
    fields: [
      { name: "hero_kicker", label: "Banner small heading", type: "text", help: "e.g. CAREERS AT HAVITIVE" },
      { name: "hero_title", label: "Banner title", type: "text", required: true },
      { name: "hero_text", label: "Banner text", type: "textarea" },
      { name: "hero_image", label: "Banner photo (team / office)", type: "image", folder: "careers" },
      { name: "openings_kicker", label: "Openings small heading", type: "text", help: "e.g. Current Openings" },
      { name: "openings_title", label: "Openings title", type: "text", help: "e.g. Explore Opportunities" },
      { name: "openings_text", label: "Openings intro", type: "textarea" },
      { name: "life_title", label: "“Life at Havitive” title", type: "text" },
      { name: "life_text", label: "“Life at Havitive” text", type: "textarea" },
      { name: "life_points", label: "Why join us (one point per line)", type: "textarea" },
      { name: "life_image", label: "“Life at Havitive” photo", type: "image", folder: "careers" },
      { name: "talent_title", label: "Drop-your-CV title", type: "text" },
      { name: "talent_text", label: "Drop-your-CV text", type: "textarea" },
    ],
  },
];

/** Sections marketing managers and designers can edit besides admins: blog posts (not blog categories, which only admins manage), projects and everything on the home page. */
export const isContentSection = (res: Pick<Resource, "key" | "home"> & { group?: Resource["group"] }) =>
  !!res.home || res.group === "Showcase" || res.key === "posts" || res.key === "projects";

export function getResource(key: string) {
  return RESOURCES.find((r) => r.key === key);
}
