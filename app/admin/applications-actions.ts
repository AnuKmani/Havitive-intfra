"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { APPLICATION_STATUSES } from "@/lib/careers";
import { mailConfigured, sendMail } from "@/lib/mail";
import { deleteSubmission } from "./actions";

export type ReplyState = { ok: boolean; message: string; mailto?: string } | null;

const STATUS_VALUES = new Set<string>(APPLICATION_STATUSES.map((s) => s.value));

function refresh(id: number) {
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin", "layout");
}

export async function updateApplication(id: number, _: ReplyState, form: FormData): Promise<ReplyState> {
  const { supabase } = await requireAdmin();
  const status = String(form.get("status") ?? "");
  if (!STATUS_VALUES.has(status)) return { ok: false, message: "Choose a status." };
  const notes = String(form.get("notes") ?? "").trim().slice(0, 5000) || null;
  const { error } = await supabase.from("career_pages").update({ status, notes, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, message: error.message };
  refresh(id);
  return { ok: true, message: "Saved." };
}

/** Quick status change from the list (one click). */
export async function setApplicationStatus(id: number, status: string) {
  if (!STATUS_VALUES.has(status)) return;
  const { supabase } = await requireAdmin();
  await supabase.from("career_pages").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  refresh(id);
}

export async function markUnread(id: number) {
  const { supabase } = await requireAdmin();
  await supabase.from("career_pages").update({ read_at: null }).eq("id", id);
  refresh(id);
  redirect("/admin/applications");
}

/** Email the applicant from the admin panel. Without SMTP settings, the reply opens in the admin's own mail app instead. */
export async function sendReply(id: number, _: ReplyState, form: FormData): Promise<ReplyState> {
  const { supabase, user } = await requireAdmin();
  const subject = String(form.get("subject") ?? "").trim().slice(0, 300);
  const body = String(form.get("body") ?? "").trim().slice(0, 20000);
  const newStatus = String(form.get("set_status") ?? "");
  if (!subject) return { ok: false, message: "Add a subject." };
  if (!body) return { ok: false, message: "Write a message." };

  const { data: app } = await supabase.from("career_pages").select("id, name, email").eq("id", id).maybeSingle();
  if (!app) return { ok: false, message: "Application not found." };

  let sent = false;
  let error: string | null = null;
  if (mailConfigured()) {
    try {
      await sendMail({ to: app.email, subject, text: body, replyTo: process.env.REPLY_TO_EMAIL || process.env.NOTIFY_EMAIL || undefined });
      sent = true;
    } catch (e) {
      error = (e as Error).message.slice(0, 500);
    }
  }
  await supabase.from("application_replies").insert({ application_id: id, subject, body, sent, error, sent_by: user.email ?? null });
  if (STATUS_VALUES.has(newStatus)) {
    await supabase.from("career_pages").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", id);
  }
  refresh(id);

  if (sent) return { ok: true, message: `Email sent to ${app.email}.` };
  const mailto = `mailto:${app.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return error
    ? { ok: false, message: `The email could not be sent (${error}). Opening your mail app instead…`, mailto }
    : { ok: true, message: "Saved to the history. Opening your mail app to send it…", mailto };
}

export async function deleteApplication(id: number) {
  await deleteSubmission("career_pages", id);
  revalidatePath("/admin", "layout");
  redirect("/admin/applications");
}
