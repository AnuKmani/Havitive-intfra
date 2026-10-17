import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireEnquiries } from "@/lib/admin/auth";
import type { Apply } from "@/lib/types";
import { deleteSubmission, markEnquiriesRead } from "../../actions";

export const metadata = { title: "Enquiries" };

export default async function Enquiries() {
  const { supabase, role } = await requireEnquiries();
  const { data } = await supabase.from("applies").select("*").order("created_at", { ascending: false }).limit(500);
  const rows = (data ?? []) as Apply[];
  const unread = rows.filter((r) => !r.read_at).length;
  const canDelete = role === "admin" || role === "marketing";
  return (
    <>
      <PageHeader
        icon="inbox"
        title="Enquiries"
        subtitle={`Messages from the website's contact forms · ${rows.length} total · ${unread} unread`}
        action={unread ? (
          <form action={markEnquiriesRead.bind(null, null)}>
            <button className="ad-btn ad-btn-light"><Icon name="check" /> Mark all as read</button>
          </form>
        ) : undefined}
      />
      {!rows.length && (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name="inbox" size={40} /></span>
          <h2>No enquiries yet</h2>
          <p>Messages from the contact form will appear here.</p>
        </div>
      )}
      <div className="ad-inbox">
        {rows.map((r) => (
          <article key={r.id} className="ad-panel ad-msg" style={r.read_at ? undefined : { borderLeft: "4px solid #2563eb" }}>
            <div className="ad-head">
              <div className="ad-msg-from">
                <span className="ad-avatar ad-avatar-lg">{(r.name ?? "?").charAt(0).toUpperCase()}</span>
                <div>
                <strong>{r.name}</strong> {!r.read_at && <span className="ad-dot" title="Unread" />} {r.service_type && <span className="ad-tag">{r.service_type}</span>}
                <div className="ad-muted">
                  {r.created_at && new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  {" · "}<a href={`mailto:${r.email}`}>{r.email}</a>
                  {r.phone && <> · <a href={`tel:${r.phone}`}>{r.phone}</a></>}
                </div>
                </div>
              </div>
              {canDelete && <ConfirmButton action={deleteSubmission.bind(null, "applies", r.id)} />}
            </div>
            <p className="ad-pre ad-msg-text">{r.message}</p>
            <div className="ad-msg-actions">
              {!r.read_at && (
                <form action={markEnquiriesRead.bind(null, r.id)} style={{ display: "inline" }}>
                  <button className="ad-btn ad-btn-sm"><Icon name="check" size={14} /> Mark as read</button>
                </form>
              )}
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
