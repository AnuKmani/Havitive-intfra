import "server-only";
import { cache } from "react";
import { publicClient } from "./supabase/public";
import type * as T from "./types";

const db = () => publicClient();

async function rows<R>(query: PromiseLike<{ data: R[] | null; error: { message: string } | null }>): Promise<R[]> {
  const { data, error } = await query;
  if (error) {
    console.error("Supabase query failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function one<R>(query: PromiseLike<{ data: R | null; error: { message: string } | null }>): Promise<R | null> {
  const { data, error } = await query;
  if (error) {
    console.error("Supabase query failed:", error.message);
    return null;
  }
  return data;
}

// Laravel's ->latest() orders by created_at desc; rows without a timestamp go last.
const latest = { ascending: false, nullsFirst: false } as const;

export const getSectors = cache(() => rows<T.Sector>(db().from("sectors").select("*").order("created_at", latest).order("id", { ascending: false })));
export const getSector = cache((id: number) => one<T.Sector>(db().from("sectors").select("*").eq("id", id).maybeSingle()));
export const getServices = cache(() => rows<T.Service>(db().from("services").select("*").order("created_at", latest)));
export const getService = cache((id: number) => one<T.Service>(db().from("services").select("*").eq("id", id).maybeSingle()));
export const getSections = cache(() => rows<T.Section>(db().from("sections").select("*").order("created_at", latest)));
export const getBanners = cache(() => rows<T.HomeBanner>(db().from("home_banners").select("*").order("created_at", latest)));
export const getCounters = cache(() => rows<T.Counter>(db().from("counters").select("*").order("id")));
export const getHome = cache((category: string) => one<T.Home>(db().from("homes").select("*").eq("category", category).order("created_at", latest).limit(1).maybeSingle()));
export const getClients = cache(() => rows<T.Client>(db().from("clients").select("*").order("created_at", latest)));
export const getTestimonials = cache(() => rows<T.Testimonial>(db().from("testimonials").select("*").order("created_at", latest)));
export const getCompanies = cache(() => rows<T.Company>(db().from("gropuof_companies").select("*").order("created_at", { ascending: true })));
export const getTeam = cache((category: "management" | "team") => rows<T.TeamMember>(db().from("teams").select("*").eq("category", category).order("created_at", { ascending: true })));
export const getTeamMember = cache((id: number) => one<T.TeamMember>(db().from("teams").select("*").eq("id", id).maybeSingle()));
export const getAllTeam = cache(() => rows<T.TeamMember>(db().from("teams").select("*").order("id")));

export const getProjects = cache(() => rows<T.Project>(db().from("latest_projects").select("*").order("created_at", latest)));
export const getProject = cache((id: number) => one<T.Project>(db().from("latest_projects").select("*").eq("id", id).maybeSingle()));
export const getProjectsBySector = cache((sectorId: number) => rows<T.Project>(db().from("latest_projects").select("*").eq("sector_id", sectorId).order("created_at", latest)));
export const getFloors = cache((projectId: number) => rows<T.Floor>(db().from("floors").select("*").eq("project_id", projectId).order("id")));
export const getFacilities = cache((projectId: number) => rows<T.Facility>(db().from("project_facitities").select("*").eq("project_id", projectId).order("id")));
export const getGallery = cache((projectId: number) => rows<T.Gallery>(db().from("galleries").select("*").eq("project_id", projectId).order("id")));
export const getAmenities = cache(() => rows<T.Amenity>(db().from("project_aminities").select("*").order("id")));

export const getShowcaseBySector = cache((sectorId: number) => rows<T.ShowcaseProject>(db().from("residenceprojects").select("*").eq("sector_id", sectorId).order("created_at", latest)));
export const getUpcoming = cache(() => rows<T.ShowcaseProject>(db().from("upcomming_projects").select("*").order("created_at", latest)));

export const getBlogCategories = cache(() => rows<T.BlogCategory>(db().from("blog_categories").select("*").order("id")));
export const getBlogCategoryBySlug = cache((slug: string) => one<T.BlogCategory>(db().from("blog_categories").select("*").eq("category_slug", slug).maybeSingle()));
export const getPosts = cache(() => rows<T.BlogPost>(db().from("blog_posts").select("*").order("created_at", latest)));
export const getPostBySlug = cache((slug: string) => one<T.BlogPost>(db().from("blog_posts").select("*").eq("post_slug", slug).maybeSingle()));

export const getJobs = cache(() =>
  rows<T.Job>(db().from("alljobs").select("*").eq("status", "open").order("sort_order").order("created_at", latest).order("id", { ascending: false })));
export const getCareersPage = cache(() => one<T.CareersPage>(db().from("careers_page").select("*").order("id").limit(1).maybeSingle()));

export const getSeo = cache((key: string) => one<import("./seo").PageSeo>(db().from("page_seo").select("*").eq("key", key).maybeSingle()));
export const getAllSeo = cache(() => rows<import("./seo").PageSeo>(db().from("page_seo").select("*")));
