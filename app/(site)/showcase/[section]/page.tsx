import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/site/Breadcrumb";
import ShowcasePager, { SHOWCASE_PER_PAGE, showcasePageNumber } from "@/components/site/ShowcasePager";
import { AwardsGrid, CsrList, HandoverList, MediaList, ProjectVideos, type ShowItem } from "@/components/site/ShowcaseLayouts";
import "@/components/site/showcase.css";
import { getShowcase } from "@/lib/data";
import { media } from "@/lib/media";
import { staticPageMetadata } from "@/lib/seo-page";
import { SHOWCASE_SECTIONS, showcasePath } from "@/lib/showcase";
import { formatDate } from "@/lib/text";
import { toEmbed, youtubeThumb } from "@/lib/video";

export const revalidate = 300;

type Props = { params: Promise<{ section: string }>; searchParams: Promise<{ page?: string }> };

const find = (slug: string) => SHOWCASE_SECTIONS.find((s) => s.slug === slug);

export function generateStaticParams() {
  return SHOWCASE_SECTIONS.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = find((await params).section);
  if (!section) return {};
  return staticPageMetadata(section.seoKey);
}

/** One Showcase page: CSR activities, handing over events, awards, media or project videos, each with its own design and page links. */
export default async function ShowcasePage({ params, searchParams }: Props) {
  const section = find((await params).section);
  if (!section) notFound();
  const [all, { page }] = await Promise.all([getShowcase(section.key), searchParams]);

  const pages = Math.max(1, Math.ceil(all.length / SHOWCASE_PER_PAGE));
  const current = Math.min(showcasePageNumber(page), pages);
  const items: ShowItem[] = all.slice((current - 1) * SHOWCASE_PER_PAGE, current * SHOWCASE_PER_PAGE).map((it) => ({
    id: it.id,
    title: it.title,
    description: it.description,
    image: it.image ? media(it.image) : null,
    alt: it.image_alt || it.title,
    date: it.event_date ? (/^\d{4}-\d{2}-\d{2}$/.test(it.event_date) ? formatDate(it.event_date) : it.event_date) : null,
    link: it.link_url && /^https?:\/\//.test(it.link_url) ? it.link_url : null,
    embed: toEmbed(it.video_url),
    poster: it.image ? media(it.image) : youtubeThumb(it.video_url),
  }));

  const list =
    section.key === "csr" ? <CsrList items={items} /> :
    section.key === "handover" ? <HandoverList items={items} /> :
    section.key === "awards" ? <AwardsGrid items={items} /> :
    section.key === "media" ? <MediaList items={items} /> :
    <ProjectVideos items={items} />;

  const wrap = section.key === "awards" ? " aw-wrap" : section.key === "project-videos" ? " pv-wrap" : "";

  return (
    <>
      <Breadcrumb
        title={section.heading}
        trail={[{ name: "Showcase" }, { name: section.label, href: showcasePath(section.slug) }]}
      />
      <section className={`space-top space-extra-bottom${wrap}`}>
        <div className="container">
          <p className="sc-intro">{section.intro}</p>
          {!all.length ? (
            <p className="sc-empty">New updates are coming soon.</p>
          ) : (
            <>
              {list}
              <ShowcasePager current={current} pages={pages} basePath={showcasePath(section.slug)} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
