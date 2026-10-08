import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { signOut } from "../../actions";

export const metadata = { title: "Verification code" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  if (!user.factors?.some((f) => f.status === "verified")) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="ad-login">
      <section className="ad-login-form" style={{ gridColumn: "1 / -1" }}>
        <div className="ad-login-card">
          <img src="/upload/logos/hav.png" alt="Havitive" width={64} height={64} />
          <h1>Two-step verification</h1>
          <p className="ad-muted">Open your authenticator app and enter the 6-digit code for Havitive.</p>
          {error === "invalid" && <p className="ad-err" role="alert">That code didn&rsquo;t work. Check the time on your phone and try the newest code.</p>}
          <form method="post" action="/admin/login/verify/submit" className="ad-form">
            <div className="ad-field">
              <label htmlFor="code">Verification code</label>
              <input
                id="code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code"
                pattern="[0-9]{6}" maxLength={6} required autoFocus placeholder="123456"
                style={{ fontSize: 22, letterSpacing: "0.3em", textAlign: "center" }}
              />
            </div>
            <button className="ad-btn">Verify</button>
          </form>
          <form action={signOut}><button className="ad-back" style={{ background: "none", border: 0, cursor: "pointer" }}>← Sign out</button></form>
        </div>
      </section>
    </main>
  );
}
