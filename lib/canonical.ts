import { notFound, permanentRedirect } from "next/navigation";
import { idFromSlug } from "./text";

/** Load a record from a "name-slug-<id>" URL segment; redirect old or mistyped slugs to the canonical one. */
export async function loadBySlug<R>(slug: string, fetcher: (id: number) => Promise<R | null>, canonical: (r: R) => string): Promise<R> {
  const id = idFromSlug(decodeURIComponent(slug));
  if (!id) notFound();
  const record = await fetcher(id);
  if (!record) notFound();
  const url = canonical(record);
  if (url.split("/").pop() !== slug) permanentRedirect(url);
  return record;
}
