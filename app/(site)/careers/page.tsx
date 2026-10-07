import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo-page";
import CareersBoard, { type BoardJob } from "@/components/careers/CareersBoard";
import JsonLd from "@/components/site/JsonLd";
import { getCareersPage, getJobs } from "@/lib/data";
import { media } from "@/lib/media";
import { SITE } from "@/lib/site";
import { jobCode, safeHtml } from "@/lib/text";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:careers");
}

const DEFAULT_TEAMS = ["Architecture", "Structural Engineering", "Interior Design", "Site Execution"];
const TEAM_ICONS = ["fa-drafting-compass", "fa-hard-hat", "fa-couch", "fa-building"];

const EMPLOYMENT: Record<string, string> = {
  "Full-time": "FULL_TIME", "Part-time": "PART_TIME", Contract: "CONTRACTOR", Internship: "INTERN", Freelance: "CONTRACTOR",
};

export default async function CareersPage() {
  const [jobs, page] = await Promise.all([getJobs(), getCareersPage()]);
  // Until photos are uploaded in the admin, designed panels are shown instead of an empty placeholder.
  const heroImage = page?.hero_image ? media(page.hero_image) : null;
  const lifeImage = page?.life_image ? media(page.life_image) : null;
  const points = (page?.life_points ?? "").split("\n").map((p) => p.trim()).filter(Boolean);
  const deptCounts = new Map<string, number>();
  for (const j of jobs) if (j.department) deptCounts.set(j.department, (deptCounts.get(j.department) ?? 0) + 1);
  const departments = deptCounts.size;
  const teams = departments ? [...deptCounts.entries()].slice(0, 4) : DEFAULT_TEAMS.map((t) => [t, 0] as [string, number]);

  const board: BoardJob[] = jobs.map((j) => ({
    id: j.id, title: j.title, code: jobCode(j), department: j.department, location: j.location,
    type: j.employment_type, experience: j.experience, summary: j.summary, html: safeHtml(j.description),
    posted: j.created_at,
  }));

  return (
    <div className="cr">
      {jobs.map((j) => (
        <JsonLd
          key={j.id}
          data={{
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: j.title,
            description: safeHtml(j.description),
            identifier: { "@type": "PropertyValue", name: SITE.name, value: jobCode(j) },
            datePosted: (j.created_at ?? j.updated_at ?? new Date().toISOString()).slice(0, 10),
            employmentType: EMPLOYMENT[j.employment_type ?? ""] ?? "FULL_TIME",
            ...(j.department ? { occupationalCategory: j.department } : {}),
            ...(j.experience ? { experienceRequirements: j.experience } : {}),
            url: `${SITE.url}/careers#job-${j.id}`,
            hiringOrganization: { "@type": "Organization", name: SITE.name, sameAs: SITE.url, logo: `${SITE.url}/upload/logos/hav.png` },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                streetAddress: SITE.address.street,
                addressLocality: j.location || SITE.address.locality,
                addressRegion: SITE.address.region,
                addressCountry: SITE.address.country,
              },
            },
          }}
        />
      ))}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
            { "@type": "ListItem", position: 2, name: "Careers", item: `${SITE.url}/careers` },
          ],
        }}
      />

      <section className="cr-hero">
        <div className="container">
          <div className="cr-hero-grid">
            <div>
              <span className="cr-kicker">{page?.hero_kicker || "Careers at Havitive"}</span>
              <h1>{page?.hero_title || "Build the spaces people live, work and grow in"}</h1>
              {page?.hero_text && <p>{page.hero_text}</p>}
              <div className="cr-hero-actions">
                <a href="#openings" className="cr-btn cr-btn-gold">View Open Positions <i className="far fa-arrow-down" aria-hidden="true"></i></a>
                <a href="#life" className="cr-btn cr-btn-ghost">{page?.life_title || "Life at Havitive"}</a>
              </div>
              <div className="cr-hero-stats">
                <div><strong>{jobs.length}</strong><span>Open position{jobs.length === 1 ? "" : "s"}</span></div>
                {departments > 0 && <div><strong>{departments}</strong><span>Department{departments === 1 ? "" : "s"}</span></div>}
                <div><strong>Kerala</strong><span>Live projects</span></div>
              </div>
            </div>
            <div className="cr-hero-img">
              {heroImage ? (
                <img src={heroImage} alt={page?.hero_image_alt || "The Havitive team at work"} width={640} height={512} fetchPriority="high" />
              ) : (
                <div className="cr-hero-art" aria-hidden="true">
                  {teams.map(([name, n], i) => (
                    <div key={name} className="cr-art-card">
                      <i className={`fal ${TEAM_ICONS[i % TEAM_ICONS.length]}`}></i>
                      <strong>{name}</strong>
                      <span>{n ? `${n} open role${n === 1 ? "" : "s"}` : "Growing team"}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="cr-hero-badge">
                <i className="far fa-users" aria-hidden="true"></i>
                <div><strong>We&apos;re hiring</strong><span>Grow with Havitive</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cr-section alt" id="openings">
        <div className="container">
          <div className="cr-head">
            <span className="cr-kicker">{page?.openings_kicker || "Current Openings"}</span>
            <h2>{page?.openings_title || "Explore Opportunities"}</h2>
            {page?.openings_text && <p>{page.openings_text}</p>}
          </div>
          <CareersBoard
            jobs={board}
            talentTitle={page?.talent_title || "Join our talent network"}
            talentText={page?.talent_text || "Don't see the right role? Drop your CV and we will contact you when a suitable position opens."}
          />
        </div>
      </section>

      <section className="cr-section" id="life">
        <div className="container">
          <div className="cr-life">
            {lifeImage ? (
              <img src={lifeImage} alt={page?.life_image_alt || "Life at Havitive"} width={600} height={480} loading="lazy" />
            ) : (
              <div className="cr-life-art" aria-hidden="true">
                <i className="fal fa-quote-left"></i>
                <p>Design is not just what it looks like – it is how people live in it. At Havitive, every team member shapes spaces that matter.</p>
                <div className="cr-life-stats">
                  <div><strong>{SITE.shortName}</strong><span>Design studio</span></div>
                  <div><strong>360°</strong><span>Design to delivery</span></div>
                  <div><strong>Kerala</strong><span>Projects</span></div>
                </div>
              </div>
            )}
            <div>
              <span className="cr-kicker" style={{ color: "#b08a12" }}>Why join us</span>
              <h2>{page?.life_title || "Life at Havitive"}</h2>
              {page?.life_text && <p>{page.life_text}</p>}
              {points.length > 0 && (
                <ul className="cr-points">
                  {points.map((p) => <li key={p}><i className="far fa-check" aria-hidden="true"></i>{p}</li>)}
                </ul>
              )}
              <div className="cr-hero-actions">
                <a href="#openings" className="cr-btn cr-btn-dark">See open roles</a>
                <a href="#talent-network" className="cr-btn cr-btn-line">Drop your CV</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
