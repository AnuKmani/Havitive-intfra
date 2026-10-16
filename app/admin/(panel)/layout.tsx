import Icon from "@/components/admin/Icon";
import NavLink from "@/components/admin/NavLink";
import { homeFor, requireStaff } from "@/lib/admin/auth";
import { RESOURCES } from "@/lib/admin/resources";
import { media } from "@/lib/media";
import { signOut } from "../actions";

/** Start of the "new this week" window for the enquiries badge. */
function weekAgo() {
  return new Date(Date.now() - 7 * 864e5).toISOString();
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase, role } = await requireStaff();
  const isAdmin = role === "admin";
  const canCareers = role !== "telecaller";
  const canEnquiries = role !== "hr";
  const [{ count: newEnquiries }, { count: unreadApplications }, { count: passwordRequests }] = await Promise.all([
    !canEnquiries ? { count: 0 } : supabase.from("applies").select("id", { count: "exact", head: true }).gte("created_at", weekAgo()),
    !canCareers ? { count: 0 } : supabase.from("career_pages").select("id", { count: "exact", head: true }).is("read_at", null),
    !isAdmin ? { count: 0 } : supabase.from("password_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const navResources = RESOURCES.filter((r) => !r.home && (isAdmin || (canCareers && r.group === "Careers")));
  const groups = [...new Set(navResources.map((r) => r.group))];
  const meta = (user.user_metadata ?? {}) as { name?: string; photo?: string };
  const initial = (meta.name || user.email || "A").charAt(0).toUpperCase();

  return (
    <div className="ad-shell">
      <aside className="ad-side">
        <a href={homeFor(role)} className="ad-brand">
          <img src="/upload/logos/hav.png" alt="" />
          <span>
            Havitive
            <small>{isAdmin ? "Admin panel" : role === "hr" ? "HR panel" : "Telecaller panel"}</small>
          </span>
        </a>
        <nav aria-label="Admin">
          {isAdmin && (
            <>
              <NavLink href="/admin" icon="dashboard" label="Dashboard" />
              <NavLink href="/admin/home" icon="building" label="Home page" />
              <NavLink href="/admin/seo" icon="globe" label="SEO manager" />
            </>
          )}
          <div className="ad-nav-group">Inbox</div>
          {canEnquiries && (
            <div className="ad-nav-badge-wrap">
              <NavLink href="/admin/enquiries" icon="inbox" label="Enquiries" />
              {!!newEnquiries && <span className="ad-badge" title="New this week">{newEnquiries}</span>}
            </div>
          )}
          {isAdmin && (
            <>
              <NavLink href="/admin/team" icon="users" label="Team logins" />
              <div className="ad-nav-badge-wrap">
                <NavLink href="/admin/password-requests" icon="key" label="Password requests" />
                {!!passwordRequests && <span className="ad-badge" title="Someone is waiting for a password">{passwordRequests}</span>}
              </div>
            </>
          )}
          {canCareers && (
            <div className="ad-nav-badge-wrap">
              <NavLink href="/admin/applications" icon="briefcase" label="Job applications" />
              {!!unreadApplications && <span className="ad-badge" title="Unread applications">{unreadApplications}</span>}
            </div>
          )}
          {groups.map((g) => (
            <div key={g}>
              <div className="ad-nav-group">{g}</div>
              {navResources.filter((r) => r.group === g).map((r) => (
                <NavLink key={r.key} href={`/admin/${r.key}`} icon={r.icon} label={r.label} />
              ))}
            </div>
          ))}
          <div className="ad-nav-group">Account</div>
          <NavLink href="/admin/account" icon="user" label="Profile & password" />
          <NavLink href="/" icon="external" label="View website" external />
        </nav>
        <div className="ad-user">
          {meta.photo ? (
            <img className="ad-avatar ad-avatar-img" src={media(meta.photo)} alt="" />
          ) : (
            <span className="ad-avatar" aria-hidden="true">{initial}</span>
          )}
          <a href="/admin/account" className="ad-user-mail">{meta.name || user.email}</a>
          
        </div>
        <form action={signOut}>
          <button className="ad-btn ad-btn-light ad-signout"><Icon name="logout" size={16} /> Sign out</button>
        </form>
      </aside>
      <main className="ad-main">{children}</main>
    </div>
  );
}
