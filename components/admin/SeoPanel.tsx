import { saveSeo } from "@/app/admin/actions";
import { SITE } from "@/lib/site";
import type { SupabaseClient } from "@supabase/supabase-js";
import Icon from "./Icon";
import SeoForm, { type SeoValues } from "./SeoForm";

/** "SEO & sharing" box for one page of the site. */
export default async function SeoPanel({ supabase, seoKey, path, defaults, returnTo, id = "seo" }: {
  supabase: SupabaseClient;
  seoKey: string;
  path: string;
  defaults: { title: string; description: string };
  returnTo: string;
  id?: string;
}) {
  const { data } = await supabase.from("page_seo").select("*").eq("key", seoKey).maybeSingle();
  return (
    <section className="ad-panel" id={id}>
      <div className="ad-panel-head">
        <h2><Icon name="globe" /> SEO &amp; sharing</h2>
        <span className={`ad-pill ${data?.meta_title || data?.meta_description ? "pill-green" : "pill-amber"}`}>
          {data?.meta_title || data?.meta_description ? "Custom" : "Automatic"}
        </span>
      </div>
      <SeoForm
        action={saveSeo.bind(null, seoKey, returnTo)}
        values={data as SeoValues | null}
        defaults={defaults}
        siteUrl={SITE.url}
        path={path}
      />
    </section>
  );
}
