"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type PopupProject = {
  href: string;
  name: string;
  /** Cover image first, then the gallery. */
  images: string[];
  imageAlt: string;
  description: string;
  category?: string | null;
  client?: string | null;
  date?: string | null;
  location?: string | null;
  /** Embeddable video address (YouTube / Vimeo), when the project has one. */
  video?: string | null;
};

/** A link that opens the project's key details in a popup instead of leaving the page. */
export default function ProjectPopup({ project, children, className, style, ariaLabel }: {
  project: PopupProject; children: ReactNode; className?: string; style?: React.CSSProperties; ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const rows: [string, string | null | undefined][] = [
    ["Category", project.category], ["Clients", project.client], ["Project Date", project.date], ["Locations", project.location],
  ];

  return (
    <>
      <a href={project.href} className={className} style={style} aria-label={ariaLabel} onClick={(e) => { e.preventDefault(); setCurrent(0); setPlaying(false); setOpen(true); }}>
        {children}
      </a>
      {open && createPortal(
        <div className="pp-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="pp-box" role="dialog" aria-modal="true" aria-label={project.name}>
            <button type="button" className="pp-close" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
            {playing && project.video ? (
              <div className="pp-video"><iframe src={project.video} title={`${project.name} video`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
            ) : (
              <img className="pp-img" src={project.images[current] ?? project.images[0]} alt={project.imageAlt} />
            )}
            {(project.images.length > 1 || project.video) && (
              <div className="pp-thumbs">
                {project.images.map((src, i) => (
                  <button type="button" key={src + i} className={i === current && !playing ? "on" : ""} aria-label={`Show image ${i + 1}`} onClick={() => { setCurrent(i); setPlaying(false); }}>
                    <img src={src} alt="" loading="lazy" />
                  </button>
                ))}
                {project.video && (
                  <button type="button" className={`pp-play${playing ? " on" : ""}`} onClick={() => setPlaying(true)} aria-label="Play project video">▶ Video</button>
                )}
              </div>
            )}
            <h3 className="pp-title">{project.name}</h3>
            <div className="pp-grid">
              <p className="pp-desc">{project.description}</p>
              <ul className="pp-meta">
                {rows.filter(([, v]) => v?.trim()).map(([k, v]) => (
                  <li key={k}><strong>{k}:</strong> {v}</li>
                ))}
              </ul>
            </div>
            <a className="th-btn style-border3 th-btn-icon pp-more" href={project.href}>View full project</a>
          </div>
          <style>{`
            .pp-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.7);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px}
            .pp-box{position:relative;background:#05202f;color:#c5d0d8;border-radius:20px;padding:40px;width:100%;max-width:1250px;margin:auto}
            .pp-close{position:absolute;top:12px;right:16px;width:36px;height:36px;border-radius:50%;border:0;background:#fff;color:#05202f;font-size:24px;line-height:1;cursor:pointer}
            .pp-img{width:100%;max-width:608px;height:auto;max-height:342px;object-fit:cover;border-radius:20px;display:block}
            .pp-thumbs{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
            .pp-thumbs button{padding:0;border:2px solid transparent;border-radius:10px;overflow:hidden;background:none;cursor:pointer;opacity:.65;width:96px;height:64px}
            .pp-thumbs button.on{border-color:#fff;opacity:1}
            .pp-thumbs img{width:100%;height:100%;object-fit:cover;display:block}
            .pp-video{position:relative;width:100%;max-width:608px;aspect-ratio:16/9;border-radius:20px;overflow:hidden;background:#000}
            .pp-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
            .pp-thumbs .pp-play{width:auto;padding:0 16px;height:64px;background:#fff;color:#05202f;font-weight:700;opacity:.9}
            .pp-thumbs .pp-play.on{border-color:#ffd24a;opacity:1}
            .pp-title{color:#fff;margin:28px 0 12px;font-size:32px}
            .pp-grid{display:flex;gap:40px;flex-wrap:wrap;justify-content:space-between}
            .pp-desc{flex:1 1 320px;margin:0}
            .pp-meta{flex:0 1 420px;list-style:none;margin:0;padding:0}
            .pp-meta li{margin-bottom:14px}
            .pp-meta strong{color:#e3e9ee}
            .pp-more{margin-top:24px}
            @media(max-width:575px){.pp-box{padding:24px 18px}.pp-title{font-size:24px}}
          `}</style>
        </div>,
        document.body,
      )}
    </>
  );
}
