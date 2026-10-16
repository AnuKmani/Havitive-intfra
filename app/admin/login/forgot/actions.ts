"use server";

import { trySendMail } from "@/lib/mail";
import { SITE } from "@/lib/site";
import { serverClient } from "@/lib/supabase/server";

export type ForgotState = { ok: boolean; message: string } | null;

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/**
 * HR or a telecaller asks the admin for a password. The answer is always the same, so nobody can use this form to find out
 * which emails have accounts. The request itself is recorded by the database (only for real HR accounts).
 */
export async function requestPasswordHelp(_: ForgotState, form: FormData): Promise<ForgotState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, message: "Enter the email address you sign in with." };
  const supabase = await serverClient();
  await supabase.rpc("request_password_reset", { p_email: email });
  // Best effort: the admin also sees the request (with a badge) in the panel.
  await trySendMail({
    to: process.env.NOTIFY_EMAIL || SITE.email,
    subject: "HR password request",
    text: `A password request was sent from the admin login page for ${email}.\n\nOpen the admin panel and go to "Password requests" to give a temporary password. They will be asked to choose their own password at the first sign-in.`,
  });
  return { ok: true, message: "Your request was sent to the admin. They will give you a temporary password, and you will choose your own when you sign in." };
}
