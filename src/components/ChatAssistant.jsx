import { useEffect, useRef, useState } from "react";
import { gsap, EASE, prefersReducedMotion } from "../lib/gsap";
import { BUSINESS, FORM_ENDPOINT } from "../data/site";

const GREETING =
  "Hi — I'm the assistant for Affordable Home Remodeling. Thinking about a project, or just have a question? Either way I can help.";

const CHIPS = [
  "I want an estimate",
  "Do you cover my town?",
  "What does a kitchen cost?",
  "Tell me about financing",
];

/**
 * AI assistant — a bubble bottom-right, matching the pattern on the Luxe Web
 * Studio site. Answers come from /api/chat (Claude via a Vercel serverless
 * function, so the API key never enters the browser bundle).
 *
 * The "Send to the team" action is the important part. The assistant collects
 * project details and promises follow-up; if that transcript never reached the
 * office it would be the same broken promise as a form that shows success and
 * posts nowhere. So delivery is a deterministic button press to the same
 * FormSubmit inbox the estimate forms use — not something inferred from the
 * model's output, which would be a fragile place to put a lead.
 *
 * If ANTHROPIC_API_KEY is missing the endpoint answers 501 and the widget says
 * so plainly with the phone number, rather than sitting there looking online.
 */
export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sendState, setSendState] = useState("idle"); // idle | sending | sent | error

  const panel = useRef(null);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  /* Keep the newest message in view. */
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [msgs, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || prefersReducedMotion() || !panel.current) return;
    const ctx = gsap.context(() => {
      gsap.from(panel.current, { y: 24, autoAlpha: 0, duration: 0.7, ease: EASE });
    });
    /* Desktop only: pulling up the phone keyboard the instant the panel opens
       covers the conversation the visitor came to read. */
    if (window.matchMedia("(hover: hover)").matches) {
      const t = setTimeout(() => inputRef.current?.focus(), 380);
      return () => {
        clearTimeout(t);
        ctx.revert();
      };
    }
    return () => ctx.revert();
  }, [open]);

  const ask = async (text) => {
    const q = text.trim();
    if (!q || busy) return;
    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-14) }),
      });
      if (r.status === 501) throw new Error("unconfigured");
      if (!r.ok) throw new Error("upstream");
      const { reply } = await r.json();
      setMsgs([...next, { role: "assistant", content: reply || "Sorry — could you rephrase that?" }]);
    } catch (e) {
      setMsgs([
        ...next,
        {
          role: "assistant",
          content:
            e.message === "unconfigured"
              ? `I'm not connected yet — please call or text ${BUSINESS.phone} and the team will help right away.`
              : `Something went wrong on my end. Call or text ${BUSINESS.phone} and we'll pick it up from there.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  /* Deterministic delivery of the whole conversation. */
  const sendTranscript = async () => {
    if (sendState === "sending") return;
    setSendState("sending");
    const transcript = msgs
      .map((m) => `${m.role === "user" ? "Visitor" : "Assistant"}: ${m.content}`)
      .join("\n\n");
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: "Website chat enquiry",
          message: transcript,
          _subject: "Chat enquiry from the website",
          _captcha: "false",
        }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok || String(body.success) === "false") throw new Error("send failed");
      setSendState("sent");
    } catch {
      setSendState("error");
    }
  };

  const userTurns = msgs.filter((m) => m.role === "user").length;

  return (
    <>
      {/* ---- Launcher ---- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Chat with Affordable Home Remodeling"
        className={`fixed right-4 bottom-4 z-[80] flex items-center gap-2.5 border border-white/15 bg-ink-2 py-3 pr-4 pl-3.5 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.9)] transition-all duration-500 sm:right-6 sm:bottom-6 ${
          open ? "pointer-events-none translate-y-2 opacity-0" : "opacity-100"
        }`}
      >
        <span className="relative grid h-6 w-6 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-lt/25" />
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="relative text-blue-lt">
            <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v6A2.5 2.5 0 0 1 14.5 14H8l-4 3.5V14H5.5A2.5 2.5 0 0 1 3 11.5v-6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[0.7rem] font-semibold tracking-[0.12em] text-cream uppercase">
          Ask us
        </span>
      </button>

      {/* ---- Panel ---- */}
      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Affordable Home Remodeling assistant"
          className="fixed inset-x-3 bottom-3 z-[85] flex max-h-[min(34rem,80svh)] flex-col overflow-hidden border border-white/12 bg-ink-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[23rem]"
        >
          <span className="block h-[2px] w-full shrink-0 bg-gradient-to-r from-blue via-blue-lt to-copper" />

          {/* head */}
          <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3.5">
            <img src="/logo-mark.webp" alt="" className="h-8 w-auto" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[0.72rem] leading-tight tracking-[0.06em] text-cream">
                AFFORDABLE
                <br />
                <span className="text-blue-lt">REMODELING</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-cream/45 transition-colors hover:bg-white/10 hover:text-cream"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* log */}
          <div ref={logRef} aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 text-[0.8rem] leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-blue text-white"
                    : "bg-ink text-cream/85"
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="flex w-14 items-center justify-center gap-1 bg-ink px-3 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-lt/70"
                    style={{ animationDelay: `${d * 120}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* quick chips, only before the visitor has typed */}
          {userTurns === 0 && (
            <div className="flex shrink-0 flex-wrap gap-1.5 px-4 pb-2">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => ask(c)}
                  className="border border-white/12 px-2.5 py-1.5 text-[0.66rem] text-cream/70 transition-colors hover:border-blue-lt hover:text-cream"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* send-to-team: the only thing that actually delivers the lead */}
          {userTurns >= 2 && (
            <div className="shrink-0 border-t border-white/10 px-4 py-2.5">
              {sendState === "sent" ? (
                <p className="text-[0.7rem] text-blue-lt">
                  Sent — the team has your details and will follow up.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={sendTranscript}
                    disabled={sendState === "sending"}
                    className="w-full bg-blue px-3 py-2 text-[0.62rem] font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-blue-lt disabled:opacity-60"
                  >
                    {sendState === "sending" ? "Sending…" : "Send to the team"}
                  </button>
                  {sendState === "error" && (
                    <p role="alert" className="mt-2 text-[0.66rem] text-red-300">
                      That didn't send — please call {BUSINESS.phone}.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex shrink-0 items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your project…"
              aria-label="Your message"
              className="min-w-0 flex-1 border border-white/12 bg-ink px-3 py-2.5 text-[0.8rem] text-cream placeholder:text-cream/35 focus:border-blue-lt focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="grid h-10 w-10 shrink-0 place-items-center bg-blue text-white transition-colors hover:bg-blue-lt disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 10h12m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
