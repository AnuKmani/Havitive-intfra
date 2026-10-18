"use client";

import { useCallback, useEffect, useState } from "react";

export type CsrItem = { id: number; title: string; description: string | null; image: string; alt: string; date: string | null };

/** CSR activity cards. Clicking one opens a popup that slides through all activities with their text. */
export default function CsrGallery({ items }: { items: CsrItem[] }) {
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
        {items.map((it, i) => (
          <article className="sc-card csr-card" key={it.id}>
            <button type="button" className="csr-open" onClick={() => setOpen(i)} aria-label={`Open ${it.title}`}>
              <span className="sc-media"><img src={it.image} alt={it.alt} loading="lazy" /></span>
              <span className="sc-body">
                {it.date && <span className="sc-meta">{it.date}</span>}
                <span className="sc-title csr-title">{it.title}</span>
                {it.description && <span className="sc-text csr-short">{it.description}</span>}
              </span>
            </button>
          </article>
        ))}
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
