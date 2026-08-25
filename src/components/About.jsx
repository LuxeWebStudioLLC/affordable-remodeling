import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { revealUp, revealRule, countUp } from "../lib/animations";
import { BUSINESS, STATS } from "../data/site";
import SectionHeading from "./SectionHeading";

export default function About() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-stat]"), {
        start: "top 92%",
        y: 28,
        stagger: 0.08,
      });
      revealRule(root.current.querySelectorAll("[data-stat-rule]"), { start: "top 95%" });
      root.current.querySelectorAll("[data-count]").forEach((el) => countUp(el));
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} className="relative grain bg-ink py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow={`About ${BUSINESS.name}`}
              line1="One contractor for"
              line2="the whole house."
              tone="light"
            />

            {/* The mark in full brand colour, sitting straight on the dark
                section. The stacked wordmark is dark blue and would vanish
                here — and the heading above already says the company name. */}
            <img
              src="/logo-icon.png"
              alt={`${BUSINESS.legalName} logo`}
              className="mt-12 h-32 w-auto md:h-40"
            />
          </div>

          <div className="lg:pt-4">
            <div className="space-y-5">
              <p className="text-[1.05rem] leading-[1.8] text-cream/85 md:text-[1.15rem]">
                {BUSINESS.legalName} is a family-owned and operated remodeling company that has been
                working on homes in and around {BUSINESS.city}, {BUSINESS.state} for more than
                twenty-five years.
              </p>
              <p className="text-[0.95rem] leading-[1.85] text-cream/60">
                We specialize in roofing, siding, windows, kitchen and bathroom renovations, decks
                and additions — the full exterior and interior of a house under one contractor. That
                matters more than it sounds: when the roof, the siding and the windows are all one
                company's responsibility, there is nobody left to point at when water gets in.
              </p>
              <p className="text-[0.95rem] leading-[1.85] text-cream/60">
                We work throughout {BUSINESS.city}, {BUSINESS.state} and the surrounding areas up to
                50 miles. If you are within range, the estimate is free and the conversation is
                honest.
              </p>
            </div>

            {/* ---- Stats ---- */}
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-9 md:grid-cols-4">
              {STATS.map((s) => (
                <div data-stat key={s.label}>
                  <span
                    data-stat-rule
                    className="mb-5 block h-px w-full origin-left scale-x-0 bg-white/15"
                  />
                  <p
                    data-count={/\d/.test(s.value) ? "" : undefined}
                    data-value={s.value}
                    className="font-accent text-[2rem] leading-none font-medium text-blue-lt md:text-[2.5rem]"
                  >
                    {s.value}
                  </p>
                  <p className="mt-2.5 text-[0.66rem] leading-snug font-semibold tracking-[0.16em] text-cream/40 uppercase">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
