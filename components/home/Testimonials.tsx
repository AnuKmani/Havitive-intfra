import type { Testimonial } from "@/lib/types";
import { media } from "@/lib/media";

export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;
  return (
    <section className="overflow-hidden bg-title-dark">
      <div className="bg-smokes rounded-80 space">
        <div className="sec-bg-shape2-1 spin shape-mockup d-xxl-block d-none" data-bottom="8%" data-right="30%">
          <img src="/frontend/assets/img/shape/section_shape_2_1.jpg" alt="" />
        </div>
        <div className="sec-bg-shape2-3 jump shape-mockup d-xxl-block d-none" data-top="35%" data-left="0%">
          <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
        </div>
        <div className="container">
          <div className="row justify-content-lg-between justify-content-center align-items-center">
            <div className="col-xxl-6 col-lg-7">
              <div className="title-area text-lg-start text-center">
                <h2 className="sec-title">Our Trusted Voices</h2>
                <p className="sec-text">Hear from our satisfied clients about their experiences with Havitive Infra Pvt Ltd. Their trust and feedback inspire us to continue delivering excellence in every project.</p>
              </div>
            </div>
            <div className="col-auto">
              <div className="sec-btn">
                <div className="icon-box">
                  <button data-slider-prev="#testiSlider2" className="slider-arrow style4 default slider-prev" aria-label="Previous"><img src="/frontend/assets/img/icon/arrow-left.svg" alt="" /></button>
                  <button data-slider-next="#testiSlider2" className="slider-arrow style4 default slider-next" aria-label="Next"><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="testi-wrap2">
            <div className="swiper th-slider testi-slider2" id="testiSlider2" data-slider-options='{"spaceBetween":"48","breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"1"},"992":{"slidesPerView":"1"},"1200":{"slidesPerView":"2"}}}'>
              <div className="swiper-wrapper">
                {items.map((t) => (
                  <div className="swiper-slide" key={t.id}>
                    <div className="testi-grid-wrap2">
                      <div className="testi-grid-thumb">
                        <img src={media(t.img)} alt="" loading="lazy" style={{ width: 637, height: 469, objectFit: "cover" }} />
                      </div>
                      <div className="testi-card style2">
                        <div className="testi-grid_review" aria-label="5 out of 5 stars">
                          {[0, 1, 2, 3, 4].map((i) => <i key={i} className="fa-sharp fa-solid fa-star"></i>)}
                        </div>
                        <p className="testi-card_text">{t.desription}</p>
                        <div className="testi-card_profile">
                          <div className="quote-icon"><img src="/frontend/assets/img/icon/qoute2.svg" alt="" /></div>
                          <div className="avatar"><img src={media(t.client_img)} alt={t.client_name ?? ""} style={{ width: 40, height: 40 }} /></div>
                          <div className="testi-card_profile-details">
                            <h3 className="testi-card_name">{t.client_name}</h3>
                            <span className="testi-card_desig">{t.client_designation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
