import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/gsap";
import { revealUp, scrubWords } from "../lib/animations";
import { SERVICES } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * The ten trades as a stacking card deck — the Luxe Web Studio capabilities
 * section, rebuilt in this site's palette.
 *
 * Each card sticks near the top of the viewport; the next slides over it
 * while the covered card scales back and dims, so the stack reads as
 * physical cards rather than a list. Sticking is pure CSS `position: sticky`
 * (see .trade-card in index.css), which the compositor handles — the Work
 * strip taught that anything positioning a pinned element per frame from
 * scrollY stutters on iOS.
 *
 * The scrub is the reference's, unchanged: scale 1 -> 0.94 and
 * brightness(1) -> brightness(0.5) on one tween, linear, driven by the NEXT
 * card's approach. brightness is the whole point of the recede — it takes
 * the entire card down, image, border and all, where an overlay only tints
 * it toward one colour.
 *
 * Trade-off worth knowing: a deck costs more scroll than the grid it
 * replaced, because the travel between cards IS the animation. Ten cards at
 * the reference's geometry is roughly nine screens.
 */

/** Where a card comes to rest — matches `top` on .trade-card. */
const stickTop = () => (window.matchMedia("(max-width: 720px)").matches ? 84 : 96);

export default function Services() {
  const root = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    let cleanupPinWatch = null;
    const ctx = gsap.context((self) => {
      revealUp(root.current.querySelectorAll("[data-deck-head]"), {
        start: "top 92%",
        y: 28,
      });

      if (prefersReducedMotion()) return;

      const cards = gsap.utils.toArray(".trade-card", root.current);
      const last = cards[cards.length - 1];

      /* ScrollSmoother's wrapper is a fixed, overflow:hidden box and its
         content is transformed, so CSS position: sticky has no scrollport to
         stick to and the deck silently falls apart into a plain column — on
         pointer devices only, since smoothTouch is 0 and touch keeps native
         scrolling. Where the smoother runs, ScrollTrigger pins instead, which
         is GSAP's own answer to this. Touch keeps real sticky: pinning on iOS
         is what made the Work strip stutter for weeks. */
      const pinWithScrollTrigger = () => {
        root.current.querySelector(".trade-stack").classList.add("is-js-pinned");
        cards.slice(0, -1).forEach((card) => {
          ScrollTrigger.create({
            trigger: card,
            start: () => `top ${stickTop()}px`,
            endTrigger: last,
            end: () => `top ${stickTop()}px`,
            pin: true,
            pinSpacing: false,
          });
        });
      };

      /* Deferred, because React runs child effects before parent ones: the
         smoother App creates does not exist while this effect body runs, so
         asking for it here always answers no — which is exactly how the deck
         shipped unpinned. StrictMode then tears the smoother down and builds
         it again, so a single frame's wait is not enough either; this waits
         for the refresh that App fires once everything is up.

         The test is the mechanism rather than "is there a smoother": on touch
         the smoother leaves the wrapper static and native sticky works fine,
         and only a fixed wrapper actually breaks it. */
      if (last) {
        let pinned = false;
        const maybePin = () => {
          if (pinned) return;
          const wrap = document.querySelector("#smooth-wrapper");
          if (!wrap || getComputedStyle(wrap).position !== "fixed") return;
          pinned = true;
          self.add(pinWithScrollTrigger);
          ScrollTrigger.refresh();
        };
        ScrollTrigger.addEventListener("refresh", maybePin);
        self.add(() => gsap.delayedCall(0.25, maybePin));
        cleanupPinWatch = () => ScrollTrigger.removeEventListener("refresh", maybePin);
      }

      /* As the NEXT card slides over, the covered one scales back and dims.
         The target is the inner face, not the card: ScrollTrigger pins by
         writing the card's own transform, so a scale tween on the same
         element would fight it. The end is the resting offset, so the recede
         finishes exactly as the incoming card lands — hence
         invalidateOnRefresh, since that offset changes at 720px. */
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.fromTo(
          card.querySelector(".trade-card-inner"),
          { scale: 1, filter: "brightness(1)" },
          {
            scale: 0.94,
            filter: "brightness(0.5)",
            ease: "none",
            scrollTrigger: {
              trigger: next,
              start: "top bottom",
              end: () => `top ${stickTop()}px`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, root);

    const cleanScrub = scrubWords(introRef.current);
    return () => {
      cleanupPinWatch?.();
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
