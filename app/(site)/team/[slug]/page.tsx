import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import EnquiryForm from "@/components/forms/EnquiryForm";
import JsonLd from "@/components/site/JsonLd";
import { getAllTeam, getSectors, getTeamMember } from "@/lib/data";
import { loadBySlug } from "@/lib/canonical";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { richText, truncate } from "@/lib/text";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const team = await getAllTeam();
  return team.map((t) => ({ slug: routes.team(t).split("/").pop()! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = await loadBySlug(slug, getTeamMember, routes.team);
  return {
    title: `${m.name} – ${m.designation}`,
    description: truncate(m.about, 158) || `${m.name}, ${m.designation} at Havitive Infra Pvt Ltd.`,
    alternates: { canonical: routes.team(m) },
    openGraph: { type: "profile", images: [{ url: media(m.img) }] },
  };
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const m = await loadBySlug(slug, getTeamMember, routes.team);
  const sectors = await getSectors();
  const facts: [string, string | null][] = [
    ["Position", m.designation], ["Experience", m.experience], ["Specialised", m.location],
    ["Practice Area", m.practice_area], ["Projects Done", m.project_done],
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: m.name,
          jobTitle: m.designation,
          image: SITE.url + media(m.img),
          worksFor: { "@id": `${SITE.url}/#organization` },
          ...(m.linkedin ? { sameAs: [m.linkedin] } : {}),
        }}
      />
      <Breadcrumb title={m.name ?? "Team Member"} trail={[{ name: "About Us", href: "/about" }, { name: m.name ?? "", href: routes.team(m) }]} />
      <section className="space">
        <div className="container">
          <div className="row gx-40 gy-40">
            <div className="col-xl-4 col-lg-5 col-md-8">
              <div className="th-team team-card style4">
                <div className="img-wrap">
                  <div className="team-img"><img src={media(m.img)} alt={m.name ?? ""} /></div>
                  {m.linkedin && (
                    <div className="th-social-wrap">
                      <div className="th-social"><a target="_blank" rel="noopener" href={m.linkedin} aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a></div>
                    </div>
                  )}
                </div>
                <div className="team-card-content">
                  <div className="media-left">
                    <h2 className="box-title h3">{m.name}</h2>
                    <span className="team-desig">{m.designation}</span>
                  </div>
                  {m.phone && <a className="icon-btn" href={`tel:${m.phone}`} aria-label={`Call ${m.name}`}><img src="/frontend/assets/img/icon/phone.svg" alt="" /></a>}
                </div>
              </div>
            </div>
            <div className="col-xl-8 col-lg-7">
              <div className="about-card">
                <h2 className="about-card_title text-theme mb-30">About {m.name}</h2>
                <div className="row gy-3">
                  <div className="col-md-6">
                    <ul className="team-about-list">
                      {facts.slice(0, 4).filter(([, v]) => v).map(([k, v]) => <li key={k}><strong>{k}: </strong>{v}</li>)}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="team-about-list">
                      {facts.slice(4).filter(([, v]) => v).map(([k, v]) => <li key={k}><strong>{k}: </strong>{v}</li>)}
                      {m.phone && <li><strong>Phone: </strong><a href={`tel:${m.phone}`}>{m.phone}</a></li>}
                      {m.email && <li><strong>Email: </strong><a href={`mailto:${m.email}`}>{m.email.toLowerCase()}</a></li>}
                    </ul>
                  </div>
                </div>
                <div className="sec-text text-theme mt-30 rich-text" dangerouslySetInnerHTML={{ __html: richText(m.about) }} />
                <div className="title-area mb-35 mt-45"><h3 className="about-card_title text-theme mb-40">Book Business Solutions</h3></div>
                <EnquiryForm light sectors={sectors.map(({ id, sector_name }) => ({ id, sector_name }))} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
