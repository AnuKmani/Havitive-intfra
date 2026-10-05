import { slugWithId } from "./text";

type Named = { id: number };

export const routes = {
  home: () => "/",
  about: () => "/about",
  sector: (s: Named & { sector_name: string | null }) => `/sectors/${slugWithId(s.sector_name, s.id)}`,
  sectorProjects: (s: Named & { sector_name: string | null }) => `/projects/${slugWithId(s.sector_name, s.id)}`,
  project: (p: Named & { project_name: string | null }) => `/project/${slugWithId(p.project_name, p.id)}`,
  service: (s: Named & { name: string | null }) => `/services/${slugWithId(s.name, s.id)}`,
  team: (t: Named & { name: string | null }) => `/team/${slugWithId(t.name, t.id)}`,
  blog: () => "/blog",
  post: (p: { post_slug: string | null; id: number }) => `/blog/${encodeURIComponent(p.post_slug || String(p.id))}`,
  blogCategory: (c: { category_slug: string }) => `/blog/category/${encodeURIComponent(c.category_slug)}`,
  careers: () => "/careers",
  contact: () => "/contact",
};
