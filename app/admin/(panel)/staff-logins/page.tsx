import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { removeStaff } from "../../team-actions";
import { CreateLoginForm, ResetPasswordForm } from "./TeamForms";

export const metadata = { title: "Team logins" };

type Staff = {
  user_id: string; email: string; name: string | null; role: "hr" | "telecaller" | "marketing" | "designer";
  must_change_password: boolean; created_at: string; last_sign_in_at: string | null;
};

const ROLE = { hr: "HR", telecaller: "Telecaller", marketing: "Marketing manager", designer: "Project manager / designer" } as const;
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

export default async function Team() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.rpc("admin_list_staff");
  const rows = (data ?? []) as Staff[];
  return (
    <>
      <PageHeader icon="users" title="Team logins" subtitle="Create sign-ins for HR, telecallers, marketing managers and project managers / designers. You choose the first password; they change it when they first sign in." />
      <section className="ad-panel">
        <div className="ad-panel-head"><h2><Icon name="user" /> Create a login</h2></div>
        <CreateLoginForm />
      </section>
      <div className="ad-inbox" style={{ marginTop: 24 }}>
        {!rows.length && (
          <div className="ad-empty">
            <span className="ad-empty-icon"><Icon name="users" size={40} /></span>
            <h2>No team logins yet</h2>
            <p>Create the first one above.</p>
          </div>
        )}
        {rows.map((r) => (
          <article key={r.user_id} className="ad-panel ad-msg">
            <div className="ad-head">
              <div>
                <strong>{r.name || r.email}</strong> <span className="ad-tag">{ROLE[r.role]}</span>
                <div className="ad-muted">
                  {r.email} · created {when(r.created_at)}
                  {r.last_sign_in_at ? ` · last sign-in ${when(r.last_sign_in_at)}` : " · never signed in"}
                  {r.must_change_password ? " · must choose a new password" : ""}
                </div>
              </div>
              <ConfirmButton action={removeStaff.bind(null, r.user_id)} label="Remove" message={`Remove the login for ${r.email}? They will no longer be able to sign in.`} />
            </div>
            <details>
              <summary className="ad-link" style={{ cursor: "pointer" }}>Reset password</summary>
              <div style={{ marginTop: 12 }}><ResetPasswordForm userId={r.user_id} /></div>
            </details>
          </article>
        ))}
      </div>
    </>
  );
}
