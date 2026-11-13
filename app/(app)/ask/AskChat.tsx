"use client";

import { useEffect, useRef, useState } from "react";
import { startCheckout } from "@/app/(app)/billing/actions";
import { IconSend, IconSparkle } from "@/app/components/icons";

type Msg = { id: string; role: "user" | "assistant"; content: string };

/** Shows **bold** as bold and strips other Markdown marks. Renders text only (no HTML injection). */
function Answer({ text }: { text: string }) {
  const clean = text.replace(/^#{1,6}\s+/gm, "").replace(/(^|\s)\*(?!\*)([^*\n]+)\*(?=\s|[.,;:!?]|$)/g, "$1$2");
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => (p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>))}</>;
}

export default function AskChat({
  initial,
  suggestions,
  prefill,
  months,
  locked: initiallyLocked,
  isFree,
  freeLeft: initialFreeLeft,
  freeTotal,
}: {
  initial: Msg[];
  suggestions: string[];
  prefill: string;
  months: string[];
  locked: boolean;
  isFree: boolean;
  freeLeft: number | null;
  freeTotal: number;
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState(prefill);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(initiallyLocked);
  const [freeLeft, setFreeLeft] = useState(initialFreeLeft);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, busy]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setError(null);
    setBusy(true);
    const tempId = `t${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: "user", content: q }]);
    setText("");
    try {
      const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessages((m) => m.filter((x) => x.id !== tempId));
        setText(q);
        if (data.needsSubscription) setLocked(true);
        setError(data.error ?? "Finny couldn't answer right now. Please try again.");
        return;
      }
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", content: data.answer }]);
      if (typeof data.freeQuestionsLeft === "number") {
        setFreeLeft(data.freeQuestionsLeft);
        if (data.freeQuestionsLeft <= 0) setLocked(true);
      }
    } catch {
      setMessages((m) => m.filter((x) => x.id !== tempId));
      setText(q);
      setError("Couldn't reach Finny. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ask-layout">
      <section className="card chat-card" aria-label="Conversation">
        <div className="chat-head">
          <span className="ic-tile sm"><IconSparkle /></span>
          <strong>Ask Finny</strong>
          <span className="tag-pill plain">Your data only</span>
        </div>
        <div className="chat-log" aria-live="polite">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p><strong>Ask anything about your numbers.</strong></p>
              <p className="muted">For example why profit changed, which costs grew, or how two months compare.</p>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <p key={m.id} className="bubble-user">{m.content}</p>
            ) : (
              <div key={m.id} className="bubble-row">
                <span className="avatar-sm f" aria-hidden="true">F</span>
                <p className="bubble-ai"><Answer text={m.content} /></p>
              </div>
            ),
          )}
          {busy && (
            <div className="bubble-row" role="status">
              <span className="avatar-sm f" aria-hidden="true">F</span>
              <p className="bubble-ai typing"><span className="spinner sm" aria-hidden="true" />Finny is checking your numbers…</p>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        {locked ? (
          <div className="chat-locked">
            <p>{isFree ? `You've used your ${freeTotal} free questions.` : "You've reached today's question limit."}</p>
            {isFree && <form action={startCheckout}><button className="btn btn-primary" type="submit">Upgrade to Pro</button></form>}
          </div>
        ) : (
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); ask(text); }}>
            <label className="sr-only" htmlFor="question">Your question</label>
            <input id="question" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about your numbers…" maxLength={600} disabled={busy} autoComplete="off" />
            <button className="btn btn-primary" type="submit" disabled={busy || !text.trim()}>
              <IconSend aria-hidden="true" /><span>Ask</span>
            </button>
          </form>
        )}
        {isFree && freeLeft !== null && !locked && <p className="muted small">{freeLeft} of {freeTotal} free questions left.</p>}
      </section>

      <aside className="ask-side">
        <section className="card">
          <h2 className="card-title">Suggested questions</h2>
          <ul className="suggest-list">
            {suggestions.map((s) => (
              <li key={s}><button type="button" onClick={() => ask(s)} disabled={busy || locked}>{s}</button></li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 className="card-title">Months on file</h2>
          <ul className="month-chips">{months.map((m) => <li key={m}>{m}</li>)}</ul>
          <p className="muted small">Finny can only answer about these months.</p>
        </section>
      </aside>
    </div>
  );
}
