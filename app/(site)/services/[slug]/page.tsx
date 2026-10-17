import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-page";
import { defaults } from "@/lib/seo";
import Breadcrumb from "@/components/site/Breadcrumb";
import LatestProjects from "@/components/home/LatestProjects";
import CompletedProjects from "@/components/home/CompletedProjects";
import JsonLd from "@/components/site/JsonLd";
import { getAllGalleries, getCompletedProjects, getHome, getProjects, getSectors, getService, getServices } from "@/lib/data";
import { loadBySlug } from "@/lib/canonical";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { parseServiceContent } from "@/lib/serviceContent";
import { richText, titleCase, truncate } from "@/lib/text";
import "@/components/site/service-detail.css";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: routes.service(s).split("/").pop()! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await loadBySlug(slug, getService, routes.service);
  return pageMetadata(`service:${s.id}`, defaults.service(s));
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await loadBySlug(slug, getService, routes.service);
  const [projects, completed, completedHome, sectors, galleries] = await Promise.all([getProjects(), getCompletedProjects(), getHome("projects"), getSectors(), getAllGalleries()]);
  const name = titleCase(service.name);
  const content = parseServiceContent(service.description);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name,
          description: truncate(service.description, 300),
          provider: { "@id": `${SITE.url}/#organization` },
          areaServed: "Kerala, India",
          url: SITE.url + routes.service(service),
        }}
      />
      <Breadcrumb title={name} trail={[{ name, href: routes.service(service) }]} />
      {content ? (
        <>
          <section className="sv-intro">
            <div className="container">
              <div className="sv-intro-grid">
                <div>
                  {content.intro.map((p, i) => <p key={i}>{p}</p>)}
                  <a href="/contact" className="sv-btn">Get in touch</a>
                </div>
                <div className="sv-img"><img src={media(service.img)} alt={service.img_alt || name} /></div>
              </div>
            </div>
          </section>
          <section className="sv-included">
            <div className="container">
              <h2>What&rsquo;s included</h2>
              <p className="sv-sub">Everything covered under {name.toLowerCase()}.</p>
              <ol className="sv-cards" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {content.cards.map((c, i) => (
                  <li className="sv-card" key={c.title}>
                    <span className="sv-num" aria-hidden="true">{i + 1}</span>
                    <div><h3>{c.title}</h3><p>{c.text}</p></div>
                  </li>
                ))}
              </ol>
              {content.outro.length > 0 && <div className="sv-outro">{content.outro.map((p, i) => <p key={i}>{p}</p>)}</div>}
              <div className="sv-cta">
                <div><h3>Have a project in mind?</h3><p>Talk to our team about your site and requirements.</p></div>
                <a href="/contact">Get in touch</a>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="overflow-hidden space">
          <div className="sec-bg-shape2-1 spin shape-mockup d-xl-block d-none" data-bottom="25%" data-right="12%">
            <img src="/frontend/assets/img/shape/section_shape_2_1.jpg" alt="" />
          </div>
          <div className="container">
            <div className="about-page-wrap">
              <div className="row gy-40 justify-content-between align-items-center">
                <div className="col-lg-6">
                  <div className="title-area mb-0">
                    <h2 className="sec-title text-theme mb-2">{name}</h2>
                    <div className="mb-0 text-theme rich-text" dangerouslySetInnerHTML={{ __html: richText(service.description) }} />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="img-box3"><div className="img1"><img src={media(service.img)} alt={service.img_alt || name} /></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <LatestProjects projects={projects} sectors={sectors} galleries={galleries} />
      <CompletedProjects projects={completed} home={completedHome} sectors={sectors} galleries={galleries} />
    </>
  );
}
