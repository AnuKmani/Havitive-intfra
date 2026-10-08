"use client";

import { useState } from "react";

// A regular form post (see ./submit/route.ts): it keeps working even in a tab opened before a site update.
export default function LoginForm() {
  const [pending, setPending] = useState(false);
  return (
    <form method="post" action="/admin/login/submit" className="ad-form" onSubmit={() => setPending(true)}>
      <div className="ad-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="ad-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="ad-btn" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
