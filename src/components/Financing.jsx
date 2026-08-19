import { useEffect, useRef } from "react";
import { gsap, scrollToSection } from "../lib/gsap";
import { revealUp, revealRule } from "../lib/animations";
import { BUSINESS, FINANCING } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * Compact banner rather than a full section — it only needs to land one
 * fact (financing exists) before the estimate form, not compete with the
 * page's bigger statements.
 */
export default function Financing() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-stat]"), {
        start: "top 92%",
        y: 24,
        stagger: 0.08,
      });
      revealRule(root.current.querySelectorAll("[data-stat-rule]"), { start: "top 95%" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative bg-cream py-20 md:py-28">
      <div className="container-x">
        {/* Hairline frame with survey-corner marks — reads like a spec sheet */}
        <div className="relative border border-ink/10 px-6 py-12 md:px-12 md:py-16 lg:px-16">
          {[
            "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
            "top-0 right-0 translate-x-1/2 -translate-y-1/2",
            "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
            "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
          ].map((pos) => (
            <span
              key={pos}
              aria-hidden="true"
              className={`absolute ${pos} bg-cream px-1 font-display text-[0.95rem] leading-none text-blue`}
            >
              +
            </span>
          ))}
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <SectionHeading
            eyebrow={FINANCING.eyebrow}
            line1={FINANCING.headline}
            line2={FINANCING.script}
            body={FINANCING.body}
          />

          <div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-3">
              {FINANCING.stats.map((s) => (
                <div data-stat key={s.label}>
                  <span
                    data-stat-rule
                    className="mb-4 block h-px w-full origin-left scale-x-0 bg-ink/15"
                  />
                  <p className="font-display text-[1.9rem] leading-none text-blue md:text-[2.3rem]">
                    {s.value}
                  </p>
                  <p className="mt-2.5 text-[0.72rem] leading-snug text-ink/55">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("#contact", 74);
                }}
                className="btn btn-blue"
              >
                Ask about financing
              </a>
              <a href={BUSINESS.phoneHref} className="link-line text-[0.85rem] text-ink/60">
                or call to talk it through
              </a>
            </div>

            <p className="mt-8 max-w-lg text-[0.7rem] leading-relaxed text-ink/40">
              {FINANCING.disclaimer}
            </p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
