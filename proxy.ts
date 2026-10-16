import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Keeps the Supabase session cookie fresh for the admin area.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data } = await supabase.auth.getClaims();
  const isLogin = ["/admin/login", "/admin/login/submit", "/admin/login/forgot"].includes(request.nextUrl.pathname);
  // (The two-factor step under /admin/login/verify needs a signed-in session, so it is not exempt.)
  // An expired or broken session cookie is removed, so the browser starts clean at the login page.
  const clearStale = (res: NextResponse) => {
    if (!data?.claims) {
      for (const c of request.cookies.getAll()) if (c.name.startsWith("sb-")) res.cookies.set(c.name, "", { path: "/", maxAge: 0 });
    }
    return res;
  };
  if (!data?.claims && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return clearStale(NextResponse.redirect(url));
  }
  // Only when the login page is opened (never during the sign-in post, which sets fresh cookies).
  const openingLogin = request.method === "GET" && request.nextUrl.pathname === "/admin/login";
  return openingLogin ? clearStale(response) : response;
}

export const config = { matcher: ["/admin/:path*"] };
