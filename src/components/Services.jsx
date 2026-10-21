import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { revealUp, scrubWords } from "../lib/animations";
import { SERVICES } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * The ten trades as a stacking card deck — the pattern from the Luxe Web
 * Studio capabilities section, rebuilt in this site's palette.
 *
 * Each card sticks near the top of the viewport; the next slides over it while
 * the covered card scales back and dims, so the stack reads as physical cards
 * rather than a list. The sticking is pure CSS `position: sticky`, which the
 * compositor handles — the Work strip taught that anything positioning a
 * pinned element per frame from scrollY stutters on iOS.
 *
 * The recede is the only scrubbed part, and it is deliberately transform +
 * opacity ONLY. The reference uses filter: brightness(), which forces a filter
 * pass over a full-viewport card every frame; dimming via an overlay's opacity
 * gets the same look on the compositor. Reduced motion skips the scrub and
 * keeps the plain stack.
 *
 * Trade-off worth knowing: a deck costs more scroll than the grid it replaced,
 * because the travel between cards IS the animation. Cards are kept shorter
 * than the reference's 72vh to hold that in check across ten of them.
 */

/** Sticky offset — clears the fixed header with room to read the spine. */
const STICK_TOP = 88;

export default function Services() {
  const root = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-deck-head]"), {
        start: "top 92%",
        y: 28,
      });

      if (prefersReducedMotion()) return;

      /* As the NEXT card slides over, the covered one scales back and its
         scrim fades up. Both are compositor properties.

         One timeline per card rather than two tweens sharing a config: a
         scrollTrigger object is consumed by the ScrollTrigger built from it,
         so passing the same object to a second tween leaves the first one
         inert — the scrim scrubbed while the scale silently never moved. */
      const cards = gsap.utils.toArray("[data-card]", root.current);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const scrim = card.querySelector("[data-scrim]");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: `top ${STICK_TOP}px`,
            scrub: true,
          },
        });
        /* scaleX/scaleY spelled out, not the `scale` shorthand: through the
           shorthand GSAP only wrote the Y axis here (transform: scale(1,
           0.94)), which squashes the card instead of receding it. */
        tl.fromTo(card, { scaleX: 1, scaleY: 1 }, { scaleX: 0.94, scaleY: 0.94 }, 0);
        if (scrim) tl.fromTo(scrim, { opacity: 0 }, { opacity: 0.62 }, 0);
      });
    }, root);

    const cleanScrub = scrubWords(introRef.current);
    return () => {
      ctx.revert();
      cleanScrub();
    };
  }, []);

  return (
    /* overflow-x-clip, never overflow-hidden: `hidden` would make this section
       a scroll container and the cards would stick to IT instead of the
       viewport — the exact bug that left the Work strip a blank panel. */
    <section id="services" ref={root} className="relative grain overflow-x-clip bg-bone py-20 md:py-28">
      <div className="container-x">
        <div
          data-deck-head
          className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between"
        >
          <SectionHeading
            eyebrow="What we do"
            line1="Ten trades,"
            line2="one crew, one number."
            className="lg:max-w-2xl"
          />
          <p ref={introRef} className="max-w-sm text-[0.95rem] leading-[1.75] text-ink/60 lg:pb-3">
            Exterior to interior, all under one contractor. Family owned for over twenty-five years
            in La Crosse — so the person who quotes your job is the person who stands behind it.
          </p>
        </div>

        {/* ---- The deck ---- */}
        {/* Normal block flow, which is what position: sticky is designed
            around — each card sticks against this wrapper's box. */}
        <div className="mt-14 md:mt-20">
          {SERVICES.map((s, i) => (
            <article
              data-card
              key={s.id}
              style={{ top: `${STICK_TOP}px`, transformOrigin: "50% 0%" }}
              className="sticky mb-[9vh] h-[min(64svh,540px)] will-change-transform last:mb-0"
            >
              <div className="relative flex h-full flex-col justify-end overflow-hidden border border-white/10 bg-gradient-to-br from-navy via-ink-2 to-ink p-7 shadow-[0_30px_80px_-28px_rgba(10,14,23,0.7)] sm:p-10 md:p-14">
                {/* Oversized outlined numeral, bled off the corner */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-[0.14em] -right-[0.05em] font-display text-[clamp(10rem,26vw,22rem)] leading-none font-bold text-transparent select-none"
                  style={{ WebkitTextStroke: "1.5px rgba(111,157,255,0.22)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10 max-w-2xl">
                  <p className="eyebrow text-blue-lt">{s.tag}</p>
                  <h3 className="mt-4 text-[clamp(2rem,5.4vw,3.6rem)] leading-[1.02] text-cream">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-[0.92rem] leading-[1.75] text-cream/65 md:text-[1rem]">
                    {s.blurb}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {s.points.map((pt) => (
                      <li
                        key={pt}
                        className="border border-white/18 px-3 py-1.5 text-[0.62rem] font-semibold tracking-[0.12em] text-cream/70 uppercase"
                      >
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dim layer for the card underneath — opacity only, so the
                    recede stays on the compositor. */}
                <span
                  data-scrim
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 bg-ink opacity-0"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
