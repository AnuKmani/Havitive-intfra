import type { Client } from "@/lib/types";
import { media } from "@/lib/media";

export default function Clients({ clients }: { clients: Client[] }) {
  if (!clients.length) return null;
  return (
    <div className="client-area-1 space bg-title-dark overflow-hidden">
      <div className="container">
        <h2 className="visually-hidden-focusable">Our clients</h2>
        <div className="slider-area client-slider1">
          <div className="swiper th-slider has-shadow" id="clientSlider1" data-slider-options='{"breakpoints":{"0":{"slidesPerView":2},"576":{"slidesPerView":"3"},"768":{"slidesPerView":"4"},"992":{"slidesPerView":"5"},"1200":{"slidesPerView":"6"}}}'>
            <div className="swiper-wrapper">
              {clients.map((c) => (
                <div className="swiper-slide" key={c.id}>
                  <span className="client-card">
                    <img src={media(c.img)} alt={c.img_alt || "Havitive client logo"} loading="lazy" style={{ width: "100%", height: 100, objectFit: "contain" }} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
