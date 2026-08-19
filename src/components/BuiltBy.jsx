import { useEffect, useRef, useState } from "react";
import { CREDIT } from "../data/site";

/**
 * Quiet studio credit for the footer's legal bar. Sits at whisper contrast
 * until hovered; a click opens a small card with the pitch and a compact
 * enquiry form. Deliberately opt-in — nothing animates or advertises until
 * asked.
 *
 * The form posts to FormSubmit rather than opening a mailto, which keeps any
 * personal address out of the markup and means a visitor never leaves the page
 * or needs a configured mail client.
 */
export default function BuiltBy() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const root = useRef(null);
  const firstField = useRef(null);

  /* Outside click + Escape close it. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (root.current && !root.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* Focus the first field when the card opens, but not on touch — pulling up
     the keyboard unprompted covers the card the visitor just opened. */
  useEffect(() => {
    if (!open || status === "sent") return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const t = setTimeout(() => firstField.current?.focus(), 420);
    return () => clearTimeout(t);
  }, [open, status]);

  async function submit(e) {
    e.preventDefault();
    if (status === "sending") return;

    const fd = new FormData(e.currentTarget);
    if (fd.get("_honey")) return; // bot filled the hidden field

    setStatus("sending");
    try {
      const res = await fetch(CREDIT.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          message: fd.get("message"),
          _subject: "Website enquiry — via Affordable Remodeling site",
          _template: "table",
          _captcha: "false",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      /* Never swallow it silently — a dropped enquiry the visitor thinks
         succeeded is worse than telling them to email instead. */
      setStatus("error");
    }
  }

  return (
    <div ref={root} className="relative">
      <div
        role="dialog"
        aria-label={`Contact ${CREDIT.studio}`}
        aria-hidden={!open}
        className={`absolute bottom-full left-1/2 z-40 mb-3 w-[17rem] origin-bottom -translate-x-1/2 border border-white/10 bg-ink-2 p-4 text-left shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:right-0 sm:left-auto sm:origin-bottom-right sm:translate-x-0 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-[0.96] opacity-0"
        }`}
      >
        {status === "sent" ? (
          <div className="py-1.5">
            <p className="script text-[1rem] leading-snug text-blue-lt">Thank you.</p>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-cream/55">
              Message sent — you'll hear back shortly.
            </p>
          </div>
        ) : (
          <>
            <p className="script text-[1rem] leading-snug text-blue-lt">{CREDIT.line}</p>
            <p className="mt-1.5 text-[0.72rem] leading-relaxed text-cream/55">{CREDIT.blurb}</p>

            <form onSubmit={submit} className="mt-3.5 space-y-2">
              {/* Honeypot — hidden from people, catches naive bots. */}
              <input
                type="text"
                name="_honey"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              <input
                ref={firstField}
                name="name"
                required
                autoComplete="name"
                placeholder="Name"
                className="w-full border border-white/12 bg-ink px-2.5 py-2 text-[0.74rem] text-cream placeholder:text-cream/30 focus:border-blue focus:outline-none"
              />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email"
                className="w-full border border-white/12 bg-ink px-2.5 py-2 text-[0.74rem] text-cream placeholder:text-cream/30 focus:border-blue focus:outline-none"
              />
              <textarea
                name="message"
                required
                rows={2}
                placeholder="What are you looking to build?"
                className="w-full resize-none border border-white/12 bg-ink px-2.5 py-2 text-[0.74rem] leading-relaxed text-cream placeholder:text-cream/30 focus:border-blue focus:outline-none"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-blue px-3 py-2 text-[0.62rem] font-semibold tracking-[0.12em] text-white uppercase transition-colors duration-300 hover:bg-blue-lt disabled:opacity-55"
              >
                {status === "sending" ? "Sending…" : CREDIT.cta}
              </button>

              <p aria-live="polite" className="min-h-[0.85rem] text-[0.62rem] text-cream/45">
                {status === "error" ? "Didn't send — please try again in a moment." : ""}
              </p>
            </form>
          </>
        )}
      </div>

      {/* The credit itself — whisper-quiet until hovered */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`text-[0.62rem] transition-colors duration-500 ${
          open ? "text-cream/60" : "text-cream/20 hover:text-cream/50"
        }`}
      >
        Site by {CREDIT.studio}
      </button>
    </div>
  );
}
