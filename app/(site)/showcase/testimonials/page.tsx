import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import TestimonialFacade, { type FacadeItem } from "@/components/site/TestimonialFacade";
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

/** Video testimonials (YouTube links from Admin > Showcase) and written testimonials as a building facade. */
export default async function TestimonialsPage() {
  const [videos, written] = await Promise.all([getShowcase("testimonial-videos"), getTestimonials()]);
  const playable = videos.filter((v) => toEmbed(v.video_url));
  const items: FacadeItem[] = written.map((t) => ({
    id: t.id,
    quote: t.desription ?? "",
    name: t.client_name ?? "",
    role: t.client_designation ?? "",
    photo: media(t.client_img),
    photoAlt: t.client_img_alt || t.client_name || "",
    project: t.img ? media(t.img) : null,
    projectAlt: t.img_alt || `Project of ${t.client_name ?? "our client"}`,
  }));

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

      {items.length > 0 && (
        <section className="fx-wallband">
          <span className="fx-glow" aria-hidden="true"></span>
          <div className="container">
            <div className="fx-head">
              <span className="sc-kicker">Testimonials</span>
              <h2>What our clients say</h2>
              <span className="sc-bar" aria-hidden="true"></span>
            </div>

            <TestimonialFacade items={items} />

            <div className="fx-cta">
              <div>
                <h3>Planning your own project?</h3>
                <p>Talk to our architects and engineers. We would love to build the next success story with you.</p>
              </div>
              <a className="fx-btn" href="/contact">Start your project</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
