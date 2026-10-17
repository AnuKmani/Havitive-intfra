"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import PasswordInput from "@/components/admin/PasswordInput";
import { generatePassword } from "@/components/admin/generatePassword";
import { setTempPassword, type TempPasswordState } from "../../password-actions";

export default function TempPasswordForm({ requestId }: { requestId: number }) {
  const [state, action, pending] = useActionState<TempPasswordState, FormData>(setTempPassword.bind(null, requestId), null);
  const router = useRouter();
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  if (state?.ok) {
    return (
      <div className="ad-ok-box" role="status">
        {state.message}
        <div style={{ marginTop: 8 }}>
          Temporary password: <strong style={{ fontFamily: "monospace", userSelect: "all" }}>{value}</strong>
        </div>
        <button type="button" className="ad-btn ad-btn-light" style={{ marginTop: 12 }} onClick={() => router.refresh()}>Done</button>
      </div>
    );
  }
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor={`pw-${requestId}`}>Temporary password</label>
        <div className="ad-gen-row">
          <PasswordInput
            id={`pw-${requestId}`} name="password" minLength={10} maxLength={72} required autoComplete="off"
            value={value} onChange={(e) => setValue(e.target.value)}
          />
          <button type="button" className="ad-btn ad-btn-light" onClick={() => { setValue(generatePassword()); setCopied(false); }}>Generate</button>
          <button
            type="button" className="ad-btn ad-btn-light" disabled={!value}
            onClick={() => navigator.clipboard?.writeText(value).then(() => setCopied(true), () => {})}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <small className="ad-hint">They will be signed out everywhere and must choose a new password at the next sign-in.</small>
      </div>
      {state && <p className="ad-err" role="alert">{state.message}</p>}
      <button className="ad-btn" disabled={pending}>{pending ? "Saving…" : "Set temporary password"}</button>
    </form>
  );
}
