"use client";

import { useActionState, useState, useTransition } from "react";
import { confirmTwoFactor, disableTwoFactor, startTwoFactor, type TwoFactorState } from "../../actions";

export default function TwoFactor({ enabled }: { enabled: boolean }) {
  const [setup, setSetup] = useState<TwoFactorState>(null);
  const [starting, start] = useTransition();
  const [confirmState, confirm, confirming] = useActionState<TwoFactorState, FormData>(
    (prev, fd) => confirmTwoFactor(setup?.factorId ?? "", prev, fd), null);
  const [disableState, disable, disabling] = useActionState<TwoFactorState, FormData>(disableTwoFactor, null);

  if (enabled) {
    return (
      <div>
        <p><span className="ad-pill pill-green">On</span> Each sign-in asks for a 6-digit code from your authenticator app.</p>
        <p className="ad-muted">Lost your phone? Ask your developer to reset two-step verification for your account.</p>
        <form action={disable} className="ad-form ad-form-1">
          <div className="ad-field">
            <label htmlFor="off-code">To turn it off, enter a current code</label>
            <input id="off-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="123456" required />
          </div>
          <div className="ad-form-foot">
            <button className="ad-btn ad-btn-light" disabled={disabling}>{disabling ? "Turning off…" : "Turn off"}</button>
            {disableState && <span className={disableState.ok ? "ad-ok" : "ad-err"} role="status">{disableState.message}</span>}
          </div>
        </form>
      </div>
    );
  }

  if (!setup?.ok) {
    return (
      <div>
        <p className="ad-muted">
          Protect the admin with a second step: after your password, you enter a 6-digit code from an app on your phone
          (Google Authenticator, Microsoft Authenticator or similar). Someone who learns your password still can&rsquo;t sign in.
        </p>
        <button type="button" className="ad-btn" disabled={starting} onClick={() => start(async () => setSetup(await startTwoFactor()))}>
          {starting ? "Preparing…" : "Set up two-step verification"}
        </button>
        {setup && !setup.ok && <p className="ad-err" role="alert">{setup.message}</p>}
      </div>
    );
  }

  return (
    <div className="ad-2fa">
      <ol className="ad-steps">
        <li>Open your authenticator app and add a new account.</li>
        <li>Scan this QR code (or type the key below).</li>
        <li>Enter the 6-digit code the app shows.</li>
      </ol>
      <img src={setup.qr} alt="QR code for your authenticator app" width={180} height={180} className="ad-qr" />
      <p className="ad-muted">Key: <code className="ad-code">{setup.secret}</code></p>
      <form action={confirm} className="ad-form ad-form-1">
        <div className="ad-field">
          <label htmlFor="on-code">6-digit code</label>
          <input id="on-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="123456" required autoFocus />
        </div>
        <div className="ad-form-foot">
          <button className="ad-btn" disabled={confirming}>{confirming ? "Checking…" : "Turn on"}</button>
          {confirmState && !confirmState.ok && <span className="ad-err" role="alert">{confirmState.message}</span>}
        </div>
      </form>
    </div>
  );
}
