import { useEffect, useRef, useState } from "react";
import { CREDIT } from "../data/site";

/**
 * Quiet studio credit for the footer's legal bar. Sits at whisper contrast
 * until hovered; a click opens a small card with the pitch and a contact
 * link. Deliberately opt-in — nothing animates or advertises until asked.
 */
export default function BuiltBy() {
  const [open, setOpen] = useState(false);
  const root = useRef(null);

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

  return (
    <div ref={root} className="relative">
      {/* The card */}
      <div
        role="dialog"
        aria-label={`About ${CREDIT.studio}`}
        className={`absolute bottom-full left-1/2 z-40 mb-3 w-52 origin-bottom -translate-x-1/2 border border-white/10 bg-ink-2 p-4 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:left-auto sm:right-0 sm:translate-x-0 sm:origin-bottom-right ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-[0.96] opacity-0"
        }`}
      >
        <p className="script text-[1rem] leading-snug text-blue-lt">{CREDIT.line}</p>
        <p className="mt-2 text-[0.72rem] leading-relaxed text-cream/55">{CREDIT.blurb}</p>
        <a
          href={`mailto:${CREDIT.email}?subject=${encodeURIComponent("Website inquiry — saw the Affordable Remodeling site")}`}
          className="link-line mt-3.5 inline-block text-[0.62rem] font-semibold tracking-[0.12em] text-cream/90 uppercase"
        >
          {CREDIT.cta} →
        </a>
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
