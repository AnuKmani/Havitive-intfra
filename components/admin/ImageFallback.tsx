"use client";

import { useEffect } from "react";

// Swaps images that fail to load (e.g. photos still on the old server) for a neutral placeholder.
export default function ImageFallback() {
  useEffect(() => {
    const fix = (img: HTMLImageElement) => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = "1";
      img.src = "/upload/no_image.jpg";
    };
    const onError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) fix(e.target);
    };
    document.addEventListener("error", onError, true);
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) fix(img);
    });
    return () => document.removeEventListener("error", onError, true);
  }, []);
  return null;
}
