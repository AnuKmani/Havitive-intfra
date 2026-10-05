import ConfirmButton from "@/components/admin/ConfirmButton";
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
      <h1>Job applications</h1>
      <p className="ad-muted">Download links stay valid for 10 minutes. Reload the page for fresh links.</p>
      {!rows.length && <p className="ad-muted">No applications yet.</p>}
      <div className="ad-inbox">
        {rows.map((r, i) => (
          <article key={r.id} className="ad-panel">
            <div className="ad-head">
              <div>
                <strong>{r.name}</strong>{" "}
                <span className="ad-tag">{(jobs as Pick<Job, "id" | "title">[] | null)?.find((j) => j.id === r.job_id)?.title ?? "General"}</span>
                <div className="ad-muted">
                  {r.created_at && new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  {" · "}<a href={`mailto:${r.email}`}>{r.email}</a> · <a href={`tel:${r.phone}`}>{r.phone}</a>
                </div>
              </div>
              <ConfirmButton action={deleteSubmission.bind(null, "career_pages", r.id)} message="Delete this application and its files?" />
            </div>
            {r.message && <p className="ad-pre">{r.message}</p>}
            <p>
              {links[i][0] ? <a className="ad-btn ad-btn-light" href={links[i][0]!} target="_blank">Download CV</a> : <span className="ad-muted">CV on old server</span>}{" "}
              {links[i][1] ? <a className="ad-btn ad-btn-light" href={links[i][1]!} target="_blank">Download cover letter</a> : <span className="ad-muted">Cover letter on old server</span>}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
