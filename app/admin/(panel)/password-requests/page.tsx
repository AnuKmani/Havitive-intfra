import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { dismissPasswordRequest } from "../../password-actions";
import TempPasswordForm from "./TempPasswordForm";

export const metadata = { title: "Password requests" };

type Row = { id: number; email: string; status: "pending" | "done"; created_at: string; handled_at: string | null; handled_by: string | null };

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

export default async function PasswordRequests() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("password_requests").select("*").order("created_at", { ascending: false }).limit(50);
  const rows = (data ?? []) as Row[];
  const pending = rows.filter((r) => r.status === "pending");
  const done = rows.filter((r) => r.status === "done").slice(0, 10);
  return (
    <>
      <PageHeader icon="key" title="Password requests" subtitle={`HR and telecaller logins that forgot their password · ${pending.length} waiting`} />
      {!pending.length && (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name="key" size={40} /></span>
          <h2>No requests waiting</h2>
          <p>When HR or a telecaller uses “Forgot your password?” on the login page, the request appears here.</p>
        </div>
      )}
      <div className="ad-inbox">
        {pending.map((r) => (
          <article key={r.id} className="ad-panel ad-msg">
            <div className="ad-head">
              <div>
                <strong>{r.email}</strong>
                <div className="ad-muted">Asked {when(r.created_at)}</div>
              </div>
              <ConfirmButton action={dismissPasswordRequest.bind(null, r.id)} label="Dismiss" message="Dismiss this request without giving a password?" />
            </div>
            <TempPasswordForm requestId={r.id} />
          </article>
        ))}
      </div>
      {!!done.length && (
        <section className="ad-panel" style={{ marginTop: 24 }}>
          <div className="ad-panel-head"><h2>Recently handled</h2></div>
          <ul className="ad-muted" style={{ margin: 0, paddingLeft: 18 }}>
            {done.map((r) => (
              <li key={r.id}>{r.email} · {r.handled_at ? when(r.handled_at) : ""}{r.handled_by ? ` · by ${r.handled_by}` : ""}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
