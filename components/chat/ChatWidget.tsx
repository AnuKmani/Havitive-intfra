"use client";

import { useEffect, useRef, useState } from "react";
import "./chat.css";

type Turn = { role: "user" | "assistant"; content: string };

const GREETING: Turn = {
  role: "assistant",
  content: "Hi! I'm Havi, Havitive's assistant. Ask me about our services, projects, team or how to start your project.",
};
const SUGGESTIONS = ["What services do you offer?", "Show me your recent projects", "How can I get a quote?"];
const STORE = "havitive-chat";

/** Turn URLs in plain text into links without using innerHTML. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a key={i} href={p.replace(/[.,]$/, "")} target={p.includes(window.location.host) ? undefined : "_blank"} rel="noopener">
            {p.replace(/[.,]$/, "")}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (turns.length > 1) sessionStorage.setItem(STORE, JSON.stringify(turns.slice(-30)));
    } catch {}
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [turns]);

  function toggle() {
    // Restore this tab's earlier conversation the first time the panel opens.
    if (!open && turns.length === 1) {
      try {
        const saved = sessionStorage.getItem(STORE);
        if (saved) setTurns(JSON.parse(saved));
      } catch {}
    }
    setOpen(!open);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history = [...turns, { role: "user" as const, content }];
    setTurns([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((t) => t !== GREETING) }),
      });
      if (!res.body) throw new Error("No response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setTurns([...history, { role: "assistant", content: reply }]);
      }
      if (!reply) throw new Error("Empty response");
    } catch {
      setTurns([...history, { role: "assistant", content: "Sorry, something went wrong. Please try again, or call us at +91 999 5 320 321." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hv-chat">
      {open && (
        <section className="hv-chat-panel" role="dialog" aria-label="Chat with Havitive assistant">
          <header className="hv-chat-head">
            <img src="/upload/logos/hav.png" alt="" />
            <div>
              <strong>Havi · Havitive Assistant</strong>
              <span>Usually replies in seconds</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </header>
          <div className="hv-chat-list" ref={listRef} aria-live="polite">
            {turns.map((t, i) => (
              <div key={i} className={`hv-msg hv-${t.role}`}>
                {t.content ? <Linkified text={t.content} /> : <span className="hv-typing" aria-label="Typing"><i></i><i></i><i></i></span>}
              </div>
            ))}
            {turns.length === 1 && (
              <div className="hv-suggest">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}
          </div>
          <form
            className="hv-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              aria-label="Your message"
              maxLength={2000}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label="Send">➤</button>
          </form>
          <p className="hv-chat-note">AI assistant. For quotes, please confirm details with our team.</p>
        </section>
      )}
      <button type="button" className="hv-chat-fab" onClick={toggle} aria-expanded={open} aria-label={open ? "Close chat" : "Chat with us"}>
        {open ? "×" : <><span className="hv-dot" aria-hidden="true"></span>Ask Havi</>}
      </button>
    </div>
  );
}
