import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Option } from "./resources";

export async function loadOptions(supabase: SupabaseClient): Promise<Record<string, Option[]>> {
  const [sectors, sections, amenities, cats] = await Promise.all([
    supabase.from("sectors").select("id, sector_name").order("id"),
    supabase.from("sections").select("id, section_name").order("id"),
    supabase.from("project_aminities").select("id, aminity_name").order("id"),
    supabase.from("blog_categories").select("id, category_name").order("id"),
  ]);
  const map = <T extends { id: number }>(rows: T[] | null, label: (r: T) => string | null) =>
    (rows ?? []).map((r) => ({ value: String(r.id), label: label(r) ?? `#${r.id}` }));
  return {
    sectors: map(sectors.data, (r) => r.sector_name),
    sections: map(sections.data, (r) => r.section_name),
    amenities: map(amenities.data, (r) => r.aminity_name),
    blog_categories: map(cats.data, (r) => r.category_name),
  };
}
