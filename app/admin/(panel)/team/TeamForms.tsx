"use client";

import { useActionState, useState } from "react";
import PasswordInput from "@/components/admin/PasswordInput";
import { generatePassword } from "@/components/admin/generatePassword";
import { createStaff, resetStaffPassword, type TeamState } from "../../team-actions";

/** Password box + Generate + Copy, shared by the create and reset forms. */
function PasswordRow({ id, value, setValue }: { id: string; value: string; setValue: (v: string) => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="ad-gen-row">
      <PasswordInput id={id} name="password" minLength={10} maxLength={72} required autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="button" className="ad-btn ad-btn-light" onClick={() => { setValue(generatePassword()); setCopied(false); }}>Generate</button>
      <button
        type="button" className="ad-btn ad-btn-light" disabled={!value}
        onClick={() => navigator.clipboard?.writeText(value).then(() => setCopied(true), () => {})}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Done({ message, value }: { message: string; value: string }) {
  return (
    <div className="ad-ok-box" role="status">
      {message}
      <div style={{ marginTop: 8 }}>
        Password: <strong style={{ fontFamily: "monospace", userSelect: "all" }}>{value}</strong>
      </div>
    </div>
  );
}

export function CreateLoginForm() {
  const [state, action, pending] = useActionState<TeamState, FormData>(createStaff, null);
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("");
  if (state?.ok) {
    return (
      <>
        <Done message={state.message} value={value} />
        <p style={{ marginTop: 12 }}><a className="ad-btn ad-btn-light" href="/admin/team">Done</a></p>
        <small className="ad-hint">Username: {email}</small>
      </>
    );
  }
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor="new-name">Name</label>
        <input id="new-name" name="name" type="text" maxLength={100} autoComplete="off" />
      </div>
      <div className="ad-field">
        <label htmlFor="new-email">Username (email)</label>
        <input id="new-email" name="email" type="email" required autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="ad-field">
        <label htmlFor="new-role">Login for</label>
        <select id="new-role" name="role" defaultValue="hr" required>
          <option value="hr">HR (job openings, careers page, job applications)</option>
          <option value="telecaller">Telecaller (website enquiries)</option>
        </select>
      </div>
      <div className="ad-field">
        <label htmlFor="new-pw">Temporary password</label>
        <PasswordRow id="new-pw" value={value} setValue={setValue} />
        <small className="ad-hint">At least 10 characters. They must choose their own password the first time they sign in.</small>
      </div>
      {state && <p className="ad-err" role="alert">{state.message}</p>}
      <button className="ad-btn" disabled={pending}>{pending ? "Creating…" : "Create login"}</button>
    </form>
  );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<TeamState, FormData>(resetStaffPassword.bind(null, userId), null);
  const [value, setValue] = useState("");
  if (state?.ok) return <Done message={state.message} value={value} />;
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor={`rp-${userId}`}>New temporary password</label>
        <PasswordRow id={`rp-${userId}`} value={value} setValue={setValue} />
      </div>
      {state && <p className="ad-err" role="alert">{state.message}</p>}
      <button className="ad-btn" disabled={pending}>{pending ? "Saving…" : "Set temporary password"}</button>
    </form>
  );
}
