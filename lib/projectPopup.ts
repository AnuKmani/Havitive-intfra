import type { Project, Sector } from "@/lib/types";
import type { PopupProject } from "@/components/home/ProjectPopup";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { truncate } from "@/lib/text";

/** The details a project card shows in its popup. */
export function toPopup(p: Project, sectors: Sector[] = []): PopupProject {
  return {
    href: routes.project(p),
    name: p.project_name ?? "Project",
    image: media(p.project_image),
    imageAlt: p.project_image_alt || p.project_name || "Project",
    description: truncate(p.description, 400),
    category: sectors.find((s) => s.id === p.sector_id)?.sector_name,
    client: p.client_name,
    date: p.project_date,
    location: p.location,
  };
}
