"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ManagementMember = {
  href: string;
  name: string;
  designation: string | null;
  img: string;
  imgAlt: string;
  phone: string | null;
  email: string | null;
  linkedin: string | null;
  /** Position, experience and similar facts, already filtered to the ones that have a value. */
  facts: [string, string][];
  /** Already cleaned HTML of the "About" text. */
  aboutHtml: string;
};

/** A management team card: pressing it opens the member's details in a popup instead of a new page. */
export default function ManagementCard({ member: m }: { member: ManagementMember }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const show = (e: React.MouseEvent) => { e.preventDefault(); setOpen(true); };

  return (
    <>
      <div className="th-team team-card style3">
        <div className="img-wrap">
          <div className="team-img">
            <a href={m.href} onClick={show} aria-label={`About ${m.name}`}><img src={m.img} alt={m.imgAlt} loading="lazy" /></a>
          </div>
          <div className="th-social-wrap">
            <a className="icon-btn" href={m.href} onClick={show} aria-label={`About ${m.name}`}><img src="/frontend/assets/img/icon/arrow-right.svg" alt="" /></a>
          </div>
        </div>
        <div className="team-card-content">
          <div className="media-left">
            <h3 className="box-title"><a href={m.href} onClick={show}>{m.name}</a></h3>
            <span className="team-desig">{m.designation}</span>
          </div>
          {m.phone && <a className="icon-btn" href={`tel:${m.phone}`} aria-label={`Call ${m.name}`}><img src="/frontend/assets/img/icon/phone.svg" alt="" /></a>}
        </div>
      </div>
      {open && createPortal(
        <div className="tm-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="tm-box" role="dialog" aria-modal="true" aria-label={m.name}>
            <button type="button" className="tm-close" aria-label="Close" onClick={() => setOpen(false)}>&times;</button>
            <div className="tm-photo"><img src={m.img} alt={m.imgAlt} /></div>
            <div className="tm-info">
              <h3 className="tm-name">{m.name}</h3>
              {m.designation && <span className="tm-desig">{m.designation}</span>}
              <ul className="tm-facts">
                {m.facts.map(([k, v]) => <li key={k}><strong>{k}:</strong> {v}</li>)}
                {m.phone && <li><strong>Phone:</strong> <a href={`tel:${m.phone}`}>{m.phone}</a></li>}
                {m.email && <li><strong>Email:</strong> <a href={`mailto:${m.email}`}>{m.email.toLowerCase()}</a></li>}
              </ul>
              {m.aboutHtml && <div className="tm-about rich-text" dangerouslySetInnerHTML={{ __html: m.aboutHtml }} />}
              {m.linkedin && <a className="tm-linkedin" href={m.linkedin} target="_blank" rel="noopener" aria-label={`${m.name} on LinkedIn`}><i className="fab fa-linkedin-in"></i> LinkedIn</a>}
            </div>
          </div>
          <style>{`
            .tm-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.7);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:20px}
            .tm-box{position:relative;background:#05202f;color:#c5d0d8;border-radius:20px;padding:40px;width:100%;max-width:960px;margin:auto;display:flex;gap:36px;align-items:flex-start}
            .tm-close{position:absolute;top:12px;right:16px;width:36px;height:36px;border-radius:50%;border:0;background:#fff;color:#05202f;font-size:24px;line-height:1;cursor:pointer;z-index:1}
            .tm-photo{flex:0 0 300px}
            .tm-photo img{width:100%;height:auto;max-height:420px;object-fit:cover;border-radius:20px;display:block;background:#fff}
            .tm-info{flex:1 1 auto;min-width:0}
            .tm-name{color:#fff;margin:0 0 4px;font-size:30px}
            .tm-desig{display:block;color:#e3e9ee;margin-bottom:20px}
            .tm-facts{list-style:none;margin:0 0 18px;padding:0}
            .tm-facts li{margin-bottom:10px}
            .tm-facts strong{color:#e3e9ee}
            .tm-facts a,.tm-about a{color:#fff;text-decoration:underline}
            .tm-about{color:#c5d0d8}
            .tm-linkedin{display:inline-block;margin-top:16px;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:8px;padding:8px 16px}
            @media(max-width:767px){.tm-box{flex-direction:column;padding:56px 18px 24px;gap:20px}.tm-photo{flex:none;width:100%;max-width:300px}.tm-name{font-size:24px}}
          `}</style>
        </div>,
        document.body,
      )}
    </>
  );
}
