import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import type { CareerApplication, Job } from "@/lib/types";
import { deleteSubmission } from "../../actions";

export const metadata = { title: "Job applications" };

export default async function Applications() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: jobs }] = await Promise.all([
    supabase.from("career_pages").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("alljobs").select("id, title"),
  ]);
  const rows = (data ?? []) as CareerApplication[];

  // Private files get short-lived download links; legacy Laravel files are not in Storage.
  const link = async (path: string) => {
    if (!path.startsWith("applications:")) return null;
    const { data } = await supabase.storage.from("applications").createSignedUrl(path.slice("applications:".length), 600);
    return data?.signedUrl ?? null;
  };
  const links = await Promise.all(rows.map(async (r) => [await link(r.cv_path), await link(r.cover_letter_path)] as const));

  return (
    <>
      <PageHeader icon="briefcase" title="Job applications" subtitle={`${rows.length} total · download links stay valid for 10 minutes`} />
      {!rows.length && (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name="briefcase" size={40} /></span>
          <h2>No applications yet</h2>
          <p>CVs sent from the careers page will appear here.</p>
        </div>
      )}
      <div className="ad-inbox">
        {rows.map((r, i) => (
          <article key={r.id} className="ad-panel ad-msg">
            <div className="ad-head">
              <div className="ad-msg-from">
                <span className="ad-avatar ad-avatar-lg">{r.name.charAt(0).toUpperCase()}</span>
                <div>
                <strong>{r.name}</strong>{" "}
                <span className="ad-tag">{(jobs as Pick<Job, "id" | "title">[] | null)?.find((j) => j.id === r.job_id)?.title ?? "General"}</span>
                <div className="ad-muted">
                  {r.created_at && new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  {" · "}<a href={`mailto:${r.email}`}>{r.email}</a> · <a href={`tel:${r.phone}`}>{r.phone}</a>
                </div>
                </div>
              </div>
              <ConfirmButton action={deleteSubmission.bind(null, "career_pages", r.id)} message="Delete this application and its files?" />
            </div>
            {r.message && <p className="ad-pre">{r.message}</p>}
            <div className="ad-msg-actions">
              {links[i][0] ? <a className="ad-btn ad-btn-light ad-btn-sm" href={links[i][0]!} target="_blank"><Icon name="file" size={14} /> Download CV</a> : <span className="ad-muted">CV on old server</span>}
              {links[i][1] ? <a className="ad-btn ad-btn-light ad-btn-sm" href={links[i][1]!} target="_blank"><Icon name="file" size={14} /> Cover letter</a> : <span className="ad-muted">Cover letter on old server</span>}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
