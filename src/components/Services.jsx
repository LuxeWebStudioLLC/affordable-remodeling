import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { revealUp, scrubWords } from "../lib/animations";
import { SERVICES } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * The ten trades as a two-column grid of cards — five rows instead of ten,
 * so the section reads at half the scroll length of the old accordion list.
 * Each card carries the index, title, tag, blurb and the trade's key points,
 * so nothing needs expanding; there is no hidden state and no interaction
 * cost, just information laid out.
 *
 * Ground is bone rather than cream: this is the only section on that sand
 * tone, which keeps ten cells of text from reading as one more white block.
 * The grid is drawn with hairlines (gap-px over an ink-tinted ground), the
 * old print-table trick, so the cells feel composed rather than boxed.
 *
 * Hover floods a card with the brand's deep navy — the logo's interior blue,
 * not the near-black of the previous iteration, which read as a hole in the
 * page rather than a brand moment. Type flips cream/gold on the way.
 */
export default function Services() {
  const root = useRef(null);
  const introRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-cell]"), {
        start: "top 94%",
        y: 32,
        stagger: 0.05,
      });
    }, root);
    const cleanScrub = scrubWords(introRef.current);
    return () => {
      ctx.revert();
      cleanScrub();
    };
  }, []);

  return (
    <section id="services" ref={root} className="relative grain bg-bone py-20 md:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
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

        {/* ---- The grid: hairlines drawn by the gap ---- */}
        {/* Two columns at EVERY size. On phones the cells compact to index +
            title + tag (blurb and points appear from md up), so ten trades
            cost five short rows — measured 2898px -> ~1100px of scroll. */}
        <div className="mt-14 grid grid-cols-2 gap-px border border-ink/15 bg-ink/15 md:mt-16">
          {SERVICES.map((s, i) => (
            <article
              key={s.id}
              data-cell
              className="group relative overflow-hidden bg-bone p-4 transition-colors duration-500 sm:p-6 md:p-8"
            >
              {/* Navy flood — the logo's interior blue rising from the
                  baseline, not a black hole. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-navy transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
              />

              <div className="relative z-10">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-accent text-[1rem] font-medium text-copper-dk italic transition-colors duration-500 group-hover:text-copper-lt">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="eyebrow hidden text-[0.6rem] text-ink/35 transition-colors duration-500 group-hover:text-blue-lt sm:block">
                    {s.tag}
                  </span>
                </div>

                <h3 className="mt-2.5 font-accent text-[1.05rem] leading-tight font-medium text-ink transition-colors duration-500 group-hover:text-cream sm:mt-4 sm:text-[1.3rem] md:text-[1.6rem]">
                  {s.title}
                </h3>

                <p className="mt-3 hidden max-w-md text-[0.85rem] leading-[1.7] text-ink/60 transition-colors duration-500 group-hover:text-cream/70 md:block">
                  {s.blurb}
                </p>

                <p className="mt-5 hidden text-[0.62rem] font-semibold tracking-[0.14em] text-ink/40 uppercase transition-colors duration-500 group-hover:text-cream/50 md:block">
                  {s.points.join("  ·  ")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
