import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Option } from "./resources";

export async function loadOptions(supabase: SupabaseClient): Promise<Record<string, Option[]>> {
  const [sectors, cats] = await Promise.all([
    supabase.from("sectors").select("id, sector_name").order("id"),
    supabase.from("blog_categories").select("id, category_name").is("archived_at", null).order("id"),
  ]);
  const map = <T extends { id: number }>(rows: T[] | null, label: (r: T) => string | null) =>
    (rows ?? []).map((r) => ({ value: String(r.id), label: label(r) ?? `#${r.id}` }));
  return {
    sectors: map(sectors.data, (r) => r.sector_name),
    blog_categories: map(cats.data, (r) => r.category_name),
  };
}
