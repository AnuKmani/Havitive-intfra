import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/** Second login step: checks the authenticator-app code and upgrades the session. */
export async function POST(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const site = `${proto}://${host}`;
  const back = () => NextResponse.redirect(`${site}/admin/login/verify?error=invalid`, 303);

  const origin = request.headers.get("origin");
  if (origin && origin !== "null" && new URL(origin).host !== host) return back();
  const code = String((await request.formData()).get("code") ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return back();

  const response = NextResponse.redirect(`${site}/admin`, 303);
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (!factor) return NextResponse.redirect(`${site}/admin/login`, 303);
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return back();
  return response;
}
