"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource, type Field } from "@/lib/admin/resources";
import { serverClient } from "@/lib/supabase/server";

export type ActionState = { ok: boolean; message: string } | null;

const INT_COLUMNS = new Set(["sector_id", "blogcat_id", "project_id", "job_id"]);

function readValues(fields: Field[], form: FormData, table: string) {
  const values: Record<string, string | number | null> = {};
  for (const f of fields) {
    let v: string | null =
      f.type === "multiselect" ? form.getAll(f.name).map(String).filter(Boolean).join(",") : String(form.get(f.name) ?? "").trim();
    if (v === "") v = null;
    if (f.required && v === null) throw new Error(`${f.label} is required.`);
    values[f.name] = v !== null && (INT_COLUMNS.has(f.name) || (table === "sectors" && f.name === "category")) ? Number(v) : v;
  }
  return values;
}

function refreshSite() {
  updateTag("content");
  revalidatePath("/", "layout");
}

export async function saveRecord(resourceKey: string, id: number | null, _: ActionState, form: FormData): Promise<ActionState> {
  const res = getResource(resourceKey);
  if (!res) return { ok: false, message: "Unknown section." };
  const { supabase } = await requireAdmin();
  let values: Record<string, string | number | null>;
  try {
    values = readValues(res.fields, form, res.table);
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  if (res.derive) Object.assign(values, res.derive(values as Record<string, string | null>, id === null));
  Object.assign(values, res.fixed ?? {});

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
  const { supabase } = await requireAdmin();
  for (const child of res.children ?? []) await supabase.from(child.table).delete().eq(child.foreignKey, id);
  await supabase.from(res.table).delete().eq("id", id);
  refreshSite();
  redirect(`/admin/${res.key}`);
}

export async function saveChild(
  resourceKey: string, childKey: string, parentId: number, id: number | null, _: ActionState, form: FormData,
): Promise<ActionState> {
  const child = getResource(resourceKey)?.children?.find((c) => c.key === childKey);
  if (!child) return { ok: false, message: "Unknown section." };
  const { supabase } = await requireAdmin();
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
  const { supabase } = await requireAdmin();
  await supabase.from(child.table).delete().eq("id", id).eq(child.foreignKey, parentId);
  refreshSite();
  revalidatePath(`/admin/${resourceKey}/${parentId}`);
}

export async function deleteSubmission(table: "applies" | "career_pages", id: number) {
  const { supabase } = await requireAdmin();
  if (table === "career_pages") {
    const { data } = await supabase.from("career_pages").select("cv_path, cover_letter_path").eq("id", id).maybeSingle();
    const files = [data?.cv_path, data?.cover_letter_path]
      .filter((p): p is string => !!p && p.startsWith("applications:"))
      .map((p) => p.slice("applications:".length));
    if (files.length) await supabase.storage.from("applications").remove(files);
  }
  await supabase.from(table).delete().eq("id", id);
  revalidatePath(table === "applies" ? "/admin/enquiries" : "/admin/applications");
}

export async function signIn(_: ActionState, form: FormData): Promise<ActionState> {
  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { ok: false, message: "Wrong email or password." };
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account is not an administrator." };
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function changePassword(_: ActionState, form: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const password = String(form.get("password") ?? "");
  if (password.length < 10) return { ok: false, message: "Use at least 10 characters." };
  if (password !== String(form.get("confirm") ?? "")) return { ok: false, message: "The passwords don't match." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Password changed." };
}
