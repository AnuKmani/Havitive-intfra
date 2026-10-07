const MASK = "/frontend/assets/img/theme-img/aminities-shape1.png";

export type StrengthItem = { title: string; icon: string; img?: string; imgAlt?: string | null };

export default function Strengths({ heading, intro, items }: { heading: string; intro: string; items: StrengthItem[] }) {
  return (
    <section className="space overflow-hidden">
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-xl-6 col-lg-8">
            <div className="title-area text-center">
              <span className="shadow-title style2">Our Strength</span>
              <h2 className="sec-title">{heading}</h2>
              <p className="sec-text text-title">{intro}</p>
            </div>
          </div>
        </div>
        <div className="swiper th-slider aminities-slider" id="aminitiesSlider1" data-slider-options='{"breakpoints":{"0":{"slidesPerView":1},"375":{"slidesPerView":"2"},"768":{"slidesPerView":"3"},"992":{"slidesPerView":"4"},"1200":{"slidesPerView":"6"}}}'>
          <div className="swiper-wrapper">
            {items.map((s) => (
              <div className="swiper-slide" key={s.title}>
                <div className="aminities-card" data-mask-src={MASK}>
                  {s.img && (
                    <div className="aminities-card-img">
                      <img src={s.img} alt={s.imgAlt || s.title} loading="lazy" style={{ width: 196, height: 240, objectFit: "cover" }} />
                    </div>
                  )}
                  <div className="aminities-content">
                    <div className="aminities-card-icon"><img src={s.icon} alt="" style={{ width: 50, height: 50 }} /></div>
                    <h3 className="box-title">{s.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="slider-pagination"></div>
          <button data-slider-prev="#aminitiesSlider1" className="slider-arrow slider-prev" aria-label="Previous"><img src="/frontend/assets/img/icon/arrow-left.svg" alt="" /></button>
          <button data-slider-next="#aminitiesSlider1" className="slider-arrow slider-next" aria-label="Next"><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></button>
        </div>
      </div>
    </section>
  );
}
