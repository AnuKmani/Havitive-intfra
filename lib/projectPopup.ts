import type { Gallery, Project, Sector } from "@/lib/types";
import type { PopupProject } from "@/components/home/ProjectPopup";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { formatDate, truncate } from "@/lib/text";

/** YouTube / Vimeo link → address that can be shown in an iframe; null for anything else. */
export function toEmbed(url?: string | null): string | null {
  const u = (url ?? "").trim();
  const yt = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(u);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(u);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`;
  return null;
}

/** The details a project card shows in its popup: cover image first, then the gallery. */
export function toPopup(p: Project, sectors: Sector[] = [], galleries: Gallery[] = []): PopupProject {
  const cover = media(p.project_image);
  const extra = galleries.filter((g) => g.project_id === p.id && g.gallery).map((g) => media(g.gallery));
  return {
    href: routes.project(p),
    name: p.project_name ?? "Project",
    images: [cover, ...extra.filter((u) => u !== cover)],
    imageAlt: p.project_image_alt || p.project_name || "Project",
    description: truncate(p.description, 400),
    category: sectors.find((s) => s.id === p.sector_id)?.sector_name,
    client: p.client_name,
    date: p.project_date && /^\d{4}-\d{2}-\d{2}$/.test(p.project_date) ? formatDate(p.project_date) : p.project_date,
    location: p.location,
    video: toEmbed(p.main_content),
  };
}
