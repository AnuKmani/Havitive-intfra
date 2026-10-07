"use client";

import { useActionState, useState } from "react";
import type { ReplyState } from "@/app/admin/applications-actions";
import { APPLICATION_STATUSES, REPLY_TEMPLATES } from "@/lib/careers";

type Action = (state: ReplyState, form: FormData) => Promise<ReplyState>;

export function StatusForm({ action, status, notes }: { action: Action; status: string; notes: string }) {
  const [state, formAction, pending] = useActionState<ReplyState, FormData>(action, null);
  return (
    <form action={formAction} className="ad-form ad-form-1">
      <div className="ad-field">
        <label htmlFor="status">Stage</label>
        <select id="status" name="status" defaultValue={status}>
          {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="ad-field">
        <label htmlFor="notes">Private notes</label>
        <textarea id="notes" name="notes" defaultValue={notes} rows={5} placeholder="Interview feedback, salary expectation, notice period… (only visible to admins)" />
      </div>
      <div className="ad-form-foot">
        <button className="ad-btn" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
        {state && <span className={state.ok ? "ad-ok" : "ad-err"} role="status">{state.message}</span>}
      </div>
    </form>
  );
}

export function ReplyComposer({ action, name, position, emailReady }: { action: Action; name: string; position: string; emailReady: boolean }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [setStatus, setSetStatus] = useState("");
  const [state, formAction, pending] = useActionState<ReplyState, FormData>(async (prev, fd) => {
    const result = await action(prev, fd);
    // Without SMTP settings the reply is handed to the admin's own mail app.
    if (result?.mailto) window.location.href = result.mailto;
    if (result?.ok) { setSubject(""); setBody(""); setSetStatus(""); }
    return result;
  }, null);
  const fill = (s: string) => s.replaceAll("{name}", name.split(" ")[0] || name).replaceAll("{position}", position);

  return (
    <form action={formAction} className="ad-form ad-form-1">
      <div className="ad-field">
        <label>Start from a template</label>
        <div className="ad-template-row">
          {REPLY_TEMPLATES.map((t) => (
            <button
              type="button" key={t.key} className="ad-chip"
              onClick={() => { setSubject(fill(t.subject)); setBody(fill(t.body)); setSetStatus(t.status); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="ad-field">
        <label htmlFor="subject">Subject <span className="ad-req">*</span></label>
        <input id="subject" name="subject" type="text" required value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="ad-field">
        <label htmlFor="body">Message <span className="ad-req">*</span></label>
        <textarea id="body" name="body" rows={10} required value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="ad-field">
        <label htmlFor="set_status">After sending, move the application to</label>
        <select id="set_status" name="set_status" value={setStatus} onChange={(e) => setSetStatus(e.target.value)}>
          <option value="">Keep the current stage</option>
          {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>
      <div className="ad-form-foot">
        <button className="ad-btn" disabled={pending}>{pending ? "Sending…" : emailReady ? "Send email" : "Save & open in mail app"}</button>
        {state && <span className={state.ok ? "ad-ok" : "ad-err"} role="status">{state.message}</span>}
      </div>
    </form>
  );
}
