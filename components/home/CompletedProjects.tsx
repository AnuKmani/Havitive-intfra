import type { Gallery, Home, Project, Sector } from "@/lib/types";
import { media } from "@/lib/media";
import { toPopup } from "@/lib/projectPopup";
import { SITE } from "@/lib/site";
import ProjectNumberSync from "./ProjectNumberSync";
import ProjectPopup from "./ProjectPopup";

/** Slider of finished projects (status "Completed"). The heading, text and button come from Admin > Home page. */
export default function CompletedProjects({ projects, home, sectors = [], galleries = [] }: { projects: Project[]; home?: Home | null; sectors?: Sector[]; galleries?: Gallery[] }) {
  if (!projects.length) return null;
  const link = home?.button_link?.trim() || SITE.social.instagram;
  const external = /^https?:\/\//.test(link);
  // With only a few projects the slider doesn't loop, so no card is repeated.
  const slider = JSON.stringify({
    loop: projects.length > 3,
    breakpoints: { 0: { slidesPerView: 1 }, 576: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 992: { slidesPerView: 3 }, 1200: { slidesPerView: 3 } },
  });

  return (
    <section className="project-area-1 space overflow-hidden" data-bg-src="/frontend/assets/img/bg/9.png" data-opacity="5" data-overlay="title">
      <div className="container-fluid">
        <div className="project-wrap1">
          <div className="project-number-pagination" data-slider-tab="#projectSlider1">
            {projects.slice(0, 4).map((p, i) => (
              <div className={`tab-btn${i === 0 ? " active" : ""}`} key={p.id}><span>{String(i + 1).padStart(2, "0")}</span></div>
            ))}
          </div>
          <ProjectNumberSync sliderId="projectSlider1" slots={Math.min(projects.length, 4)} />
          <div className="row gy-40 justify-content-between align-items-center">
            <div className="col-xl-4">
              <div className="project-title-wrap1">
                <div className="title-area mb-40">
                  <span className="shadow-title">{home?.shadow_text || "PROJECTS"}</span>
                  <h2 className="sec-title text-white">{home?.heading || "Our Completed Projects"}</h2>
                  <p className="sec-text text-white mt-15">{home?.main_content}</p>
                </div>
                <div className="btn-wrap">
                  <a href={link} className="th-btn btn-mask th-btn-icon" {...(external ? { target: "_blank", rel: "noopener" } : {})}>
                    {home?.button_text || "Explore More"}
                  </a>
                </div>
              </div>
            </div>
            <div className="col-xl-8">
              <div className="slider-area project-slider1">
                <div className="swiper th-slider" id="projectSlider1" data-slider-options={slider}>
                  <div className="swiper-wrapper">
                    {projects.map((p) => (
                      <div className="swiper-slide" key={p.id}>
                        <div className="portfolio-card">
                          <ProjectPopup project={toPopup(p, sectors, galleries)} className="portfolio-img img-shine" style={{ display: "block" }} ariaLabel={`View ${p.project_name ?? "project"}`}>
                            <img src={media(p.project_image)} alt={p.project_image_alt || p.project_name || "Completed project"} loading="lazy" style={{ width: 371, height: 241, objectFit: "cover" }} />
                          </ProjectPopup>
                          <div className="portfolio-content">
                            <ProjectPopup project={toPopup(p, sectors, galleries)} className="icon-btn" ariaLabel={`View ${p.project_name ?? "project"}`}>
                              <img src="/frontend/assets/img/icon/arrow-right.svg" alt="" />
                            </ProjectPopup>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="slider-pagination d-sm-block d-none"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
