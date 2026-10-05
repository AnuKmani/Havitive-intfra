"use client";

import { useEffect } from "react";

// The theme's jQuery plugins rewrite the DOM (sliders, masks, background images).
// Loading them after React has hydrated keeps those edits from clashing with hydration.
const SCRIPTS = [
  "/frontend/assets/js/vendor/jquery-3.7.1.min.js",
  "/frontend/assets/js/swiper-bundle.min.js",
  "/frontend/assets/js/bootstrap.min.js",
  "/frontend/assets/js/jquery.magnific-popup.min.js",
  "/frontend/assets/js/jquery.counterup.min.js",
  "/frontend/assets/js/imagesloaded.pkgd.min.js",
  "/frontend/assets/js/isotope.pkgd.min.js",
  "/frontend/assets/js/gsap.min.js",
  "/frontend/assets/js/main.js",
  "/js/site.js",
];

function load(src: string) {
  return new Promise<void>((resolve) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = false;
    el.onload = () => resolve();
    el.onerror = () => resolve();
    document.body.appendChild(el);
  });
}

export default function ThemeScripts() {
  useEffect(() => {
    if ((window as unknown as { __themeLoaded?: boolean }).__themeLoaded) return;
    (window as unknown as { __themeLoaded?: boolean }).__themeLoaded = true;
    (async () => {
      for (const src of SCRIPTS) await load(src);
    })();
  }, []);
  return null;
}
