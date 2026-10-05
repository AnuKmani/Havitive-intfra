import { requireAdmin } from "@/lib/admin/auth";
import { RESOURCES } from "@/lib/admin/resources";
import { signOut } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const groups = [...new Set(RESOURCES.map((r) => r.group))];
  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <a href="/admin" className="ad-brand"><img src="/upload/logos/hav.png" alt="" /> Havitive Admin</a>
        <nav>
          <a href="/admin">Dashboard</a>
          <div className="ad-nav-group">Inbox</div>
          <a href="/admin/enquiries">Enquiries</a>
          <a href="/admin/applications">Job applications</a>
          {groups.map((g) => (
            <div key={g}>
              <div className="ad-nav-group">{g}</div>
              {RESOURCES.filter((r) => r.group === g).map((r) => (
                <a key={r.key} href={`/admin/${r.key}`}>{r.label}</a>
              ))}
            </div>
          ))}
          <div className="ad-nav-group">Account</div>
          <a href="/admin/account">Change password</a>
          <a href="/" target="_blank">View website ↗</a>
        </nav>
        <form action={signOut} className="ad-signout">
          <small>{user.email}</small>
          <button className="ad-btn ad-btn-light">Sign out</button>
        </form>
      </aside>
      <main className="ad-main">{children}</main>
    </div>
  );
}
