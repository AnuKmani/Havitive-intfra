import Icon from "@/components/admin/Icon";
import NavLink from "@/components/admin/NavLink";
import { requireAdmin } from "@/lib/admin/auth";
import { RESOURCES } from "@/lib/admin/resources";
import { signOut } from "../actions";

/** Start of the "new this week" window for the enquiries badge. */
function weekAgo() {
  return new Date(Date.now() - 7 * 864e5).toISOString();
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase } = await requireAdmin();
  const { count: newEnquiries } = await supabase
    .from("applies")
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo());
  const groups = [...new Set(RESOURCES.map((r) => r.group))];
  const initial = (user.email ?? "A").charAt(0).toUpperCase();

  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <a href="/admin" className="ad-brand">
          <img src="/upload/logos/hav.png" alt="" />
          <span>
            Havitive
            <small>Admin panel</small>
          </span>
        </a>
        <nav aria-label="Admin">
          <NavLink href="/admin" icon="dashboard" label="Dashboard" />
          <div className="ad-nav-group">Inbox</div>
          <div className="ad-nav-badge-wrap">
            <NavLink href="/admin/enquiries" icon="inbox" label="Enquiries" />
            {!!newEnquiries && <span className="ad-badge" title="New this week">{newEnquiries}</span>}
          </div>
          <NavLink href="/admin/applications" icon="briefcase" label="Job applications" />
          {groups.map((g) => (
            <div key={g}>
              <div className="ad-nav-group">{g}</div>
              {RESOURCES.filter((r) => r.group === g).map((r) => (
                <NavLink key={r.key} href={`/admin/${r.key}`} icon={r.icon} label={r.label} />
              ))}
            </div>
          ))}
          <div className="ad-nav-group">Account</div>
          <NavLink href="/admin/account" icon="key" label="Change password" />
          <NavLink href="/" icon="external" label="View website" external />
        </nav>
        <form action={signOut} className="ad-user">
          <span className="ad-avatar" aria-hidden="true">{initial}</span>
          <span className="ad-user-mail">{user.email}</span>
          <button className="ad-icon-btn" title="Sign out" aria-label="Sign out"><Icon name="logout" /></button>
        </form>
      </aside>
      <main className="ad-main">{children}</main>
    </div>
  );
}
