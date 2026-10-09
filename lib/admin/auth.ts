import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

/**
 * Returns a session-bound Supabase client for a signed-in admin, or sends the visitor to the login page.
 * Cached per request, so the layout and the page share one check instead of repeating it.
 */
export const requireAdmin = cache(async () => {
  const supabase = await serverClient();
  // Both checks only need the session, so they run at the same time.
  const [{ data: { user } }, { data: isAdmin }] = await Promise.all([supabase.auth.getUser(), supabase.rpc("is_admin")]);
  if (!user) redirect("/admin/login");
  // Two-factor login: once an authenticator app is set up, the session must have passed the code step.
  if (user.factors?.some((f) => f.status === "verified")) {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.aal !== "aal2") redirect("/admin/login/verify");
  }
  if (!isAdmin) redirect("/admin/login?error=not-admin");
  return { supabase, user };
});
