"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import type { Field } from "@/lib/admin/resources";
import { FieldInput } from "./Fields";
import Icon from "./Icon";

export type SeoValues = {
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_image: string | null;
  og_image_alt: string | null;
  noindex: boolean;
};

const OG_FIELD: Field = { name: "og_image", label: "Share image", type: "image", folder: "seo" };

function Counter({ value, ideal }: { value: string; ideal: [number, number] }) {
  const n = value.length;
  const tone = n === 0 ? "" : n < ideal[0] ? "warn" : n > ideal[1] ? "bad" : "good";
  return <span className={`ad-counter ${tone}`}>{n} / {ideal[1]}</span>;
}

export default function SeoForm({ action, values, defaults, siteUrl, path }: {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  values: SeoValues | null;
  defaults: { title: string; description: string };
  siteUrl: string;
  path: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const [title, setTitle] = useState(values?.meta_title ?? "");
  const [description, setDescription] = useState(values?.meta_description ?? "");
  const [canonical, setCanonical] = useState(values?.canonical_url ?? "");
  const shownTitle = title || defaults.title;
  const shownDesc = description || defaults.description;
  const shownUrl = canonical ? (canonical.startsWith("/") ? siteUrl + canonical : canonical) : siteUrl + path;

  return (
    <form action={formAction} className="ad-form ad-seo">
      <div className="ad-serp" aria-label="Google search preview">
        <span className="ad-serp-label"><Icon name="globe" size={14} /> Google preview</span>
        <span className="ad-serp-url">{shownUrl.replace(/^https?:\/\//, "")}</span>
        <span className="ad-serp-title">{shownTitle.length > 62 ? shownTitle.slice(0, 60) + "…" : shownTitle}</span>
        <span className="ad-serp-desc">{shownDesc.length > 160 ? shownDesc.slice(0, 158) + "…" : shownDesc}</span>
      </div>

      <div className="ad-field ad-field-textarea">
        <label htmlFor="meta_title">Meta title <Counter value={title} ideal={[30, 60]} /></label>
        <input id="meta_title" name="meta_title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={defaults.title} maxLength={200} />
        <small>Shown as the blue link in Google. Leave empty to use: “{defaults.title}”.</small>
      </div>
      <div className="ad-field ad-field-textarea">
        <label htmlFor="meta_description">Meta description <Counter value={description} ideal={[70, 160]} /></label>
        <textarea id="meta_description" name="meta_description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={defaults.description} maxLength={400} />
        <small>The grey text under the link. Aim for 120–160 characters.</small>
      </div>
      <div className="ad-field ad-field-textarea">
        <label htmlFor="canonical_url">Canonical URL</label>
        <input id="canonical_url" name="canonical_url" type="text" value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder={siteUrl + path} maxLength={500} />
        <small>Leave empty to use this page&rsquo;s own address. Only set it if the same content lives at another URL.</small>
      </div>
      <div className="ad-field ad-field-image">
        <label>Share image (Facebook, WhatsApp, LinkedIn)</label>
        <FieldInput field={OG_FIELD} value={values?.og_image ?? ""} alt={values?.og_image_alt ?? ""} />
        <small>Recommended 1200 × 630 pixels. Leave empty to use the page&rsquo;s main image.</small>
      </div>
      <label className="ad-switch ad-field-textarea">
        <input type="checkbox" name="noindex" defaultChecked={values?.noindex ?? false} />
        <span>Hide this page from Google (noindex)</span>
      </label>
      <div className="ad-form-foot">
        <button type="submit" className="ad-btn" disabled={pending}><Icon name="check" /> {pending ? "Saving…" : "Save SEO settings"}</button>
        <a className="ad-btn ad-btn-light" href={path} target="_blank"><Icon name="external" /> View page</a>
        {state && <span className={state.ok ? "ad-ok" : "ad-err"} role="status">{state.message}</span>}
      </div>
    </form>
  );
}
