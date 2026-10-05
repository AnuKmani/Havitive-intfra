import { notFound } from "next/navigation";
import RecordForm from "@/components/admin/RecordForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin/auth";
import { loadOptions } from "@/lib/admin/options";
import { getResource } from "@/lib/admin/resources";
import { media } from "@/lib/media";
import { deleteChild, deleteRecord, saveChild, saveRecord } from "../../../actions";

type Props = { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditRecord({ params, searchParams }: Props) {
  const { resource, id: rawId } = await params;
  const res = getResource(resource);
  if (!res) notFound();
  const isNew = rawId === "new";
  const id = isNew ? null : Number(rawId);
  if (!isNew && !Number.isInteger(id)) notFound();

  const { supabase } = await requireAdmin();
  const options = await loadOptions(supabase);
  let record: Record<string, unknown> = {};
  if (id) {
    const { data } = await supabase.from(res.table).select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    record = data;
  }
  const children = id
    ? await Promise.all(
        (res.children ?? []).map(async (c) => ({
          child: c,
          rows: (await supabase.from(c.table).select("*").eq(c.foreignKey, id).order("id")).data ?? [],
        })),
      )
    : [];
  const saved = (await searchParams).saved ? "Saved. The website is updated." : undefined;

  return (
    <>
      <div className="ad-head">
        <div>
          {!res.singleton && <a href={`/admin/${res.key}`} className="ad-muted">← {res.label}</a>}
          <h1>{isNew ? `New ${res.singular.toLowerCase()}` : res.singleton ? res.label : `Edit ${res.singular.toLowerCase()}`}</h1>
        </div>
        {id && !res.singleton && (
          <ConfirmButton action={deleteRecord.bind(null, res.key, id)} message={`Delete this ${res.singular.toLowerCase()}? This cannot be undone.`} />
        )}
      </div>

      <section className="ad-panel">
        <RecordForm
          fields={res.fields}
          values={record}
          options={options}
          action={saveRecord.bind(null, res.key, id)}
          submitLabel={isNew ? `Create ${res.singular.toLowerCase()}` : "Save changes"}
          initialMessage={saved}
        />
      </section>

      {isNew && res.children?.length ? <p className="ad-muted">Save the project first, then add gallery images, floor plans and facilities.</p> : null}

      {children.map(({ child, rows }) => (
        <section className="ad-panel" key={child.key}>
          <h2>{child.label}</h2>
          {rows.map((row) => (
            <details key={row.id} className="ad-child">
              <summary>
                {child.fields.some((f) => f.type === "image") && (
                  <img src={media(row[child.fields.find((f) => f.type === "image")!.name])} alt="" />
                )}
                <span>{child.title === "gallery" ? `Image #${row.id}` : row[child.title] || `#${row.id}`}</span>
              </summary>
              <RecordForm
                compact
                fields={child.fields}
                values={row}
                options={options}
                action={saveChild.bind(null, res.key, child.key, id!, row.id)}
              />
              <ConfirmButton action={deleteChild.bind(null, res.key, child.key, id!, row.id)} label="Remove" />
            </details>
          ))}
          <details className="ad-child ad-child-new">
            <summary>+ Add {child.label.toLowerCase().replace(/s$/, "")}</summary>
            <RecordForm compact fields={child.fields} values={{}} options={options} action={saveChild.bind(null, res.key, child.key, id!, null)} submitLabel="Add" />
          </details>
        </section>
      ))}
    </>
  );
}
