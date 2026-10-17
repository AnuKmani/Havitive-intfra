import { stripHtml } from "./text";

export type ServiceCard = { title: string; text: string };
export type ServiceContent = { intro: string[]; cards: ServiceCard[]; outro: string[] };

/**
 * Splits a service description written in the admin editor into an intro, a list of "Title: explanation" items
 * (a bold lead-in followed by text, as in the Word-style content), and any closing paragraphs.
 * Everything comes back as plain text. Returns null when there are fewer than two such items, so the page
 * can show the description as ordinary rich text instead.
 */
export function parseServiceContent(html?: string | null): ServiceContent | null {
  const blocks = (html ?? "").replace(/<!--[\s\S]*?-->/g, "").match(/<(p|li)\b[\s\S]*?<\/\1>/gi) ?? [];
  const intro: string[] = [];
  const cards: ServiceCard[] = [];
  const outro: string[] = [];

  for (const block of blocks) {
    const text = stripHtml(block);
    if (!text) continue;
    const lead = block.match(/<(b|strong)\b[^>]*>([\s\S]*?)<\/\1>/i);
    const leadText = lead ? stripHtml(lead[2]) : "";
    const title = leadText.replace(/\s*:\s*$/, "");
    const body = text.slice(leadText.length).replace(/^[\s:–-]+/, "");
    // A card is a paragraph that starts with a bold title and goes on with its explanation.
    if (leadText && text.startsWith(leadText) && title && body && title.length <= 80) cards.push({ title, text: body });
    else (cards.length ? outro : intro).push(text);
  }
  return cards.length >= 2 ? { intro, cards, outro } : null;
}
