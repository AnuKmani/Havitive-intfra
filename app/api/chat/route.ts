import Anthropic from "@anthropic-ai/sdk";
import { getKnowledge } from "@/lib/chat/knowledge";
import { CHAT_INSTRUCTIONS } from "@/lib/chat/prompt";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
const MAX_TURNS = 20;
const MAX_CHARS = 2000;

type ChatTurn = { role: "user" | "assistant"; content: string };

// Best-effort per-instance rate limit: 20 messages per IP per 10 minutes.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 20;
}

function parse(body: unknown): ChatTurn[] | null {
  const list = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(list) || list.length === 0) return null;
  const turns = list.slice(-MAX_TURNS).map((m) => ({
    role: (m as ChatTurn)?.role === "assistant" ? "assistant" : "user",
    content: String((m as ChatTurn)?.content ?? "").slice(0, MAX_CHARS).trim(),
  })) as ChatTurn[];
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user" || turns.some((t) => !t.content)) return null;
  return turns;
}

const FALLBACK_REPLY = `Sorry, I can't answer that right now. Please call ${SITE.phones[0].label} or message us on WhatsApp and our team will help you.`;

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(FALLBACK_REPLY, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) {
    return new Response("You're sending messages quickly. Please wait a few minutes and try again.", { status: 429 });
  }
  const turns = parse(await req.json().catch(() => null));
  if (!turns) return new Response("Invalid request", { status: 400 });

  const knowledge = await getKnowledge();
  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 4000,
          // Chat answers are short and latency matters; low effort keeps replies quick.
          output_config: { effort: "low" },
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          system: [
            { type: "text", text: CHAT_INSTRUCTIONS },
            // Stable prefix (instructions + knowledge) is cached; only the conversation varies.
            { type: "text", text: `<knowledge_base>\n${knowledge}\n</knowledge_base>`, cache_control: { type: "ephemeral" } },
          ],
          messages: turns,
        });
        let wrote = false;
        for await (const event of response) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            wrote = true;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await response.finalMessage();
        if (final.stop_reason === "refusal" || !wrote) controller.enqueue(encoder.encode(wrote ? "\n\n" + FALLBACK_REPLY : FALLBACK_REPLY));
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) console.error("Chat rate limited by API");
        else if (error instanceof Anthropic.APIError) console.error(`Chat API error ${error.status}:`, error.message);
        else console.error("Chat failed:", error);
        controller.enqueue(encoder.encode(FALLBACK_REPLY));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
