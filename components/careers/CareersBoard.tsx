"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { submitJobApplication, type FormState } from "@/app/actions/public";
import { browserClient } from "@/lib/supabase/browser";
import "./careers.css";

export type BoardJob = {
  id: number; title: string; code: string; department: string | null; location: string | null;
  type: string | null; experience: string | null; summary: string | null; html: string; posted: string | null;
};

const PER_PAGE = 6;
const MAX = 5 * 1024 * 1024;
const TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const EXT = /\.(pdf|docx?)$/i;
const GENERAL = "General application (talent network)";

const MIME: Record<string, string> = { pdf: TYPES[0], doc: TYPES[1], docx: TYPES[2] };
const mimeOf = (f: File) => (TYPES.includes(f.type) ? f.type : MIME[f.name.split(".").pop()!.toLowerCase()] ?? f.type);
const safeName = (n: string) => n.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-80);

function checkFile(f: File | null | undefined) {
  if (!f) return "Please attach your CV.";
  if (!(TYPES.includes(f.type) || EXT.test(f.name))) return "CV must be a PDF, DOC or DOCX file.";
  if (f.size > MAX) return "CV must be 5 MB or smaller.";
  return null;
}

type View = { mode: "details" | "apply"; job: BoardJob | null };

export default function CareersBoard({ jobs, talentTitle, talentText }: { jobs: BoardJob[]; talentTitle: string; talentText: string }) {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View | null>(null);
  const [presetFile, setPresetFile] = useState<File | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const departments = useMemo(() => [...new Set(jobs.map((j) => j.department).filter(Boolean))] as string[], [jobs]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (j) => (!dept || j.department === dept) &&
        (!q || [j.title, j.code, j.department, j.location, j.summary].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [jobs, query, dept]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const open = useCallback((v: View, file: File | null = null) => {
    setPresetFile(file);
    setView(v);
    if (v.job) history.replaceState(null, "", `#job-${v.job.id}`);
  }, []);
  const close = useCallback(() => {
    dialog.current?.close();
  }, []);

  // Open the modal whenever a view is chosen; clear state when it closes.
  useEffect(() => {
    const d = dialog.current;
    if (view && d && !d.open) d.showModal();
  }, [view]);
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClose = () => {
      setView(null);
      if (location.hash.startsWith("#job-")) history.replaceState(null, "", location.pathname + location.search);
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  // Shared links like /careers#job-3 open that job straight away.
  useEffect(() => {
    const m = location.hash.match(/^#job-(\d+)$/);
    const job = m && jobs.find((j) => j.id === Number(m[1]));
    if (job) {
      const t = setTimeout(() => open({ mode: "details", job }), 0);
      return () => clearTimeout(t);
    }
  }, [jobs, open]);

  return (
    <>
      <div className="cr-toolbar">
        <div className="cr-search">
          <i className="far fa-search" aria-hidden="true"></i>
          <input
            type="search" placeholder="Search by job title, code or location" aria-label="Search jobs"
            value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        {departments.length > 1 && (
          <div className="cr-chips" role="group" aria-label="Filter by department">
            <button type="button" className={!dept ? "on" : ""} onClick={() => { setDept(""); setPage(1); }}>All</button>
            {departments.map((d) => (
              <button type="button" key={d} className={dept === d ? "on" : ""} onClick={() => { setDept(d); setPage(1); }}>{d}</button>
            ))}
          </div>
        )}
      </div>

      {!jobs.length ? (
        <div className="cr-empty">
          <i className="fal fa-briefcase" aria-hidden="true"></i>
          <h3>No open positions right now</h3>
          <p>We are always happy to meet talented people. Drop your CV below and we will contact you when a role opens.</p>
        </div>
      ) : !filtered.length ? (
        <div className="cr-empty"><h3>No jobs match your search</h3><p>Try another keyword or department.</p></div>
      ) : (
        <div className="cr-grid">
          {shown.map((j) => (
            <article key={j.id} className="cr-card">
              <div className="cr-card-top">
                <span className="cr-card-icon" aria-hidden="true"><i className="fal fa-briefcase"></i></span>
                <span className="cr-code">{j.code}</span>
              </div>
              <h3 className="cr-card-title">{j.title}</h3>
              {j.summary && <p className="cr-card-summary">{j.summary}</p>}
              <ul className="cr-meta">
                {j.location && <li><i className="far fa-map-marker-alt" aria-hidden="true"></i>{j.location}</li>}
                {j.department && <li><i className="far fa-building" aria-hidden="true"></i>{j.department}</li>}
                {j.type && <li><i className="far fa-clock" aria-hidden="true"></i>{j.type}</li>}
                {j.experience && <li><i className="far fa-user-tie" aria-hidden="true"></i>{j.experience}</li>}
              </ul>
              <div className="cr-card-actions">
                <button type="button" className="cr-btn cr-btn-dark" onClick={() => open({ mode: "details", job: j })}>View Details</button>
                <button type="button" className="cr-btn cr-btn-line" onClick={() => open({ mode: "apply", job: j })}>Apply</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {filtered.length > PER_PAGE && (
        <nav className="cr-pager" aria-label="Job pages">
          <span>Showing {(current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div>
            <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>Prev</button>
            {Array.from({ length: pages }, (_, i) => (
              <button type="button" key={i} className={current === i + 1 ? "on" : ""} aria-current={current === i + 1 ? "page" : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</button>
          </div>
        </nav>
      )}

      <TalentDrop title={talentTitle} text={talentText} onFile={(f) => open({ mode: "apply", job: null }, f)} />

      <dialog ref={dialog} className="cr-modal" aria-labelledby="cr-modal-title" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
        {view && (
          <div className="cr-modal-box">
            <header className="cr-modal-head">
              <div>
                <span className="cr-modal-kicker">{view.mode === "details" ? "Job description" : "Job application"}</span>
                <h2 id="cr-modal-title">{view.job?.title ?? "Join our talent network"}</h2>
              </div>
              <button type="button" className="cr-x" onClick={close} aria-label="Close">×</button>
            </header>
            {view.mode === "details" && view.job ? (
              <JobDetails job={view.job} onApply={() => setView({ mode: "apply", job: view.job })} />
            ) : (
              <ApplyForm key={view.job?.id ?? "general"} job={view.job} presetFile={presetFile} onBack={view.job ? () => setView({ mode: "details", job: view.job }) : undefined} />
            )}
          </div>
        )}
      </dialog>
    </>
  );
}

function JobDetails({ job, onApply }: { job: BoardJob; onApply: () => void }) {
  return (
    <div className="cr-modal-body">
      <ul className="cr-meta cr-meta-inline">
        <li><i className="far fa-hashtag" aria-hidden="true"></i>{job.code}</li>
        {job.location && <li><i className="far fa-map-marker-alt" aria-hidden="true"></i>{job.location}</li>}
        {job.department && <li><i className="far fa-building" aria-hidden="true"></i>{job.department}</li>}
        {job.type && <li><i className="far fa-clock" aria-hidden="true"></i>{job.type}</li>}
        {job.experience && <li><i className="far fa-user-tie" aria-hidden="true"></i>Experience: {job.experience}</li>}
      </ul>
      {job.summary && <p className="cr-lead">{job.summary}</p>}
      <div className="cr-jd rich-text" dangerouslySetInnerHTML={{ __html: job.html }} />
      <div className="cr-modal-foot">
        <button type="button" className="cr-btn cr-btn-gold" onClick={onApply}>Apply for this job <i className="far fa-arrow-right" aria-hidden="true"></i></button>
      </div>
    </div>
  );
}

function FilePicker({ file, setFile, error }: { file: File | null; setFile: (f: File | null) => void; error?: string | null }) {
  const [over, setOver] = useState(false);
  return (
    <label
      className={`cr-drop cr-drop-sm${over ? " over" : ""}${file ? " has" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); setFile(e.dataTransfer.files[0] ?? null); }}
    >
      <i className={file ? "far fa-file-check" : "far fa-cloud-upload"} aria-hidden="true"></i>
      <span>
        <strong>{file ? file.name : "Upload your CV *"}</strong>
        <small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · click to change` : "Drag & drop or click · PDF, DOC, DOCX · max 5 MB"}</small>
        {error && <em>{error}</em>}
      </span>
      <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
    </label>
  );
}

function ApplyForm({ job, presetFile, onBack }: { job: BoardJob | null; presetFile: File | null; onBack?: () => void }) {
  const [file, setFile] = useState<File | null>(presetFile);
  const [state, setState] = useState<FormState>(null);
  const [pending, setPending] = useState(false);
  const fileError = file ? checkFile(file) : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const problem = checkFile(file);
    if (problem) return setState({ ok: false, message: problem });
    setPending(true);
    setState(null);
    try {
      const cvPath = `cvs/${Date.now()}-${crypto.randomUUID().slice(0, 8)}_${safeName(file!.name)}`;
      const up = await browserClient().storage.from("applications").upload(cvPath, file!, { contentType: mimeOf(file!) });
      if (up.error) throw new Error(up.error.message);
      const result = await submitJobApplication({
        name: String(f.get("name") ?? ""), email: String(f.get("email") ?? ""), phone: String(f.get("phone") ?? ""),
        location: String(f.get("location") ?? ""), linkedin: String(f.get("linkedin") ?? ""),
        coverLetter: String(f.get("cover_letter") ?? ""), jobId: job?.id ?? null, cvPath, company: String(f.get("company") ?? ""),
      });
      setState(result);
      if (result?.ok) { form.reset(); setFile(null); }
    } catch {
      setState({ ok: false, message: "Could not upload your CV. Please check your connection and try again." });
    } finally {
      setPending(false);
    }
  }

  if (state?.ok) {
    return (
      <div className="cr-modal-body cr-done">
        <span className="cr-done-icon" aria-hidden="true"><i className="far fa-check"></i></span>
        <h3>Application submitted</h3>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form className="cr-modal-body cr-form" onSubmit={onSubmit} noValidate={false}>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />
      <div className="cr-field cr-full">
        <label htmlFor="cr-position">Position</label>
        <input id="cr-position" value={job ? `${job.title} (${job.code})` : GENERAL} readOnly />
      </div>
      <div className="cr-field">
        <label htmlFor="cr-name">Full Name *</label>
        <input id="cr-name" name="name" required maxLength={255} autoComplete="name" placeholder="Your full name" />
      </div>
      <div className="cr-field">
        <label htmlFor="cr-email">Email Address *</label>
        <input id="cr-email" name="email" type="email" required maxLength={255} autoComplete="email" placeholder="you@example.com" />
      </div>
      <div className="cr-field">
        <label htmlFor="cr-phone">Contact Number *</label>
        <input id="cr-phone" name="phone" type="tel" required autoComplete="tel" placeholder="+91 98765 43210" minLength={10} maxLength={20} />
      </div>
      <div className="cr-field">
        <label htmlFor="cr-location">Current Location</label>
        <input id="cr-location" name="location" maxLength={255} autoComplete="address-level2" placeholder="City, State" />
      </div>
      <div className="cr-field cr-full">
        <label htmlFor="cr-linkedin">LinkedIn / Portfolio</label>
        <input id="cr-linkedin" name="linkedin" maxLength={500} placeholder="https://linkedin.com/in/your-profile" />
      </div>
      <div className="cr-field cr-full">
        <label htmlFor="cr-cover">Cover Letter</label>
        <textarea id="cr-cover" name="cover_letter" rows={5} maxLength={5000} placeholder="Tell us briefly why you are a great fit for this role…" />
      </div>
      <div className="cr-field cr-full">
        <FilePicker file={file} setFile={setFile} error={fileError} />
      </div>
      {state && !state.ok && <p className="form-alert err cr-full" role="alert">{state.message}</p>}
      <div className="cr-modal-foot cr-full">
        {onBack && <button type="button" className="cr-btn cr-btn-line" onClick={onBack}>Back to job details</button>}
        <button className="cr-btn cr-btn-gold" disabled={pending}>
          {pending ? "Submitting…" : "Submit Application"} <i className="far fa-paper-plane" aria-hidden="true"></i>
        </button>
      </div>
    </form>
  );
}

function TalentDrop({ title, text, onFile }: { title: string; text: string; onFile: (f: File) => void }) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const take = (f: File | undefined) => {
    if (!f) return;
    const problem = checkFile(f);
    setError(problem);
    if (!problem) onFile(f);
  };
  return (
    <div className="cr-talent" id="talent-network">
      <div className="cr-talent-text">
        <span className="cr-kicker">{title}</span>
        <h3>Drop Your CV for Future Consideration</h3>
        <p>{text}</p>
      </div>
      <label
        className={`cr-drop${over ? " over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}
      >
        <i className="far fa-cloud-upload" aria-hidden="true"></i>
        <span>
          <strong>Drag & drop your CV here</strong>
          <small>or <u>browse files</u> · PDF, DOC, DOCX · max 5 MB</small>
          {error && <em>{error}</em>}
        </span>
        <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
    </div>
  );
}
