import "server-only";
import type { Metadata } from "next";
import { getSeo } from "./data";
import { buildMetadata, STATIC_PAGES, type SeoDefaults } from "./seo";

/** Metadata for a page: automatic values, overridden by whatever the admin set in the SEO manager. */
export async function pageMetadata(key: string, defaults: SeoDefaults, extra?: Metadata): Promise<Metadata> {
  return buildMetadata(defaults, await getSeo(key), extra);
}

export const staticPageMetadata = (key: keyof typeof STATIC_PAGES & string) => pageMetadata(key, STATIC_PAGES[key]);
