import { SUPABASE_URL } from "./supabase/env";

export const PLACEHOLDER = "/upload/no_image.jpg";
export const STORAGE_PREFIX = "storage:";

/**
 * Resolve an image value stored in the database to a URL.
 * - "storage:<path>"  → file uploaded through the new admin (Supabase Storage, bucket "upload")
 * - "upload/..."      → legacy Laravel file shipped in /public
 * - "http(s)://..."   → used as-is
 * `folder` is prepended to bare legacy filenames (homes.home_images stores only the file name).
 */
export function media(value?: string | null, folder?: string): string {
  const v = value?.trim();
  if (!v) return PLACEHOLDER;
  if (/^https?:\/\//.test(v)) return v;
  if (v.startsWith(STORAGE_PREFIX)) {
    return `${SUPABASE_URL}/storage/v1/object/public/upload/${encodePath(v.slice(STORAGE_PREFIX.length))}`;
  }
  const path = folder && !v.includes("/") ? `${folder}/${v}` : v;
  return "/" + encodePath(path.replace(/^\/+/, ""));
}

function encodePath(p: string) {
  return p.split("/").map(encodeURIComponent).join("/");
}

export function splitList(value?: string | null): string[] {
  return (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}
