import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { listSitePages, loadSeoMap } from "@/lib/admin/seo-pages";

export const metadata = { title: "SEO manager" };

export default async function SeoManager() {
  const { supabase } = await requireAdmin();
  const [pages, seo] = await Promise.all([listSitePages(supabase), loadSeoMap(supabase)]);
  const custom = pages.filter((p) => seo.get(p.key)?.meta_title || seo.get(p.key)?.meta_description).length;
  const hidden = pages.filter((p) => seo.get(p.key)?.noindex).length;

  return (
    <>
      <PageHeader icon="globe" title="SEO manager" subtitle="Titles, descriptions, canonical URLs and share images for every page of the website." />
      <div className="ad-stats ad-stats-3">
        <div className="ad-stat tone-blue"><span className="ad-stat-icon"><Icon name="file" size={22} /></span><span className="ad-stat-body"><strong>{pages.length}</strong><span>Pages on the site</span></span></div>
        <div className="ad-stat tone-green"><span className="ad-stat-icon"><Icon name="check" size={22} /></span><span className="ad-stat-body"><strong>{custom}</strong><span>With custom SEO</span></span></div>
        <div className="ad-stat tone-amber"><span className="ad-stat-icon"><Icon name="sparkles" size={22} /></span><span className="ad-stat-body"><strong>{pages.length - custom}</strong><span>Using automatic SEO</span></span></div>
      </div>
      {hidden > 0 && <div className="ad-note"><Icon name="info" /> {hidden} page{hidden === 1 ? " is" : "s are"} hidden from Google (noindex).</div>}
      <p className="ad-muted">Every page already gets a title and description automatically from its content. Set custom ones for the pages that matter most.</p>
      <div className="ad-table-wrap">
        <table className="ad-table ad-seo-table">
          <thead>
            <tr><th>Page</th><th>Title shown in Google</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {pages.map((p) => {
              const o = seo.get(p.key);
              const isCustom = !!(o?.meta_title || o?.meta_description);
              return (
                <tr key={p.key}>
                  <td>
                    <a href={`/admin/seo/${encodeURIComponent(p.key)}`} className="ad-row-title">
                      <span className="ad-row-icon"><Icon name="file" size={16} /></span>
                      <span>
                        {p.label}
                        <small className="ad-row-sub">{p.type} · {p.path}</small>
                      </span>
                    </a>
                  </td>
                  <td className="ad-seo-title">{o?.meta_title || p.title}</td>
                  <td>
                    <span className={`ad-pill ${isCustom ? "pill-green" : "pill-amber"}`}>{isCustom ? "Custom" : "Automatic"}</span>
                    {o?.noindex && <span className="ad-pill pill-red">Hidden</span>}
                  </td>
                  <td className="ad-right ad-nowrap">
                    <a href={p.path} target="_blank" className="ad-btn ad-btn-light ad-btn-sm" title="View page"><Icon name="external" size={14} /></a>{" "}
                    <a href={`/admin/seo/${encodeURIComponent(p.key)}`} className="ad-btn ad-btn-light ad-btn-sm"><Icon name="edit" size={14} /> Edit SEO</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
