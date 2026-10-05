"use client";

import { useState } from "react";
import { submitJobApplication, type FormState } from "@/app/actions/public";
import { browserClient } from "@/lib/supabase/browser";

const MAX = 2 * 1024 * 1024;
const LETTER_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const safeName = (n: string) => n.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);

export default function JobApplicationForm({ jobs }: { jobs: { id: number; title: string }[] }) {
  const [state, setState] = useState<FormState>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const cv = f.get("cv") as File;
    const letter = f.get("letter") as File;
    if (!cv?.size || cv.type !== "application/pdf" || cv.size > MAX) return setState({ ok: false, message: "Please attach your CV as a PDF under 2 MB." });
    if (!letter?.size || !LETTER_TYPES.includes(letter.type) || letter.size > MAX)
      return setState({ ok: false, message: "Please attach a cover letter (PDF or Word) under 2 MB." });

    setPending(true);
    setState(null);
    try {
      const stamp = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      const cvPath = `cvs/${stamp}_${safeName(cv.name)}`;
      const letterPath = `cover_letters/${stamp}_${safeName(letter.name)}`;
      const storage = browserClient().storage.from("applications");
      const [a, b] = await Promise.all([
        storage.upload(cvPath, cv, { contentType: cv.type }),
        storage.upload(letterPath, letter, { contentType: letter.type }),
      ]);
      if (a.error || b.error) throw new Error(a.error?.message || b.error?.message);
      const result = await submitJobApplication({
        name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), phone: String(f.get("phone") ?? ""),
        jobId: Number(f.get("job_id")), message: String(f.get("message") ?? ""), cvPath, letterPath,
        company: String(f.get("company") ?? ""),
      });
      setState(result);
      if (result?.ok) form.reset();
    } catch {
      setState({ ok: false, message: "Could not upload your files. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="appointment-form" id="applyForm">
      <div className="row">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
        <div className="form-group style-border3 col-md-6">
          <input type="text" className="form-control" name="name" placeholder="Your Name*" aria-label="Your name" required />
          <i className="fal fa-user"></i>
        </div>
        <div className="form-group style-border3 col-md-6">
          <input type="email" className="form-control" name="email" placeholder="Your Email*" aria-label="Your email" required />
          <i className="fal fa-envelope"></i>
        </div>
        <div className="form-group style-border3 col-md-12">
          <input type="tel" className="form-control" name="phone" placeholder="+91 XXXXXXXXXX" aria-label="Phone" required pattern="^\+91[0-9]{10}$" title="Phone number must start with +91 and contain exactly 10 digits after +91" />
          <i className="fal fa-phone"></i>
        </div>
        <div className="form-group style-border3 col-md-12">
          <select name="job_id" className="form-select" required defaultValue="" aria-label="Position">
            <option value="" disabled hidden>Select Job Type</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <i className="fal fa-angle-down"></i>
        </div>
        <div className="form-group style-border3 col-md-12">
          <label htmlFor="cv" className="form-label">Upload Your CV (PDF only, max 2 MB)</label>
          <input type="file" className="form-control" name="cv" id="cv" accept=".pdf,application/pdf" required />
        </div>
        <div className="form-group style-border3 col-md-12">
          <label htmlFor="letter" className="form-label">Upload Cover Letter (PDF, DOC, DOCX, max 2 MB)</label>
          <input type="file" className="form-control" name="letter" id="letter" accept=".pdf,.doc,.docx" required />
        </div>
        <div className="col-12 form-group style-border3">
          <i className="far fa-comments"></i>
          <textarea placeholder="Message" name="message" className="form-control" maxLength={255} aria-label="Message"></textarea>
        </div>
        <div className="col-12 form-btn mt-4">
          <button className="th-btn style-border" disabled={pending}>
            {pending ? "Submitting..." : "Submit Application"}
            <span className="btn-icon"><img src="/frontend/assets/img/icon/paper-plane.svg" alt="" /></span>
          </button>
        </div>
      </div>
      {state && <p className={`form-alert ${state.ok ? "ok" : "err"}`} role="status">{state.message}</p>}
    </form>
  );
}
