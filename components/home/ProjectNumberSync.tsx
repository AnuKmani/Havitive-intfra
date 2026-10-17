"use client";

import { useEffect } from "react";

/**
 * Keeps the big number beside the Completed Projects slider in step with the slider:
 * 01, 02, 03 ... then 04, 05, 06 as the slider moves on. The template only has 4 number
 * slots, so the active slot is reused and its text is replaced.
 */
export default function ProjectNumberSync({ sliderId, slots }: { sliderId: string; slots: number }) {
  useEffect(() => {
    let off: (() => void) | undefined;
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(sliderId) as (HTMLElement & { swiper?: any }) | null;
      const swiper = el?.swiper;
      if (!swiper) {
        if (++tries > 50) window.clearInterval(timer);
        return;
      }
      window.clearInterval(timer);
      const tabs = Array.from(document.querySelectorAll<HTMLElement>(`[data-slider-tab="#${sliderId}"] .tab-btn`));
      const sync = () => {
        const index: number = swiper.realIndex ?? 0;
        tabs.forEach((tab, i) => {
          const active = i === index % slots;
          tab.classList.toggle("active", active);
          const span = tab.querySelector("span");
          if (span) span.textContent = String((active ? index : i) + 1).padStart(2, "0");
        });
      };
      // Run after the template's own slideChange handler, which only knows 4 slots.
      const onChange = () => window.setTimeout(sync, 0);
      swiper.on("slideChange", onChange);
      sync();
      off = () => swiper.off("slideChange", onChange);
    }, 100);
    return () => {
      window.clearInterval(timer);
      off?.();
    };
  }, [sliderId, slots]);

  return null;
}
