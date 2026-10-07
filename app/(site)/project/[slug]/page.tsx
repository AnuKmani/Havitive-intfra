import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo-page";
import { defaults } from "@/lib/seo";
import Breadcrumb from "@/components/site/Breadcrumb";
import JsonLd from "@/components/site/JsonLd";
import RecentPosts from "@/components/site/RecentPosts";
import { getFacilities, getFloors, getGallery, getPosts, getProject, getProjects, getSector } from "@/lib/data";
import { loadBySlug } from "@/lib/canonical";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { richText, truncate } from "@/lib/text";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: routes.project(p).split("/").pop()! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await loadBySlug(slug, getProject, routes.project);
  return pageMetadata(`project:${p.id}`, defaults.project(p));
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await loadBySlug(slug, getProject, routes.project);
  const [gallery, floors, facilities, posts, sector] = await Promise.all([
    getGallery(project.id), getFloors(project.id), getFacilities(project.id), getPosts(),
    project.sector_id ? getSector(project.sector_id) : Promise.resolve(null),
  ]);
  const images = gallery.length ? gallery.map((g) => media(g.gallery)) : [media(project.project_image)];
  const imageAlts = gallery.length ? gallery.map((g) => g.gallery_alt) : [project.project_image_alt];
  const videoUrl = /^https?:\/\//.test(project.main_content ?? "") ? project.main_content! : SITE.video;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.project_name,
          headline: project.project_heading,
          description: truncate(project.description, 300),
          image: images.map((i) => (i.startsWith("http") ? i : SITE.url + i)),
          creator: { "@id": `${SITE.url}/#organization` },
          ...(sector ? { genre: sector.sector_name } : {}),
        }}
      />
      <Breadcrumb
        title={project.project_name ?? "Project"}
        trail={[
          ...(sector ? [{ name: sector.sector_name ?? "", href: routes.sectorProjects(sector) }] : []),
          { name: project.project_name ?? "Project", href: routes.project(project) },
        ]}
      />
      <section className="space-top space-extra-bottom">
        <div className="container">
          <div className="slider-area property-slider1">
            <div className="swiper th-slider mb-4" id="propertySlider" data-slider-options='{"effect":"fade","loop":true,"thumbs":{"swiper":".property-thumb-slider"},"autoplayDisableOnInteraction":"true"}'>
              <div className="swiper-wrapper">
                {images.map((src, i) => (
                  <div className="swiper-slide" key={i}>
                    <div className="property-slider-img"><img src={src} alt={imageAlts[i] || `${project.project_name} – image ${i + 1}`} loading={i ? "lazy" : "eager"} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="swiper th-slider property-thumb-slider" data-slider-options='{"effect":"slide","loop":true,"breakpoints":{"0":{"slidesPerView":2},"576":{"slidesPerView":"2"},"768":{"slidesPerView":"3"},"992":{"slidesPerView":"3"},"1200":{"slidesPerView":"4"}},"autoplayDisableOnInteraction":"true"}'>
              <div className="swiper-wrapper">
                {images.map((src, i) => (
                  <div className="swiper-slide" key={i}>
                    <div className="property-slider-img"><img src={src} alt="" loading="lazy" /></div>
                  </div>
                ))}
              </div>
            </div>
            <button data-slider-prev="#propertySlider" className="slider-arrow style3 slider-prev" aria-label="Previous"><img src="/frontend/assets/img/icon/arrow-left.svg" alt="" /></button>
            <button data-slider-next="#propertySlider" className="slider-arrow style3 slider-next" aria-label="Next"><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></button>
          </div>

          <div className="row gx-30">
            <div className="col-xxl-8 col-lg-7">
              <div className="property-page-single">
                <div className="page-content">
                  <h2 className="page-title">{project.project_heading}</h2>
                  <div className="mb-30 rich-text" dangerouslySetInnerHTML={{ __html: richText(project.description) }} />
                  {project.location && <p><strong>Location:</strong> {project.location}</p>}

                  {gallery.length > 0 && (
                    <>
                      <h3 className="page-title mt-50 mb-30">From Our Gallery</h3>
                      <div className="row gy-4">
                        {gallery.map((g, i) => (
                          <div className={i % 2 === 0 ? "col-xl-5" : "col-xl-7"} key={g.id}>
                            <div className="property-gallery-card">
                              <div className="property-gallery-card-img">
                                <img className="w-100" src={media(g.gallery)} alt={g.gallery_alt || `${project.project_name} gallery`} loading="lazy" />
                              </div>
                              <a className="icon-btn popup-image" href={media(g.gallery)} aria-label="Enlarge image"><i className="fal fa-magnifying-glass-plus"></i></a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {floors.length > 0 && (
                    <>
                      <div className="row align-items-center justify-content-between">
                        <div className="col-lg-auto"><h3 className="page-title mt-50 mb-30">{project.main_description || "Floor Plans"}</h3></div>
                        <div className="col-lg-auto">
                          <ul className="nav nav-tabs property-tab mt-50" role="tablist">
                            {floors.map((f, i) => (
                              <li className="nav-item" role="presentation" key={f.id}>
                                <button className={`nav-link${i === 0 ? " active" : ""}`} id={`floor-tab-${f.id}`} data-bs-toggle="tab" data-bs-target={`#floor-pane-${f.id}`} type="button" role="tab" aria-controls={`floor-pane-${f.id}`} aria-selected={i === 0}>
                                  {f.floor_name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="tab-content">
                        {floors.map((f, i) => (
                          <div className={`tab-pane fade${i === 0 ? " show active" : ""}`} id={`floor-pane-${f.id}`} role="tabpanel" aria-labelledby={`floor-tab-${f.id}`} tabIndex={0} key={f.id}>
                            <div className="property-grid-plan">
                              <div className="property-grid-thumb"><img src={media(f.image)} alt={f.image_alt || `${f.floor_name} plan`} loading="lazy" style={{ height: 300, objectFit: "contain" }} /></div>
                              <div className="property-grid-details">
                                <h4 className="property-grid-title">{f.floor_name}</h4>
                                <div className="property-grid-text rich-text" dangerouslySetInnerHTML={{ __html: richText(f.description) }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {facilities.length > 0 && (
                    <>
                      <div className="row align-items-center justify-content-between">
                        <div className="col-lg-auto"><h3 className="page-title mt-50 mb-30">Project Facilities</h3></div>
                        <div className="col-lg-auto">
                          <ul className="nav nav-tabs property-tab mt-50" role="tablist">
                            {facilities.map((f, i) => (
                              <li className="nav-item" role="presentation" key={f.id}>
                                <button className={`nav-link${i === 0 ? " active" : ""}`} id={`facility-tab-${f.id}`} data-bs-toggle="tab" data-bs-target={`#facility-pane-${f.id}`} type="button" role="tab" aria-controls={`facility-pane-${f.id}`} aria-selected={i === 0}>
                                  {f.facility_name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="tab-content">
                        {facilities.map((f, i) => (
                          <div className={`tab-pane fade${i === 0 ? " show active" : ""}`} id={`facility-pane-${f.id}`} role="tabpanel" aria-labelledby={`facility-tab-${f.id}`} tabIndex={0} key={f.id}>
                            <div className="property-grid-plan">
                              <div className="property-grid-thumb"><img src={media(f.facility_image)} alt={f.facility_image_alt || f.facility_name || ""} loading="lazy" style={{ height: 300, objectFit: "contain" }} /></div>
                              <div className="property-grid-details">
                                <h4 className="property-grid-title">{f.facility_name}</h4>
                                <div className="property-grid-text rich-text" dangerouslySetInnerHTML={{ __html: richText(f.facility_description) }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-lg-5">
              <aside className="sidebar-area">
                <RecentPosts posts={posts.slice(0, 3)} />
                <div className="widget widget_banner" data-bg-src="/upload/logos/havitive.jpeg">
                  <div className="widget-banner text-center">
                    <h3 className="title">Project Video</h3>
                    <div className="about-tag">
                      <a href={videoUrl} className="play-btn popup-video" aria-label="Play project video"><i className="fa-sharp fa-solid fa-play"></i></a>
                    </div>
                  </div>
                </div>
                <div className="widget">
                  <h3 className="widget_title">Plan a similar project?</h3>
                  <p>Talk to our architects and engineers about your requirements.</p>
                  <a href="/contact" className="th-btn style2 th-btn-icon">Contact Us</a>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
