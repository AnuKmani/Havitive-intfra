"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

export type TeamState = { ok: boolean; message: string } | null;

/** Admin creates an HR or telecaller login. They must choose their own password at the first sign-in. */
export async function createStaff(_: TeamState, form: FormData): Promise<TeamState> {
  const { supabase } = await requireAdmin();
  const role = String(form.get("role") ?? "");
  if (role !== "hr" && role !== "telecaller") return { ok: false, message: "Choose HR or telecaller." };
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { ok: false, message: "Use at least 10 characters." };
  const { error } = await supabase.rpc("admin_create_staff", {
    p_email: email,
    p_password: password,
    p_role: role,
    p_name: String(form.get("name") ?? "").trim().slice(0, 100),
  });
  if (error) return { ok: false, message: error.message };
  // No revalidate: the form keeps showing the password until the admin has copied it.
  return { ok: true, message: `Login created for ${email.toLowerCase()}. Share the username and password with them; they will choose their own password at the first sign-in.` };
}

/** Admin gives an existing HR / telecaller login a new temporary password. */
export async function resetStaffPassword(userId: string, _: TeamState, form: FormData): Promise<TeamState> {
  const { supabase } = await requireAdmin();
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { ok: false, message: "Use at least 10 characters." };
  const { error } = await supabase.rpc("set_staff_password", { p_user_id: userId, p_password: password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Temporary password set. They will be asked to choose their own at the next sign-in." };
}

export async function removeStaff(userId: string) {
  const { supabase } = await requireAdmin();
  await supabase.rpc("admin_remove_staff", { p_user_id: userId });
  revalidatePath("/admin/team");
  revalidatePath("/admin", "layout");
}
