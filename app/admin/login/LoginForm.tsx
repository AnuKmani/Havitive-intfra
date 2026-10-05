"use client";

import { useActionState } from "react";
import { signIn, type ActionState } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, null);
  return (
    <form action={action} className="ad-form">
      <div className="ad-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="ad-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="ad-btn" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      {state && !state.ok && <p className="ad-err" role="alert">{state.message}</p>}
    </form>
  );
}
