"use client";

import { useActionState } from "react";
import { requestPasswordHelp, type ForgotState } from "./actions";

export default function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordHelp, null);
  if (state?.ok) return <p className="ad-ok-box" role="status">{state.message}</p>;
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor="email">Your email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      {state && <p className="ad-err" role="alert">{state.message}</p>}
      <button className="ad-btn" disabled={pending}>{pending ? "Sending…" : "Ask the admin for a password"}</button>
    </form>
  );
}
