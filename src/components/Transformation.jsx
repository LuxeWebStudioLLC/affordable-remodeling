import { useEffect, useRef } from "react";
import { gsap, EASE, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { revealUp } from "../lib/animations";

/**
 * Featured project as a labelled before/after pair.
 *
 * Deliberately NOT a drag-wipe divider. A wipe implies both frames were shot
 * from the same spot, and these weren't — the before is straight on from the
 * front, the after is from the right and closer. Wiping between them would
 * misalign the roofline and read as broken rather than transformative. Two
 * panels, honestly labelled, let the change speak: white clapboard and blue
 * shutters becoming dark siding with white trim.
 *
 * The after panel is scaled and lifted a touch so the pair has a hierarchy
 * instead of sitting as a flat two-up.
 */
export default function Transformation() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-t]"), { y: 30, stagger: 0.08 });

      if (prefersReducedMotion()) return;

      /* Each frame wipes up into place, after trailing before. */
      gsap.utils.toArray("[data-frame]", root.current).forEach((el, i) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.4,
            ease: EASE,
            delay: i * 0.18,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
        const img = el.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.14 },
            {
              scale: 1,
              duration: 1.8,
              ease: EASE,
              delay: i * 0.18,
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
            },
          );
        }
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative grain overflow-hidden bg-ink py-24 md:py-32 lg:py-40">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p data-t className="eyebrow text-blue-lt">
              Featured project · Siding
            </p>
            <h2 data-t className="mt-5 text-[clamp(1.9rem,5.6vw,3.6rem)] text-cream">
              Same house.
              <span className="script block text-blue-lt">Whole new face.</span>
            </h2>
          </div>
          <p data-t className="max-w-xs text-[0.85rem] leading-relaxed text-cream/55">
            New siding, trim and deck on a farmhouse outside La Crosse. Same pines, same roofline —
            everything else is new.
          </p>
        </div>

        {/* ---- The pair ---- */}
        <div className="mt-12 grid gap-5 md:mt-16 md:grid-cols-2 md:gap-8 lg:gap-12">
          {[
            {
              key: "before",
              label: "Before",
              src: "/images/job-before.jpg",
              alt: "The farmhouse before work: white clapboard siding with blue shutters and a weathered deck",
              chip: "bg-ink/80 text-cream/90 backdrop-blur-sm",
              offset: "md:mt-14",
            },
            {
              key: "after",
              label: "After",
              src: "/images/job-after.jpg",
              alt: "The same farmhouse after work: dark siding, white trim and a rebuilt deck",
              chip: "bg-blue text-white",
              offset: "",
            },
          ].map((f) => (
            <figure data-t key={f.key} className={f.offset}>
              <div
                data-frame
                className="relative aspect-[4/5] overflow-hidden bg-ink-2 sm:aspect-[4/3] md:aspect-[4/5]"
                style={{ clipPath: "inset(0% 0% 100% 0%)" }}
              >
                <img
                  src={f.src}
                  alt={f.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <span
                  className={`pointer-events-none absolute top-4 left-4 px-3 py-1.5 text-[0.6rem] font-bold tracking-[0.22em] uppercase md:top-6 md:left-6 ${f.chip}`}
                >
                  {f.label}
                </span>
              </div>
            </figure>
          ))}
        </div>

        <div data-t className="mt-12 flex flex-wrap items-center gap-5">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#contact", 74);
            }}
            className="btn btn-cream"
          >
            Get a free estimate
          </a>
          <span className="text-[0.8rem] text-cream/45">
            Wondering what yours could look like? That's the free part.
          </span>
        </div>
      </div>
    </section>
  );
}
