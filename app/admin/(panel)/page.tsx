import Icon from "@/components/admin/Icon";
import { requireAdmin } from "@/lib/admin/auth";
import { RESOURCES } from "@/lib/admin/resources";
import { media } from "@/lib/media";
import type { Apply, Project } from "@/lib/types";

export const metadata = { title: "Dashboard" };

function greeting() {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, fixed?: Record<string, string>) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    for (const [k, v] of Object.entries(fixed ?? {})) q = q.eq(k, v);
    return (await q).count ?? 0;
  };
  // Latest image per section, for the picture previews on the section cards.
  const latestThumb = async (table: string, column?: string, fixed?: Record<string, string>) => {
    if (!column) return null;
    let q = supabase.from(table).select(column).not(column, "is", null).order("id", { ascending: false }).limit(1);
    for (const [k, v] of Object.entries(fixed ?? {})) q = q.eq(k, v);
    const { data } = await q;
    const row = data?.[0] as unknown as Record<string, string> | undefined;
    return row?.[column]?.split(",")[0] ?? null;
  };

  const [enquiries, applications, counts, thumbs, recentEnquiries, recentProjects] = await Promise.all([
    count("applies"),
    count("career_pages"),
    Promise.all(RESOURCES.map((r) => count(r.table, r.fixed))),
    Promise.all(RESOURCES.map((r) => latestThumb(r.table, r.thumb ?? r.fields.find((f) => f.type === "images")?.name, r.fixed))),
    supabase.from("applies").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("latest_projects").select("id, project_name, project_heading, project_image, updated_at").order("updated_at", { ascending: false }).limit(4),
  ]);
  const countOf = (key: string) => counts[RESOURCES.findIndex((r) => r.key === key)];

  const stats = [
    { label: "Enquiries", value: enquiries, icon: "inbox", href: "/admin/enquiries", tone: "blue" },
    { label: "Job applications", value: applications, icon: "briefcase", href: "/admin/applications", tone: "violet" },
    { label: "Projects", value: countOf("projects"), icon: "building", href: "/admin/projects", tone: "amber" },
    { label: "Blog posts", value: countOf("posts"), icon: "pen", href: "/admin/posts", tone: "green" },
  ];
  const groups = [...new Set(RESOURCES.map((r) => r.group))];
  const latest = (recentEnquiries.data ?? []) as Apply[];
  const projects = (recentProjects.data ?? []) as Pick<Project, "id" | "project_name" | "project_heading" | "project_image">[];

  return (
    <>
      <section className="ad-hero">
        <div className="ad-hero-text">
          <span className="ad-hero-kicker">Havitive Infra Pvt Ltd</span>
          <h1>{greeting()}!</h1>
          <p>Manage your website content here. Changes appear on the live site within a few seconds.</p>
          <div className="ad-hero-actions">
            <a className="ad-btn ad-btn-white" href="/admin/home"><Icon name="edit" /> Edit home page</a>
            <a className="ad-btn ad-btn-ghost" href="/admin/projects/new"><Icon name="plus" /> Add project</a>
            <a className="ad-btn ad-btn-ghost" href="/admin/posts/new"><Icon name="pen" /> Write blog post</a>
            <a className="ad-btn ad-btn-ghost" href="/" target="_blank"><Icon name="external" /> View website</a>
          </div>
        </div>
        <div className="ad-hero-img" aria-hidden="true">
          <img src="/upload/logos/havitive.jpeg" alt="" />
        </div>
      </section>

      <div className="ad-stats">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className={`ad-stat tone-${s.tone}`}>
            <span className="ad-stat-icon"><Icon name={s.icon} size={22} /></span>
            <span className="ad-stat-body">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="ad-split">
        <section className="ad-panel">
          <div className="ad-panel-head">
            <h2><Icon name="inbox" /> Latest enquiries</h2>
            <a href="/admin/enquiries" className="ad-link">View all <Icon name="arrow" size={14} /></a>
          </div>
          {!latest.length ? (
            <div className="ad-empty-sm"><Icon name="inbox" size={28} /> No enquiries yet</div>
          ) : (
            <ul className="ad-feed">
              {latest.map((e) => (
                <li key={e.id}>
                  <span className="ad-avatar">{(e.name ?? "?").charAt(0).toUpperCase()}</span>
                  <div>
                    <strong>{e.name}</strong> {e.service_type && <span className="ad-tag">{e.service_type}</span>}
                    <p>{(e.message ?? "").slice(0, 90)}{(e.message ?? "").length > 90 ? "…" : ""}</p>
                  </div>
                  <time>{e.created_at ? new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ad-panel">
          <div className="ad-panel-head">
            <h2><Icon name="building" /> Recent projects</h2>
            <a href="/admin/projects" className="ad-link">All projects <Icon name="arrow" size={14} /></a>
          </div>
          <div className="ad-mini-grid">
            {projects.map((p) => (
              <a key={p.id} href={`/admin/projects/${p.id}`} className="ad-mini-card">
                <img src={media(p.project_image)} alt="" />
                <span>{p.project_name}</span>
              </a>
            ))}
            <a href="/admin/projects/new" className="ad-mini-card ad-mini-add"><Icon name="plus" size={26} /><span>New project</span></a>
          </div>
        </section>
      </div>

      {groups.map((g) => (
        <section key={g} className="ad-section">
          <h2 className="ad-section-title">{g}</h2>
          <div className="ad-tiles">
            {RESOURCES.map((r, i) => ({ r, i })).filter(({ r }) => r.group === g).map(({ r, i }) => (
              <a key={r.key} href={r.home ? "/admin/home" : `/admin/${r.key}`} className="ad-tile">
                <div className="ad-tile-img">
                  {thumbs[i] ? <img src={media(thumbs[i], r.fields.find((f) => f.legacyFolder)?.legacyFolder)} alt="" /> : <Icon name={r.icon} size={34} />}
                </div>
                <div className="ad-tile-body">
                  <div className="ad-tile-title"><Icon name={r.icon} size={16} /> {r.label}</div>
                  <p>{r.hint}</p>
                  <span className="ad-tile-count">{r.singleton ? "Edit" : `${counts[i]} item${counts[i] === 1 ? "" : "s"}`}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
