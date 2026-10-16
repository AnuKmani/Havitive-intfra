import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import type { Resource } from "@/lib/admin/resources";

export type StaffRole = "admin" | "hr";

/** Where HR users land: the only part of the panel besides their own account. */
export const HR_HOME = "/admin/applications";

/**
 * Returns a session-bound Supabase client for a signed-in staff member (admin or HR), or sends the visitor to the login page.
 * Cached per request, so the layout and the page share one check instead of repeating it.
 */
export const requireStaff = cache(async () => {
  const supabase = await serverClient();
  // Both checks only need the session, so they run at the same time.
  const [{ data: { user } }, { data: role }] = await Promise.all([supabase.auth.getUser(), supabase.rpc("staff_role")]);
  if (!user) redirect("/admin/login");
  // Two-factor login: once an authenticator app is set up, the session must have passed the code step.
  if (user.factors?.some((f) => f.status === "verified")) {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.aal !== "aal2") redirect("/admin/login/verify");
  }
  if (role !== "admin" && role !== "hr") redirect("/admin/login?error=not-admin");
  return { supabase, user, role: role as StaffRole };
});

/** Full admins only. HR users are sent to the job applications. */
export const requireAdmin = cache(async () => {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect(HR_HOME);
  return staff;
});

/** A content section: admins can use all of them, HR only the Careers ones. */
export async function requireSection(res: Pick<Resource, "group">) {
  return res.group === "Careers" ? requireStaff() : requireAdmin();
}
