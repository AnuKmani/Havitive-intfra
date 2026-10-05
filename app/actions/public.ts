"use server";

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
  return { ok: true, message: "Message sent successfully! Our team will contact you soon." };
}

const PATH = /^(cvs|cover_letters)\/[A-Za-z0-9._-]+$/;

/** Files are uploaded from the browser straight to the private "applications" bucket; this records the application. */
export async function submitJobApplication(input: {
  name: string; email: string; phone: string; jobId: number; message: string; cvPath: string; letterPath: string; company?: string;
}): Promise<FormState> {
  if (input.company) return { ok: true, message: "Application submitted." };
  const name = input.name.trim();
  const email = input.email.trim();
  const phone = input.phone.replace(/\s+/g, "");
  if (!name || name.length > 255) return { ok: false, message: "Please enter your name." };
  if (!EMAIL.test(email)) return { ok: false, message: "Please enter a valid email address." };
  if (!PHONE.test(phone)) return { ok: false, message: "Phone number must start with +91 followed by 10 digits." };
  if (!Number.isInteger(input.jobId) || input.jobId <= 0) return { ok: false, message: "Please choose a position." };
  if (!PATH.test(input.cvPath) || !PATH.test(input.letterPath)) return { ok: false, message: "Please attach your CV and cover letter." };

  const { error } = await publicClient().from("career_pages").insert({
    job_id: input.jobId, name, email, phone, message: input.message.trim().slice(0, 255),
    cv_path: `applications:${input.cvPath}`,
    cover_letter_path: `applications:${input.letterPath}`,
  });
  if (error) {
    console.error("Application insert failed:", error.message);
    return { ok: false, message: "Sorry, something went wrong. Please try again." };
  }
  return { ok: true, message: "Your application has been submitted successfully!" };
}
