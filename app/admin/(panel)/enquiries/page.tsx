import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import type { Apply } from "@/lib/types";
import { deleteSubmission } from "../../actions";

export const metadata = { title: "Enquiries" };

export default async function Enquiries() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("applies").select("*").order("created_at", { ascending: false }).limit(500);
  const rows = (data ?? []) as Apply[];
  return (
    <>
      <PageHeader icon="inbox" title="Enquiries" subtitle={`Messages from the website's contact forms · ${rows.length} total`} />
      {!rows.length && (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name="inbox" size={40} /></span>
          <h2>No enquiries yet</h2>
          <p>Messages from the contact form will appear here.</p>
        </div>
      )}
      <div className="ad-inbox">
        {rows.map((r) => (
          <article key={r.id} className="ad-panel ad-msg">
            <div className="ad-head">
              <div className="ad-msg-from">
                <span className="ad-avatar ad-avatar-lg">{(r.name ?? "?").charAt(0).toUpperCase()}</span>
                <div>
                <strong>{r.name}</strong> {r.service_type && <span className="ad-tag">{r.service_type}</span>}
                <div className="ad-muted">
                  {r.created_at && new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  {" · "}<a href={`mailto:${r.email}`}>{r.email}</a>
                  {r.phone && <> · <a href={`tel:${r.phone}`}>{r.phone}</a></>}
                </div>
                </div>
              </div>
              <ConfirmButton action={deleteSubmission.bind(null, "applies", r.id)} />
            </div>
            <p className="ad-pre ad-msg-text">{r.message}</p>
            <div className="ad-msg-actions">
              <a className="ad-btn ad-btn-light ad-btn-sm" href={`mailto:${r.email}`}><Icon name="mail" size={14} /> Reply by email</a>
              {r.phone && <a className="ad-btn ad-btn-light ad-btn-sm" href={`tel:${r.phone}`}><Icon name="phone" size={14} /> Call</a>}
              {r.phone && <a className="ad-btn ad-btn-whatsapp ad-btn-sm" href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank">WhatsApp</a>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
