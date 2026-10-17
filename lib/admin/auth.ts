import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { isContentSection, type Resource } from "@/lib/admin/resources";

export type StaffRole = "admin" | "hr" | "telecaller" | "marketing" | "designer";

const ROLES: StaffRole[] = ["admin", "hr", "telecaller", "marketing", "designer"];

/** The first page each role sees: HR works in the job applications, telecallers and marketing in the enquiries, designers in the home page. */
export function homeFor(role: StaffRole) {
  switch (role) {
    case "hr": return "/admin/applications";
    case "telecaller":
    case "marketing": return "/admin/enquiries";
    case "designer": return "/admin/home";
    default: return "/admin";
  }
}

/**
 * Returns a session-bound Supabase client for a signed-in staff member (admin, HR or telecaller), or sends the visitor to the login page.
 * Cached per request, so the layout and the page share one check instead of repeating it.
 */
const loadStaff = cache(async () => {
  const supabase = await serverClient();
  // All three only need the session, so they run at the same time.
  const [{ data: { user } }, { data: role }, { data: me }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("staff_role"),
    supabase.from("admins").select("must_change_password").maybeSingle(),
  ]);
  if (!user) redirect("/admin/login");
  // Two-factor login: once an authenticator app is set up, the session must have passed the code step.
  if (user.factors?.some((f) => f.status === "verified")) {
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.aal !== "aal2") redirect("/admin/login/verify");
  }
  if (!ROLES.includes(role as StaffRole)) redirect("/admin/login?error=not-admin");
  return { supabase, user, role: role as StaffRole, mustChange: !!me?.must_change_password };
});

/** Signed in, without the forced password change. Only for the change-password page and its action. */
export const requireStaffAny = loadStaff;

/** Any signed-in staff member. Someone using a temporary password must choose their own first. */
export const requireStaff = cache(async () => {
  const staff = await loadStaff();
  if (staff.mustChange) redirect("/admin/change-password");
  return staff;
});

/** Only the given roles; anyone else goes to their own first page. */
async function requireRole(...roles: StaffRole[]) {
  const staff = await requireStaff();
  if (!roles.includes(staff.role)) redirect(homeFor(staff.role));
  return staff;
}

/** Full admins only. */
export const requireAdmin = () => requireRole("admin");
/** Job openings, the careers page and job applications: admin and HR. */
export const requireCareers = () => requireRole("admin", "hr");
/** Website enquiries: admin, telecaller and marketing. */
export const requireEnquiries = () => requireRole("admin", "telecaller", "marketing");
/** Blog, projects and the home page: admin, marketing and designer. */
export const requireContent = () => requireRole("admin", "marketing", "designer");

/** A content section: admins can use all of them, HR only the Careers ones, marketing and designers the blog, projects and home page. */
export async function requireSection(res: Pick<Resource, "group" | "key" | "home">) {
  if (res.group === "Careers") return requireCareers();
  return isContentSection(res) ? requireContent() : requireAdmin();
}
