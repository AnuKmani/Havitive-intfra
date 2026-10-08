import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Sign-in as a plain form post. Unlike a server action, this keeps working in a login tab
 * that was opened before the site was updated (and even without JavaScript).
 */
export async function POST(request: NextRequest) {
  // The address the visitor actually used (Vercel sets x-forwarded-host / x-forwarded-proto).
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const site = `${proto}://${host}`;
  const back = (error: string) => NextResponse.redirect(`${site}/admin/login?error=${error}`, 303);

  // Only accept the form from this site.
  const origin = request.headers.get("origin");
  if (origin && origin !== "null" && new URL(origin).host !== host) return back("invalid");

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return back("invalid");

  const response = NextResponse.redirect(`${site}/admin`, 303);
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return back("invalid");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    const denied = back("not-admin");
    // Make sure no half-signed-in session cookies stay behind.
    response.cookies.getAll().forEach((c) => denied.cookies.set(c.name, "", { path: "/", maxAge: 0 }));
    return denied;
  }
  return response;
}
