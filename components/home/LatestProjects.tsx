import type { Home, Project, Sector } from "@/lib/types";
import { media } from "@/lib/media";
import { toPopup } from "@/lib/projectPopup";
import { SITE } from "@/lib/site";
import { truncate } from "@/lib/text";
import ProjectPopup from "./ProjectPopup";

/** Heading, text and button come from Admin > Home page (falls back to the built-in wording). */
export default function LatestProjects({ projects, home, sectors = [] }: { projects: Project[]; home?: Home | null; sectors?: Sector[] }) {
  const link = home?.button_link?.trim() || SITE.social.instagram;
  const external = /^https?:\/\//.test(link);
  return (
    <section className="space bg-title-dark overflow-hidden">
      <div className="project-bg-shape2-1 sec-bg-shape2-1 text-white jump shape-mockup" data-bottom="9%" data-left="3%">
        <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
      </div>
      <div className="container">
        <div className="row justify-content-lg-between justify-content-center align-items-center">
          <div className="col-xxl-6 col-xl-7 col-lg-6">
            <div className="title-area text-lg-start text-center">
              <h2 className="sec-title text-white">{home?.heading || "Browse Our Latest Projects"}</h2>
              <p className="sec-text text-white">{home?.main_content ?? "Explore our latest design masterpiece, showcasing innovation, functionality, and aesthetic brilliance."}</p>
            </div>
          </div>
          <div className="col-auto">
            <div className="sec-btn">
              <a href={link} className="th-btn style-border3 th-btn-icon" {...(external ? { target: "_blank", rel: "noopener" } : {})}>
                {home?.button_text || "Browse All Project"}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid p-0">
        <div className="slider-area project-slider2">
          <div className="swiper th-slider" id="projectSlider2" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"3"},"1200":{"slidesPerView":"3"}}}'>
            <div className="swiper-wrapper">
              {projects.map((p) => (
                <div className="swiper-slide" key={p.id}>
                  <div className="portfolio-card style2">
                    <div className="portfolio-img img-shine" style={{ width: "100%", height: 278 }}>
                      <ProjectPopup project={toPopup(p, sectors)}>
                        <img src={media(p.project_image)} alt={p.project_image_alt || p.project_name || "Project"} loading="lazy" />
                        <div className="portfolio-card-shape"><img src={media(p.project_image)} alt="" loading="lazy" /></div>
                      </ProjectPopup>
                    </div>
                    <div className="portfolio-content">
                      <h3 className="portfolio-title"><ProjectPopup project={toPopup(p, sectors)}>{p.project_name}</ProjectPopup></h3>
                      <p className="portfolio-text">{truncate(p.description, 60)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button data-slider-prev="#projectSlider2" className="slider-arrow slider-prev" aria-label="Previous"><img src="/frontend/assets/img/icon/arrow-left.svg" alt="" /></button>
        </div>
      </div>
    </section>
  );
}
