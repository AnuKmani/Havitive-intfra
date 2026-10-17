import Icon from "@/components/admin/Icon";
import NavLink from "@/components/admin/NavLink";
import { homeFor, requireStaff } from "@/lib/admin/auth";
import { isContentSection, RESOURCES } from "@/lib/admin/resources";
import { media } from "@/lib/media";
import { signOut } from "../actions";

const PANEL_NAME = { admin: "Admin panel", hr: "HR panel", telecaller: "Telecaller panel", marketing: "Marketing panel", designer: "Design panel" } as const;

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, supabase, role } = await requireStaff();
  const isAdmin = role === "admin";
  const canCareers = role === "admin" || role === "hr";
  const canEnquiries = role === "admin" || role === "telecaller" || role === "marketing";
  const canContent = role === "admin" || role === "marketing" || role === "designer";
  const archived = (table: string) =>
    !isAdmin ? { count: 0 } : supabase.from(table).select("id", { count: "exact", head: true }).not("archived_at", "is", null);
  const [
    { count: newEnquiries }, { count: unreadApplications }, { count: unreadTalent }, { count: passwordRequests },
    { count: archivedEnquiries }, { count: archivedPosts }, { count: archivedCategories },
  ] = await Promise.all([
    !canEnquiries ? { count: 0 } : supabase.from("applies").select("id", { count: "exact", head: true }).is("read_at", null).is("archived_at", null),
    !canCareers ? { count: 0 } : supabase.from("career_pages").select("id", { count: "exact", head: true }).is("read_at", null).not("job_id", "is", null),
    !canCareers ? { count: 0 } : supabase.from("career_pages").select("id", { count: "exact", head: true }).is("read_at", null).is("job_id", null),
    !isAdmin ? { count: 0 } : supabase.from("password_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    archived("applies"),
    archived("blog_posts"),
    archived("blog_categories"),
  ]);
  const navResources = RESOURCES.filter(
    (r) => !r.home && (isAdmin || (canCareers && r.group === "Careers") || (canContent && isContentSection(r))),
  );
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
            <small>{PANEL_NAME[role]}</small>
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
          {!isAdmin && canContent && <NavLink href="/admin/home" icon="building" label="Home page" />}
          {(isAdmin || canEnquiries || canCareers) && <div className="ad-nav-group">Inbox</div>}
          {canEnquiries && (
            <div className="ad-nav-badge-wrap">
              <NavLink href="/admin/enquiries" icon="inbox" label="Enquiries" />
              {!!newEnquiries && <span className="ad-badge" title="Unread enquiries">{newEnquiries}</span>}
            </div>
          )}
          {isAdmin && (
            <>
              {([
                ["/admin/enquiries?view=archived", "Archived enquiries", archivedEnquiries],
                ["/admin/posts?view=archived", "Archived blog posts", archivedPosts],
                ["/admin/categories?view=archived", "Archived categories", archivedCategories],
              ] as const).map(([href, label, count]) => (
                <div className="ad-nav-badge-wrap" key={href}>
                  <NavLink href={href} icon="folder" label={label} plain />
                  {!!count && <span className="ad-badge" title="Archived items waiting for you to restore or delete">{count}</span>}
                </div>
              ))}
            </>
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
          {canCareers && (
            <div className="ad-nav-badge-wrap">
              <NavLink href="/admin/talent-network" icon="users" label="Talent network" />
              {!!unreadTalent && <span className="ad-badge" title="Unread CVs sent for future consideration">{unreadTalent}</span>}
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
