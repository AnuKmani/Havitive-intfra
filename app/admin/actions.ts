"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireCareers, requireContent, requireEnquiries, requireEnquiryArchive, requireSection, requireStaff, requireStaffAny } from "@/lib/admin/auth";
import { altName, getResource, type Field, type Resource } from "@/lib/admin/resources";
import { serverClient } from "@/lib/supabase/server";

export type ActionState = { ok: boolean; message: string } | null;

const INT_COLUMNS = new Set(["sector_id", "blogcat_id", "project_id", "job_id", "sort_order"]);

function readValues(fields: Field[], form: FormData, table: string) {
  const values: Record<string, string | number | null> = {};
  for (const f of fields) {
    let v: string | null =
      f.type === "multiselect" ? form.getAll(f.name).map(String).filter(Boolean).join(",") : String(form.get(f.name) ?? "").trim();
    if (v === "") v = null;
    if (f.required && v === null) throw new Error(`${f.label} is required.`);
    values[f.name] = v !== null && (INT_COLUMNS.has(f.name) || (table === "sectors" && f.name === "category")) ? Number(v) : v;
    if (f.type === "image" || f.type === "images") {
      const alt = String(form.get(altName(f)) ?? "").trim();
      values[altName(f)] = alt || null;
    }
  }
  return values;
}

/** Refuses a second record with the same name / URL, e.g. when a marketing manager and a designer both add the same blog category. */
async function duplicateMessage(
  supabase: Awaited<ReturnType<typeof serverClient>>,
  res: Resource,
  values: Record<string, string | number | null>,
  id: number | null,
) {
  const u = res.unique;
  const value = u && values[u.column];
  if (!u || typeof value !== "string" || !value) return null;
  let q = supabase.from(res.table).select("id").ilike(u.column, value.replace(/[\\%_]/g, "\\$&")).limit(1);
  if (id) q = q.neq("id", id);
  const { data } = await q;
  if (!data?.length) return null;
  const name = String(values[res.fields[0].name] ?? value);
  return `A ${u.label} named “${name}” is already added. Open the existing one from the list, or use a different name.`;
}

function refreshSite() {
  updateTag("content");
  revalidatePath("/", "layout");
}

