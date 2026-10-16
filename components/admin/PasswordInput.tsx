"use client";

import { useState } from "react";
import Icon from "./Icon";

/** Password box with a show / hide button. Takes the usual input props. */
export default function PasswordInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [shown, setShown] = useState(false);
  return (
    <span className="ad-pw">
      <input {...props} type={shown ? "text" : "password"} />
      <button
        type="button"
        className="ad-pw-toggle"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        title={shown ? "Hide password" : "Show password"}
      >
        <Icon name={shown ? "eyeOff" : "eye"} size={18} />
      </button>
    </span>
  );
}
