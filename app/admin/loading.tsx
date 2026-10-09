// Shown instantly while an admin page loads, instead of a blank screen.
export default function AdminLoading() {
  return (
    <div className="ad-loading" role="status" aria-live="polite">
      <span className="ad-spinner" aria-hidden="true" />
      <span>Loading…</span>
    </div>
  );
}
