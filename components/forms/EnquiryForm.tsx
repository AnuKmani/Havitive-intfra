"use client";

import { useActionState } from "react";
import { submitEnquiry, type FormState } from "@/app/actions/public";

export default function EnquiryForm({ sectors, light }: { sectors: { id: number; sector_name: string | null }[]; light?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, null);
  return (
    <form action={action} className="appointment-form me-xl-5" key={state?.ok ? "sent" : "form"}>
      <div className="row">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
        <div className="form-group style-border3 col-md-6">
          <input type="text" className="form-control" name="name" placeholder="Your Name*" aria-label="Your name" required maxLength={255} />
          <i className="fal fa-user"></i>
        </div>
        <div className="form-group style-border3 col-md-6">
          <input type="email" className="form-control" name="email" placeholder="Your Email*" aria-label="Your email" required />
          <i className="fal fa-envelope"></i>
        </div>
        <div className="form-group style-border3 col-md-12">
          <input
            type="tel" className="form-control" name="phone" placeholder="+91 XXXXXXXXXX" aria-label="Phone number" required
            pattern="^\+91[0-9]{10}$" title="Phone number must start with +91 and contain exactly 10 digits after +91"
          />
          <i className="fal fa-phone"></i>
        </div>
        <div className="form-group style-border3 col-md-12">
          <select name="service_type" className="form-select" required defaultValue="" aria-label="Service type">
            <option value="" disabled hidden>Select Service Type</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.sector_name ?? ""}>{s.sector_name}</option>
            ))}
          </select>
          <i className="fal fa-angle-down"></i>
        </div>
        <div className="col-12 form-group style-border3">
          <i className="far fa-comments"></i>
          <textarea name="message" placeholder="Type Your Message" className="form-control" required aria-label="Message"></textarea>
        </div>
        <div className="col-12 form-btn mt-4">
          <button type="submit" className={light ? "th-btn style2" : "th-btn style-border"} disabled={pending}>
            {pending ? "Sending..." : "Submit Message"}
            <span className="btn-icon"><img src="/frontend/assets/img/icon/paper-plane.svg" alt="" /></span>
          </button>
        </div>
      </div>
      {state && <p className={`form-alert ${state.ok ? "ok" : "err"}`} role="status">{state.message}</p>}
    </form>
  );
}
