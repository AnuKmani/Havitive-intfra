"use client";

import { useCallback, useEffect, useState } from "react";

export type VideoItem = { id: number; embed: string; poster: string | null; title: string; text: string | null };

/** Video testimonial cards. Pressing one plays it in a popup; arrows (or the arrow keys) slide to the next video. */
export default function VideoGallery({ items }: { items: VideoItem[] }) {
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
      <div className="sc-grid">
        {items.map((v, i) => (
          <article className="sc-card sc-video" key={v.id}>
            <div className="sc-media">
              <button type="button" className="sc-play" onClick={() => setOpen(i)} aria-label={`Play video: ${v.title}`}>
                {v.poster && <img src={v.poster} alt="" loading="lazy" />}
                <span className="sc-play-icon" aria-hidden="true"><i className="fa-sharp fa-solid fa-play"></i></span>
              </button>
            </div>
            <div className="sc-body">
              <h3 className="sc-title">{v.title}</h3>
              {v.text && <p className="sc-text csr-short">{v.text}</p>}
            </div>
          </article>
        ))}
      </div>

      {cur && (
        <div className="csr-modal" role="dialog" aria-modal="true" aria-label={cur.title} onClick={() => setOpen(null)}>
          <div className="csr-dialog" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="csr-close" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <div className="csr-stage">
              <iframe
                key={cur.id}
                src={cur.embed}
                title={cur.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
            <div className="vg-bar">
              <button type="button" className="vg-btn" onClick={() => go(-1)} aria-label="Previous video">‹ Prev</button>
              <div className="vg-info">
                <h3>{cur.title}</h3>
                <span className="csr-count">{(open ?? 0) + 1} / {count}</span>
              </div>
              <button type="button" className="vg-btn" onClick={() => go(1)} aria-label="Next video">Next ›</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
