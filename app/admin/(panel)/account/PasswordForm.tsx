"use client";

import { useActionState, useEffect } from "react";
import PasswordInput from "@/components/admin/PasswordInput";
import { changePassword, type ActionState } from "../../actions";

export default function PasswordForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePassword, null);
  useEffect(() => {
    if (state?.ok && redirectTo) window.location.assign(redirectTo);
  }, [state, redirectTo]);
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor="password">New password</label>
        <PasswordInput id="password" name="password" minLength={10} autoComplete="new-password" required />
      </div>
      <div className="ad-field">
        <label htmlFor="confirm">Repeat new password</label>
        <PasswordInput id="confirm" name="confirm" minLength={10} autoComplete="new-password" required />
      </div>
      <div className="ad-form-foot">
        <button className="ad-btn" disabled={pending}>{pending ? "Saving…" : "Change password"}</button>
        {state && <span className={state.ok ? "ad-ok" : "ad-err"}>{state.message}</span>}
      </div>
    </form>
  );
}
