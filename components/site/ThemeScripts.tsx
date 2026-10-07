"use client";

import { useEffect } from "react";

// The theme's jQuery plugins rewrite the DOM (sliders, masks, background images).
// Loading them after React has hydrated keeps those edits from clashing with hydration.
// (Isotope, imagesLoaded and GSAP were dropped: nothing on the site uses them.)
const SCRIPTS = [
  "/frontend/assets/js/vendor/jquery-3.7.1.min.js",
  "/frontend/assets/js/swiper-bundle.min.js",
  "/frontend/assets/js/bootstrap.min.js",
  "/frontend/assets/js/jquery.magnific-popup.min.js",
  "/frontend/assets/js/jquery.counterup.min.js",
  "/frontend/assets/js/main.v2.js",
  "/js/site.js",
];

// async = false: the browser downloads all scripts in parallel but still runs them in this order.
function load(src: string) {
  const el = document.createElement("script");
  el.src = src;
  el.async = false;
  document.body.appendChild(el);
}

export default function ThemeScripts() {
  useEffect(() => {
    if ((window as unknown as { __themeLoaded?: boolean }).__themeLoaded) return;
    (window as unknown as { __themeLoaded?: boolean }).__themeLoaded = true;
    SCRIPTS.forEach(load);
  }, []);
  return null;
}
