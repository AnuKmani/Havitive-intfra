"use client";

import { useActionState } from "react";
import { changePassword, type ActionState } from "../../actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePassword, null);
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor="password">New password</label>
        <input id="password" name="password" type="password" minLength={10} autoComplete="new-password" required />
      </div>
      <div className="ad-field">
        <label htmlFor="confirm">Repeat new password</label>
        <input id="confirm" name="confirm" type="password" minLength={10} autoComplete="new-password" required />
      </div>
      <div className="ad-form-foot">
        <button className="ad-btn" disabled={pending}>{pending ? "Saving…" : "Change password"}</button>
        {state && <span className={state.ok ? "ad-ok" : "ad-err"}>{state.message}</span>}
      </div>
    </form>
  );
}
