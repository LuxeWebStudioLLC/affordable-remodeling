import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { marquee, revealUp } from "../lib/animations";
import { BUSINESS, REVIEWS } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * Two behaviours, one section:
 *  • REVIEWS populated  → the reference site's scrolling testimonial rails.
 *  • REVIEWS empty      → a verifiable trust panel instead.
 *
 * Affordable's current site publishes no testimonials, so nothing is
 * quoted here until real ones are added to src/data/site.js.
 */
export default function Reviews() {
  return REVIEWS.length > 0 ? <ReviewRails /> : <TrustPanel />;
}

/* ------------------------------------------------------------------ */
/* Populated state                                                     */
/* ------------------------------------------------------------------ */
function ReviewRails() {
  const root = useRef(null);
  const rowA = useRef(null);
  const rowB = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      marquee(rowA.current, { speed: 44 });
      marquee(rowB.current, { speed: 38, reverse: true });
    }, root);
    return () => ctx.revert();
  }, []);

  const doubled = [...REVIEWS, ...REVIEWS];

  return (
    <section ref={root} className="relative overflow-hidden bg-cream-2 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Homeowners"
          line1="What people say"
          line2="after we have gone."
          align="center"
          className="mx-auto"
        />
      </div>

      <div className="mt-14 space-y-4 md:mt-16">
        {[rowA, rowB].map((ref, row) => (
          <div key={row} className="overflow-hidden">
            <div ref={ref} className="marquee-track gap-4">
              {doubled.map((r, i) => (
                <blockquote
                  key={`${row}-${i}`}
                  className="flex w-[19rem] shrink-0 flex-col justify-between border border-ink/10 bg-cream p-6 md:w-[24rem] md:p-7"
                >
                  <div>
                    <p className="text-[0.8rem] tracking-[0.3em] text-copper">★★★★★</p>
                    <p className="mt-4 text-[0.88rem] leading-[1.75] text-ink/75">"{r.quote}"</p>
                  </div>
                  <footer className="mt-6">
                    <p className="font-display text-[0.78rem] tracking-[0.1em] text-ink">{r.name}</p>
                    <p className="eyebrow mt-1.5 text-ink/40">{r.source}</p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="container-x mt-12 text-center">
        <a href={BUSINESS.social.facebook} target="_blank" rel="noreferrer" className="btn btn-ink">
          Read more reviews
        </a>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state — credentials only, nothing invented                    */
/* ------------------------------------------------------------------ */
const CREDENTIALS = [
  {
    title: "Family owned & operated",
    body: "The same family has run this business for over twenty-five years. You deal with owners, not a call center.",
  },
  {
    title: "Lifetime roofing warranty",
    body: "Our roofing carries a lifetime warranty — put in writing before a single shingle comes off.",
  },
  {
    title: "One contractor, ten trades",
    body: "Roof to flooring under one roof. No coordinating four companies and hoping they talk to each other.",
  },
  {
    title: "Local to La Crosse",
    body: "We live and work here, within fifty miles of home. Our reputation walks past your house every day.",
  },
];

function TrustPanel() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* One-shot entrance only — no scrub. The stacking itself is CSS. */
      revealUp(root.current.querySelectorAll("[data-card]"), {
        start: "top 92%",
        y: 38,
        stagger: 0.1,
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative bg-cream-2 py-24 md:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Track record"
          line1="Twenty-five years."
          line2="Same phone number."
          body="Reputation in a town this size is not built on advertising. It is built on roofs that do not leak and crews that show up."
          align="center"
          className="mx-auto"
        />

        {/* ---- The deck ----
            Cards stack on top of one another as you scroll: each is sticky at
            a slightly lower offset than the last, so the one above stays
            visible as a spine while the next slides over it.

            Pure CSS sticky, deliberately. The Work strip taught this the hard
            way — anything driven per-frame from scrollY stutters on iOS, where
            the compositor scrolls and the main thread is throttled. Sticky is
            handled by the compositor, so this cannot drop a frame. The only
            JS here is the one-shot entrance.

            The section must NOT be overflow-hidden: that would make it a
            scroll container and the cards would stick to the section instead
            of the viewport. */}
        <div className="mt-14 md:mt-20">
          {CREDENTIALS.map((c, i) => {
            const last = i === CREDENTIALS.length - 1;
            return (
              <article
                data-card
                key={c.title}
                style={{ top: `calc(5.5rem + ${i * 1.15}rem)`, zIndex: i + 1 }}
                className={`sticky mb-6 overflow-hidden border shadow-[0_24px_60px_-32px_rgba(10,14,23,0.45)] ${
                  last
                    ? "border-navy bg-navy text-cream"
                    : "border-ink/12 bg-cream text-ink"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="block h-[2px] w-full bg-gradient-to-r from-blue via-blue-lt to-copper"
                />
                <div className="grid gap-5 p-7 sm:grid-cols-[auto_1fr] sm:gap-9 sm:p-10 md:p-12">
                  <p
                    className={`font-accent text-[2.6rem] leading-none font-medium italic md:text-[3.4rem] ${
                      last ? "text-copper-lt" : "text-copper-dk"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="min-w-0">
                    <h3
                      className={`text-[1.5rem] leading-[1.08] md:text-[2rem] ${
                        last ? "text-cream" : "text-ink"
                      }`}
                    >
                      {c.title}
                    </h3>
                    <p
                      className={`mt-4 max-w-xl text-[0.92rem] leading-[1.8] ${
                        last ? "text-cream/70" : "text-ink/65"
                      }`}
                    >
                      {c.body}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="max-w-md text-[0.88rem] leading-relaxed text-ink/55">
            Been through a project with us? A review helps other neighbors decide who to call.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={BUSINESS.social.facebook}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ink"
            >
              Find us on Facebook
            </a>
            <a
              href={BUSINESS.social.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-dark"
            >
              See our Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
