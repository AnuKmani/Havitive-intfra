import Icon from "@/components/admin/Icon";
import InlineCollection from "@/components/admin/InlineCollection";
import PageHeader from "@/components/admin/PageHeader";
import RecordForm from "@/components/admin/RecordForm";
import SeoPanel from "@/components/admin/SeoPanel";
import { saveInline } from "../../actions";
import { requireAdmin } from "@/lib/admin/auth";
import { loadOptions } from "@/lib/admin/options";
import { getResource, type Resource, type Row } from "@/lib/admin/resources";
import { SITE } from "@/lib/site";

export const metadata = { title: "Home page" };

const RETURN = "/admin/home";

// Order matches the sections on the live home page.
const SECTIONS: { key: string; anchor: string; label: string }[] = [
  { key: "banners", anchor: "banners", label: "Hero banners" },
  { key: "counters", anchor: "counters", label: "Counters" },
  { key: "home-about", anchor: "about", label: "About" },
  { key: "home-service", anchor: "offer", label: "What we offer" },
  { key: "upcoming", anchor: "future", label: "Future projects" },
  { key: "clients", anchor: "clients", label: "Client logos" },
  { key: "testimonials", anchor: "testimonials", label: "Testimonials" },
  { key: "home-residence", anchor: "residence", label: "Residence section" },
];

export default async function HomeEditor() {
  const { supabase } = await requireAdmin();
  const options = await loadOptions(supabase);

  const singleton = async (res: Resource) => {
    let q = supabase.from(res.table).select("*").limit(1);
    for (const [k, v] of Object.entries(res.fixed ?? {})) q = q.eq(k, v);
    return ((await q).data?.[0] ?? null) as Row | null;
  };

  const blocks = await Promise.all(
    SECTIONS.map(async (s) => {
      const res = getResource(s.key)!;
      if (!res.singleton) {
        return <InlineCollection key={s.key} supabase={supabase} res={res} options={options} returnTo={RETURN} id={s.anchor} />;
      }
      const row = await singleton(res);
      return (
        <section className="ad-panel" id={s.anchor} key={s.key}>
          <div className="ad-panel-head">
            <h2><Icon name={res.icon} /> {res.label}</h2>
          </div>
          <p className="ad-muted ad-panel-hint">{res.hint}</p>
          <RecordForm fields={res.fields} values={row ?? {}} options={options} action={saveInline.bind(null, res.key, row?.id ?? null, RETURN)} submitLabel="Save section" />
        </section>
      );
    }),
  );

  return (
    <>
      <PageHeader
        icon="dashboard"
        title="Home page"
        subtitle="Every section of the home page in one place, top to bottom."
        action={<a className="ad-btn ad-btn-light" href="/" target="_blank"><Icon name="external" /> View home page</a>}
      />
      <nav className="ad-tabs" aria-label="Home page sections">
        <a href="#seo"><Icon name="globe" size={15} /> SEO</a>
        {SECTIONS.map((s) => (
          <a key={s.key} href={`#${s.anchor}`}><Icon name={getResource(s.key)!.icon} size={15} /> {s.label}</a>
        ))}
      </nav>
      <SeoPanel
        supabase={supabase}
        seoKey="page:home"
        path="/"
        returnTo={RETURN}
        defaults={{ title: "Havitive Infra Pvt Ltd | Architecture, Engineering & Construction in Kerala", description: SITE.description }}
      />
      {blocks}
      <div className="ad-note"><Icon name="info" /> “Browse our latest projects”, “Why choose us” and “News &amp; articles” fill in automatically from Projects and Blog posts.</div>
    </>
  );
}
