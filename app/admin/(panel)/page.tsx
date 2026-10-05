import { requireAdmin } from "@/lib/admin/auth";
import { RESOURCES } from "@/lib/admin/resources";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, fixed?: Record<string, string>) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    for (const [k, v] of Object.entries(fixed ?? {})) q = q.eq(k, v);
    return (await q).count ?? 0;
  };
  const [enquiries, applications, ...counts] = await Promise.all([
    count("applies"), count("career_pages"), ...RESOURCES.map((r) => count(r.table, r.fixed)),
  ]);
  return (
    <>
      <h1>Dashboard</h1>
      <p className="ad-muted">Changes you save here appear on the website within a few seconds.</p>
      <div className="ad-cards">
        <a className="ad-card ad-card-hi" href="/admin/enquiries"><strong>{enquiries}</strong><span>Enquiries</span></a>
        <a className="ad-card ad-card-hi" href="/admin/applications"><strong>{applications}</strong><span>Job applications</span></a>
        {RESOURCES.map((r, i) => (
          <a className="ad-card" key={r.key} href={`/admin/${r.key}`}><strong>{counts[i]}</strong><span>{r.label}</span></a>
        ))}
      </div>
    </>
  );
}
