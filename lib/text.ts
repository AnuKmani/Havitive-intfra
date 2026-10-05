export function slugify(s?: string | null): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** "kottarakkara-municipality-office-5" → 5 ; "5" → 5 */
export function idFromSlug(slug: string): number | null {
  const m = /(?:^|-)(\d+)$/.exec(slug);
  return m ? Number(m[1]) : null;
}

export function slugWithId(name: string | null | undefined, id: number): string {
  const s = slugify(name);
  return s ? `${s}-${id}` : String(id);
}

export function stripHtml(html?: string | null): string {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(s: string | null | undefined, n: number): string {
  const t = stripHtml(s);
  return t.length > n ? t.slice(0, n).trimEnd() + "..." : t;
}

export function truncateWords(s: string | null | undefined, n: number): string {
  const words = stripHtml(s).split(" ");
  return words.length > n ? words.slice(0, n).join(" ") + "..." : words.join(" ");
}

export function titleCase(s?: string | null): string {
  return (s ?? "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(d?: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
}

/** Light clean-up for admin-authored HTML before rendering it. */
export function safeHtml(html?: string | null): string {
  return (html ?? "")
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form|link|meta)[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["']?)\s*javascript:[^"'\s>]*\2/gi, "$1=\"#\"");
}

/** Plain text with line breaks → paragraphs; HTML is passed through safeHtml. */
export function richText(value?: string | null): string {
  const v = value ?? "";
  if (/<[a-z][\s\S]*>/i.test(v)) return safeHtml(v);
  return v
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`)
    .join("");
}
