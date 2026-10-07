import Icon from "@/components/admin/Icon";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import PasswordForm from "./PasswordForm";
import ProfileForm from "./ProfileForm";

export const metadata = { title: "Profile & password" };

export default async function Account() {
  const { user } = await requireAdmin();
  const meta = (user.user_metadata ?? {}) as { name?: string; phone?: string; photo?: string };
  return (
    <>
      <PageHeader icon="user" title="Profile & password" subtitle="Your admin account details." />
      <div className="ad-split">
        <section className="ad-panel">
          <div className="ad-panel-head"><h2><Icon name="user" /> Profile</h2></div>
          <ProfileForm email={user.email ?? ""} name={meta.name ?? ""} phone={meta.phone ?? ""} photo={meta.photo ?? ""} />
        </section>
        <section className="ad-panel">
          <div className="ad-panel-head"><h2><Icon name="key" /> Change password</h2></div>
          <p className="ad-muted ad-panel-hint">Use at least 10 characters. You stay signed in on this device.</p>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
