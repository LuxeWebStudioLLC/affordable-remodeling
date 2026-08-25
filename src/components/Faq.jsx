import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { revealUp } from "../lib/animations";
import { BUSINESS, FAQS } from "../data/site";
import SectionHeading from "./SectionHeading";

export default function Faq() {
  const root = useRef(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-q]"), {
        start: "top 92%",
        y: 26,
        stagger: 0.06,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative bg-cream py-24 md:py-32">
      <div className="container-x grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="Common questions"
            line1="Answers before"
            line2="you pick up the phone."
            body="Straight answers to what La Crosse homeowners ask us most."
          />
          <a href={BUSINESS.phoneHref} className="btn btn-ink mt-8">
            Still unsure? Call {BUSINESS.phone}
          </a>
        </div>

        <div className="border-t border-ink/12">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div data-q key={f.q} className="border-b border-ink/12">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    className="tap-row group flex w-full items-start gap-4 py-6 text-left md:gap-6"
                  >
                    <span className="eyebrow mt-1.5 shrink-0 text-copper">
                      Q{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-accent text-[1.1rem] leading-[1.3] font-medium text-ink transition-colors duration-500 group-hover:text-blue group-active:text-blue md:text-[1.25rem]">
                      {f.q}
                    </span>
                    <span
                      className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-blue group-hover:bg-blue group-hover:text-white group-active:border-blue group-active:bg-blue group-active:text-white ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </button>
                </h3>

                <div
                  id={`faq-${i}`}
                  className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`max-w-2xl pb-7 text-[0.92rem] leading-[1.85] text-ink/65 transition-opacity duration-500 md:pl-[3.4rem] ${
                        isOpen ? "opacity-100 delay-150" : "opacity-0"
                      }`}
                    >
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
