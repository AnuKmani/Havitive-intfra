"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";

export type TempPasswordState = { ok: boolean; message: string } | null;

/** Gives an HR or telecaller login a temporary password. They must choose their own at the next sign-in. */
export async function setTempPassword(requestId: number, _: TempPasswordState, form: FormData): Promise<TempPasswordState> {
  const { supabase } = await requireAdmin();
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { ok: false, message: "Use at least 10 characters." };
  const { error } = await supabase.rpc("admin_set_temp_password", { p_request_id: requestId, p_password: password });
  if (error) return { ok: false, message: error.message };
  // No revalidate here: the page keeps showing the new password until the admin leaves it.
  return { ok: true, message: "Temporary password set. Share it with them; they will choose their own at sign-in." };
}

export async function dismissPasswordRequest(id: number) {
  const { supabase } = await requireAdmin();
  await supabase.from("password_requests").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}
