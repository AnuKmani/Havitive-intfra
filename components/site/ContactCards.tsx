import { SITE } from "@/lib/site";
import "./contact-page.css";

/** Inline icons, so they always show (the theme's icon images are white and vanish on a white background). */
const ICONS = {
  pin: <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  mail: <path d="M3 6h18v12H3V6Zm0 0 9 7 9-7" />,
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${SITE.name}, ${SITE.address.locality}, ${SITE.address.region}`)}`;

/** Three cards on the contact page: where we are, how to call us, and where to write. */
export default function ContactCards() {
  return (
    <div className="ct-cards">
      <div className="ct-card">
        <span className="ct-icon"><Icon name="pin" /></span>
        <h3>Visit us</h3>
        <p>
          <a href={mapsLink} target="_blank" rel="noopener">
            {SITE.name}, {SITE.address.street}, {SITE.address.locality}, {SITE.address.region}
          </a>
        </p>
      </div>
      <div className="ct-card">
        <span className="ct-icon"><Icon name="phone" /></span>
        <h3>Call us</h3>
        <p>{SITE.phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`}>{p.label}</a>)}</p>
      </div>
      <div className="ct-card">
        <span className="ct-icon"><Icon name="mail" /></span>
        <h3>Email us</h3>
        <p><a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
      </div>
    </div>
  );
}
