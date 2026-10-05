import { notFound, redirect } from "next/navigation";
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
    const s = stripHtml(String(v ?? ""));
    return s.length > 90 ? s.slice(0, 90) + "…" : s || "—";
  };

  return (
    <>
      <div className="ad-head">
        <h1>{res.label}</h1>
        <a className="ad-btn" href={`/admin/${res.key}/new`}>+ Add {res.singular.toLowerCase()}</a>
      </div>
      {error && <p className="ad-err">{error.message}</p>}
      {!rows?.length ? (
        <p className="ad-muted">Nothing here yet.</p>
      ) : (
        <table className="ad-table">
          <thead>
            <tr>
              {res.thumb && <th></th>}
              {res.columns.map((c) => <th key={c}>{res.fields.find((f) => f.name === c)?.label ?? (c === "created_at" ? "Date" : c === "id" ? "#" : c)}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {res.thumb && <td className="ad-thumb"><img src={media(r[res.thumb])} alt="" /></td>}
                {res.columns.map((c, i) => (
                  <td key={c}>{i === 0 ? <a href={`/admin/${res.key}/${r.id}`}>{cell(r[c], c)}</a> : cell(r[c], c)}</td>
                ))}
                <td className="ad-right"><a href={`/admin/${res.key}/${r.id}`}>Edit</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
