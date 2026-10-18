import CsrGallery from "./CsrGallery";
import VideoGallery from "./VideoGallery";

export type ShowItem = {
  id: number; title: string; description: string | null; image: string | null; alt: string;
  date: string | null; link: string | null; embed: string | null; poster: string | null;
};

/** Handing over events: photo and story side by side, flipping sides row by row. */
export function HandoverList({ items }: { items: ShowItem[] }) {
  return (
    <div className="ho-list">
      {items.map((it, i) => (
        <article className={`ho-row${i % 2 ? " flip" : ""}`} key={it.id}>
          <div className="ho-photo">{it.image && <img src={it.image} alt={it.alt} loading="lazy" />}</div>
          <div className="ho-body">
            {it.date && <span className="ho-date">{it.date}</span>}
            <h3>{it.title}</h3>
            {it.description && <p>{it.description}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

/** Awards: trophy cards with a gold ribbon on a soft sand background. */
export function AwardsGrid({ items }: { items: ShowItem[] }) {
  return (
    <div className="aw-grid">
      {items.map((it) => (
        <article className="aw-card" key={it.id}>
          <div className="aw-photo">
            {it.image && <img src={it.image} alt={it.alt} loading="lazy" />}
            <span className="aw-ribbon" aria-hidden="true">★</span>
          </div>
          <div className="aw-body">
            {it.date && <span className="aw-year">{it.date}</span>}
            <h3>{it.title}</h3>
            {it.description && <p>{it.description}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

/** Media coverage: a news-style list with a thumbnail, headline and a link to the article. */
export function MediaList({ items }: { items: ShowItem[] }) {
  return (
    <div className="md-list">
      {items.map((it) => (
        <article className="md-row" key={it.id}>
          <div className="md-thumb">{it.image && <img src={it.image} alt={it.alt} loading="lazy" />}</div>
          <div className="md-body">
            {it.date && <span className="md-date">{it.date}</span>}
            <h3>{it.title}</h3>
            {it.description && <p>{it.description}</p>}
            {it.link && <a className="sc-link" href={it.link} target="_blank" rel="noopener noreferrer">Read the article →</a>}
          </div>
        </article>
      ))}
    </div>
  );
}

/** Project videos: a dark cinema band; each video plays in a popup you can slide through. */
export function ProjectVideos({ items }: { items: ShowItem[] }) {
  const vids = items.filter((i) => i.embed).map((i) => ({ id: i.id, embed: i.embed!, poster: i.poster, title: i.title, text: i.description }));
  return (
    <div className="pv-band">
      <VideoGallery items={vids} />
    </div>
  );
}

export function CsrList({ items }: { items: ShowItem[] }) {
  return (
    <CsrGallery
      items={items.filter((i) => i.image).map((i) => ({ id: i.id, title: i.title, description: i.description, image: i.image!, alt: i.alt, date: i.date }))}
    />
  );
}
