import type { HomeBanner } from "@/lib/types";
import { media } from "@/lib/media";
import { SITE } from "@/lib/site";

export default function Hero({ banners }: { banners: HomeBanner[] }) {
  return (
    <div className="hero-1" id="hero">
      <div className="swiper th-slider hero-slider1" id="heroSlide1" data-slider-options='{"effect":"fade", "autoHeight": "true"}'>
        <div className="swiper-wrapper">
          {banners.map((b, i) => (
            <div className="swiper-slide" key={b.id}>
              <div className="hero-inner" data-mask-src="/frontend/assets/img/hero/hero_1_bg_mask.png">
                <div className="th-hero-bg" data-bg-src={media(b.home_images)}></div>
                <div className="hero-big-text" aria-hidden="true">HAVITIVE</div>
                <div className="container">
                  <div className="row align-items-center">
                    <div className="col-lg-8">
                      <div className="hero-style1">
                        {/* Only the first slide carries the page's H1 */}
                        {i === 0 ? (
                          <h1 className="hero-title text-white">
                            <span className="title1" data-ani="slideindown" data-ani-delay="0.3s">{b.heading}</span>
                          </h1>
                        ) : (
                          <h2 className="hero-title text-white">
                            <span className="title1" data-ani="slideindown" data-ani-delay="0.3s">{b.heading}</span>
                          </h2>
                        )}
                        <p className="hero-text text-white" data-ani="slideinup" data-ani-delay="0.5s">{b.description}</p>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="hero-video-wrap text-center" data-ani="slideinright" data-ani-delay="0.4s">
                        <a href={SITE.video} className="play-btn style2 popup-video" aria-label="Play Havitive video">
                          <i className="fa-sharp fa-solid fa-play"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="slider-pagination"></div>
      </div>
      <div className="hero-social-link">
        <div className="social-wrap">
          <a href={SITE.social.youtube}>YOUTUBE</a>
          <a href={SITE.social.instagram}>INSTAGRAM</a>
          <a href={SITE.social.facebook}>FACEBOOK</a>
        </div>
      </div>
      <div className="scroll-down">
        <a href="#about-sec" className="hero-scroll-wrap"><i className="fal fa-long-arrow-left"></i>Scroll</a>
      </div>
    </div>
  );
}
