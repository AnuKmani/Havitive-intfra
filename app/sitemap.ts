import type { MetadataRoute } from "next";
import { getAllTeam, getBlogCategories, getPosts, getProjects, getSectors, getServices } from "@/lib/data";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sectors, projects, services, posts, categories, team] = await Promise.all([
    getSectors(), getProjects(), getServices(), getPosts(), getBlogCategories(), getAllTeam(),
  ]);
  const u = (path: string, lastModified?: string | null, priority = 0.6): MetadataRoute.Sitemap[number] => ({
    url: SITE.url + path,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    priority,
  });
  return [
    u("/", null, 1),
    u("/about", null, 0.8),
    u("/contact", null, 0.8),
    u("/careers", null, 0.5),
    u("/blog", null, 0.6),
    ...sectors.flatMap((s) => [u(routes.sector(s), s.updated_at, 0.8), u(routes.sectorProjects(s), s.updated_at, 0.7)]),
    ...projects.map((p) => u(routes.project(p), p.updated_at, 0.8)),
    ...services.map((s) => u(routes.service(s), s.updated_at, 0.8)),
    ...posts.map((p) => u(routes.post(p), p.updated_at ?? p.created_at, 0.6)),
    ...categories.map((c) => u(routes.blogCategory(c), c.updated_at, 0.4)),
    ...team.map((t) => u(routes.team(t), t.updated_at, 0.5)),
  ];
}
