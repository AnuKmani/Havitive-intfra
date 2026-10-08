/** Send a browser error to /api/client-error (best effort, never throws). */
export function reportError(error: { message?: string; stack?: string; digest?: string } | unknown) {
  try {
    const e = (error ?? {}) as { message?: string; stack?: string; digest?: string };
    const body = JSON.stringify({ message: e.message ?? String(error), stack: e.stack, digest: e.digest, url: location.href });
    if (!navigator.sendBeacon?.("/api/client-error", new Blob([body], { type: "application/json" }))) {
      fetch("/api/client-error", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {}
}
