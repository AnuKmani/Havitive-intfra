import type { MetadataRoute } from "next";
import { getAllSeo, getAllTeam, getBlogCategories, getPosts, getProjects, getSectors, getServices } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sectors, projects, services, posts, categories, team, seo] = await Promise.all([
    getSectors(), getProjects(), getServices(), getPosts(), getBlogCategories(), getAllTeam(), getAllSeo(),
  ]);
  // Pages hidden from Google in the SEO manager stay out of the sitemap; custom canonicals are listed instead.
  const hidden = new Set(seo.filter((r) => r.noindex).map((r) => r.key));
  const canonical = new Map(seo.filter((r) => r.canonical_url).map((r) => [r.key, r.canonical_url!]));
  const u = (path: string, lastModified?: string | null, priority = 0.6, key?: string): MetadataRoute.Sitemap[number] | null => {
    if (key && hidden.has(key)) return null;
    const c = key ? canonical.get(key) : undefined;
    return {
    url: c ? (c.startsWith("http") ? c : SITE.url + c) : SITE.url + path,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
    };
  };
  return [
    u("/", null, 1, "page:home"),
    u("/about", null, 0.8, "page:about"),
    u("/contact", null, 0.8, "page:contact"),
    u("/careers", null, 0.5, "page:careers"),
    u("/blog", null, 0.6, "page:blog"),
    ...sectors.flatMap((s) => [u(routes.sector(s), s.updated_at, 0.8, `sector:${s.id}`), u(routes.sectorProjects(s), s.updated_at, 0.7, `sector-projects:${s.id}`)]),
    ...projects.map((p) => u(routes.project(p), p.updated_at, 0.8, `project:${p.id}`)),
    ...services.map((s) => u(routes.service(s), s.updated_at, 0.8, `service:${s.id}`)),
    ...posts.map((p) => u(routes.post(p), p.updated_at ?? p.created_at, 0.6, `post:${p.id}`)),
    ...categories.map((c) => u(routes.blogCategory(c), c.updated_at, 0.4, `blog-category:${c.id}`)),
    ...team.map((t) => u(routes.team(t), t.updated_at, 0.5, `team:${t.id}`)),
  ].filter((x): x is MetadataRoute.Sitemap[number] => x !== null);
}
