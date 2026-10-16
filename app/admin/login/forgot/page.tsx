import ForgotForm from "./ForgotForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <main className="ad-login">
      <section className="ad-login-form" style={{ gridColumn: "1 / -1" }}>
        <div className="ad-login-card">
          <img src="/upload/logos/hav.png" alt="Havitive" width={64} height={64} />
          <h1>Forgot your password?</h1>
          <p className="ad-muted">Send a request to the admin. They will give you a temporary password, and you will be asked to choose your own at your first sign-in.</p>
          <ForgotForm />
          <a href="/admin/login" className="ad-back">← Back to sign in</a>
        </div>
      </section>
    </main>
  );
}
