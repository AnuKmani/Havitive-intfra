import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import JobApplicationForm from "@/components/forms/JobApplicationForm";
import JsonLd from "@/components/site/JsonLd";
import { getJobs } from "@/lib/data";
import { SITE } from "@/lib/site";
import { safeHtml, stripHtml } from "@/lib/text";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Careers – Jobs at Havitive",
  description: "Join Havitive Infra Pvt Ltd in Thiruvananthapuram. See open positions for architects, engineers, draughtsmen and designers, and apply online.",
  alternates: { canonical: "/careers" },
};

export default async function CareersPage() {
  const jobs = await getJobs();
  return (
    <>
      {jobs.map((j) => (
        <JsonLd
          key={j.id}
          data={{
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: j.title,
            description: j.description,
            datePosted: (j.created_at ?? j.updated_at ?? new Date().toISOString()).slice(0, 10),
            hiringOrganization: { "@type": "Organization", name: SITE.name, sameAs: SITE.url, logo: `${SITE.url}/upload/logos/hav.png` },
            jobLocation: {
              "@type": "Place",
              address: { "@type": "PostalAddress", streetAddress: SITE.address.street, addressLocality: SITE.address.locality, addressRegion: SITE.address.region, addressCountry: SITE.address.country },
            },
            employmentType: "FULL_TIME",
          }}
        />
      ))}
      <Breadcrumb title="Career" trail={[{ name: "Career", href: "/careers" }]} />
      <section className="space-top space-extra-bottom">
        <div className="container">
          <div className="row gx-30">
            <div className="col-xxl-8 col-lg-7">
              <div className="property-page-single">
                <div className="page-content">
                  <h2 className="page-title">Join Our Team, Build the Future</h2>
                  <p className="sec-text text-title">Become part of a dynamic team dedicated to innovation, creativity, and sustainability in the design consultancy industry.</p>
                  {jobs.length === 0 && <p>There are no open positions right now. You can still send us your CV.</p>}
                  {jobs.map((j) => (
                    <details className="card mb-3" key={j.id}>
                      <summary className="card-header" style={{ cursor: "pointer" }}><h3 className="h5 mb-0 d-inline">{j.title}</h3></summary>
                      <div className="card-body">
                        <div className="rich-text" dangerouslySetInnerHTML={{ __html: safeHtml(j.description) }} />
                        <a href="#applyForm" className="btn btn-primary mt-3" aria-label={`Apply for ${stripHtml(j.title)}`}>Apply</a>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-lg-5">
              <aside className="sidebar-area">
                <div className="widget widget-property-contact">
                  <p className="widget_text">Submit Your Resume</p>
                  <JobApplicationForm jobs={jobs.map(({ id, title }) => ({ id, title }))} />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
