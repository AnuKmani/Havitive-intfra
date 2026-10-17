import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import VideoCard from "@/components/site/VideoCard";
import "@/components/site/showcase.css";
import { getShowcase, getTestimonials } from "@/lib/data";
import { media } from "@/lib/media";
import { staticPageMetadata } from "@/lib/seo-page";
import { TESTIMONIALS_PATH } from "@/lib/showcase";
import type { Testimonial } from "@/lib/types";
import { toEmbed, youtubeThumb } from "@/lib/video";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:testimonials");
}

function Person({ t }: { t: Testimonial }) {
  return (
    <div className="sw-person">
      <img src={media(t.client_img)} alt={t.client_img_alt || t.client_name || ""} loading="lazy" />
      <div>
        <strong>{t.client_name}</strong>
        {t.client_designation && <span>{t.client_designation}</span>}
      </div>
    </div>
  );
}

/** Video testimonials (YouTube links from Admin > Showcase) and written testimonials on a dark wall. */
export default async function TestimonialsPage() {
  const [videos, written] = await Promise.all([getShowcase("testimonial-videos"), getTestimonials()]);
  const playable = videos.filter((v) => toEmbed(v.video_url));
  const [featured, ...others] = written;

  return (
    <>
      <Breadcrumb
        title="Testimonials"
        trail={[{ name: "Showcase" }, { name: "Testimonials", href: TESTIMONIALS_PATH }]}
      />

      <section className={`sc-top${playable.length ? " has-videos" : ""}`}>
        <div className="container">
          <p className="sc-intro">Hear from the people we have built for. Their trust and feedback inspire us to deliver excellence in every project.</p>

          {playable.length > 0 && (
            <div className="sc-block">
              <div className="sc-title-block">
                <span className="sc-kicker">Watch</span>
                <h2 className="sc-heading">Video testimonials</h2>
                <span className="sc-bar" aria-hidden="true"></span>
              </div>
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

          {!playable.length && !written.length && <p className="sc-empty">Client testimonials are coming soon.</p>}
        </div>
      </section>

      {featured && (
        <section className="sw-wall">
          <span className="sw-glow" aria-hidden="true"></span>
          <div className="container">
            <div className="sw-head">
              <span className="sw-kicker">Testimonials</span>
              <h2>What our clients say</h2>
              <span className="sw-bar" aria-hidden="true"></span>
            </div>

            <figure className={`sw-feature${featured.img ? "" : " no-photo"}`}>
              {featured.img && (
                <div className="sw-feature-photo">
                  <span className="sw-chip">Featured story</span>
                  <img src={media(featured.img)} alt={featured.img_alt || `Project of ${featured.client_name ?? "our client"}`} loading="lazy" />
                </div>
              )}
              <div className="sw-feature-body">
                <span className="sw-quote-mark" aria-hidden="true">“</span>
                <div className="sw-stars" aria-label="5 out of 5 stars">★★★★★</div>
                <blockquote>{featured.desription}</blockquote>
                <figcaption><Person t={featured} /></figcaption>
              </div>
            </figure>

            {others.length > 0 && (
              <div className="sw-masonry">
                {others.map((t) => (
                  <figure className="sw-card" key={t.id}>
                    <span className="sw-quote-mark small" aria-hidden="true">“</span>
                    <div className="sw-stars" aria-label="5 out of 5 stars">★★★★★</div>
                    <blockquote>{t.desription}</blockquote>
                    <figcaption><Person t={t} /></figcaption>
                  </figure>
                ))}
              </div>
            )}

            <div className="sw-cta">
              <div>
                <h3>Planning your own project?</h3>
                <p>Talk to our architects and engineers. We would love to build the next success story with you.</p>
              </div>
              <a className="sw-btn" href="/contact">Start your project</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
