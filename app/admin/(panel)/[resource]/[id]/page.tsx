import { notFound } from "next/navigation";
import RecordForm from "@/components/admin/RecordForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import BulkImageAdd from "@/components/admin/BulkImageAdd";
import PageHeader from "@/components/admin/PageHeader";
import SeoPanel from "@/components/admin/SeoPanel";
import { requireAdmin } from "@/lib/admin/auth";
import { loadOptions } from "@/lib/admin/options";
import { getResource } from "@/lib/admin/resources";
import { listSitePages } from "@/lib/admin/seo-pages";
import { media } from "@/lib/media";
import { addChildrenBulk, deleteChild, deleteRecord, saveChild, saveRecord } from "../../../actions";

const CHILD_ICON: Record<string, string> = { gallery: "image", floors: "layers", facilities: "check" };

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
  const viewUrl = id && res.viewUrl ? res.viewUrl(record) : res.home ? "/" : null;
  const seoKey = id && res.seoKey ? res.seoKey(record) : null;
  const seoPage = seoKey ? (await listSitePages(supabase)).find((p) => p.key === seoKey) : null;
  const tabs = id
    ? [
        { href: "#details", icon: res.icon, label: "Details" },
        ...children.map(({ child, rows }) => ({ href: `#${child.key}`, icon: CHILD_ICON[child.key] ?? "grid", label: `${child.label} (${rows.length})` })),
        ...(seoPage ? [{ href: "#seo", icon: "globe", label: "SEO" }] : []),
      ]
    : [];

  return (
    <>
      <PageHeader
        icon={res.icon}
        title={isNew ? `New ${res.singular.toLowerCase()}` : res.singleton ? res.label : `Edit ${res.singular.toLowerCase()}`}
        subtitle={res.hint}
        back={res.home ? { href: "/admin/home", label: "Home page" } : { href: `/admin/${res.key}`, label: res.label }}
        action={
          <>
            {viewUrl && <a className="ad-btn ad-btn-light" href={viewUrl} target="_blank"><Icon name="external" /> View page</a>}
            {id && !res.singleton && (
              <ConfirmButton action={deleteRecord.bind(null, res.key, id)} message={`Delete this ${res.singular.toLowerCase()}? This cannot be undone.`} />
            )}
          </>
        }
      />

      {tabs.length > 2 && (
        <nav className="ad-tabs" aria-label="Sections">
          {tabs.map((t) => <a key={t.href} href={t.href}><Icon name={t.icon} size={15} /> {t.label}</a>)}
        </nav>
      )}

      <section className="ad-panel" id="details">
        <RecordForm
          fields={res.fields}
          values={record}
          options={options}
          action={saveRecord.bind(null, res.key, id)}
          submitLabel={isNew ? `Create ${res.singular.toLowerCase()}` : "Save changes"}
          initialMessage={saved}
        />
      </section>

      {isNew && (res.children?.length || res.seoKey) ? (
        <div className="ad-note"><Icon name="info" /> Save first. Then you can add {res.children?.length ? "gallery images, floor plans, facilities and " : ""}SEO settings.</div>
      ) : null}

      {children.map(({ child, rows }) => (
        <section className="ad-panel" key={child.key} id={child.key}>
          <div className="ad-panel-head">
            <h2><Icon name={CHILD_ICON[child.key] ?? "grid"} /> {child.label}</h2>
            <span className="ad-tag">{rows.length}</span>
          </div>
          {child.key === "floors" && (
            <p className="ad-muted ad-panel-hint">Add as many plans as you need – ground floor, first floor, site plan, elevation… Each plan has its own name, description and image.</p>
          )}
          <div className={child.key === "gallery" ? "ad-children ad-children-gallery" : "ad-children"}>
          {rows.map((row) => (
            <details key={row.id} className="ad-child">
              <summary>
                {child.fields.some((f) => f.type === "image") && (
                  <img src={media(row[child.fields.find((f) => f.type === "image")!.name])} alt="" />
                )}
                <span className="ad-child-text">
                  <strong>{child.title === "gallery" ? (row.gallery_alt || `Image #${row.id}`) : row[child.title] || `#${row.id}`}</strong>
                </span>
                <span className="ad-child-edit"><Icon name="edit" size={14} /> Edit</span>
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
          <div className="ad-add-row">
            <details className="ad-child ad-child-new" key={`new-${rows.length}`}>
              <summary><Icon name="plus" /> Add {child.key === "gallery" ? "image" : child.key === "floors" ? "plan" : child.label.toLowerCase().replace(/ies$/, "y").replace(/s$/, "")}</summary>
              <RecordForm compact fields={child.fields} values={{}} options={options} action={saveChild.bind(null, res.key, child.key, id!, null)} submitLabel="Add" />
            </details>
            {child.key !== "facilities" && (
              <BulkImageAdd
                label={child.key === "floors" ? "Add several plans at once" : "Upload several images at once"}
                folder={child.fields.find((f) => f.type === "image")?.folder ?? "misc"}
                onDone={addChildrenBulk.bind(null, res.key, child.key, id!)}
              />
            )}
          </div>
        </section>
      ))}

      {seoKey && seoPage && (
        <SeoPanel supabase={supabase} seoKey={seoKey} path={seoPage.path} defaults={seoPage} returnTo={`/admin/${res.key}/${id}`} />
      )}
    </>
  );
}
