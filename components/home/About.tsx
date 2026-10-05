import type { Home } from "@/lib/types";
import { media, splitList } from "@/lib/media";
import { SITE } from "@/lib/site";

const ABOUT_SLIDER = '{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"1","effect":"fade"},"992":{"slidesPerView":"3"},"1200":{"slidesPerView":"3"}},"effect":"coverflow","coverflowEffect":{"rotate":"0","stretch":"350","depth":"215","modifier":"1"},"centeredSlides":"true"}';

export default function About({ about }: { about: Home | null }) {
  const images = splitList(about?.home_images);
  return (
    <div className="overflow-hidden space" id="about-sec" style={{ backgroundColor: "white" }}>
      <div className="sec-bg-shape2-1 spin shape-mockup d-xl-block d-none" data-bottom="9%" data-right="13%">
        <img src="/frontend/assets/img/shape/section_shape_2_1.jpg" alt="" />
      </div>
      <div className="container" style={{ marginTop: 30 }}>
        <div className="row align-items-center flex-row-reverse">
          <div className="col-xl-7 mb-50 mb-xl-0">
            <div className="img-box2">
              <div className="slider-area">
                <div className="swiper th-slider about-thumb-slider" id="aboutSlider1" data-slider-options={ABOUT_SLIDER}>
                  <div className="swiper-wrapper">
                    {images.map((img) => (
                      <div className="swiper-slide" key={img}>
                        <div className="img1">
                          <img src={media(img, "upload/home_img")} alt="Havitive project" loading="lazy" style={{ width: "100%", height: "auto", objectFit: "cover" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button data-slider-next="#aboutSlider1" className="slider-arrow slider-next" aria-label="Next image">
                  <img src="/frontend/assets/img/icon/arrow-right.svg" alt="" />
                </button>
              </div>
              <div className="about-tag">
                <div className="about-experience-tag"><span className="circle-title-anime">Havitive Infra</span></div>
                <a href={SITE.video} className="play-btn popup-video" aria-label="Play video"><i className="fa-sharp fa-solid fa-play"></i></a>
              </div>
            </div>
          </div>
          <div className="col-xl-5">
            <div className="title-area mb-32">
              <h2 className="sec-title style2">Building Visions with Creativity, Precision, and Innovation</h2>
              <p className="sec-text">{about?.main_content}</p>
            </div>
            <div className="about-wrap2">
              <div className="checklist style2">
                <ul>
                  {["Quality real estate services", "100% Satisfaction guarantee", "Highly professional team", "Dealing always on time"].map((t) => (
                    <li key={t}><img src="/frontend/assets/img/icon/checkmark.svg" alt="" />{t}</li>
                  ))}
                </ul>
              </div>
              <div className="call-btn">
                <div className="icon-btn"><img src="/frontend/assets/img/icon/phone.svg" alt="" /></div>
                <div className="btn-content">
                  <h3 className="btn-title h6">Call Us 24/7</h3>
                  <span className="btn-text"><a href={`tel:${SITE.phones[0].tel}`}>{SITE.phones[0].label}</a></span>
                </div>
              </div>
            </div>
            <div className="btn-wrap mt-5">
              <a href="/about" className="th-btn style2 th-btn-icon">More About Havitive</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
