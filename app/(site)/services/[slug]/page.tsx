import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import Strengths from "@/components/site/Strengths";
import LatestProjects from "@/components/home/LatestProjects";
import Upcoming from "@/components/home/Upcoming";
import JsonLd from "@/components/site/JsonLd";
import { getProjects, getSections, getService, getServices, getUpcoming } from "@/lib/data";
import { loadBySlug } from "@/lib/canonical";
import { media, splitList } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { richText, titleCase, truncate } from "@/lib/text";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: routes.service(s).split("/").pop()! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await loadBySlug(slug, getService, routes.service);
  const name = titleCase(s.name);
  return {
    title: `${name} Services in Kerala`,
    description: truncate(`${name} by Havitive Infra Pvt Ltd, Thiruvananthapuram. ${s.description ?? ""}`, 158),
    alternates: { canonical: routes.service(s) },
    openGraph: { images: [{ url: media(s.img) }] },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await loadBySlug(slug, getService, routes.service);
  const [sections, projects, upcoming] = await Promise.all([getSections(), getProjects(), getUpcoming()]);
  const ids = splitList(service.section_id).map(Number);
  const serviceSections = sections.filter((s) => ids.includes(s.id));
  const name = titleCase(service.name);

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
                <div className="img-box3"><div className="img1"><img src={media(service.img)} alt={name} /></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LatestProjects projects={projects} />
      {serviceSections.length > 0 && (
        <Strengths
          heading="Design Solutions for Every Need"
          intro="Our expertise ensures outstanding results for both residential and commercial sectors, delivering creative excellence in every detail."
          items={serviceSections.map((s) => ({ title: s.section_name ?? "", icon: media(s.icon), img: media(s.img) }))}
        />
      )}
      <Upcoming projects={upcoming} />
    </>
  );
}
