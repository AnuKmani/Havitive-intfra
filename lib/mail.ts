import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { SITE } from "@/lib/site";

/**
 * Email is sent over SMTP. Set these in Vercel → Settings → Environment Variables:
 *   SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASS, MAIL_FROM (optional), NOTIFY_EMAIL (optional)
 * A Gmail / Google Workspace account works with smtp.gmail.com, port 465 and an App Password.
 */
export function mailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transport: Transporter | null = null;
function transporter() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Plain text → simple branded HTML email. */
function layout(text: string) {
  const body = escape(text).replace(/\n/g, "<br>");
  return `<div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:24px">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;overflow:hidden">
    <div style="background:#052132;color:#fff;padding:16px 24px;font-size:18px;font-weight:bold">${escape(SITE.name)}</div>
    <div style="padding:24px;color:#1d2733;font-size:15px;line-height:1.6">${body}</div>
    <div style="padding:12px 24px;background:#f4f6f8;color:#6b7785;font-size:12px">${escape(SITE.name)} · ${escape(SITE.url)}</div>
  </div></div>`;
}

export async function sendMail(opts: { to: string; subject: string; text: string; replyTo?: string }) {
  if (!mailConfigured()) throw new Error("Email is not set up yet.");
  await transporter().sendMail({
    from: process.env.MAIL_FROM || `${SITE.name} <${process.env.SMTP_USER}>`,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.text,
    html: layout(opts.text),
  });
}

/** Best effort: never throws, so a mail problem can't break a form submission. */
export async function trySendMail(opts: Parameters<typeof sendMail>[0]) {
  if (!mailConfigured() || !opts.to) return false;
  try {
    await sendMail(opts);
    return true;
  } catch (e) {
    console.error("Email failed:", (e as Error).message);
    return false;
  }
}
