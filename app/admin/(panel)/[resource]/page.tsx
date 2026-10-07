import { notFound, redirect } from "next/navigation";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { getResource } from "@/lib/admin/resources";
import { media } from "@/lib/media";
import { stripHtml } from "@/lib/text";

export default async function ResourceList({ params }: { params: Promise<{ resource: string }> }) {
  const res = getResource((await params).resource);
  if (!res) notFound();
  const { supabase } = await requireAdmin();
  let q = supabase.from(res.table).select("*").order("id", { ascending: false });
  for (const [k, v] of Object.entries(res.fixed ?? {})) q = q.eq(k, v);
  const { data: rows, error } = await q;

  if (res.singleton) {
    if (rows?.[0]) redirect(`/admin/${res.key}/${rows[0].id}`);
    redirect(`/admin/${res.key}/new`);
  }

  const cell = (v: unknown, col: string) => {
    if (col === "created_at" && v) return new Date(String(v)).toLocaleDateString("en-IN");
    if (res.key === "sectors" && col === "category") return v === 0 ? "Government" : "Private";
    if (col === "id") return `#${v}`;
    const s = stripHtml(String(v ?? ""));
    return s.length > 90 ? s.slice(0, 90) + "…" : s || "—";
  };
  const label = (c: string) => res.fields.find((f) => f.name === c)?.label ?? (c === "created_at" ? "Date" : c === "id" ? "#" : c);
  const editHref = (id: number) => `/admin/${res.key}/${id}`;

  return (
    <>
      <PageHeader
        icon={res.icon}
        title={res.label}
        subtitle={`${res.hint} · ${rows?.length ?? 0} item${rows?.length === 1 ? "" : "s"}`}
        action={<a className="ad-btn" href={`/admin/${res.key}/new`}><Icon name="plus" /> Add {res.singular.toLowerCase()}</a>}
      />
      {error && <p className="ad-err">{error.message}</p>}

      {!rows?.length ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name={res.icon} size={40} /></span>
          <h2>No {res.label.toLowerCase()} yet</h2>
          <p>Add the first one and it will appear on the website.</p>
          <a className="ad-btn" href={`/admin/${res.key}/new`}><Icon name="plus" /> Add {res.singular.toLowerCase()}</a>
        </div>
      ) : res.thumb ? (
        <div className="ad-cards-grid">
          {rows.map((r) => (
            <a key={r.id} href={editHref(r.id)} className="ad-item-card">
              <div className="ad-item-img">
                <img src={media(r[res.thumb!])} alt="" loading="lazy" />
                <span className="ad-item-edit"><Icon name="edit" size={14} /> Edit</span>
              </div>
              <div className="ad-item-body">
                <strong>{res.columns[0] === "id" ? `${res.singular} #${r.id}` : cell(r[res.columns[0]], res.columns[0])}</strong>
                {res.columns[1] && <span>{cell(r[res.columns[1]], res.columns[1])}</span>}
              </div>
            </a>
          ))}
          <a href={`/admin/${res.key}/new`} className="ad-item-card ad-item-add">
            <Icon name="plus" size={30} />
            <span>Add {res.singular.toLowerCase()}</span>
          </a>
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                {res.columns.map((c) => <th key={c}>{label(c)}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {res.columns.map((c, i) => (
                    <td key={c}>
                      {i === 0 ? (
                        <a href={editHref(r.id)} className="ad-row-title">
                          <span className="ad-row-icon"><Icon name={res.icon} size={16} /></span>
                          {cell(r[c], c)}
                        </a>
                      ) : res.key === "sectors" && c === "category" ? (
                        <span className={`ad-pill ${r[c] === 0 ? "pill-blue" : "pill-green"}`}>{cell(r[c], c)}</span>
                      ) : (
                        cell(r[c], c)
                      )}
                    </td>
                  ))}
                  <td className="ad-right"><a href={editHref(r.id)} className="ad-btn ad-btn-light ad-btn-sm"><Icon name="edit" size={14} /> Edit</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
