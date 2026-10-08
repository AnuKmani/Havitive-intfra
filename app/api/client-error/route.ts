import { NextResponse, type NextRequest } from "next/server";

/** Browser errors are logged here so they show up in Vercel → Logs (search "[client-error]"). */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.text()).slice(0, 4000);
    const data = JSON.parse(body) as Record<string, unknown>;
    const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);
    console.error("[client-error]", JSON.stringify({
      message: clip(data.message, 500),
      digest: clip(data.digest, 50),
      url: clip(data.url, 300),
      stack: clip(data.stack, 1500),
      ua: clip(request.headers.get("user-agent"), 200),
    }));
  } catch {
    // Ignore malformed reports.
  }
  return new NextResponse(null, { status: 204 });
}
