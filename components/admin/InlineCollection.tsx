import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteInline, saveInline } from "@/app/admin/actions";
import type { Option, Resource, Row } from "@/lib/admin/resources";
import { media } from "@/lib/media";
import { stripHtml } from "@/lib/text";
import ConfirmButton from "./ConfirmButton";
import Icon from "./Icon";
import RecordForm from "./RecordForm";

/** Edit every record of a section in place: expandable cards plus an "Add" form. */
export default async function InlineCollection({ supabase, res, options, returnTo, id }: {
  supabase: SupabaseClient;
  res: Resource;
  options: Record<string, Option[]>;
  returnTo: string;
  id: string;
}) {
  let q = supabase.from(res.table).select("*").order("id", { ascending: true });
  for (const [k, v] of Object.entries(res.fixed ?? {})) q = q.eq(k, v);
  const rows = ((await q).data ?? []) as Row[];
  const title = (r: Row) => {
    const col = res.columns[0];
    const v = col === "id" ? `${res.singular} #${r.id}` : stripHtml(String(r[col] ?? ""));
    return v.length > 70 ? v.slice(0, 70) + "…" : v || `${res.singular} #${r.id}`;
  };
  const subtitle = (r: Row) => (res.columns[1] ? stripHtml(String(r[res.columns[1]] ?? "")).slice(0, 80) : "");

  return (
    <section className="ad-panel" id={id}>
      <div className="ad-panel-head">
        <h2><Icon name={res.icon} /> {res.label}</h2>
        <span className="ad-tag">{rows.length}</span>
      </div>
      <p className="ad-muted ad-panel-hint">{res.hint}</p>
      <div className={res.thumb ? "ad-children ad-children-cards" : "ad-children"}>
        {rows.map((r) => (
          <details key={r.id} className="ad-child">
            <summary>
              {res.thumb && <img src={media(r[res.thumb])} alt="" />}
              <span className="ad-child-text">
                <strong>{title(r)}</strong>
                {subtitle(r) && <small>{subtitle(r)}</small>}
              </span>
              <span className="ad-child-edit"><Icon name="edit" size={14} /> Edit</span>
            </summary>
            <RecordForm compact fields={res.fields} values={r} options={options} action={saveInline.bind(null, res.key, r.id, returnTo)} />
            <ConfirmButton action={deleteInline.bind(null, res.key, r.id, returnTo)} label="Delete" />
          </details>
        ))}
      </div>
      <details className="ad-child ad-child-new" key={`new-${rows.length}`}>
        <summary><Icon name="plus" /> Add {res.singular.toLowerCase()}</summary>
        <RecordForm compact fields={res.fields} values={{}} options={options} action={saveInline.bind(null, res.key, null, returnTo)} submitLabel={`Add ${res.singular.toLowerCase()}`} />
      </details>
    </section>
  );
}
