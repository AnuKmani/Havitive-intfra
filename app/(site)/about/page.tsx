import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import Strengths from "@/components/site/Strengths";
import { getCompanies, getTeam } from "@/lib/data";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us – Vision, Group Companies & Leadership",
  description:
    "Learn about Havitive Infra Pvt Ltd: our vision and mission, the Havitive group of companies (constructions, architectural studio, engineering consultancy, interiors) and the management team behind our projects in Kerala.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [companies, management, team] = await Promise.all([getCompanies(), getTeam("management"), getTeam("team")]);
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
                  <h2 className="sec-title text-theme mb-2">Havitive Vision &amp; Mission</h2>
                  <p className="mb-0 text-theme">Our vision is to redefine the standards of excellence in the design consultancy industry by becoming a trusted leader known for our innovation, integrity, and dedication to quality. We aspire to be the preferred partner for clients seeking unique, sustainable, and functional designs.</p>
                  <p className="text-theme">Through continuous growth, collaboration, and the pursuit of perfection, we aim to foster long-term relationships built on trust and mutual success. Our goal is to empower businesses, communities, and individuals by delivering design solutions that enhance their spaces and elevate their experiences.</p>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="img-box3">
                  <div className="img1"><img src="/upload/logos/mission.png" alt="Havitive mission" /></div>
                  <div className="about-tag">
                    <div className="about-experience-tag"><span className="circle-title-anime">Havitive Infra Pvt Ltd</span></div>
                    <a href={SITE.video} className="play-btn popup-video" aria-label="Play video"><i className="fa-sharp fa-solid fa-play"></i></a>
                  </div>
                </div>
              </div>
              <div className="col-lg-5">
                <div className="img-box3"><div className="img1"><img src="/upload/logos/vision.jpg" alt="Havitive vision" loading="lazy" /></div></div>
              </div>
              <div className="col-lg-6">
                <p className="text-theme">At Havitive, we are passionate about delivering design solutions that combine innovation, quality, and sustainability. Our mission is to transform visions into impactful realities by crafting designs that inspire and endure.</p>
                <p className="text-theme">With a focus on creativity and precision, we strive to meet and exceed client expectations, ensuring that every project reflects our commitment to excellence. By integrating eco-friendly practices and cutting-edge technologies, we create solutions that not only meet today&rsquo;s needs but also contribute to a better tomorrow.</p>
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
                <span className="shadow-title">Havitive</span>
                <h2 className="sec-title text-white">Group of Companies</h2>
                <p className="sec-text text-white">Our group spans diverse sectors, offering innovative and reliable solutions across industries, driven by creativity and excellence.</p>
              </div>
            </div>
          </div>
          {companies.map((c, i) => (
            <div className="property-card-wrap" key={c.id}>
              <div className="property-thumb img-shine" data-mask-src="/frontend/assets/img/shape/property-card1-img-mask.png">
                <img src={media(c.compani_img)} alt={c.company_name ?? "Havitive company"} loading="lazy" style={{ width: 338, height: 298, objectFit: "cover" }} />
              </div>
              <div className="property-card">
                <div className="property-card-number">{String(i + 1).padStart(2, "0")}</div>
                <div className="property-card-details">
                  <span className="property-card-subtitle">Havitive Group</span>
                  <h3 className="property-card-title h4">{c.link ? <a href={c.link}>{c.company_name}</a> : c.company_name}</h3>
                  <p className="property-card-text">{c.company_description}</p>
                  <div className="property-btn-wrap">
                    <div className="property-author-wrap">
                      <img src={media(c.compani_logo)} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />
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

      <Strengths
        heading="Why Havitive Infra Pvt Ltd?"
        intro="Our experienced team ensures every project is crafted with precision, completed on time, and exceeds industry standards."
        items={[
          { title: "Proven expertise in design consultancy.", icon: "/frontend/assets/img/icon/design.png" },
          { title: "Best-in-class tools and technology.", icon: "/frontend/assets/img/icon/technology.png" },
          { title: "Creative and dedicated team.", icon: "/frontend/assets/img/icon/team.png" },
          { title: "Timely project delivery.", icon: "/frontend/assets/img/icon/deadline.png" },
          { title: "Exceptional attention to detail.", icon: "/frontend/assets/img/icon/efficient.png" },
          { title: "Unparalleled client satisfaction.", icon: "/frontend/assets/img/icon/satisfaction.png" },
        ]}
      />

      <div className="container">
        <div className="video-area-1">
          <div className="vido_detailss">
            <div className="title-area mb-45">
              <h2 className="sec-title">Message from the Chairman</h2>
              <p className="sec-text text-title">At Havitive, we are passionate about creating innovative and sustainable designs that inspire and add value. We prioritize trust, precision, and creativity in every project. Together, let&rsquo;s shape the future of design.</p>
            </div>
            <div className="btn-wrap mb-55">
              <a href={SITE.social.instagram} className="th-btn style2 btn-mask th-btn-icon" style={{ backgroundColor: "black" }}>Connect</a>
            </div>
            <div className="author-grid">
              <div className="author-profile">
                <div className="avater"><img src="/upload/Management_team/mohan.jpeg" alt="Er. S Mohan" style={{ width: 57, height: 77, objectFit: "cover" }} /></div>
                <div className="media-body">
                  <h3 className="author-profile-name h5">Er. Mohan S</h3>
                  <p className="author-desig">Chairman of Havitive</p>
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
                <span className="shadow-title">Team</span>
                <h2 className="sec-title text-white">Our Management Team</h2>
                <p className="sec-text text-white">Havitive is guided by a visionary management team led by industry experts who bring years of experience and innovation to every project. Our leadership drives creativity, sustainability, and excellence, ensuring every design exceeds expectations.</p>
              </div>
            </div>
          </div>
          <div className="slider-area team-slider3">
            <div className="swiper th-slider" id="teamSlider3" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"3"},"1400":{"slidesPerView":"3"}}}'>
              <div className="swiper-wrapper">
                {management.map((m) => (
                  <div className="swiper-slide" key={m.id}>
                    <div className="th-team team-card style3">
                      <div className="img-wrap">
                        <div className="team-img"><img src={media(m.img)} alt={m.name ?? "Team member"} loading="lazy" /></div>
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
                <h2 className="sec-title text-white">Our Employees</h2>
                <p className="text-light">Our team consists of skilled architects, designers, and consultants dedicated to delivering innovative, sustainable, and cost-effective solutions. Through continuous training and teamwork, our professionals uphold our commitment to precision and client satisfaction in every project.</p>
              </div>
            </div>
          </div>
          <div className="swiper th-slider team-slider1" id="teamSlider1" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}}}'>
            <div className="swiper-wrapper">
              {team.map((m) => (
                <div className="swiper-slide" key={m.id}>
                  <div className="th-team team-card">
                    <div className="img-wrap">
                      <div className="team-img" data-mask-src="/frontend/assets/img/theme-img/team-shape1.png">
                        <img src={media(m.img)} alt={m.name ?? "Team member"} loading="lazy" style={{ width: 416, height: 550, objectFit: "cover" }} />
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
                <img src="/upload/logos/havitive.jpeg" alt="Havitive team at work" loading="lazy" style={{ width: 526, height: 370, borderRadius: 30, objectFit: "cover" }} />
              </div>
            </div>
            <div className="col-xl-6">
              <div className="me-xxl-5 pe-xxl-5">
                <div className="title-area">
                  <span className="shadow-title">CONSULTING</span>
                  <h2 className="sec-title text-white">Invest With Us</h2>
                  <p className="sec-text text-white">Let us bring your vision to life with creative, reliable, and sustainable design solutions to your unique needs.</p>
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
