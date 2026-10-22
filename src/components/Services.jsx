import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { revealUp, scrubWords } from "../lib/animations";
import { SERVICES } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * The ten trades as a stacking card deck — the Luxe Web Studio capabilities
 * section, rebuilt in this site's palette.
 *
 * The cards scroll past in normal flow; as the NEXT one comes up behind it,
 * the outgoing card scales 1 -> 0.94 and dims brightness(1) -> brightness(0.5).
 * That is what the live site does, verified against it directly: its card
 * tops move -160px per -160px of scroll with no plateau, so despite the
 * reference CSS saying position: sticky, nothing ever pins. Pinning the
 * cards into a pile at the top of the viewport is a different effect.
 *
 * brightness is the whole point of the recede — it takes the entire card
 * down, border and gradient with it, where an overlay only tints it toward
 * one colour.
 *
 * Trade-off worth knowing: this costs more scroll than the grid it replaced,
 * because the travel between cards IS the animation.
 */

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

      /* The reference's tween, verbatim: the recede runs while the next card
         travels from the bottom of the viewport to 96px below the top. */
      const cards = gsap.utils.toArray(".trade-card", root.current);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.fromTo(
          card,
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 0.94,
            filter: "brightness(0.5)",
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 96px", scrub: true },
          },
        );
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

        <div className="trade-stack mt-14 md:mt-20">
          {SERVICES.map((s, i) => {
            const n = String(i + 1).padStart(2, "0");
            return (
              <article className="trade-card" data-tone={(i % 4) + 1} key={s.id}>
                <div className="trade-card-inner">
                  <span className="trade-idx">{n}</span>

                  <div className="trade-body">
                    <p className="eyebrow text-blue-lt">{s.tag}</p>
                    <h3 className="mt-4 text-[clamp(2rem,5.4vw,3.6rem)] leading-[1.02] text-cream">
                      {s.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-[0.92rem] leading-[1.75] text-cream/[0.78] md:text-[1rem]">
                      {s.blurb}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {s.points.map((pt) => (
                        <li
                          key={pt}
                          className="rounded-full border border-white/18 px-3 py-1.5 text-[0.62rem] font-semibold tracking-[0.12em] text-cream/[0.72] uppercase"
                        >
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span className="trade-ghost" aria-hidden="true">
                    {n}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
