import type { Metadata } from "next";
import { media } from "./media";
import { routes } from "./routes";
import { SITE } from "./site";
import { titleCase, truncate } from "./text";
import type * as T from "./types";

export type SeoDefaults = { title: string; description: string; path: string; image?: string | null };
export type PageSeo = {
  key: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  og_image_alt: string | null;
  noindex: boolean;
};

export const HOME_TITLE = "Havitive Infra Pvt Ltd | Architecture, Engineering & Construction in Kerala";

/** Fixed pages of the site and their automatic SEO text. */
export const STATIC_PAGES: Record<string, SeoDefaults & { label: string }> = {
  "page:home": { label: "Home", path: "/", title: HOME_TITLE, description: SITE.description, image: "/upload/logos/havitive.jpeg" },
  "page:about": {
    label: "About us", path: "/about", title: "About Us – Vision, Group Companies & Leadership",
    description: "Learn about Havitive Infra Pvt Ltd: our vision and mission, the Havitive group of companies (constructions, architectural studio, engineering consultancy, interiors) and the management team behind our projects in Kerala.",
  },
  "page:contact": {
    label: "Contact", path: "/contact", title: "Contact Us",
    description: `Contact Havitive Infra Pvt Ltd, Kazhakkoottam, Thiruvananthapuram. Call ${SITE.phones[0].label} or email ${SITE.email} for architecture, engineering and construction enquiries.`,
  },
  "page:careers": {
    label: "Careers", path: "/careers", title: "Careers – Jobs at Havitive",
    description: "Join Havitive Infra Pvt Ltd in Thiruvananthapuram. See open positions for architects, engineers, draughtsmen and designers, and apply online.",
  },
  "page:blog": {
    label: "Blog", path: "/blog", title: "Blog – Architecture, Construction & Design Insights",
    description: "News and articles from Havitive Infra Pvt Ltd on architecture, construction, engineering and interior design trends in Kerala.",
  },
};

export const defaults = {
  sector: (s: T.Sector): SeoDefaults => {
    const name = s.sector_name ?? "Sector";
    return {
      path: routes.sector(s),
      title: `${name} in Kerala`,
      description: `${name} by Havitive Infra Pvt Ltd – architecture, structural engineering and construction for ${name.toLowerCase()} across Kerala. View our work and schedule a site visit.`,
    };
  },
  sectorProjects: (s: T.Sector): SeoDefaults => ({
    path: routes.sectorProjects(s),
    title: `${s.sector_name} – All Projects`,
    description: `Browse all ${s.sector_name?.toLowerCase()} designed and delivered by Havitive Infra Pvt Ltd in Kerala.`,
  }),
  project: (p: T.Project): SeoDefaults => ({
    path: routes.project(p),
    title: p.project_name || "Project",
    description: truncate(`${p.project_heading ?? ""}. ${p.description ?? ""}`, 158),
    image: p.project_image,
  }),
  service: (s: T.Service): SeoDefaults => {
    const name = titleCase(s.name);
    return {
      path: routes.service(s),
      title: `${name} Services in Kerala`,
      description: truncate(`${name} by Havitive Infra Pvt Ltd, Thiruvananthapuram. ${s.description ?? ""}`, 158),
      image: s.img,
    };
  },
  team: (m: T.TeamMember): SeoDefaults => ({
    path: routes.team(m),
    title: `${m.name} – ${m.designation}`,
    description: truncate(m.about, 158) || `${m.name}, ${m.designation} at Havitive Infra Pvt Ltd.`,
    image: m.img,
  }),
  post: (p: T.BlogPost): SeoDefaults => ({
    path: routes.post(p),
    title: p.post_title ?? "Article",
    description: truncate(p.short_descp, 158),
    image: p.post_image,
  }),
  blogCategory: (c: T.BlogCategory): SeoDefaults => ({
    path: routes.blogCategory(c),
    title: `${c.category_name} Articles`,
    description: `Havitive articles about ${c.category_name.toLowerCase()}.`,
  }),
};

const abs = (url: string) => (url.startsWith("http") ? url : SITE.url + url);

/** Merge the admin's SEO overrides (page_seo) over the automatic values. */
export function buildMetadata(d: SeoDefaults, o: PageSeo | null, extra: Metadata = {}): Metadata {
  const title = o?.meta_title || d.title;
  const description = o?.meta_description || d.description;
  const image = o?.og_image || d.image;
  const canonical = o?.canonical_url || d.path;
  const images = image ? [{ url: abs(media(image)), alt: o?.og_image_alt || title }] : undefined;
  return {
    ...extra,
    // A custom title is used exactly as typed (no " | Havitive" suffix).
    title: o?.meta_title || d.path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: { ...(extra.openGraph ?? {}), title, description, url: abs(canonical), ...(images ? { images } : {}) },
    twitter: { card: "summary_large_image", title, description, ...(images ? { images: images.map((i) => i.url) } : {}) },
    ...(o?.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
