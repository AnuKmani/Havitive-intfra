import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/site/Breadcrumb";
import CsrGallery from "@/components/site/CsrGallery";
import VideoCard from "@/components/site/VideoCard";
import "@/components/site/showcase.css";
import { getShowcase } from "@/lib/data";
import { media } from "@/lib/media";
import { staticPageMetadata } from "@/lib/seo-page";
import { SHOWCASE_SECTIONS, showcasePath } from "@/lib/showcase";
import { formatDate } from "@/lib/text";
import { toEmbed, youtubeThumb } from "@/lib/video";

export const revalidate = 300;

type Props = { params: Promise<{ section: string }> };

const find = (slug: string) => SHOWCASE_SECTIONS.find((s) => s.slug === slug);

export function generateStaticParams() {
  return SHOWCASE_SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = find((await params).section);
  if (!section) return {};
  return staticPageMetadata(section.seoKey);
}

/** One Showcase page: CSR activities, handing over events, awards, media or project videos. */
export default async function ShowcasePage({ params }: Props) {
  const section = find((await params).section);
  if (!section) notFound();
  const items = await getShowcase(section.key);

  return (
    <>
      <Breadcrumb
        title={section.heading}
        trail={[{ name: "Showcase" }, { name: section.label, href: showcasePath(section.slug) }]}
      />
      <section className="space-top space-extra-bottom">
        <div className="container">
          <p className="sc-intro">{section.intro}</p>
          {!items.length ? (
            <p className="sc-empty">New updates are coming soon.</p>
          ) : section.key === "csr" ? (
            <CsrGallery
              items={items.filter((it) => it.image).map((it) => ({
                id: it.id,
                title: it.title,
                description: it.description,
                image: media(it.image),
                alt: it.image_alt || it.title,
                date: it.event_date ? (/^\d{4}-\d{2}-\d{2}$/.test(it.event_date) ? formatDate(it.event_date) : it.event_date) : null,
              }))}
            />
          ) : (
            <div className="sc-grid">
              {items.map((it) => {
                const embed = toEmbed(it.video_url);
                const poster = it.image ? media(it.image) : youtubeThumb(it.video_url);
                const date = it.event_date ? (/^\d{4}-\d{2}-\d{2}$/.test(it.event_date) ? formatDate(it.event_date) : it.event_date) : null;
                if (embed) {
                  return <VideoCard key={it.id} embed={embed} poster={poster} title={it.title} text={it.description} meta={date} />;
                }
                return (
                  <article className="sc-card" key={it.id}>
                    {it.image && (
                      <div className="sc-media">
                        <a className="popup-image" href={media(it.image)} aria-label={`Enlarge ${it.title}`}>
                          <img src={media(it.image)} alt={it.image_alt || it.title} loading="lazy" />
                        </a>
                      </div>
                    )}
                    <div className="sc-body">
                      {date && <span className="sc-meta">{date}</span>}
                      <h3 className="sc-title">{it.title}</h3>
                      {it.description && <p className="sc-text">{it.description}</p>}
                      {it.link_url && /^https?:\/\//.test(it.link_url) && (
                        <a className="sc-link" href={it.link_url} target="_blank" rel="noopener">Read more →</a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
