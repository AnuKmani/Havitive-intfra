"use client";

import { useEffect, useState } from "react";
import { reportError } from "./reportError";

const KEY = "hv-error-reload";

/**
 * Shown instead of a blank page when something fails in the browser. The usual cause is a tab
 * that was opened before the site was updated, so the first time it simply reloads the page.
 */
export default function ErrorScreen({ error, reset, variant }: {
  error: Error & { digest?: string };
  reset?: () => void;
  variant: "admin" | "site";
}) {
  const [reloading, setReloading] = useState(true);

  useEffect(() => {
    console.error(error);
    reportError(error);
    let last = 0;
    try { last = Number(sessionStorage.getItem(KEY) || 0); } catch {}
    if (Date.now() - last > 30_000) {
      try { sessionStorage.setItem(KEY, String(Date.now())); } catch {}
      window.location.reload();
      return;
    }
    const t = setTimeout(() => setReloading(false), 0);
    return () => clearTimeout(t);
  }, [error]);

  const retry = () => {
    try { sessionStorage.removeItem(KEY); } catch {}
    if (reset) reset();
    window.location.reload();
  };

  const admin = variant === "admin";
  return (
    <div style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "40px 16px", fontFamily: "Inter, system-ui, sans-serif", background: admin ? "#f3f5f9" : undefined }}>
      <div style={{ maxWidth: 440, textAlign: "center", background: "#fff", borderRadius: 16, padding: "36px 28px", boxShadow: "0 10px 30px rgba(5,33,50,.1)" }}>
        <img src="/upload/logos/hav.png" alt="Havitive" width={56} height={56} style={{ marginBottom: 14 }} />
        <h1 style={{ fontSize: 22, margin: "0 0 8px", color: "#052132" }}>{reloading ? "Loading…" : "Something went wrong"}</h1>
        <p style={{ color: "#5d6b78", fontSize: 15, margin: "0 0 22px" }}>
          {reloading
            ? "Refreshing the page."
            : admin
              ? "The page could not load. Your saved work is safe. Please reload the page and try again."
              : "The page could not load. Please reload the page."}
        </p>
        {!reloading && (
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={retry} style={{ background: "#052132", color: "#fff", border: 0, borderRadius: 10, padding: "11px 20px", fontWeight: 600, cursor: "pointer" }}>
              Reload page
            </button>
            <a href={admin ? "/admin" : "/"} style={{ border: "1px solid #d3dbe3", color: "#052132", borderRadius: 10, padding: "10px 18px", fontWeight: 600, textDecoration: "none" }}>
              {admin ? "Go to dashboard" : "Go to home page"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
