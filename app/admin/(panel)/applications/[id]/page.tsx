import { notFound } from "next/navigation";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { ReplyComposer, StatusForm } from "@/components/admin/ApplicationForms";
import { requireAdmin } from "@/lib/admin/auth";
import { statusInfo } from "@/lib/careers";
import { mailConfigured } from "@/lib/mail";
import type { ApplicationReply, CareerApplication, Job } from "@/lib/types";
import { jobCode } from "@/lib/text";
import { deleteApplication, markUnread, sendReply, updateApplication } from "../../../applications-actions";

export const metadata = { title: "Application" };

const when = (d: string | null) =>
  d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("career_pages").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const app = data as CareerApplication;

  // Opening an application marks it as read.
  if (!app.read_at) await supabase.from("career_pages").update({ read_at: new Date().toISOString() }).eq("id", id);

  const [{ data: jobData }, { data: replyData }] = await Promise.all([
    app.job_id ? supabase.from("alljobs").select("*").eq("id", app.job_id).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("application_replies").select("*").eq("application_id", id).order("created_at", { ascending: false }),
  ]);
  const job = jobData as Job | null;
  const replies = (replyData ?? []) as ApplicationReply[];
  const position = job?.title ?? (app.job_id ? "a position at Havitive" : "our talent network");

  // Private files get short-lived download links; legacy Laravel files are not in Storage.
  const link = async (path: string | null) => {
    if (!path?.startsWith("applications:")) return null;
    const { data } = await supabase.storage.from("applications").createSignedUrl(path.slice("applications:".length), 3600);
    return data?.signedUrl ?? null;
  };
  const [cvUrl, letterUrl] = await Promise.all([link(app.cv_path), link(app.cover_letter_path)]);
  const st = statusInfo(app.status);
  const digits = app.phone.replace(/\D/g, "");
  const whatsapp = `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
  const emailReady = mailConfigured();

  return (
    <>
      <PageHeader
        icon="user"
        title={app.name}
        subtitle={`Applied for ${job ? `${job.title} (${jobCode(job)})` : app.job_id ? "a removed job" : "the talent network"} · ${when(app.created_at)}`}
        back={{ href: "/admin/applications", label: "Job applications" }}
        action={
          <>
            <form action={markUnread.bind(null, id)}><button className="ad-btn ad-btn-light"><Icon name="mail" /> Mark unread</button></form>
            <ConfirmButton action={deleteApplication.bind(null, id)} message="Delete this application, its CV and its reply history? This cannot be undone." />
          </>
        }
      />

      <div className="ad-app-grid">
        <div>
          <section className="ad-panel">
            <div className="ad-panel-head">
              <h2><Icon name="user" /> Applicant</h2>
              <span className={`ad-pill pill-${st.tone}`}>{st.label}</span>
            </div>
            <dl className="ad-dl">
              <dt>Email</dt><dd><a href={`mailto:${app.email}`}>{app.email}</a></dd>
              <dt>Phone</dt><dd><a href={`tel:${app.phone}`}>{app.phone}</a></dd>
              {app.location && <><dt>Location</dt><dd>{app.location}</dd></>}
              {app.linkedin && <><dt>LinkedIn / portfolio</dt><dd><a href={app.linkedin} target="_blank" rel="noopener noreferrer nofollow">{app.linkedin}</a></dd></>}
              <dt>Position</dt><dd>{job ? <a href={`/admin/jobs/${job.id}`}>{job.title}</a> : app.job_id ? "Removed job" : "General / talent network"}</dd>
              <dt>Received</dt><dd>{when(app.created_at)}</dd>
            </dl>
            <div className="ad-msg-actions">
              {cvUrl ? (
                <a className="ad-btn" href={cvUrl} target="_blank"><Icon name="file" size={15} /> Download CV</a>
              ) : (
                <span className="ad-muted">CV is on the old server</span>
              )}
              {letterUrl && <a className="ad-btn ad-btn-light" href={letterUrl} target="_blank"><Icon name="file" size={15} /> Cover letter file</a>}
              <a className="ad-btn ad-btn-light" href={`tel:${app.phone}`}><Icon name="phone" size={15} /> Call</a>
              <a className="ad-btn ad-btn-light" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </section>

          {(app.cover_letter || app.message) && (
            <section className="ad-panel">
              <div className="ad-panel-head"><h2><Icon name="pen" /> Cover letter</h2></div>
              <p className="ad-pre ad-msg-text">{app.cover_letter || app.message}</p>
            </section>
          )}

          <section className="ad-panel" id="reply">
            <div className="ad-panel-head">
              <h2><Icon name="mail" /> Reply to {app.name.split(" ")[0]}</h2>
              <span className="ad-muted">to {app.email}</span>
            </div>
            {!emailReady && (
              <p className="ad-muted ad-panel-hint">
                Email sending isn&apos;t connected yet, so the reply is saved here and opens in your mail app to send.
              </p>
            )}
            <ReplyComposer action={sendReply.bind(null, id)} name={app.name} position={position} emailReady={emailReady} />
          </section>

          <section className="ad-panel">
            <div className="ad-panel-head">
              <h2><Icon name="clock" /> Reply history</h2>
              <span className="ad-tag">{replies.length}</span>
            </div>
            {!replies.length ? (
              <div className="ad-empty-sm"><Icon name="mail" size={24} /> No replies yet</div>
            ) : (
              <ul className="ad-replies">
                {replies.map((r) => (
                  <li key={r.id}>
                    <details>
                      <summary>
                        <strong>{r.subject}</strong>
                        <span className={`ad-pill ${r.sent ? "pill-green" : r.error ? "pill-red" : "pill-grey"}`}>
                          {r.sent ? "Emailed" : r.error ? "Failed" : "Via mail app"}
                        </span>
                        <time className="ad-muted">{when(r.created_at)}</time>
                      </summary>
                      <p className="ad-pre ad-msg-text">{r.body}</p>
                      {r.error && <p className="ad-err">Error: {r.error}</p>}
                      {r.sent_by && <p className="ad-muted">By {r.sent_by}</p>}
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside>
          <section className="ad-panel">
            <div className="ad-panel-head"><h2><Icon name="layers" /> Hiring stage</h2></div>
            <StatusForm action={updateApplication.bind(null, id)} status={app.status} notes={app.notes ?? ""} />
          </section>
          {job && (
            <section className="ad-panel">
              <div className="ad-panel-head"><h2><Icon name="briefcase" /> Job</h2></div>
              <p><strong>{job.title}</strong> <span className="ad-tag">{jobCode(job)}</span></p>
              <p className="ad-muted">{[job.department, job.location, job.employment_type, job.experience].filter(Boolean).join(" · ")}</p>
              <p className="ad-muted">{job.status === "open" ? "Open on the website" : "Closed"}</p>
              <a className="ad-link" href={`/admin/applications?job=${job.id}`}>All applicants for this job <Icon name="arrow" size={14} /></a>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
