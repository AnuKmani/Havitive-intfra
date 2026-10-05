import type { Metadata } from "next";
import Breadcrumb from "@/components/site/Breadcrumb";
import { getProjectsBySector, getSector, getSectors } from "@/lib/data";
import { loadBySlug } from "@/lib/canonical";
import { media } from "@/lib/media";
import { routes } from "@/lib/routes";
import { truncate } from "@/lib/text";

export const revalidate = 300;
const PER_PAGE = 30;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateStaticParams() {
  const sectors = await getSectors();
  return sectors.map((s) => ({ slug: routes.sectorProjects(s).split("/").pop()! }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sector = await loadBySlug(slug, getSector, routes.sectorProjects);
  return {
    title: `${sector.sector_name} – All Projects`,
    description: `Browse all ${sector.sector_name?.toLowerCase()} designed and delivered by Havitive Infra Pvt Ltd in Kerala.`,
    alternates: { canonical: routes.sectorProjects(sector) },
  };
}

export default async function SectorProjectsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sector = await loadBySlug(slug, getSector, routes.sectorProjects);
  const all = await getProjectsBySector(sector.id);
  const pages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number((await searchParams).page) || 1));
  const projects = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const from = all.length ? (page - 1) * PER_PAGE + 1 : 0;

  return (
    <>
      <Breadcrumb
        title={`${sector.sector_name}`}
        trail={[{ name: sector.sector_name ?? "", href: routes.sector(sector) }, { name: "All Projects", href: routes.sectorProjects(sector) }]}
      />
      <section className="space-top space-extra-bottom">
        <div className="container">
          <div className="th-sort-bar">
            <div className="row justify-content-between align-items-center">
              <div className="col-md">
                <p className="woocommerce-result-count">Showing {from}–{from + projects.length - (all.length ? 1 : 0)} of {all.length} results</p>
              </div>
            </div>
          </div>
          <div className="row gy-40">
            {projects.length === 0 && <p className="text-center">No projects found.</p>}
            {projects.map((p) => (
              <div className="col-md-6 col-xl-4" key={p.id}>
                <article className="property-card2">
                  <div className="property-card-thumb img-shine">
                    <img src={media(p.project_image)} alt={p.project_name ?? "Project"} loading="lazy" />
                  </div>
                  <div className="property-card-details">
                    <div className="media-left">
                      <h2 className="property-card-title h4"><a href={routes.project(p)}>{p.project_name}</a></h2>
                      <p className="mb-0">{truncate(p.description, 80)}</p>
                    </div>
                    <div className="btn-wrap"><a href={routes.project(p)} className="th-btn style-border2 th-btn-icon">Details</a></div>
                  </div>
                </article>
              </div>
            ))}
          </div>
          {pages > 1 && (
            <nav className="mt-60 text-center" aria-label="Pagination">
              <div className="th-pagination">
                <ul>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                    <li key={n}><a href={`${routes.sectorProjects(sector)}${n > 1 ? `?page=${n}` : ""}`} className={n === page ? "active" : ""}>{n}</a></li>
                  ))}
                </ul>
              </div>
            </nav>
          )}
        </div>
      </section>
    </>
  );
}
