import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="ad-login">
      <section className="ad-login-art" aria-hidden="true">
        <img src="/upload/logos/havitive.jpeg" alt="" />
        <div className="ad-login-art-text">
          <span>Havitive Infra Pvt Ltd</span>
          <h2>Designing homes, crafting dreams.</h2>
          <p>Update projects, banners, team and blog in one place.</p>
        </div>
      </section>
      <section className="ad-login-form">
        <div className="ad-login-card">
          <img src="/upload/logos/hav.png" alt="Havitive" width={64} height={64} />
          <h1>Welcome back</h1>
          <p className="ad-muted">Sign in to manage the Havitive website.</p>
          {error === "not-admin" && <p className="ad-err">This account doesn&rsquo;t have admin access.</p>}
          <LoginForm />
          <a href="/" className="ad-back">← Back to website</a>
        </div>
      </section>
    </main>
  );
}
