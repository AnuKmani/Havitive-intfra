import type { ShowcaseProject } from "@/lib/types";
import { media } from "@/lib/media";
import { SITE } from "@/lib/site";

export function portfolioData(p: ShowcaseProject) {
  return JSON.stringify({
    imageOne: media(p.residence_image_one),
    imageTwo: media(p.residence_image_two),
    heading: p.project_heading,
    description: p.project_descp,
    descriptionTwo: p.project_dec_two,
    category: p.project_category,
    client: p.client_name,
    date: p.project_date,
    location: p.location,
  });
}

/** Shared modal; cards with data-portfolio fill it (see public/js/site.js). */
export function PortfolioModal() {
  return (
    <div className="th-modal modal fade" id="portfolioModal" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="container">
            <button type="button" className="icon-btn btn-close bg-title-dark" data-bs-dismiss="modal" aria-label="Close">
              <i className="fa-regular fa-xmark" aria-hidden="true"></i>
            </button>
            <div className="page-single bg-title-dark">
              <div className="page-img mb-30" style={{ width: "50%" }}>
                <img className="w-100 rounded-20" src="/upload/no_image.jpg" alt="Project" id="modalImageOne" />
              </div>
              <div className="page-content">
                <h2 className="h3 page-title text-white fw-medium" id="modalHeading"></h2>
                <div className="row gy-30">
                  <div className="col-xl-7"><p className="mb-20 text-light" id="modalDescription"></p></div>
                  <div className="col-xl-5"><div className="checklist"><ul id="modalChecklist"></ul></div></div>
                </div>
                <div className="row gy-30 gx-40 align-items-center">
                  <div className="col-xl-6">
                    <div className="page-img mb-0" style={{ width: "50%" }}>
                      <img className="w-100 rounded-20" src="/upload/no_image.jpg" alt="Project" id="modalImageTwo" />
                    </div>
                  </div>
                  <div className="col-xl-6"><p className="text-light" id="modalDescriptionTwo"></p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Upcoming({ projects }: { projects: ShowcaseProject[] }) {
  return (
    <>
      <section className="project-area-1 space overflow-hidden" data-bg-src="/frontend/assets/img/bg/9.png" data-opacity="5" data-overlay="title">
        <div className="container-fluid">
          <div className="project-wrap1">
            <div className="project-number-pagination" data-slider-tab="#projectSlider1">
              {projects.slice(0, 4).map((p, i) => (
                <div className={`tab-btn${i === 0 ? " active" : ""}`} key={p.id}><span>{String(i + 1).padStart(2, "0")}</span></div>
              ))}
            </div>
            <div className="row gy-40 justify-content-between align-items-center">
              <div className="col-xl-4">
                <div className="project-title-wrap1">
                  <div className="title-area mb-40">
                    <span className="shadow-title">PROJECTS</span>
                    <h2 className="sec-title text-white">Our Future Projects</h2>
                    <p className="sec-text text-white mt-15">Our upcoming ventures highlight creativity, sustainability, and excellence in design. Stay tuned.</p>
                  </div>
                  <div className="btn-wrap"><a href={SITE.social.instagram} className="th-btn btn-mask th-btn-icon">Explore More</a></div>
                </div>
              </div>
              <div className="col-xl-8">
                <div className="slider-area project-slider1">
                  <div className="swiper th-slider" id="projectSlider1" data-slider-options='{"loop": true, "breakpoints": {"0": {"slidesPerView": 1}, "576": {"slidesPerView": 1}, "768": {"slidesPerView": 2}, "992": {"slidesPerView": 3}, "1200": {"slidesPerView": 3}}}'>
                    <div className="swiper-wrapper">
                      {projects.map((p) => (
                        <div className="swiper-slide" key={p.id}>
                          <div className="portfolio-card">
                            <div className="portfolio-img img-shine" data-bs-toggle="modal" data-bs-target="#portfolioModal" data-portfolio={portfolioData(p)} role="button" aria-label={`View ${p.project_heading ?? "project"}`}>
                              <img src={media(p.residence_image_one)} alt={p.project_heading ?? "Upcoming project"} loading="lazy" style={{ width: 371, height: 241, objectFit: "cover" }} />
                            </div>
                            <div className="portfolio-content">
                              <a href="#portfolioModal" data-bs-toggle="modal" data-bs-target="#portfolioModal" data-portfolio={portfolioData(p)} className="icon-btn" aria-label="View details">
                                <img src="/frontend/assets/img/icon/arrow-right.svg" alt="" />
                              </a>
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
      <PortfolioModal />
    </>
  );
}
