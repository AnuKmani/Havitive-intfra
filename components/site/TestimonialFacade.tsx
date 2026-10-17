"use client";

import { useMemo, useState } from "react";

export type FacadeItem = {
  id: number;
  quote: string;
  name: string;
  role: string;
  photo: string;
  photoAlt: string;
  project: string | null;
  projectAlt: string;
};

const COLS = 4;

/** Where the lit windows go: spread over the facade, the same on the server and in the browser. */
function litPositions(count: number) {
  const rows = Math.max(4, Math.ceil(count / 2) + 3);
  const total = COLS * rows;
  const taken: number[] = [];
  let p = 1;
  while (taken.length < count) {
    if (!taken.includes(p % total)) taken.push(p % total);
    p += 5;
    if (p > total * 6) break;
  }
  return { total, lit: taken.sort((a, b) => a - b) };
}

/** A building front: every lit window is a client. Press one to read what they said. */
export default function TestimonialFacade({ items }: { items: FacadeItem[] }) {
  const [active, setActive] = useState(0);
  const { total, lit } = useMemo(() => litPositions(items.length), [items.length]);
  const current = items[active] ?? items[0];
  const go = (n: number) => setActive((n + items.length) % items.length);

  return (
    <div className="fx">
      <div className="fx-building">
        <div className="fx-roof" aria-hidden="true"><span>HAVITIVE</span></div>
        <div className="fx-wall" role="group" aria-label="Choose a client">
          {Array.from({ length: total }, (_, pos) => {
            const k = lit.indexOf(pos);
            if (k < 0) return <span className="fx-win" key={pos} aria-hidden="true" />;
            const it = items[k];
            return (
              <button
                type="button"
                key={pos}
                className={`fx-win lit${k === active ? " on" : ""}`}
                onClick={() => setActive(k)}
                aria-label={`Read the testimonial from ${it.name}`}
                aria-pressed={k === active}
              />
            );
          })}
        </div>
        <div className="fx-door" aria-hidden="true" />
        <p className="fx-hint">Each lit window is a client. Press one to read their story.</p>
      </div>

      <div className="fx-panel" key={current.id} aria-live="polite">
        <img className="fx-face" src={current.photo} alt={current.photoAlt} loading="lazy" />
        <div className="fx-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote>{current.quote}</blockquote>
        {current.project && <img className="fx-project" src={current.project} alt={current.projectAlt} loading="lazy" />}
        <div className="fx-who">
          <strong>{current.name}</strong>
          {current.role && <span>{current.role}</span>}
        </div>
        {items.length > 1 && (
          <div className="fx-nav">
            <button type="button" onClick={() => go(active - 1)} aria-label="Previous testimonial">←</button>
            <span>{active + 1} / {items.length}</span>
            <button type="button" onClick={() => go(active + 1)} aria-label="Next testimonial">→</button>
          </div>
        )}
      </div>
    </div>
  );
}
