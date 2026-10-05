import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="ad-login">
      <div className="ad-login-card">
        <img src="/upload/logos/hav.png" alt="Havitive" width={90} />
        <h1>Admin sign in</h1>
        {error === "not-admin" && <p className="ad-err">This account doesn&rsquo;t have admin access.</p>}
        <LoginForm />
        <a href="/" className="ad-muted">← Back to website</a>
      </div>
    </main>
  );
}
