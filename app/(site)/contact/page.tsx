import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import EnquiryForm from "@/components/forms/EnquiryForm";
import { ContactInfo } from "@/components/site/ContactInfo";
import { getSectors } from "@/lib/data";
import { SITE } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact Havitive Infra Pvt Ltd, Kazhakkoottam, Thiruvananthapuram. Call ${SITE.phones[0].label} or email ${SITE.email} for architecture, engineering and construction enquiries.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const sectors = await getSectors();
  return (
    <>
      <Breadcrumb title="Contact Us" trail={[{ name: "Contact Us", href: "/contact" }]} />
      <section className="space">
        <div className="container">
          <div className="row gx-60 gy-40">
            <div className="col-lg-5">
              <div className="title-area mb-35">
                <h2 className="sec-title">Let&rsquo;s talk about your project</h2>
                <p className="sec-text">Visit our office, call us, or send a message and our team will get back to you.</p>
              </div>
              <ContactInfo />
              <div className="mt-4">
                <a href={SITE.whatsapp} className="th-btn style2 th-btn-icon" rel="noopener" target="_blank">Chat on WhatsApp</a>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="appointment-wrap2 bg-theme">
                <h2 className="form-title text-white">Send an enquiry</h2>
                <EnquiryForm sectors={sectors.map(({ id, sector_name }) => ({ id, sector_name }))} />
              </div>
            </div>
          </div>
          <div className="mt-5" style={{ borderRadius: 20, overflow: "hidden" }}>
            <iframe
              title="Havitive office location"
              src="https://www.google.com/maps?q=Kulathoor,+Kazhakkoottam,+Thiruvananthapuram,+Kerala&output=embed"
              width="100%" height="380" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}
