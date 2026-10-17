import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo-page";
import Breadcrumb from "@/components/site/Breadcrumb";
import EnquiryForm from "@/components/forms/EnquiryForm";
import ContactCards from "@/components/site/ContactCards";
import { getSectors } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("page:contact");
}

export default async function ContactPage() {
  const sectors = await getSectors();
  return (
    <>
      <Breadcrumb title="Contact Us" trail={[{ name: "Contact Us", href: "/contact" }]} />
      <section className="space">
        <div className="container">
          <div className="ct-head">
            <h2 className="sec-title">Let&rsquo;s talk about your project</h2>
            <p>Visit our office, call us, or send a message and our team will get back to you.</p>
          </div>
          <ContactCards />
          <div className="row gx-30 gy-30">
            <div className="col-lg-7">
              <div className="appointment-wrap2 bg-theme">
                <h2 className="form-title text-white">Send an enquiry</h2>
                <EnquiryForm sectors={sectors.map(({ id, sector_name }) => ({ id, sector_name }))} />
              </div>
            </div>
            <div className="col-lg-5">
              <div className="ct-side">
                <div className="ct-map">
                  <iframe
                    title="Havitive office location"
                    src="https://www.google.com/maps?q=Kulathoor,+Kazhakkoottam,+Thiruvananthapuram,+Kerala&output=embed"
                    loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className="ct-chat">
                  <div><strong>Prefer to chat?</strong><span>Message us on WhatsApp.</span></div>
                  <a href={SITE.whatsapp} rel="noopener" target="_blank">Chat on WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
