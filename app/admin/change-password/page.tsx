import { redirect } from "next/navigation";
import { requireStaffAny } from "@/lib/admin/auth";
import Icon from "@/components/admin/Icon";
import { signOut } from "../actions";
import PasswordForm from "../(panel)/account/PasswordForm";

export const metadata = { title: "Choose a new password" };

export default async function ChangePasswordPage() {
  const { mustChange } = await requireStaffAny();
  if (!mustChange) redirect("/admin");
  return (
    <main className="ad-login">
      <section className="ad-login-form" style={{ gridColumn: "1 / -1" }}>
        <div className="ad-login-card">
          <img src="/upload/logos/hav.png" alt="Havitive" width={64} height={64} />
          <h1>Choose a new password</h1>
          <p className="ad-muted">You signed in with a temporary password. Choose your own password to continue (at least 10 characters).</p>
          <PasswordForm redirectTo="/admin" />
          <form action={signOut}>
            <button className="ad-btn ad-btn-light ad-signout"><Icon name="logout" size={16} /> Sign out</button>
          </form>
        </div>
      </section>
    </main>
  );
}
