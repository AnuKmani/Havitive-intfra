import "server-only";
import { unstable_cache } from "next/cache";
import {
  getAllTeam, getBlogCategories, getCompanies, getCounters, getHome, getJobs, getPosts, getProjects,
  getSections, getSectors, getServices, getUpcoming, getFloors,
} from "@/lib/data";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { stripHtml, titleCase } from "@/lib/text";

/**
 * Everything the chat assistant knows about Havitive, rebuilt from Supabase at most once an hour.
 * The text must be deterministic (stable ordering, no timestamps) so the prompt cache keeps hitting.
 */
async function build(): Promise<string> {
  const [about, service, counters, sectors, services, sections, projects, upcoming, companies, team, posts, categories, jobs] =
    await Promise.all([
      getHome("about"), getHome("service"), getCounters(), getSectors(), getServices(), getSections(), getProjects(),
      getUpcoming(), getCompanies(), getAllTeam(), getPosts(), getBlogCategories(), getJobs(),
    ]);
  const byId = <T extends { id: number }>(a: T[]) => [...a].sort((x, y) => x.id - y.id);
  const sectorName = (id: number | null) => sectors.find((s) => s.id === id)?.sector_name ?? "Unassigned";
  const floors = await Promise.all(byId(projects).map((p) => getFloors(p.id)));
  const t = (s?: string | null) => stripHtml(s);
  const out: string[] = [];

  out.push(`# Company
Name: ${SITE.name} (brand: Havitive)
Website: ${SITE.url}
Summary: ${SITE.description}
Address: ${SITE.address.street}, ${SITE.address.locality}, ${SITE.address.region}, India
Phone: ${SITE.phones.map((p) => p.label).join(" / ")}
Email: ${SITE.email}
WhatsApp: ${SITE.whatsapp}
Enquiry form: ${SITE.url}${routes.contact()}
Social: Facebook ${SITE.social.facebook} | YouTube ${SITE.social.youtube} | Instagram ${SITE.social.instagram}`);

  out.push(`# About Havitive
${t(about?.main_content)}
Vision: To redefine the standards of excellence in the design consultancy industry by becoming a trusted leader known for innovation, integrity and dedication to quality; to be the preferred partner for clients seeking unique, sustainable and functional designs, and to build long-term relationships on trust.
Mission: To deliver design solutions that combine innovation, quality and sustainability, transforming visions into impactful realities; to meet and exceed client expectations with creativity and precision, integrating eco-friendly practices and modern technology.
Why choose Havitive: proven expertise in design consultancy; best-in-class tools and technology; a creative and dedicated team; timely project delivery; attention to detail; client satisfaction. Creative professionals (architects and designers), tailored end-to-end solutions from concept to completion, client-centric approach.
What we offer: ${t(service?.main_content)} Areas include architectural design, interior styling, structural consulting, landscaping, property evaluation, asset management and investment guidance.
Chairman's message: "We are passionate about creating innovative and sustainable designs that inspire and add value. We prioritize trust, precision, and creativity in every project." – Er. S Mohan, Chairman`);

  if (counters.length)
    out.push(`# Track record (as shown on the website)\n${byId(counters).map((c) => `- ${titleCase(c.counter_name)}: ${c.counter}+`).join("\n")}`);

  out.push(`# Group of companies\n${byId(companies).map((c) => `- ${c.company_name}: ${t(c.company_description)}`).join("\n")}`);

  out.push(`# Sectors\n${byId(sectors)
    .map((s) => `- ${s.sector_name} (${s.category === 0 ? "Government" : "Private"}) – ${SITE.url}${routes.sector(s)}`)
    .join("\n")}`);

  out.push(`# Services\n${byId(services)
    .map((s) => {
      const ids = (s.section_id ?? "").split(",").map(Number);
      const secs = sections.filter((x) => ids.includes(x.id)).map((x) => x.section_name).join(", ");
      return `- ${titleCase(s.name)} – ${SITE.url}${routes.service(s)}\n  ${t(s.description)}${secs ? `\n  Includes: ${secs}` : ""}`;
    })
    .join("\n")}`);

  out.push(`# Completed / featured projects\n${byId(projects)
    .map((p, i) => {
      const f = floors[i].map((x) => `${x.floor_name}: ${t(x.description)}`).join("; ");
      return `- ${p.project_name} (sector: ${sectorName(p.sector_id)}) – ${SITE.url}${routes.project(p)}
  ${t(p.project_heading)}. ${t(p.description)}${p.location ? ` Location: ${p.location}.` : ""}${f ? `\n  Floors: ${f}` : ""}`;
    })
    .join("\n")}`);

  if (upcoming.length)
    out.push(`# Upcoming projects\n${byId(upcoming)
      .map((u) => `- ${u.project_heading}: ${t(u.project_descp)}. Client: ${u.client_name ?? "-"}. Location: ${u.location ?? "-"}. Date: ${u.project_date ?? "-"}.`)
      .join("\n")}`);

  out.push(`# Leadership and team\n${byId(team)
    .map((m) => `- ${m.name} – ${m.designation} (${m.category === "management" ? "management" : "team"}). Experience: ${m.experience ?? "-"}. Specialisation: ${m.location ?? "-"}. Practice area: ${m.practice_area ?? "-"}. Projects: ${m.project_done ?? "-"}. Profile: ${SITE.url}${routes.team(m)}
  ${t(m.about)}`)
    .join("\n")}`);

  if (jobs.length)
    out.push(`# Open jobs (apply at ${SITE.url}${routes.careers()})\n${byId(jobs).map((j) => `- ${j.title}: ${t(j.description)}`).join("\n")}`);

  if (posts.length)
    out.push(`# Blog articles\n${byId(posts)
      .map((p) => `- ${p.post_title} (${categories.find((c) => c.id === p.blogcat_id)?.category_name ?? "General"}) – ${SITE.url}${routes.post(p)}\n  ${t(p.short_descp)}`)
      .join("\n")}`);

  return out.join("\n\n");
}

export const getKnowledge = unstable_cache(build, ["havitive-knowledge"], { revalidate: 3600, tags: ["content"] });
