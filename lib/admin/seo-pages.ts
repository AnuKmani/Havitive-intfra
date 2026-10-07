import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { defaults, STATIC_PAGES, type PageSeo, type SeoDefaults } from "@/lib/seo";
import type * as T from "@/lib/types";

export type SitePage = SeoDefaults & { key: string; label: string; type: string; editHref?: string };

/** Every page of the public site, with its automatic SEO text. */
export async function listSitePages(supabase: SupabaseClient): Promise<SitePage[]> {
  const [sectors, projects, services, team, posts, cats] = await Promise.all([
    supabase.from("sectors").select("*").order("id"),
    supabase.from("latest_projects").select("*").order("id"),
    supabase.from("services").select("*").order("id"),
    supabase.from("teams").select("*").order("id"),
    supabase.from("blog_posts").select("*").order("id"),
    supabase.from("blog_categories").select("*").order("id"),
  ]);
  const pages: SitePage[] = Object.entries(STATIC_PAGES).map(([key, p]) => ({ key, type: "Page", ...p, editHref: key === "page:home" ? "/admin/home" : undefined }));
  for (const s of (sectors.data ?? []) as T.Sector[]) {
    pages.push({ key: `sector:${s.id}`, label: s.sector_name ?? `Sector ${s.id}`, type: "Sector", ...defaults.sector(s), editHref: `/admin/sectors/${s.id}` });
    pages.push({ key: `sector-projects:${s.id}`, label: `${s.sector_name} – all projects`, type: "Sector projects", ...defaults.sectorProjects(s) });
  }
  for (const p of (projects.data ?? []) as T.Project[]) pages.push({ key: `project:${p.id}`, label: p.project_name ?? `Project ${p.id}`, type: "Project", ...defaults.project(p), editHref: `/admin/projects/${p.id}` });
  for (const s of (services.data ?? []) as T.Service[]) pages.push({ key: `service:${s.id}`, label: s.name ?? `Service ${s.id}`, type: "Service", ...defaults.service(s), editHref: `/admin/services/${s.id}` });
  for (const m of (team.data ?? []) as T.TeamMember[]) pages.push({ key: `team:${m.id}`, label: m.name ?? `Member ${m.id}`, type: "Team member", ...defaults.team(m), editHref: `/admin/${m.category === "management" ? "management" : "team"}/${m.id}` });
  for (const p of (posts.data ?? []) as T.BlogPost[]) pages.push({ key: `post:${p.id}`, label: p.post_title ?? `Post ${p.id}`, type: "Blog post", ...defaults.post(p), editHref: `/admin/posts/${p.id}` });
  for (const c of (cats.data ?? []) as T.BlogCategory[]) pages.push({ key: `blog-category:${c.id}`, label: c.category_name, type: "Blog category", ...defaults.blogCategory(c), editHref: `/admin/categories/${c.id}` });
  return pages;
}

export async function loadSeoMap(supabase: SupabaseClient) {
  const { data } = await supabase.from("page_seo").select("*");
  return new Map(((data ?? []) as PageSeo[]).map((r) => [r.key, r]));
}
