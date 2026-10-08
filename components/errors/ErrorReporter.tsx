"use client";

import { useEffect } from "react";
import { reportError } from "./reportError";

// Reports errors that happen outside React's error pages (e.g. failed scripts or promises).
export default function ErrorReporter() {
  useEffect(() => {
    let sent = 0;
    const onError = (e: ErrorEvent) => { if (sent++ < 5) reportError(e.error ?? { message: e.message }); };
    const onRejection = (e: PromiseRejectionEvent) => { if (sent++ < 5) reportError(e.reason); };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}
