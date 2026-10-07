"use server";

import { after } from "next/server";
import { trySendMail } from "@/lib/mail";
import { SITE } from "@/lib/site";
import { publicClient } from "@/lib/supabase/public";

export type FormState = { ok: boolean; message: string } | null;

const PHONE = /^\+91[0-9]{10}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function submitEnquiry(_: FormState, form: FormData): Promise<FormState> {
  if (str(form, "company")) return { ok: true, message: "Message sent successfully!" }; // honeypot
  const data = {
    name: str(form, "name"),
    email: str(form, "email"),
    phone: str(form, "phone").replace(/\s+/g, ""),
    service_type: str(form, "service_type"),
    message: str(form, "message"),
  };
  if (!data.name || data.name.length > 255) return { ok: false, message: "Please enter your name." };
  if (!EMAIL.test(data.email)) return { ok: false, message: "Please enter a valid email address." };
  if (!PHONE.test(data.phone)) return { ok: false, message: "Phone number must start with +91 followed by 10 digits." };
  if (!data.service_type) return { ok: false, message: "Please select a service type." };
  if (!data.message || data.message.length > 5000) return { ok: false, message: "Please enter a message." };

  const { error } = await publicClient().from("applies").insert(data);
  if (error) {
    console.error("Enquiry insert failed:", error.message);
    return { ok: false, message: "Sorry, something went wrong. Please call us instead." };
  }
  after(() =>
    trySendMail({
      to: notifyTo(),
      replyTo: data.email,
      subject: `New enquiry from ${data.name} – ${data.service_type}`,
      text: `A new enquiry has arrived on the website.\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nService: ${data.service_type}\n\nMessage:\n${data.message}\n\nAll enquiries: ${SITE.url}/admin/enquiries`,
    }),
  );
  return { ok: true, message: "Message sent successfully! Our team will contact you soon." };
}

const PATH = /^cvs\/[A-Za-z0-9._-]+$/;
const PHONE_ANY = /^\+?[0-9]{10,15}$/;
const notifyTo = () => process.env.NOTIFY_EMAIL || SITE.email;

/** CVs are uploaded from the browser straight to the private "applications" bucket; this records the application. */
export async function submitJobApplication(input: {
  name: string; email: string; phone: string; location: string; linkedin: string; coverLetter: string;
  jobId: number | null; cvPath: string; company?: string;
}): Promise<FormState> {
  if (input.company) return { ok: true, message: "Application submitted." }; // honeypot
  const name = input.name.trim().slice(0, 255);
  const email = input.email.trim().slice(0, 255);
  const phone = input.phone.replace(/[\s()-]+/g, "");
  const location = input.location.trim().slice(0, 255) || null;
  let linkedin = input.linkedin.trim().slice(0, 500) || null;
  if (linkedin && !/^https?:\/\//i.test(linkedin)) linkedin = `https://${linkedin}`;
  const coverLetter = input.coverLetter.trim().slice(0, 5000) || null;
  if (!name) return { ok: false, message: "Please enter your full name." };
  if (!EMAIL.test(email)) return { ok: false, message: "Please enter a valid email address." };
  if (!PHONE_ANY.test(phone)) return { ok: false, message: "Please enter a valid contact number, e.g. +91 9876543210." };
  if (input.jobId !== null && (!Number.isInteger(input.jobId) || input.jobId <= 0)) return { ok: false, message: "Please choose a position." };
  if (!PATH.test(input.cvPath)) return { ok: false, message: "Please attach your CV." };

  const db = publicClient();
  let position = "General application (talent network)";
  if (input.jobId !== null) {
    const { data: job } = await db.from("alljobs").select("title, status").eq("id", input.jobId).maybeSingle();
    if (!job || job.status !== "open") return { ok: false, message: "This position is no longer open." };
    position = job.title;
  }

  const { error } = await db.from("career_pages").insert({
    job_id: input.jobId, name, email, phone, location, linkedin, cover_letter: coverLetter,
    cv_path: `applications:${input.cvPath}`,
  });
  if (error) {
    console.error("Application insert failed:", error.message);
    return { ok: false, message: "Sorry, something went wrong. Please try again." };
  }

  // Emails go out after the response, so the applicant doesn't wait for them.
  after(async () => {
    await trySendMail({
      to: notifyTo(),
      replyTo: email,
      subject: `New job application: ${name} – ${position}`,
      text: [
        `A new application has arrived on the website.`,
        ``,
        `Position: ${position}`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        location ? `Location: ${location}` : "",
        linkedin ? `LinkedIn / portfolio: ${linkedin}` : "",
        coverLetter ? `\nCover letter:\n${coverLetter}` : "",
        ``,
        `Open it in the admin panel to download the CV and reply: ${SITE.url}/admin/applications`,
      ].filter((l) => l !== "").join("\n"),
    });
    await trySendMail({
      to: email,
      subject: `We received your application – ${SITE.shortName}`,
      text: `Dear ${name},\n\nThank you for applying for "${position}" at ${SITE.name}. Our team will review your application and contact you if your profile matches our requirements.\n\nBest regards,\nHR Team\n${SITE.name}`,
    });
  });
  return { ok: true, message: "Thank you! Your application has been submitted. We will get in touch soon." };
}
