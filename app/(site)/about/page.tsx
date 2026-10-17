import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo-page";
import Breadcrumb from "@/components/site/Breadcrumb";
import Strengths from "@/components/site/Strengths";
import { getAboutPage, getAboutStrengths, getCompanies, getTeam } from "@/lib/data";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";
import { richText } from "@/lib/text";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:about");
}

/** The wording of every block comes from Admin > About page. */
export default async function AboutPage() {
  const [page, strengths, companies, management, team] = await Promise.all([
    getAboutPage(), getAboutStrengths(), getCompanies(), getTeam("management"), getTeam("team"),
  ]);
  const a = page;
  const chairmanLink = a?.chairman_button_link?.trim() || SITE.social.instagram;
  const chairmanExternal = /^https?:\/\//.test(chairmanLink);

  return (
    <>
      <Breadcrumb title="About Us" trail={[{ name: "About Us", href: "/about" }]} />

      <div className="overflow-hidden space">
        <div className="sec-bg-shape2-1 jump shape-mockup d-xl-block d-none" data-bottom="0%" data-left="5%">
          <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
        </div>
        <div className="container" id="mission">
          <div className="about-page-wrap">
            <div className="row gy-40 justify-content-between align-items-center">
              <div className="col-lg-6">
                <div className="title-area mb-0">
                  <h2 className="sec-title text-theme mb-2">{a?.mission_title || "Havitive Vision & Mission"}</h2>
                  <div className="text-theme rich-text" dangerouslySetInnerHTML={{ __html: richText(a?.mission_text) }} />
                </div>
              </div>
              <div className="col-lg-5">
                <div className="img-box3">
                  <div className="img1"><img src={media(a?.mission_image)} alt={a?.mission_image_alt || "Havitive mission"} /></div>
                  <div className="about-tag">
                    <div className="about-experience-tag"><span className="circle-title-anime">Havitive Infra Pvt Ltd</span></div>
                    <a href={SITE.video} className="play-btn popup-video" aria-label="Play video"><i className="fa-sharp fa-solid fa-play"></i></a>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="img-box3"><div className="img1"><img src={media(a?.vision_image)} alt={a?.vision_image_alt || "Havitive vision"} loading="lazy" /></div></div>
              </div>
              <div className="col-lg-6">
                <div className="text-theme rich-text" dangerouslySetInnerHTML={{ __html: richText(a?.vision_text) }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space bg-theme" id="group-of-companies">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6">
              <div className="title-area">
                {a?.companies_kicker && <span className="shadow-title">{a.companies_kicker}</span>}
                <h2 className="sec-title text-white">{a?.companies_title || "Group of Companies"}</h2>
                <p className="sec-text text-white">{a?.companies_text}</p>
              </div>
            </div>
          </div>
          {companies.map((c, i) => (
            <div className="property-card-wrap" key={c.id}>
              <div className="property-thumb img-shine" data-mask-src="/frontend/assets/img/shape/property-card1-img-mask.png">
                <img src={media(c.compani_img)} alt={c.compani_img_alt || c.company_name || "Havitive company"} loading="lazy" style={{ width: 338, height: 298, objectFit: "cover" }} />
              </div>
              <div className="property-card">
                <div className="property-card-number">{String(i + 1).padStart(2, "0")}</div>
                <div className="property-card-details">
                  <span className="property-card-subtitle">Havitive Group</span>
                  <h3 className="property-card-title h4">{c.link ? <a href={c.link}>{c.company_name}</a> : c.company_name}</h3>
                  <p className="property-card-text">{c.company_description}</p>
                  <div className="property-btn-wrap">
                    <div className="property-author-wrap">
                      <img src={media(c.compani_logo)} alt={c.compani_logo_alt || ""} style={{ width: 40, height: 40, objectFit: "contain" }} />
                      <span>Havitive</span>
                    </div>
                    <a href={c.link || "/contact"} className="th-btn btn-mask2 th-btn-icon">Details</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {strengths.length > 0 && (
        <Strengths
          heading={a?.why_title || "Why Havitive Infra Pvt Ltd?"}
          intro={a?.why_text ?? ""}
          items={strengths.map((s) => ({ title: s.title ?? "", icon: media(s.icon) }))}
        />
      )}

      <div className="container">
        <div className="video-area-1">
          <div className="vido_detailss">
            <div className="title-area mb-45">
              <h2 className="sec-title">{a?.chairman_title || "Message from the Chairman"}</h2>
              <p className="sec-text text-title">{a?.chairman_text}</p>
            </div>
            <div className="btn-wrap mb-55">
              <a href={chairmanLink} className="th-btn style2 th-btn-icon" style={{ borderRadius: 50 }} {...(chairmanExternal ? { target: "_blank", rel: "noopener" } : {})}>
                {a?.chairman_button_text || "Connect"}
              </a>
            </div>
            <div className="author-grid">
              <div className="author-profile">
                <div className="avater"><img src={media(a?.chairman_photo)} alt={a?.chairman_photo_alt || a?.chairman_name || "Chairman"} style={{ width: 57, height: 77, objectFit: "cover" }} /></div>
                <div className="media-body">
                  <h3 className="author-profile-name h5">{a?.chairman_name}</h3>
                  <p className="author-desig">{a?.chairman_role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="team-area-1 space-bottom bg-theme" id="leadership">
        <div className="container z-index-common">
          <div className="row justify-content-between align-items-center">
            <div className="col-xl-5 col-lg-7">
              <div className="title-area">
                {a?.management_kicker && <span className="shadow-title">{a.management_kicker}</span>}
                <h2 className="sec-title text-white">{a?.management_title || "Our Management Team"}</h2>
                <p className="sec-text text-white">{a?.management_text}</p>
              </div>
            </div>
          </div>
          <div className="slider-area team-slider3">
            <div className="swiper th-slider" id="teamSlider3" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"2"},"768":{"slidesPerView":"3"},"992":{"slidesPerView":"4"},"1400":{"slidesPerView":"4"}}}'>
              <div className="swiper-wrapper">
                {management.map((m) => (
                  <div className="swiper-slide" key={m.id}>
                    <div className="th-team team-card style3">
                      <div className="img-wrap">
                        <div className="team-img"><img src={media(m.img)} alt={m.img_alt || m.name || "Team member"} loading="lazy" /></div>
                        <div className="th-social-wrap">
                          <a className="icon-btn" href={routes.team(m)} aria-label={`About ${m.name}`}><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></a>
                        </div>
                      </div>
                      <div className="team-card-content">
                        <div className="media-left">
                          <h3 className="box-title"><a href={routes.team(m)}>{m.name}</a></h3>
                          <span className="team-desig">{m.designation}</span>
                        </div>
                        {m.phone && <a className="icon-btn" href={`tel:${m.phone}`} aria-label={`Call ${m.name}`}><img src="/frontend/assets/img/icon/phone.svg" alt="" /></a>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button data-slider-prev="#teamSlider3" className="slider-arrow style6 slider-prev" aria-label="Previous"><img src="/frontend/assets/img/icon/arrow-left.svg" alt="" /></button>
            <button data-slider-next="#teamSlider3" className="slider-arrow style6 slider-next" aria-label="Next"><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></button>
          </div>
        </div>
      </section>

      <section className="bg-theme">
        <div className="sec-bg-shape2-3 jump shape-mockup d-xxl-block d-none text-white" data-bottom="5%" data-right="8%">
          <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
        </div>
        <div className="container">
          <div className="row justify-content-lg-between align-items-center">
            <div className="col-lg-6">
              <div className="title-area" id="employee">
                <h2 className="sec-title text-white">{a?.employees_title || "Our Employees"}</h2>
                <p className="text-light">{a?.employees_text}</p>
              </div>
            </div>
          </div>
          <div className="swiper th-slider team-slider1" id="teamSlider1" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"2"},"768":{"slidesPerView":"3"},"992":{"slidesPerView":"4"},"1200":{"slidesPerView":"4"}}}'>
            <div className="swiper-wrapper">
              {team.map((m) => (
                <div className="swiper-slide" key={m.id}>
                  <div className="th-team team-card">
                    <div className="img-wrap">
                      <div className="team-img" data-mask-src="/frontend/assets/img/theme-img/team-shape1.png">
                        <img src={media(m.img)} alt={m.img_alt || m.name || "Team member"} loading="lazy" />
                      </div>
                    </div>
                    <div className="team-card-content">
                      <div className="media">
                        <div className="media-left">
                          <h3 className="box-title"><a href={routes.team(m)}>{m.name}</a></h3>
                          <span className="team-desig">{m.designation}</span>
                        </div>
                        <div className="media-body">
                          {m.phone && <a className="icon-btn" href={`tel:${m.phone}`} aria-label={`Call ${m.name}`}><img src="/frontend/assets/img/icon/phone.svg" alt="" /></a>}
                        </div>
                      </div>
                      {m.linkedin && (
                        <div className="th-social">
                          <a target="_blank" rel="noopener" href={m.linkedin} aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="slider-pagination"></div>
            <button data-slider-prev="#teamSlider1" className="slider-arrow slider-prev" aria-label="Previous"><img src="/frontend/assets/img/icon/arrow-left.svg" alt="" /></button>
            <button data-slider-next="#teamSlider1" className="slider-arrow slider-next" aria-label="Next"><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></button>
          </div>
        </div>
      </section>

      <section className="space-bottom bg-theme overflow-hidden">
        <div className="container" style={{ marginTop: 46 }}>
          <div className="row gy-80 gx-40 align-items-center">
            <div className="col-xl-6">
              <div className="cta-thumb img-shine" data-mask-src="/frontend/assets/img/shape/cta_1_1-img-mask.png">
                <img src={media(a?.invest_image)} alt={a?.invest_image_alt || "Havitive team at work"} loading="lazy" style={{ width: 526, height: 370, borderRadius: 30, objectFit: "cover" }} />
              </div>
            </div>
            <div className="col-xl-6">
              <div className="me-xxl-5 pe-xxl-5">
                <div className="title-area">
                  {a?.invest_kicker && <span className="shadow-title">{a.invest_kicker}</span>}
                  <h2 className="sec-title text-white">{a?.invest_title || "Invest With Us"}</h2>
                  <p className="sec-text text-white">{a?.invest_text}</p>
                </div>
                <div className="btn-wrap">
                  <a href={`mailto:${SITE.email}`} className="th-btn btn-mask th-btn-icon">Get Started</a>
                  <a href={`tel:${SITE.phones[0].tel}`} className="th-btn btn-mask2 th-btn-icon">Contact Us</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
