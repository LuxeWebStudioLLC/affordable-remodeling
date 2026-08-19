import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, EASE, prefersReducedMotion } from "../lib/gsap";
import { revealUp } from "../lib/animations";
import { BUDGETS, BUSINESS, PROJECT_TYPES, TIMELINES } from "../data/site";
import SectionHeading from "./SectionHeading";

const STEPS = [
  { id: 0, label: "Your project", fields: ["services", "budget", "timeline"] },
  { id: 1, label: "Your details", fields: ["name", "email", "phone", "address"] },
  { id: 2, label: "The brief", fields: ["message"] },
];

const EMPTY = {
  services: [],
  budget: "",
  timeline: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  message: "",
  contactPref: "Either",
};

export default function Contact() {
  const root = useRef(null);
  const formRef = useRef(null);
  const panelRef = useRef(null);

  const [step, setStep] = useState(0);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-c]"), { start: "top 88%", y: 30, stagger: 0.07 });
    }, root);
    return () => ctx.revert();
  }, []);

  /* Animate each step change. */
  useEffect(() => {
    if (prefersReducedMotion() || !panelRef.current) return;
    gsap.fromTo(
      panelRef.current.querySelectorAll("[data-f]"),
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.75, ease: EASE, stagger: 0.07, overwrite: true },
    );
  }, [step]);

  const set = (key, value) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleService = (title) =>
    setData((d) => ({
      ...d,
      services: d.services.includes(title)
        ? d.services.filter((s) => s !== title)
        : [...d.services, title],
    }));

  /* ---- Validation ---- */
  const validate = (fields) => {
    const next = {};
    if (fields.includes("services") && data.services.length === 0)
      next.services = "Pick at least one — or choose “Not sure yet”.";
    if (fields.includes("name") && data.name.trim().length < 2) next.name = "Please tell us your name.";
    if (fields.includes("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim()))
      next.email = "That email doesn't look right.";
    if (fields.includes("phone")) {
      const digits = data.phone.replace(/\D/g, "");
      if (digits.length && digits.length < 10) next.phone = "Enter a 10-digit phone number.";
      if (!digits.length && !data.email.trim()) next.phone = "We need a phone or an email.";
    }
    if (fields.includes("message") && data.message.trim().length < 12)
      next.message = "A sentence or two about the project helps us quote it.";
    return next;
  };

  const advance = () => {
    const next = validate(STEPS[step].fields);
    setErrors(next);
    if (Object.keys(next).length) {
      shake();
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const shake = () => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      panelRef.current,
      { x: -7 },
      { x: 0, duration: 0.55, ease: "elastic.out(1, 0.35)" },
    );
  };

  const submit = async (e) => {
    e.preventDefault();

    // Validate everything, not just the current step.
    const all = validate(STEPS.flatMap((s) => s.fields));
    setErrors(all);
    if (Object.keys(all).length) {
      // Jump back to the first step that has a problem.
      const bad = STEPS.findIndex((s) => s.fields.some((f) => all[f]));
      setStep(bad === -1 ? 0 : bad);
      shake();
      return;
    }

    setStatus("sending");

    /* No backend is wired up yet — see README for the two-line swap to
       Formspree / Netlify Forms / your own endpoint. */
    await new Promise((r) => setTimeout(r, 1100));
    setStatus("sent");
  };

  const reset = () => {
    setData(EMPTY);
    setErrors({});
    setStep(0);
    setStatus("idle");
  };

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const current = STEPS[step];

  return (
    <section id="contact" ref={root} className="relative grain overflow-hidden bg-navy py-24 md:py-32 lg:py-40">
      {/* Faint background photo so the panel has depth */}
      <div className="pointer-events-none absolute inset-0 -z-0 opacity-[0.14]">
        <img src="/images/cta-dusk.jpg" alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy/85 to-navy" />
      </div>

      <div className="container-x relative z-10 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* ---- Left: pitch + direct contact ---- */}
        <div>
          <SectionHeading
            eyebrow="Free estimate"
            line1="Tell us about"
            line2="your project."
            tone="light"
            body="Call, text, email, or send the form. We reply quickly, every estimate is free, and there is no high-pressure sales pitch waiting on the other end."
          />

          <div className="mt-12 space-y-px overflow-hidden border border-white/10">
            <ContactRow label="Call or text" value={BUSINESS.phone} href={BUSINESS.phoneHref} />
            <ContactRow label="Email" value={BUSINESS.email} href={BUSINESS.emailHref} small />
            <ContactRow label="Based in" value={`${BUSINESS.city}, ${BUSINESS.state}`} />
            <ContactRow label="Service area" value="Within 50 miles" />
          </div>

          <a
            data-c
            href={BUSINESS.booking}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 text-[0.8rem] text-cream/60 transition-colors duration-500 hover:text-blue-lt"
          >
            <span className="link-line">Or book a time on our calendar</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* ---- Right: the form ---- */}
        <div data-c className="relative border border-white/12 bg-navy-dp/70 p-6 backdrop-blur-md sm:p-9 md:p-11">
          {status === "sent" ? (
            <Success data={data} onReset={reset} />
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate>
              {/* Step header + progress */}
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-blue-lt">
                    Step {step + 1} / {STEPS.length}
                  </p>
                  <h3 className="mt-3 text-[1.5rem] leading-none text-cream md:text-[1.8rem]">
                    {current.label}
                  </h3>
                </div>
                <div className="hidden gap-1.5 sm:flex">
                  {STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => i < step && setStep(i)}
                      disabled={i > step}
                      aria-label={`Go to step ${i + 1}: ${s.label}`}
                      className={`h-1.5 w-9 transition-colors duration-500 ${
                        i <= step ? "bg-blue-lt" : "bg-white/15"
                      } ${i < step ? "cursor-pointer" : "cursor-default"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 h-px w-full bg-white/10">
                <div
                  className="h-px bg-blue-lt transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Panels */}
              <div ref={panelRef} className="mt-8 min-h-[19rem]">
                {step === 0 && (
                  <div className="space-y-8">
                    <div data-f>
                      <p className="field-label">
                        What do you need? <span className="text-blue-lt">*</span>
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {PROJECT_TYPES.map((t) => {
                          const on = data.services.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleService(t)}
                              aria-pressed={on}
                              className={`border px-3.5 py-2 text-[0.7rem] font-semibold tracking-[0.08em] transition-all duration-400 ${
                                on
                                  ? "border-blue-lt bg-blue-lt text-ink"
                                  : "border-white/18 text-cream/60 hover:border-white/45 hover:text-cream"
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                      <Err msg={errors.services} />
                    </div>

                    <div data-f className="grid gap-7 sm:grid-cols-2">
                      <Select
                        label="Rough budget"
                        value={data.budget}
                        onChange={(v) => set("budget", v)}
                        options={BUDGETS}
                        placeholder="Optional"
                      />
                      <Select
                        label="Timeline"
                        value={data.timeline}
                        onChange={(v) => set("timeline", v)}
                        options={TIMELINES}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-7">
                    <div data-f className="grid gap-7 sm:grid-cols-2">
                      <Input
                        label="Name"
                        required
                        value={data.name}
                        onChange={(v) => set("name", v)}
                        error={errors.name}
                        autoComplete="name"
                        placeholder="Jane Doe"
                      />
                      <Input
                        label="Email"
                        required
                        type="email"
                        value={data.email}
                        onChange={(v) => set("email", v)}
                        error={errors.email}
                        autoComplete="email"
                        placeholder="jane@email.com"
                      />
                    </div>
                    <div data-f className="grid gap-7 sm:grid-cols-2">
                      <Input
                        label="Phone"
                        type="tel"
                        value={data.phone}
                        onChange={(v) => set("phone", formatPhone(v))}
                        error={errors.phone}
                        autoComplete="tel"
                        placeholder="(608) 000-0000"
                      />
                      <Input
                        label="Project address or town"
                        value={data.address}
                        onChange={(v) => set("address", v)}
                        autoComplete="address-level2"
                        placeholder="La Crosse, WI"
                      />
                    </div>

                    <div data-f>
                      <p className="field-label">Best way to reach you</p>
                      <div className="mt-3.5 flex gap-2">
                        {["Phone", "Email", "Either"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => set("contactPref", p)}
                            aria-pressed={data.contactPref === p}
                            className={`border px-4 py-2 text-[0.7rem] font-semibold tracking-[0.1em] uppercase transition-all duration-400 ${
                              data.contactPref === p
                                ? "border-blue-lt bg-blue-lt text-ink"
                                : "border-white/18 text-cream/55 hover:border-white/45 hover:text-cream"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-7">
                    <div data-f className="field">
                      <label htmlFor="c-message" className="field-label">
                        Tell us about the project <span className="text-blue-lt">*</span>
                      </label>
                      <textarea
                        id="c-message"
                        className="field-input mt-3.5"
                        value={data.message}
                        onChange={(e) => set("message", e.target.value)}
                        aria-invalid={Boolean(errors.message)}
                        placeholder="Age of the house, what's failing or dated, anything you've already had quoted, and what you're hoping the finished result feels like."
                      />
                      <Err msg={errors.message} />
                    </div>

                    {/* Recap so the homeowner can see what they're sending */}
                    <div data-f className="border border-white/10 bg-navy-dp/50 p-5">
                      <p className="eyebrow text-cream/35">Summary</p>
                      <dl className="mt-4 space-y-2.5 text-[0.8rem]">
                        <Recap k="Project" v={data.services.join(", ") || "—"} />
                        <Recap k="Budget" v={data.budget || "Not specified"} />
                        <Recap k="Timeline" v={data.timeline || "Not specified"} />
                        <Recap k="Contact" v={[data.name, data.phone, data.email].filter(Boolean).join(" · ") || "—"} />
                      </dl>
                    </div>
                  </div>
                )}
              </div>

              {/* Nav */}
              <div className="mt-9 flex items-center gap-3">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="btn btn-outline-light !px-6"
                  >
                    Back
                  </button>
                )}

                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={advance} className="btn btn-cream flex-1 sm:flex-none">
                    Continue
                    <span aria-hidden="true">→</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn btn-cream flex-1 disabled:opacity-70 sm:flex-none"
                  >
                    {status === "sending" ? "Sending…" : "Send request"}
                  </button>
                )}

                <p className="ml-auto hidden text-[0.68rem] text-cream/30 sm:block">
                  No spam. No obligation.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function ContactRow({ label, value, href, small }) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      data-c
      {...(href ? { href } : {})}
      className="group flex items-center justify-between gap-4 border-b border-white/8 bg-white/[0.02] px-5 py-4 transition-colors duration-500 last:border-0 hover:bg-white/[0.05]"
    >
      <span className="eyebrow shrink-0 text-cream/35">{label}</span>
      <span
        className={`truncate font-display tracking-[0.02em] text-cream transition-colors duration-500 group-hover:text-blue-lt ${
          small ? "text-[0.72rem]" : "text-[0.95rem]"
        }`}
      >
        {value}
      </span>
    </Tag>
  );
}

function Input({ label, required, error, value, onChange, type = "text", ...rest }) {
  const id = `c-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label} {required && <span className="text-blue-lt">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      <span className="field-bar" />
      <Err msg={error} />
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  const id = `c-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="field-input pr-8"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o} className="bg-navy text-cream">
              {o}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-cream/40"
          width="11"
          height="7"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
      <span className="field-bar" />
    </div>
  );
}

function Err({ msg }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-2 text-[0.72rem] leading-snug text-[#e88b74]">
      {msg}
    </p>
  );
}

function Recap({ k, v }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-cream/35">{k}</dt>
      <dd className="text-cream/80">{v}</dd>
    </div>
  );
}

function Success({ data, onReset }) {
  const box = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !box.current) return;
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .from(box.current.querySelector("[data-tick]"), {
          scale: 0.4,
          autoAlpha: 0,
          duration: 0.85,
          ease: "back.out(2)",
        })
        .from(
          box.current.querySelectorAll("[data-s]"),
          { autoAlpha: 0, y: 24, duration: 0.8, ease: EASE, stagger: 0.09 },
          "-=0.5",
        );
    }, box);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={box} className="py-10 text-center">
      <span data-tick className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-blue-lt/45 bg-blue-lt/15 text-blue-lt">
        <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
          <path
            d="M2 10.5 9.5 18 24 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <h3 data-s className="mt-7 text-[1.75rem] leading-none text-cream md:text-[2.1rem]">
        Request sent.
        <span className="script mt-2 block text-blue-lt">Talk soon.</span>
      </h3>

      <p data-s className="mx-auto mt-5 max-w-sm text-[0.9rem] leading-[1.75] text-cream/60">
        Thanks{data.name ? `, ${data.name.split(" ")[0]}` : ""} — we have your project details and
        will be in touch to set up a free walkthrough. If it is urgent, call us directly.
      </p>

      <div data-s className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={BUSINESS.phoneHref} className="btn btn-cream">
          Call {BUSINESS.phone}
        </a>
        <button type="button" onClick={onReset} className="btn btn-outline-light">
          Send another
        </button>
      </div>
    </div>
  );
}

/* (608) 844-8482 as you type. */
function formatPhone(v) {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
