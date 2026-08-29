import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { revealImage, revealUp, scrubWords } from "../lib/animations";
import { APPROACH, BUSINESS } from "../data/site";
import SectionHeading from "./SectionHeading";

export default function Approach() {
  const root = useRef(null);
  const media = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealImage(media.current, { start: "top 82%" });
      revealUp(root.current.querySelectorAll("[data-check]"), {
        start: "top 90%",
        y: 20,
        stagger: 0.07,
      });

      if (!prefersReducedMotion()) {
        gsap.to(media.current.querySelector("img"), {
          yPercent: -9,
          ease: "none",
          scrollTrigger: {
            trigger: media.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, root);

    const cleans = [...root.current.querySelectorAll("[data-prose]")].map((el) => scrubWords(el));

    return () => {
      ctx.revert();
      cleans.forEach((c) => c());
    };
  }, []);

  return (
    <section ref={root} className="relative bg-cream py-24 md:py-32 lg:py-40">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* ---- Media ---- */}
        <div className="relative order-1 lg:order-none">
          <div
            ref={media}
            className="relative aspect-[4/5] overflow-hidden bg-cream-2 sm:aspect-[5/4] lg:aspect-[4/5]"
            style={{ clipPath: "inset(0% 0% 100% 0%)" }}
          >
            <img
              src="/images/job-deck-porch.jpg"
              alt="New deck, porch and railings on a completed job"
              loading="lazy"
              className="h-[112%] w-full object-cover"
            />
          </div>

          {/* Floating stat card, offset over the image edge */}
          <div className="absolute -right-2 bottom-6 bg-ink px-6 py-5 text-cream shadow-[0_24px_60px_-20px_rgba(11,16,20,0.55)] sm:-right-4 sm:bottom-8 md:px-8 md:py-6">
            <p className="font-accent text-[2.4rem] leading-none font-medium text-blue-lt md:text-[3rem]">
              {BUSINESS.yearsInBusiness}
            </p>
            <p className="eyebrow mt-2 text-cream/50">Years in La Crosse</p>
          </div>
        </div>

        {/* ---- Copy ---- */}
        <div>
          <SectionHeading
            eyebrow={APPROACH.eyebrow}
            line1={APPROACH.headline}
            line2={APPROACH.script}
          />

          <div className="mt-7 space-y-5">
            {APPROACH.body.map((p) => (
              <p key={p.slice(0, 24)} data-prose className="max-w-xl text-[0.95rem] leading-[1.85] text-ink/68">
                {p}
              </p>
            ))}
          </div>

          <ul className="mt-9 grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
            {APPROACH.checks.map((c) => (
              <li data-check key={c} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue/15 text-blue">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                    <path
                      d="M1 4l2.6 2.6L9 1.2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[0.88rem] leading-snug text-ink/75">{c}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#contact", 74);
              }}
              className="btn btn-ink"
            >
              Request an estimate
            </a>
            <a href={BUSINESS.phoneHref} className="btn btn-outline-dark">
              {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
