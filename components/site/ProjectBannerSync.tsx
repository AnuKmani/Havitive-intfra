"use client";

import { useEffect } from "react";

/** Makes the thumbnail strip under the project banner work: a click shows that image in the banner. */
export default function ProjectBannerSync() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let tries = 0;
    const timer = window.setInterval(() => {
      const mainEl = document.getElementById("propertySlider") as (HTMLElement & { swiper?: any }) | null;
      const thumbEl = document.querySelector<HTMLElement & { swiper?: any }>(".property-thumb-slider");
      const main = mainEl?.swiper;
      const thumbs = thumbEl?.swiper;
      if (!main || !thumbs || !thumbEl) {
        if (++tries > 50) window.clearInterval(timer);
        return;
      }
      window.clearInterval(timer);
      // The strip follows the banner; it should not slide on its own.
      thumbs.autoplay?.stop();
      const onClick = (e: Event) => {
        const slide = (e.target as HTMLElement).closest<HTMLElement>(".swiper-slide");
        const index = Number(slide?.getAttribute("data-swiper-slide-index"));
        if (!slide || Number.isNaN(index)) return;
        main.slideToLoop(index);
      };
      thumbEl.addEventListener("click", onClick);
      cleanup = () => thumbEl.removeEventListener("click", onClick);
    }, 100);
    return () => {
      window.clearInterval(timer);
      cleanup?.();
    };
  }, []);

  return null;
}
