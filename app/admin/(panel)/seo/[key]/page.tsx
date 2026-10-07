import { notFound } from "next/navigation";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import SeoPanel from "@/components/admin/SeoPanel";
import { requireAdmin } from "@/lib/admin/auth";
import { listSitePages } from "@/lib/admin/seo-pages";

export const metadata = { title: "Edit SEO" };

export default async function EditSeo({ params }: { params: Promise<{ key: string }> }) {
  const key = decodeURIComponent((await params).key);
  const { supabase } = await requireAdmin();
  const page = (await listSitePages(supabase)).find((p) => p.key === key);
  if (!page) notFound();
  return (
    <>
      <PageHeader
        icon="globe"
        title={page.label}
        subtitle={`${page.type} · ${page.path}`}
        back={{ href: "/admin/seo", label: "SEO manager" }}
        action={
          <>
            {page.editHref && <a className="ad-btn ad-btn-light" href={page.editHref}><Icon name="edit" /> Edit content</a>}
            <a className="ad-btn ad-btn-light" href={page.path} target="_blank"><Icon name="external" /> View page</a>
          </>
        }
      />
      <SeoPanel supabase={supabase} seoKey={key} path={page.path} defaults={page} returnTo={`/admin/seo/${encodeURIComponent(key)}`} />
    </>
  );
}
