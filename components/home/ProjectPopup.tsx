"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type PopupProject = {
  href: string;
  name: string;
  image: string;
  imageAlt: string;
  description: string;
  category?: string | null;
  client?: string | null;
  date?: string | null;
  location?: string | null;
};

/** A link that opens the project's key details in a popup instead of leaving the page. */
export default function ProjectPopup({ project, children, className, style, ariaLabel }: {
  project: PopupProject; children: ReactNode; className?: string; style?: React.CSSProperties; ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);

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
      <a href={project.href} className={className} style={style} aria-label={ariaLabel} onClick={(e) => { e.preventDefault(); setOpen(true); }}>
        {children}
      </a>
      {open && createPortal(
        <div className="pp-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="pp-box" role="dialog" aria-modal="true" aria-label={project.name}>
            <button type="button" className="pp-close" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
            <img className="pp-img" src={project.image} alt={project.imageAlt} />
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
