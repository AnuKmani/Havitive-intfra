import { media } from "@/lib/media";
import { SITE } from "@/lib/site";
import type { Home, OfferCard } from "@/lib/types";

const CARD_SLIDER = '{"breakpoints":{"0":{"slidesPerView":1},"576":{"slidesPerView":"1"},"768":{"slidesPerView":"2"},"992":{"slidesPerView":"2"},"1200":{"slidesPerView":"3"}}}';

type Card = { icon: string; title: string; text: string; img: string; href?: string };

function CardSlider({ cards, height }: { cards: Card[]; height: number }) {
  return (
    <div className="swiper th-slider" data-slider-options={CARD_SLIDER}>
      <div className="swiper-wrapper">
        {cards.map((c) => (
          <div className="swiper-slide" key={c.title}>
            <div className="service-card style2">
              <div className="service-card-icon"><img src={c.icon} alt="" /></div>
              <h3 className="box-title">{c.href ? <a href={c.href}>{c.title}</a> : c.title}</h3>
              <p className="box-text">{c.text}</p>
              <div className="service-img img-shine">
                <img src={c.img} alt={c.title} loading="lazy" style={{ width: 416, height, objectFit: "cover" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The three icons that come with the theme; the cards use them in turn. */
const OFFER_ICONS = [1, 2, 3].map((n) => `/frontend/assets/img/icon/service-icon2-${n}.svg`);

export function WhatWeOffer({ home, cards }: { home?: Home | null; cards: OfferCard[] }) {
  return (
    <section className="service-area-2 rounded-80 space bg-smokes">
      <div className="sec-bg-shape2-1 spin shape-mockup d-xl-block d-none" data-bottom="5%" data-left="12%">
        <img src="/frontend/assets/img/shape/section_shape_2_1.jpg" alt="" />
      </div>
      <div className="sec-bg-shape2-2 wave-anim shape-mockup d-xl-block d-none" data-top="-3%" data-left="5%" data-bg-src="/frontend/assets/img/shape/section_shape_2_2.jpg"></div>
      <div className="sec-bg-shape2-3 jump shape-mockup d-xl-block d-none" data-top="10%" data-right="2%">
        <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
      </div>
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-lg-6">
            <div className="title-area">
              <h2 className="sec-title">{home?.heading || "What we offer"}</h2>
              <p className="sec-text">{home?.main_content}</p>
            </div>
          </div>
          <div className="col-auto">
            <div className="sec-btn"><a href={`tel:${SITE.phones[0].tel}`} className="th-btn style2 th-btn-icon">{home?.button_text || "Talk to Experts"}</a></div>
          </div>
        </div>
        {cards.length > 0 && (
          <CardSlider
            height={234}
            cards={cards.map((c, i) => ({
              icon: OFFER_ICONS[i % OFFER_ICONS.length],
              title: c.title ?? "",
              text: c.text ?? "",
              img: media(c.img),
            }))}
          />
        )}
      </div>
    </section>
  );
}

export function WhyChooseUs() {
  return (
    <section className="service-area-2 space bg-smokes">
      <div className="sec-bg-shape2-3 jump shape-mockup d-xl-block d-none" data-top="10%" data-right="2%">
        <img src="/frontend/assets/img/shape/section_shape_2_3.jpg" alt="" />
      </div>
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-lg-6">
            <div className="title-area">
              <h2 className="sec-title">Why Choose Us</h2>
              <p className="sec-text">With over a decade of expertise, our skilled team delivers creative and practical solutions tailored to your unique needs.</p>
            </div>
          </div>
          <div className="col-auto">
            <div className="sec-btn"><a href={SITE.whatsapp} className="th-btn style2 th-btn-icon">Quick Connect</a></div>
          </div>
        </div>
        <CardSlider
          height={312}
          cards={[
            { icon: "/frontend/assets/img/icon/service-icon2-1.svg", title: "Creative Professionals", text: "Our team of architects and designers excels in crafting innovative and functional designs that reflect your vision.", img: "/upload/logos/team.jpeg" },
            { icon: "/frontend/assets/img/icon/service-icon2-2.svg", title: "Tailored Solutions", text: "We offer customized design solutions, managing every detail from concept to completion smoothly and seamlessly.", img: "/upload/logos/customer.webp" },
            { icon: "/frontend/assets/img/icon/service-icon2-3.svg", title: "Client-Centric Approach", text: "Your satisfaction is our priority. We deliver designs that are functional, stylish, and perfectly aligned with your goals.", img: "/upload/logos/safety.jpeg" },
          ]}
        />
      </div>
    </section>
  );
}
