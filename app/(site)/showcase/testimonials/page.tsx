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

/** Video testimonials (YouTube links from Admin > Showcase) and written testimonials as a conversation of speech bubbles. */
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

      {written.length > 0 && (
        <section className="cv-wall">
          <div className="container">
            <div className="cv-head">
              <span className="sc-kicker">Testimonials</span>
              <h2>What our clients say</h2>
              <span className="sc-bar" aria-hidden="true"></span>
            </div>

            <div className="cv-thread">
              {written.map((t, i) => (
                <div className={`cv-row${i % 2 ? " right" : ""}`} key={t.id}>
                  <img className="cv-face" src={media(t.client_img)} alt={t.client_img_alt || t.client_name || ""} loading="lazy" />
                  <figure className="cv-bubble">
                    <div className="cv-stars" aria-label="5 out of 5 stars">★★★★★</div>
                    <blockquote>{t.desription}</blockquote>
                    {t.img && (
                      <img className="cv-project" src={media(t.img)} alt={t.img_alt || `Project of ${t.client_name ?? "our client"}`} loading="lazy" />
                    )}
                    <figcaption>
                      <strong>{t.client_name}</strong>
                      {t.client_designation && <span>{t.client_designation}</span>}
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>

            <div className="cv-cta">
              <div>
                <h3>Planning your own project?</h3>
                <p>Talk to our architects and engineers. We would love to build the next success story with you.</p>
              </div>
              <a className="cv-btn" href="/contact">Start your project</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
