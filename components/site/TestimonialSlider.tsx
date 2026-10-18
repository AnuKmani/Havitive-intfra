"use client";

import { useRef } from "react";

export type TestimonialSlide = { id: number; text: string; name: string; role: string | null; photo: string; alt: string };

/** Written testimonials in one compact row that slides sideways. */
export default function TestimonialSlider({ items }: { items: TestimonialSlide[] }) {
  const track = useRef<HTMLDivElement>(null);
  const move = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div className="ts-wrap">
      <button type="button" className="ts-arrow prev" onClick={() => move(-1)} aria-label="Previous testimonials">‹</button>
      <div className="ts-track" ref={track}>
        {items.map((t) => (
          <figure className="ts-card" key={t.id}>
            <div className="ts-stars" aria-label="5 out of 5 stars">★★★★★</div>
            <blockquote>{t.text}</blockquote>
            <figcaption>
              <img src={t.photo} alt={t.alt} loading="lazy" />
              <span><strong>{t.name}</strong>{t.role && <em>{t.role}</em>}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <button type="button" className="ts-arrow next" onClick={() => move(1)} aria-label="Next testimonials">›</button>
    </div>
  );
}
