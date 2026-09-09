import { useEffect, useRef, useState } from "react";
import { gsap, EASE, prefersReducedMotion } from "../lib/gsap";
import { BUSINESS, FORM_ENDPOINT } from "../data/site";

const KEY = "ar:quote-prompt";
const SNOOZE_DAYS = 7;
const DELAY_MS = 2500;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneDigits = (s) => s.replace(/\D/g, "");

/** (608) 844-8482 as you type. */
const formatPhone = (raw) => {
  const d = phoneDigits(raw).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

/**
 * Compact estimate prompt, shown shortly after load. (Pattern carried over
 * from the Brothers Pool build.)
 *
 * Deliberately a corner card rather than a full-screen interstitial: Google
 * demotes mobile pages that cover content on arrival, and this is a lead-gen
 * site where that penalty would be expensive. Dismissal is remembered for a
 * week so returning visitors are not nagged.
 *
 * Phone AND email are both required here — the whole point of the prompt is
 * a callback, so a submission the office can't act on is worthless.
 */
export default function QuotePopup() {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const card = useRef(null);

  useEffect(() => {
    let snoozedUntil = 0;
    try {
      snoozedUntil = Number(window.localStorage.getItem(KEY) || 0);
    } catch {
      /* storage blocked — just show it */
    }
    if (Date.now() < snoozedUntil) return;

    /* Timed from mount, not window 'load': waiting on every hero image and
       video pushes 'load' out far enough that visitors have already scrolled
       past or left. */
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const snooze = () => {
    try {
      window.localStorage.setItem(KEY, String(Date.now() + SNOOZE_DAYS * 864e5));
    } catch {
      /* ignore */
    }
  };

  const close = () => {
    snooze();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || prefersReducedMotion() || !card.current) return;
    const ctx = gsap.context(() => {
      gsap.from(card.current, { y: 28, autoAlpha: 0, duration: 0.9, ease: EASE });
    });
    return () => ctx.revert();
  }, [open]);

  const set = (k) => (e) => {
    const raw = e.target.value;
    setV((p) => ({ ...p, [k]: k === "phone" ? formatPhone(raw) : raw }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (v.name.trim().length < 2) next.name = "Please tell us your name.";
    if (phoneDigits(v.phone).length !== 10) next.phone = "A 10-digit number we can call.";
    if (!emailRe.test(v.email.trim())) next.email = "A valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setState("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: v.name,
          phone: v.phone,
          email: v.email,
          message: "Sent from the quick estimate prompt.",
          _subject: `Call-back request — ${v.name}`,
          _template: "table",
          _captcha: "false",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || String(body.success) === "false") throw new Error("send failed");
      setState("done");
      snooze();
    } catch {
      /* Honest failure with a working alternative, never a fake success. */
      setState("error");
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Request an estimate"
      className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:p-0"
    >
      <div
        ref={card}
        className="relative w-full overflow-hidden border border-white/12 bg-ink-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)] sm:w-[22.5rem]"
      >
        {/* brand thread: blue into gold, like the scroll progress bar */}
        <span className="block h-[2px] w-full bg-gradient-to-r from-blue via-blue-lt to-copper" />

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-cream/45 transition-colors duration-300 hover:bg-white/10 hover:text-cream"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
          </svg>
        </button>

        {state === "done" ? (
          <div className="px-6 py-8 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-blue-lt/40 bg-blue-lt/10 text-blue-lt">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="m4 10.5 4 4L16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <p className="mt-4 font-accent text-[1.3rem] font-medium text-cream">
              Thanks — that's with us.
            </p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-cream/55">
              We'll call you back shortly.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 text-[0.68rem] tracking-[0.2em] text-cream/35 uppercase underline decoration-white/20 underline-offset-4 transition-colors hover:text-cream/70"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="px-6 pt-7 pb-6">
            <p className="eyebrow text-blue-lt">Free estimate</p>
            <p className="mt-3 font-accent text-[1.35rem] leading-snug font-medium text-balance text-cream">
              Thinking about a project?
            </p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-cream/55">
              Leave a number and we'll call you back — no obligation.
            </p>

            <div className="mt-5 space-y-3">
              {[
                { k: "name", ph: "Name", type: "text", mode: undefined, ac: "name" },
                { k: "phone", ph: "Phone (required)", type: "tel", mode: "tel", ac: "tel" },
                { k: "email", ph: "Email (required)", type: "email", mode: "email", ac: "email" },
              ].map((f) => (
                <input
                  key={f.k}
                  type={f.type}
                  inputMode={f.mode}
                  autoComplete={f.ac}
                  placeholder={f.ph}
                  aria-label={f.ph}
                  value={v[f.k]}
                  onChange={set(f.k)}
                  className={`w-full border bg-ink px-3.5 py-3 text-[0.85rem] text-cream placeholder:text-cream/35 focus:outline-none ${
                    errors[f.k] ? "border-red-400/70" : "border-white/12 focus:border-blue-lt"
                  }`}
                />
              ))}
            </div>

            {Object.keys(errors).length > 0 && (
              <p role="alert" className="mt-3 text-[0.75rem] text-red-300">
                {Object.values(errors).filter(Boolean)[0]}
              </p>
            )}

            <button
              type="submit"
              disabled={state === "sending"}
              className="btn btn-blue mt-4 w-full disabled:opacity-70"
            >
              {state === "sending" ? "Sending…" : "Request a call back"}
            </button>

            {state === "error" && (
              <p role="alert" className="mt-3 text-[0.75rem] text-red-300">
                That didn't send — please call {BUSINESS.phone}.
              </p>
            )}

            <a
              href={BUSINESS.phoneHref}
              className="mt-4 flex items-center justify-center gap-2 text-[0.75rem] text-cream/40 transition-colors hover:text-cream/70"
            >
              or call {BUSINESS.phone}
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
