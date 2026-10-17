import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import VideoCard from "@/components/site/VideoCard";
import "@/components/site/showcase.css";
import { getShowcase, getTestimonials } from "@/lib/data";
import { media } from "@/lib/media";
import { staticPageMetadata } from "@/lib/seo-page";
import { TESTIMONIALS_PATH } from "@/lib/showcase";
import { toEmbed, youtubeThumb } from "@/lib/video";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:testimonials");
}

/** Video testimonials (YouTube links from Admin > Showcase) and written testimonials. */
export default async function TestimonialsPage() {
  const [videos, written] = await Promise.all([getShowcase("testimonial-videos"), getTestimonials()]);
  const playable = videos.filter((v) => toEmbed(v.video_url));

  return (
    <>
      <Breadcrumb
        title="Testimonials"
        trail={[{ name: "Showcase" }, { name: "Testimonials", href: TESTIMONIALS_PATH }]}
      />
      <section className="space-top space-extra-bottom">
        <div className="container">
          <p className="sc-intro">Hear from the people we have built for. Their trust and feedback inspire us to deliver excellence in every project.</p>

          {playable.length > 0 && (
            <div className="sc-block">
              <h2 className="sc-heading">Video testimonials</h2>
              <div className="sc-grid">
                {playable.map((v) => (
                  <VideoCard
                    key={v.id}
                    embed={toEmbed(v.video_url)!}
                    poster={v.image ? media(v.image) : youtubeThumb(v.video_url)}
                    title={v.title}
                    text={v.description}
                  />
                ))}
              </div>
            </div>
          )}

          {written.length > 0 && (
            <div className="sc-block">
              <h2 className="sc-heading">What our clients say</h2>
              <div className="sc-grid">
                {written.map((t) => (
                  <article className="sc-card sc-quote" key={t.id}>
                    <div className="sc-stars" aria-label="5 out of 5 stars">★★★★★</div>
                    <p>{t.desription}</p>
                    <div className="sc-person">
                      <img src={media(t.client_img)} alt={t.client_img_alt || t.client_name || ""} loading="lazy" />
                      <div>
                        <strong>{t.client_name}</strong>
                        <span>{t.client_designation}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {!playable.length && !written.length && <p className="sc-empty">Client testimonials are coming soon.</p>}
        </div>
      </section>
    </>
  );
}
