/** Upload sizes for each kind of image in the admin. Images are scaled down to fit and rejected when too small. */
export type ImageKind = "banner" | "cover" | "gallery" | "plan" | "photo" | "logo" | "icon" | "og" | "content";

export type ImageRule = {
  /** Largest size kept (bigger images are scaled down to fit). */
  w: number; h: number;
  /** Smallest size accepted. */
  minW: number; minH: number;
  /** Banners and share images must be landscape; other images may be either way round. */
  landscape?: boolean;
  label: string;
};

export const IMAGE_RULES: Record<ImageKind, ImageRule> = {
  banner: { w: 1920, h: 1080, minW: 1280, minH: 600, landscape: true, label: "Full-width banner" },
  cover: { w: 1600, h: 1200, minW: 800, minH: 500, label: "Cover photo" },
  gallery: { w: 1920, h: 1440, minW: 800, minH: 500, label: "Gallery photo" },
  plan: { w: 2400, h: 2400, minW: 1000, minH: 700, label: "Floor plan" },
  photo: { w: 800, h: 800, minW: 300, minH: 300, label: "Portrait photo" },
  logo: { w: 600, h: 600, minW: 120, minH: 60, label: "Logo" },
  icon: { w: 256, h: 256, minW: 48, minH: 48, label: "Icon" },
  og: { w: 1200, h: 630, minW: 600, minH: 315, landscape: true, label: "Share image" },
  content: { w: 1600, h: 1600, minW: 500, minH: 350, label: "Image" },
};

const BY_FOLDER: Record<string, ImageKind> = {
  banner_images: "banner",
  home_img: "gallery",
  project_image: "cover",
  residence_img: "cover",
  upcomming_projects: "cover",
  project_gallery: "gallery",
  floor_image: "plan",
  project_facility_images: "content",
  service: "content",
  service_sections: "content",
  company_img: "content",
  testimonial: "content",
  team: "photo",
  admin_image: "photo",
  clients: "logo",
  post: "cover",
  careers: "cover",
  seo: "og",
};

export function imageRule(folder?: string, kind?: ImageKind): ImageRule {
  return IMAGE_RULES[kind ?? BY_FOLDER[folder ?? ""] ?? "content"];
}

export function describeRule(rule: ImageRule) {
  return `Best size ${rule.w} × ${rule.h} px (minimum ${rule.minW} × ${rule.minH}). JPG, PNG or WebP. Larger images are resized and compressed automatically.`;
}
