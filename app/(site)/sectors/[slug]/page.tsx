import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import EnquiryForm from "@/components/forms/EnquiryForm";
import { PortfolioModal, portfolioData } from "@/components/home/Upcoming";
import { getProjectsBySector, getSector, getSectors, getShowcaseBySector } from "@/lib/data";
import { loadBySlug } from "@/lib/canonical";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { truncate } from "@/lib/text";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const sectors = await getSectors();
  return sectors.map((s) => ({ slug: routes.sector(s).split("/").pop()! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sector = await loadBySlug(slug, getSector, routes.sector);
  const name = sector.sector_name ?? "Sector";
  return {
    title: `${name} in Kerala`,
    description: `${name} by Havitive Infra Pvt Ltd – architecture, structural engineering and construction for ${name.toLowerCase()} across Kerala. View our work and schedule a site visit.`,
    alternates: { canonical: routes.sector(sector) },
  };
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = await loadBySlug(slug, getSector, routes.sector);
  const [showcase, projects, sectors] = await Promise.all([getShowcaseBySector(sector.id), getProjectsBySector(sector.id), getSectors()]);
  const lead = showcase[0];

  return (
    <>
      <Breadcrumb title={sector.sector_name ?? ""} trail={[{ name: sector.sector_name ?? "", href: routes.sector(sector) }]} />

      <section className="space bg-title-dark overflow-hidden">
        <div className="project-bg-shape2-1 sec-bg-shape2-1 text-white jump shape-mockup" data-bottom="9%" data-left="3%">
          <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
        </div>
        <div className="container">
          <div className="row justify-content-lg-between justify-content-center align-items-center">
            <div className="col-xxl-6 col-xl-7 col-lg-6">
              <div className="title-area text-lg-start text-center">
                <h2 className="sec-title text-white">{lead ? lead.main_content : `${sector.sector_name} Showcase`}</h2>
                <p className="sec-text text-white">{lead ? lead.main_description : "Our featured work in this sector will be listed here soon."}</p>
              </div>
            </div>
            <div className="col-auto">
              <div className="sec-btn"><a href="#schedule-visit" className="th-btn style-border3 th-btn-icon">Talk With Expert</a></div>
            </div>
          </div>
        </div>
        {showcase.length > 0 && (
          <div className="container-fluid p-0">
            <div className="slider-area project-slider2">
              <div className="swiper th-slider" id="projectSlider2" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":1},"768":{"slidesPerView":2},"992":{"slidesPerView":3},"1200":{"slidesPerView":3}}}'>
                <div className="swiper-wrapper">
                  {showcase.map((r) => (
                    <div className="swiper-slide" key={r.id}>
                      <div className="portfolio-card style2">
                        <div className="portfolio-img img-shine" data-bs-toggle="modal" data-bs-target="#portfolioModal" data-portfolio={portfolioData(r)} role="button">
                          <img src={media(r.residence_image_one)} alt={r.project_heading ?? "Project"} loading="lazy" />
                        </div>
                        <div className="portfolio-content">
                          <h3 className="portfolio-title" style={{ color: "white" }}>{r.project_heading}</h3>
                          <p className="portfolio-text">{truncate(r.project_descp, 50)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button data-slider-prev="#projectSlider2" className="slider-arrow slider-prev" aria-label="Previous"><img src="/frontend/assets/img/icon/arrow-left.svg" alt="" /></button>
            </div>
          </div>
        )}
      </section>

      <div className="video-area-2 space overflow-hidden" data-bg-src="/frontend/assets/img/hero/3.png" id="schedule-visit">
        <div className="container th-container2">
          <div className="row gy-50 flex-row-reverse">
            <div className="col-lg-7">
              <div className="video-wrap2 mb-lg-0 mb-40">
                <h2 className="video-title text-theme">We Manage Your Project, <br className="d-xl-block d-none" /> You Run Your Life</h2>
                <a href={SITE.video} className="video-btn popup-video">
                  <span className="play-btn style5"><i className="fa-sharp fa-solid fa-play"></i></span>
                  Play Video
                </a>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="appointment-wrap2 bg-theme me-xxl-5">
                <h2 className="form-title text-white">Schedule a visit</h2>
                <EnquiryForm sectors={sectors.map(({ id, sector_name }) => ({ id, sector_name }))} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space overflow-hidden">
        <div className="container">
          <div className="project-bg-shape3-1 sec-bg-shape2-1 jump shape-mockup d-xxl-block d-none" data-bottom="5%" data-right="0%">
            <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
          </div>
          <div className="container th-container2">
            <div className="row justify-content-lg-between align-items-center">
              <div className="col-xxl-6 col-xl-7 col-lg-6">
                <div className="title-area">
                  <span className="sub-title">Projects</span>
                  <h2 className="sec-title text-theme">Our Latest {sector.sector_name}</h2>
                </div>
              </div>
              <div className="col-auto">
                <div className="sec-btn"><a href={routes.sectorProjects(sector)} className="th-btn style2 th-btn-icon">View All Projects</a></div>
              </div>
            </div>
            {projects.length === 0 ? (
              <p>New projects in this sector are coming soon.</p>
            ) : (
              <div className="slider-area">
                <div className="swiper th-slider slider-drag-wrap" id="projectSlider3" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"3"},"1400":{"slidesPerView":"4"}}}'>
                  <div className="swiper-wrapper">
                    {projects.map((p) => (
                      <div className="swiper-slide" key={p.id}>
                        <div className="portfolio-card style3">
                          <div className="portfolio-img">
                            <img src={media(p.project_image)} alt={p.project_name ?? "Project"} loading="lazy" style={{ width: 416, height: 400, objectFit: "cover" }} />
                            <a href={routes.project(p)} className="icon-btn">
                              <div className="icon"><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></div>
                              Look More
                            </a>
                          </div>
                          <div className="portfolio-content">
                            <h3 className="portfolio-title"><a href={routes.project(p)}>{p.project_name}</a></h3>
                            <p className="portfolio-text">{truncate(p.description, 50)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <PortfolioModal />
    </>
  );
}
