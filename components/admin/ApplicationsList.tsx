import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireCareers } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, statusInfo } from "@/lib/careers";
import { mailConfigured } from "@/lib/mail";
import type { CareerApplication, Job } from "@/lib/types";

type Search = { status?: string; job?: string; q?: string };

/**
 * One list for both inboxes:
 *  - "jobs": people who applied for an opening on the careers page
 *  - "talent": CVs dropped for future consideration (no opening chosen), kept in their own section
 */
export default async function ApplicationsList({ searchParams, scope }: { searchParams: Promise<Search>; scope: "jobs" | "talent" }) {
  const { status = "", job = "", q = "" } = await searchParams;
  const { supabase } = await requireCareers();
  const talent = scope === "talent";
  const base = talent ? "/admin/talent-network" : "/admin/applications";
  const only = <T extends { is: (c: string, v: null) => T; not: (c: string, op: string, v: null) => T }>(query: T) =>
    talent ? query.is("job_id", null) : query.not("job_id", "is", null);

  let query = only(supabase.from("career_pages").select("*")).order("created_at", { ascending: false }).limit(500);
  if (status && status !== "unread") query = query.eq("status", status);
  if (status === "unread") query = query.is("read_at", null);
  if (!talent && /^\d+$/.test(job)) query = query.eq("job_id", Number(job));
  const term = q.trim().replace(/[%,()*\\]/g, " ").slice(0, 80);
  if (term) query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,location.ilike.%${term}%`);

  const [{ data }, { data: jobsData }, { data: all }] = await Promise.all([
    query,
    supabase.from("alljobs").select("id, title, code, status").order("id", { ascending: false }),
    only(supabase.from("career_pages").select("status, read_at")).limit(5000),
  ]);
  const rows = (data ?? []) as CareerApplication[];
  const jobs = (jobsData ?? []) as Pick<Job, "id" | "title" | "code" | "status">[];
  const counts = new Map<string, number>();
  for (const r of all ?? []) counts.set(r.status, (counts.get(r.status) ?? 0) + 1);
  const unread = (all ?? []).filter((r) => !r.read_at).length;
  const total = all?.length ?? 0;
  const jobTitle = (id: number | null) => jobs.find((j) => j.id === id)?.title ?? "Removed job";

  const href = (p: Partial<Search>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries({ status, job, q, ...p })) if (v) sp.set(k, v);
    const s = sp.toString();
    return `${base}${s ? `?${s}` : ""}`;
  };
  const tabs = [
    { value: "", label: "All", count: total },
    { value: "unread", label: "Unread", count: unread },
    ...APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label, count: counts.get(s.value) ?? 0 })),
  ];

  return (
    <>
      <PageHeader
        icon={talent ? "users" : "briefcase"}
        title={talent ? "Talent network" : "Job applications"}
        subtitle={talent
          ? `CVs sent for future consideration · ${total} received · ${unread} unread`
          : `Applications for job openings · ${total} received · ${unread} unread`}
        action={
          <>
            {talent
              ? <a className="ad-btn ad-btn-light" href="/admin/applications"><Icon name="briefcase" /> Job applications</a>
              : <a className="ad-btn ad-btn-light" href="/admin/talent-network"><Icon name="users" /> Talent network</a>}
            <a className="ad-btn ad-btn-light" href="/admin/jobs"><Icon name="briefcase" /> Job openings</a>
            <a className="ad-btn ad-btn-light" href="/careers" target="_blank"><Icon name="external" /> Careers page</a>
          </>
        }
      />

      {!mailConfigured() && (
        <div className="ad-note">
          <Icon name="mail" />
          <span>
            Email is not connected yet: replies open in your own mail app and new-application alerts are not emailed.
            Add the SMTP settings in Vercel to send emails straight from here.
          </span>
        </div>
      )}

      <nav className="ad-filter-tabs" aria-label="Filter by stage">
        {tabs.map((t) => (
          <a key={t.value || "all"} href={href({ status: t.value })} className={status === t.value ? "on" : ""}>
            {t.label} <span>{t.count}</span>
          </a>
        ))}
      </nav>

      <form className="ad-filter-bar" action={base}>
        {status && <input type="hidden" name="status" value={status} />}
        {!talent && (
          <div className="ad-field">
            <select name="job" defaultValue={job} aria-label="Position">
              <option value="">All positions</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}{j.status === "closed" ? " (closed)" : ""}</option>)}
            </select>
          </div>
        )}
        <div className="ad-field ad-grow">
          <input type="text" name="q" defaultValue={q} placeholder="Search name, email, phone or location" aria-label="Search" />
        </div>
        <button className="ad-btn">Filter</button>
        {(job || q) && <a className="ad-btn ad-btn-light" href={href({ job: "", q: "" })}>Clear</a>}
      </form>

      {!rows.length ? (
        <div className="ad-empty">
          <span className="ad-empty-icon"><Icon name={talent ? "users" : "briefcase"} size={40} /></span>
          <h2>{total ? (talent ? "No CVs match" : "No applications match") : (talent ? "No CVs yet" : "No applications yet")}</h2>
          <p>
            {total
              ? "Try another stage or search."
              : talent
                ? "CVs dropped in the “Join our talent network” box on the careers page will appear here."
                : "Applications sent for a job opening on the careers page will appear here."}
          </p>
        </div>
      ) : (
        <div className="ad-table-wrap">
          <table className="ad-table ad-apps">
            <thead>
              <tr><th>Applicant</th><th>{talent ? "Phone" : "Position"}</th><th>Stage</th><th>Received</th><th className="ad-right"></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = statusInfo(r.status);
                return (
                  <tr key={r.id} className={r.read_at ? "" : "is-unread"}>
                    <td>
                      <a href={`/admin/applications/${r.id}`} className="ad-row-title">
                        <span className="ad-avatar">{r.name.charAt(0).toUpperCase()}</span>
                        <span>
                          {r.name} {!r.read_at && <span className="ad-dot" title="Unread" />}
                          <small className="ad-muted ad-block">{r.email}{r.location ? ` · ${r.location}` : ""}</small>
                        </span>
                      </a>
                    </td>
                    <td>{talent ? r.phone : jobTitle(r.job_id)}</td>
                    <td><span className={`ad-pill pill-${st.tone}`}>{st.label}</span></td>
                    <td className="ad-muted">
                      {r.created_at ? new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
                    </td>
                    <td className="ad-right"><a className="ad-btn ad-btn-light ad-btn-sm" href={`/admin/applications/${r.id}`}>Open</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
