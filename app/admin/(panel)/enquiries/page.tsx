import ConfirmButton from "@/components/admin/ConfirmButton";
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
      <h1>Enquiries</h1>
      <p className="ad-muted">Messages sent from the website&rsquo;s contact and “Book Business Solutions” forms.</p>
      {!rows.length && <p className="ad-muted">No enquiries yet.</p>}
      <div className="ad-inbox">
        {rows.map((r) => (
          <article key={r.id} className="ad-panel">
            <div className="ad-head">
              <div>
                <strong>{r.name}</strong> <span className="ad-tag">{r.service_type}</span>
                <div className="ad-muted">
                  {r.created_at && new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  {" · "}<a href={`mailto:${r.email}`}>{r.email}</a>
                  {r.phone && <> · <a href={`tel:${r.phone}`}>{r.phone}</a> · <a href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank">WhatsApp</a></>}
                </div>
              </div>
              <ConfirmButton action={deleteSubmission.bind(null, "applies", r.id)} />
            </div>
            <p className="ad-pre">{r.message}</p>
          </article>
        ))}
      </div>
    </>
  );
}
