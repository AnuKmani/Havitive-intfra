import { notFound, redirect } from "next/navigation";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import StatusSelect from "@/components/admin/StatusSelect";
import { requireSection } from "@/lib/admin/auth";
import { loadOptions } from "@/lib/admin/options";
import { getResource } from "@/lib/admin/resources";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { media } from "@/lib/media";
import { deleteArchived, restoreRecord } from "../../actions";
import { stripHtml } from "@/lib/text";

export default async function ResourceList({ params, searchParams }: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ view?: string; blocked?: string }>;
}) {
  const res = getResource((await params).resource);
  if (!res) notFound();
  // Home page sections are all edited together on the Home page editor.
  if (res.home) redirect("/admin/home");
  const { supabase, role } = await requireSection(res);
  const isAdmin = role === "admin";
  const { view, blocked } = await searchParams;
  const archivedView = !!res.archivable && isAdmin && view === "archived";
  let q = supabase.from(res.table).select("*").order("id", { ascending: false });
  for (const [k, v] of Object.entries(res.fixed ?? {})) q = q.eq(k, v);
  if (res.archivable) q = archivedView ? q.not("archived_at", "is", null) : q.is("archived_at", null);
  const { data: rows, error } = await q;
  const archivedCount = res.archivable && isAdmin && !archivedView
    ? (await supabase.from(res.table).select("id", { count: "exact", head: true }).not("archived_at", "is", null)).count ?? 0
    : 0;

  if (res.singleton) {
    if (rows?.[0]) redirect(`/admin/${res.key}/${rows[0].id}`);
    redirect(`/admin/${res.key}/new`);
  }

  // Lists that show choices (like a project's category) need the names, not the stored ids.
  const options = res.asTable ? await loadOptions(supabase) : {};
  const optionLabel = (col: string, v: unknown) => {
    const f = res.fields.find((x) => x.name === col);
    if (!f || f.type !== "select") return null;
    const list = typeof f.options === "string" ? options[f.options] : f.options;
    return list?.find((o) => o.value === String(v ?? ""))?.label ?? null;
  };
  const cell = (v: unknown, col: string) => {
    if (col === "created_at" && v) return new Date(String(v)).toLocaleDateString("en-IN");
    if (col === "id") return `#${v}`;
    const named = optionLabel(col, v);
    if (named) return named;
    const s = stripHtml(String(v ?? ""));
    return s.length > 90 ? s.slice(0, 90) + "…" : s || "—";
  };
  const label = (c: string) => res.fields.find((f) => f.name === c)?.label ?? (c === "created_at" ? "Date" : c === "id" ? "#" : c);
  const editHref = (id: number) => `/admin/${res.key}/${id}`;

  return (
    <>
      <PageHeader
        icon={res.icon}
        title={archivedView ? `Archived ${res.label.toLowerCase()}` : res.label}
        subtitle={archivedView
          ? `Hidden from the website · ${rows?.length ?? 0} archived. Restore one, or delete it for good.`
          : `${res.hint} · ${rows?.length ?? 0} item${rows?.length === 1 ? "" : "s"}`}
        action={<a className="ad-btn" href={`/admin/${res.key}/new`}><Icon name="plus" /> Add {res.singular.toLowerCase()}</a>}
      />
      {res.archivable && isAdmin && (
        <nav className="ad-tabs" aria-label="Views">
          <a href={`/admin/${res.key}`}><Icon name={res.icon} size={15} /> Published</a>
          <a href={`/admin/${res.key}?view=archived`}>
            <Icon name="folder" size={15} /> Archived{!archivedView && archivedCount ? ` (${archivedCount})` : ""}
          </a>
        </nav>
      )}
      {error && <p className="ad-err">{error.message}</p>}
      {blocked && Number(blocked) > 0 && (
        <p className="ad-err" role="alert">
          Not archived: this category still has {blocked} blog post{Number(blocked) === 1 ? "" : "s"}. Move them to another category or archive them first.
        </p>
      )}

      {!rows?.length && archivedView ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name="folder" size={40} /></span>
          <h2>Nothing archived</h2>
          <p>Archived {res.label.toLowerCase()} will appear here.</p>
        </div>
      ) : !rows?.length ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name={res.icon} size={40} /></span>
          <h2>No {res.label.toLowerCase()} yet</h2>
          <p>Add the first one and it will appear on the website.</p>
          <a className="ad-btn" href={`/admin/${res.key}/new`}><Icon name="plus" /> Add {res.singular.toLowerCase()}</a>
        </div>
      ) : res.thumb && !res.asTable ? (
        <div className="ad-cards-grid">
          {rows.map((r) => {
            const inner = (
              <>
                <div className="ad-item-img">
                  <img src={media(r[res.thumb!])} alt="" loading="lazy" />
                  {!archivedView && <span className="ad-item-edit"><Icon name="edit" size={14} /> Edit</span>}
                </div>
                <div className="ad-item-body">
                  <strong>{res.columns[0] === "id" ? `${res.singular} #${r.id}` : cell(r[res.columns[0]], res.columns[0])}</strong>
                  {res.columns[1] && <span>{cell(r[res.columns[1]], res.columns[1])}</span>}
                </div>
              </>
            );
            return archivedView ? (
              <div key={r.id} className="ad-item-card">
                {inner}
                <div style={{ display: "flex", gap: 8, padding: "0 14px 14px" }}>
                  <form action={restoreRecord.bind(null, res.key, r.id)}><button className="ad-btn ad-btn-light ad-btn-sm">Restore</button></form>
                  <ConfirmButton
                    action={deleteArchived.bind(null, res.key, r.id)}
                    label="Delete for good"
                    message={`Delete this ${res.singular.toLowerCase()} for good? This cannot be undone.`}
                  />
                </div>
              </div>
            ) : (
              <a key={r.id} href={editHref(r.id)} className="ad-item-card">{inner}</a>
            );
          })}
          {!archivedView && (
            <a href={`/admin/${res.key}/new`} className="ad-item-card ad-item-add">
              <Icon name="plus" size={30} />
              <span>Add {res.singular.toLowerCase()}</span>
            </a>
          )}
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                {res.asTable && res.thumb && <th className="ad-keep ad-th-thumb">Image</th>}
                {res.columns.map((c) => <th key={c}>{label(c)}</th>)}
                {res.asTable && res.statusField && <th className="ad-keep">{label(res.statusField.name)}</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  {res.asTable && res.thumb && (
                    <td className="ad-keep ad-td-thumb">
                      <a href={editHref(r.id)} aria-label={`Edit ${cell(r[res.columns[0]], res.columns[0])}`}>
                        <img className="ad-row-thumb" src={media(r[res.thumb])} alt="" loading="lazy" />
                      </a>
                    </td>
                  )}
                  {res.columns.map((c, i) => (
                    <td key={c}>
                      {i === 0 ? (
                        <a href={editHref(r.id)} className="ad-row-title">
                          {!(res.asTable && res.thumb) && <span className="ad-row-icon"><Icon name={res.icon} size={16} /></span>}
                          {cell(r[c], c)}
                        </a>
                      ) : (
                        cell(r[c], c)
                      )}
                    </td>
                  ))}
                  {res.asTable && res.statusField && (
                    <td className="ad-keep">
                      <StatusSelect
                        resourceKey={res.key}
                        id={r.id}
                        value={String(r[res.statusField.name] ?? res.statusField.options[0].value)}
                        options={res.statusField.options}
                      />
                    </td>
                  )}
                  <td className="ad-right">
                    {archivedView ? (
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <form action={restoreRecord.bind(null, res.key, r.id)}><button className="ad-btn ad-btn-light ad-btn-sm">Restore</button></form>
                        <ConfirmButton
                          action={deleteArchived.bind(null, res.key, r.id)}
                          label="Delete for good"
                          message={`Delete this ${res.singular.toLowerCase()} for good? This cannot be undone.`}
                        />
                      </div>
                    ) : (
                      <a href={editHref(r.id)} className="ad-btn ad-btn-light ad-btn-sm"><Icon name="edit" size={14} /> Edit</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
