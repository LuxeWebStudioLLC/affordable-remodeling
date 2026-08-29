import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { revealUp, scrubWords } from "../lib/animations";
import { SERVICES } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * Numbered service index. Each row expands in place to reveal the detail and
 * the trade's key points — no hover imagery, so the list stays a clean piece
 * of typography and nothing covers the row you're reading.
 *
 * Two moves keep ten near-identical rows from reading as a flat list:
 *
 *  - A row floods with ink from the baseline on hover and while open, and its
 *    type inverts — cream title, gold index. The panel lives inside the same
 *    flooded surface, so an open row reads as one dark card, not a lit row
 *    with a pale attachment.
 *
 *  - A giant ghost numeral sits in the right margin (desktop only) and
 *    crossfades to whichever row is hovered or open, so the pointer's
 *    position is echoed at architectural scale.
 */
export default function Services() {
  const root = useRef(null);
  const introRef = useRef(null);
  const [openRow, setOpenRow] = useState(null);
  const [hoverRow, setHoverRow] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-row]"), {
        start: "top 92%",
        y: 40,
        stagger: 0.055,
      });
    }, root);
    const cleanScrub = scrubWords(introRef.current);
    return () => {
      ctx.revert();
      cleanScrub();
    };
  }, []);

  const active = hoverRow ?? openRow;

  return (
    <section id="services" ref={root} className="relative bg-cream py-24 md:py-32 lg:py-40">
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

        {/* ---- Rows ---- */}
        <div className="relative mt-16 md:mt-20">
          {/* Ghost numeral echoing the active row. Behind the rows, oversized,
              barely-there — presence, not information. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -right-2 hidden -translate-y-1/2 select-none lg:block"
          >
            {SERVICES.map((s, i) => (
              <span
                key={s.id}
                className={`absolute top-1/2 right-0 -translate-y-1/2 font-accent text-[16rem] leading-none font-medium text-ink transition-opacity duration-700 ${
                  active === i ? "opacity-[0.055]" : "opacity-0"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            ))}
          </div>

          <div className="border-t border-ink/12">
            {SERVICES.map((s, i) => {
              const isOpen = openRow === i;
              return (
                <div
                  key={s.id}
                  data-row
                  onMouseEnter={() => setHoverRow(i)}
                  onMouseLeave={() => setHoverRow(null)}
                  className="group relative overflow-hidden border-b border-ink/12"
                >
                  {/* The ink flood. scale-y from the baseline so the row fills
                      the way a level rises. Present while hovered OR open. */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 origin-bottom bg-ink transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setOpenRow(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`svc-panel-${s.id}`}
                    className="tap-row relative z-10 grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-6 text-left md:gap-8 md:py-8"
                  >
                    <span
                      className={`eyebrow w-7 transition-colors duration-500 md:w-9 ${
                        isOpen ? "text-copper-lt" : "text-copper group-hover:text-copper-lt"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`block font-accent text-[clamp(1.4rem,4.2vw,2.4rem)] leading-[1.08] font-medium transition-[color,transform] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-active:translate-x-2 ${
                          isOpen ? "text-cream" : "text-ink group-hover:text-cream group-active:text-cream"
                        }`}
                      >
                        {s.title}
                      </span>
                      <span
                        className={`mt-2 block max-w-xl text-[0.82rem] leading-relaxed transition-colors duration-500 lg:hidden ${
                          isOpen ? "text-cream/60" : "text-ink/55 group-hover:text-cream/60"
                        }`}
                      >
                        {s.blurb}
                      </span>
                    </span>

                    <span className="flex items-center gap-4">
                      <span
                        className={`eyebrow hidden transition-colors duration-500 xl:block ${
                          isOpen ? "text-blue-lt" : "text-ink/35 group-hover:text-blue-lt"
                        }`}
                      >
                        {s.tag}
                      </span>
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isOpen
                            ? "rotate-45 border-blue-lt bg-blue-lt text-ink"
                            : "border-ink/15 text-ink group-hover:border-blue-lt group-hover:bg-blue-lt group-hover:text-ink"
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                      </span>
                    </span>
                  </button>

                  {/* Expanding detail — rides the same flooded surface */}
                  <Panel id={`svc-panel-${s.id}`} open={isOpen} service={s} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Height-animated detail panel; grid-rows trick keeps it CSS-only. */
function Panel({ id, open, service }) {
  return (
    <div
      id={id}
      className="relative z-10 grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div
          className={`pb-9 transition-opacity duration-500 ${
            open ? "opacity-100 delay-150" : "opacity-0"
          }`}
        >
          <div className="md:pl-[2.75rem]">
            <p className="max-w-2xl text-[0.95rem] leading-[1.8] text-cream/75">{service.detail}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {service.points.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-cream/20 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.12em] text-cream/70 uppercase"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
