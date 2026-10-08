import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

/** Returns a session-bound Supabase client for a signed-in admin, or sends the visitor to the login page. */
export async function requireAdmin() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  // Two-factor login: once an authenticator app is set up, the session must have passed the code step.
  if (user.factors?.some((f) => f.status === "verified")) {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.aal !== "aal2") redirect("/admin/login/verify");
  }
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=not-admin");
  return { supabase, user };
}
