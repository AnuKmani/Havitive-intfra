"use client";

import { useCallback, useEffect, useState } from "react";

export type CsrItem = { id: number; title: string; description: string | null; image: string; alt: string; date: string | null };
export type GalleryVariant = "csr" | "handover" | "awards" | "media";

/**
 * Picture cards that open a popup. The popup slides through every item on the page with its text.
 * `variant` only changes how the cards look: CSR, handing over events, awards or the media gallery.
 */
export default function PopupGallery({ items, variant = "csr" }: { items: CsrItem[]; variant?: GalleryVariant }) {
  const [open, setOpen] = useState<number | null>(null);
  const count = items.length;
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, go]);

  const cur = open === null ? null : items[open];

  return (
    <>
      <div className={variant === "media" ? "mg-grid" : variant === "awards" ? "aw-grid" : "sc-grid"}>
        {items.map((it, i) => {
          if (variant === "media") {
            return (
              <button type="button" className="mg-tile" key={it.id} onClick={() => setOpen(i)} aria-label={`Open ${it.title}`}>
                <img src={it.image} alt={it.alt} loading="lazy" />
                <span className="mg-cap">{it.title}</span>
              </button>
            );
          }
          if (variant === "awards") {
            return (
              <button type="button" className="aw-card aw-open" key={it.id} onClick={() => setOpen(i)} aria-label={`Open ${it.title}`}>
                <span className="aw-photo">
                  <img src={it.image} alt={it.alt} loading="lazy" />
                  <span className="aw-ribbon" aria-hidden="true">★</span>
                </span>
                <span className="aw-body">
                  {it.date && <span className="aw-year">{it.date}</span>}
                  <span className="aw-name">{it.title}</span>
                </span>
              </button>
            );
          }
          return (
            <article className={`sc-card csr-card${variant === "handover" ? " ho-card" : ""}`} key={it.id}>
              <button type="button" className="csr-open" onClick={() => setOpen(i)} aria-label={`Open ${it.title}`}>
                <span className="sc-media">
                  <img src={it.image} alt={it.alt} loading="lazy" />
                  {variant === "handover" && it.date && <span className="ho-date ho-badge">{it.date}</span>}
                </span>
                <span className="sc-body">
                  {variant !== "handover" && it.date && <span className="sc-meta">{it.date}</span>}
                  <span className="sc-title csr-title">{it.title}</span>
                  {it.description && <span className="sc-text csr-short">{it.description}</span>}
                </span>
              </button>
            </article>
          );
        })}
      </div>

      {cur && (
        <div className="csr-modal" role="dialog" aria-modal="true" aria-label={cur.title} onClick={() => setOpen(null)}>
          <div className="csr-dialog" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="csr-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <div className="csr-stage">
              <button type="button" className="csr-nav prev" onClick={() => go(-1)} aria-label="Previous">‹</button>
              <img key={cur.id} className="csr-big" src={cur.image} alt={cur.alt} />
              <button type="button" className="csr-nav next" onClick={() => go(1)} aria-label="Next">›</button>
            </div>
            <div className="csr-info" key={`t${cur.id}`}>
              {cur.date && <span className="sc-meta">{cur.date}</span>}
              <h3>{cur.title}</h3>
              {cur.description && <p>{cur.description}</p>}
              <span className="csr-count">{(open ?? 0) + 1} / {count}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
