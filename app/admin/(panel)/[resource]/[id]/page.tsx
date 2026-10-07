import { notFound } from "next/navigation";
import RecordForm from "@/components/admin/RecordForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
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
      <PageHeader
        icon={res.icon}
        title={isNew ? `New ${res.singular.toLowerCase()}` : res.singleton ? res.label : `Edit ${res.singular.toLowerCase()}`}
        subtitle={res.hint}
        back={res.singleton ? { href: "/admin", label: "Dashboard" } : { href: `/admin/${res.key}`, label: res.label }}
        action={id && !res.singleton ? (
          <ConfirmButton action={deleteRecord.bind(null, res.key, id)} message={`Delete this ${res.singular.toLowerCase()}? This cannot be undone.`} />
        ) : undefined}
      />

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

      {isNew && res.children?.length ? (
        <div className="ad-note"><Icon name="info" /> Save the project first, then add gallery images, floor plans and facilities.</div>
      ) : null}

      {children.map(({ child, rows }) => (
        <section className="ad-panel" key={child.key}>
          <div className="ad-panel-head">
            <h2><Icon name={child.key === "gallery" ? "image" : child.key === "floors" ? "layers" : "check"} /> {child.label}</h2>
            <span className="ad-tag">{rows.length}</span>
          </div>
          <div className={child.key === "gallery" ? "ad-children ad-children-gallery" : "ad-children"}>
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
          </div>
          <details className="ad-child ad-child-new">
            <summary><Icon name="plus" /> Add {child.key === "gallery" ? "image" : child.label.toLowerCase().replace(/ies$/, "y").replace(/s$/, "")}</summary>
            <RecordForm compact fields={child.fields} values={{}} options={options} action={saveChild.bind(null, res.key, child.key, id!, null)} submitLabel="Add" />
          </details>
        </section>
      ))}
    </>
  );
}