export async function saveRecord(resourceKey: string, id: number | null, _: ActionState, form: FormData): Promise<ActionState> {
  const res = getResource(resourceKey);
  if (!res) return { ok: false, message: "Unknown section." };
  const { supabase } = await requireSection(res);
  let values: Record<string, string | number | null>;
  try {
    values = readValues(res.fields, form, res.table);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  if (res.derive) Object.assign(values, res.derive(values as Record<string, string | null>, id === null));
  Object.assign(values, res.fixed ?? {});
  const duplicate = await duplicateMessage(supabase, res, values, id);
  if (duplicate) return { ok: false, message: duplicate };

  let newId = id;
  if (id) {
    const { error } = await supabase.from(res.table).update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return { ok: false, message: error.message };
  } else {
    const { data, error } = await supabase.from(res.table).insert(values).select("id").single();
    if (error) return { ok: false, message: error.message };
    newId = data.id;
  }
  refreshSite();
  if (!id) redirect(`/admin/${res.key}/${newId}?saved=1`);
  return { ok: true, message: "Saved. The website is updated." };
}

export async function deleteRecord(resourceKey: string, id: number) {
  const res = getResource(resourceKey);
  if (!res || res.singleton) return;
  const { supabase, role } = await requireSection(res);
  if (res.archivable && role !== "admin") {
    // Marketing and designers can't delete: the record moves to the admin's Archived list instead.
    if (res.key === "categories") {
      // A category that still has live posts can't leave the website, or those posts would lose their category.
      const { count } = await supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("blogcat_id", id).is("archived_at", null);
      if (count) redirect(`/admin/categories?blocked=${count}`);
    }
    await supabase.from(res.table).update({ archived_at: new Date().toISOString() }).eq("id", id);
    refreshSite();
    redirect(`/admin/${res.key}`);
  }
  for (const child of res.children ?? []) await supabase.from(child.table).delete().eq(child.foreignKey, id);
  await supabase.from(res.table).delete().eq("id", id);
  refreshSite();
  redirect(`/admin/${res.key}`);
}

/** Admin only: bring an archived record back onto the website. */
export async function restoreRecord(resourceKey: string, id: number) {
  const res = getResource(resourceKey);
  if (!res?.archivable) return;
  const { supabase } = await requireAdmin();
  await supabase.from(res.table).update({ archived_at: null }).eq("id", id);
  refreshSite();
  revalidatePath(`/admin/${res.key}`);
}

/** Admin only: delete an archived record for good. */
export async function deleteArchived(resourceKey: string, id: number) {
  const res = getResource(resourceKey);
  if (!res?.archivable) return;
  const { supabase } = await requireAdmin();
  await supabase.from(res.table).delete().eq("id", id).not("archived_at", "is", null);
  refreshSite();
  revalidatePath(`/admin/${res.key}`);
}

export async function saveChild(
  resourceKey: string, childKey: string, parentId: number, id: number | null, _: ActionState, form: FormData,
): Promise<ActionState> {
  const child = getResource(resourceKey)?.children?.find((c) => c.key === childKey);
  if (!child) return { ok: false, message: "Unknown section." };
  const { supabase } = await requireContent();
  let values: Record<string, string | number | null>;
  try {
    values = readValues(child.fields, form, child.table);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  values[child.foreignKey] = parentId;
  const { error } = id
    ? await supabase.from(child.table).update({ ...values, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from(child.table).insert(values);
  if (error) return { ok: false, message: error.message };
  refreshSite();
  revalidatePath(`/admin/${resourceKey}/${parentId}`);
  return { ok: true, message: id ? "Saved." : "Added." };
}

export async function deleteChild(resourceKey: string, childKey: string, parentId: number, id: number) {
  const child = getResource(resourceKey)?.children?.find((c) => c.key === childKey);
  if (!child) return;
  const { supabase } = await requireContent();
  await supabase.from(child.table).delete().eq("id", id).eq(child.foreignKey, parentId);
  refreshSite();
  revalidatePath(`/admin/${resourceKey}/${parentId}`);
}

export async function deleteSubmission(table: "applies" | "career_pages", id: number) {
  const { supabase } = await (table === "career_pages" ? requireCareers() : requireAdmin());
  if (table === "career_pages") {
    const { data } = await supabase.from("career_pages").select("cv_path, cover_letter_path").eq("id", id).maybeSingle();
    const files = [data?.cv_path, data?.cover_letter_path]
      .filter((p): p is string => !!p && p.startsWith("applications:"))
      .map((p) => p.slice("applications:".length));
    if (files.length) await supabase.storage.from("applications").remove(files);
  }
  await supabase.from(table).delete().eq("id", id);
  revalidatePath(table === "applies" ? "/admin/enquiries" : "/admin/applications");
  revalidatePath("/admin", "layout"); // refreshes the sidebar badges
}

/** Moves an enquiry out of the inbox. An admin can restore it or delete it for good. */
export async function archiveEnquiry(id: number) {
  const { supabase } = await requireEnquiryArchive();
  const now = new Date().toISOString();
  await supabase.from("applies").update({ archived_at: now, read_at: now }).eq("id", id);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin", "layout");
}

export async function restoreEnquiry(id: number) {
  const { supabase } = await requireAdmin();
  await supabase.from("applies").update({ archived_at: null }).eq("id", id);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin", "layout");
}

/** Marks one enquiry (or all of them, when id is null) as read, so the sidebar number goes down. */
export async function markEnquiriesRead(id: number | null) {
  const { supabase } = await requireEnquiries();
  let q = supabase.from("applies").update({ read_at: new Date().toISOString() }).is("read_at", null).is("archived_at", null);
  if (id !== null) q = q.eq("id", id);
  await q;
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin", "layout");
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function changePassword(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaffAny();
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { ok: false, message: "Use at least 10 characters." };
  if (password !== String(form.get("confirm") ?? "")) return { ok: false, message: "The passwords don't match." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };
  // Ends the "choose a new password" step for accounts that were given a temporary one.
  await supabase.rpc("clear_must_change_password");
  return { ok: true, message: "Password changed." };
}

/** Save from the combined Home page editor: never redirects, refreshes the editor instead. */
export async function saveInline(resourceKey: string, id: number | null, returnTo: string, _: ActionState, form: FormData): Promise<ActionState> {
  const res = getResource(resourceKey);
  if (!res) return { ok: false, message: "Unknown section." };
  const { supabase } = await requireSection(res);
  let values: Record<string, string | number | null>;
  try {
    values = readValues(res.fields, form, res.table);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  if (res.derive) Object.assign(values, res.derive(values as Record<string, string | null>, id === null));
  Object.assign(values, res.fixed ?? {});
  const duplicate = await duplicateMessage(supabase, res, values, id);
  if (duplicate) return { ok: false, message: duplicate };
  const { error } = id
    ? await supabase.from(res.table).update({ ...values, updated_at: new Date().toISOString() }).eq("id", id)
    : await supabase.from(res.table).insert(values);
  if (error) return { ok: false, message: error.message };
  refreshSite();
  revalidatePath(returnTo);
  return { ok: true, message: id ? "Saved. The website is updated." : "Added. The website is updated." };
}

export async function deleteInline(resourceKey: string, id: number, returnTo: string) {
  const res = getResource(resourceKey);
  if (!res || res.singleton) return;
  const { supabase } = await requireSection(res);
  if (res.key === "banners") {
    // Same rule as the Laravel admin: the home page always keeps at least one banner.
    const { count } = await supabase.from(res.table).select("id", { count: "exact", head: true });
    if ((count ?? 0) <= 1) return;
  }
  await supabase.from(res.table).delete().eq("id", id);
  refreshSite();
  revalidatePath(returnTo);
}

/** Add several gallery images or floor plans at once (one row per uploaded image). */
export async function addChildrenBulk(resourceKey: string, childKey: string, parentId: number, images: string[]) {
  const child = getResource(resourceKey)?.children?.find((c) => c.key === childKey);
  const imageField = child?.fields.find((f) => f.type === "image");
  if (!child || !imageField || !images.length) return;
  const { supabase } = await requireContent();
  const { count } = await supabase.from(child.table).select("id", { count: "exact", head: true }).eq(child.foreignKey, parentId);
  const titleField = child.title !== imageField.name ? child.title : null;
  const rows = images
    .filter((p) => typeof p === "string" && p.startsWith("storage:"))
    .slice(0, 50)
    .map((path, i) => ({
      [child.foreignKey]: parentId,
      [imageField.name]: path,
      ...(titleField ? { [titleField]: `${child.key === "floors" ? "Plan" : "Item"} ${(count ?? 0) + i + 1}` } : {}),
    }));
  await supabase.from(child.table).insert(rows);
  refreshSite();
  revalidatePath(`/admin/${resourceKey}/${parentId}`);
}

const SEO_KEY = /^(page:[a-z-]+|(project|sector|sector-projects|service|team|post|blog-category):\d+)$/;

const CONTENT_SEO_KEY = /^(page:home|(project|post|blog-category):\d+)$/;

export async function saveSeo(key: string, returnTo: string, _: ActionState, form: FormData): Promise<ActionState> {
  if (!SEO_KEY.test(key)) return { ok: false, message: "Unknown page." };
  const { supabase, role } = await requireContent();
  // Marketing and designers only handle SEO for the pages they edit: home, projects and blog.
  if (role !== "admin" && !CONTENT_SEO_KEY.test(key)) return { ok: false, message: "You can't change SEO for that page." };
  const str = (k: string, max: number) => {
    const v = String(form.get(k) ?? "").trim().slice(0, max);
    return v || null;
  };
  const canonical = str("canonical_url", 500);
  if (canonical && !/^(https?:\/\/|\/)/.test(canonical)) return { ok: false, message: "Canonical URL must start with https:// or /" };
  const { error } = await supabase.from("page_seo").upsert({
    key,
    meta_title: str("meta_title", 200),
    meta_description: str("meta_description", 400),
    canonical_url: canonical,
    og_image: str("og_image", 500),
    og_image_alt: str("og_image_alt", 200),
    noindex: form.get("noindex") === "on",
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, message: error.message };
  refreshSite();
  revalidatePath(returnTo);
  return { ok: true, message: "SEO settings saved." };
}

export async function updateProfile(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const name = String(form.get("name") ?? "").trim().slice(0, 100);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 30);
  const photo = String(form.get("photo") ?? "").trim().slice(0, 500);
  const { error } = await supabase.auth.updateUser({ data: { name, phone, photo } });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Profile updated." };
}

// ---- Two-step verification (authenticator app) ----

export type TwoFactorState = { ok: boolean; message: string; factorId?: string; qr?: string; secret?: string } | null;

const SIX_DIGITS = /^\d{6}$/;

/** Creates a new authenticator-app key and returns its QR code. Nothing changes until the code is confirmed. */
export async function startTwoFactor(): Promise<TwoFactorState> {
  const { supabase } = await requireStaff();
  const { data: existing } = await supabase.auth.mfa.listFactors();
  // Remove unfinished set-ups so a fresh QR code can be made.
  for (const f of existing?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`, issuer: "Havitive Admin" });
  if (error || !data) return { ok: false, message: error?.message ?? "Could not start set-up." };
  return { ok: true, message: "", factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function confirmTwoFactor(factorId: string, _: TwoFactorState, form: FormData): Promise<TwoFactorState> {
  const { supabase } = await requireStaff();
  const code = String(form.get("code") ?? "").replace(/\s+/g, "");
  if (!SIX_DIGITS.test(code)) return { ok: false, message: "Enter the 6-digit code from the app.", factorId };
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { ok: false, message: "That code didn't work. Try the newest code shown in the app.", factorId };
  revalidatePath("/admin/account");
  return { ok: true, message: "Two-step verification is on. You'll need a code from the app each time you sign in." };
}

export async function disableTwoFactor(_: TwoFactorState, form: FormData): Promise<TwoFactorState> {
  const { supabase } = await requireStaff();
  const code = String(form.get("code") ?? "").replace(/\s+/g, "");
  if (!SIX_DIGITS.test(code)) return { ok: false, message: "Enter the current 6-digit code to confirm." };
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp.find((f) => f.status === "verified");
  if (!factor) return { ok: true, message: "Two-step verification is already off." };
  const check = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (check.error) return { ok: false, message: "That code didn't work." };
  const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
  if (error) return { ok: false, message: error.message };
  revalidatePath("/admin/account");
  return { ok: true, message: "Two-step verification is off." };
}
