import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import { revealUp } from "../lib/animations";
import { SERVICES } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * Numbered service index. Each row expands in place to reveal the detail and
 * the trade's key points — no hover imagery, so the list stays a clean piece
 * of typography and nothing covers the row you're reading.
 */
export default function Services() {
  const root = useRef(null);
  const [openRow, setOpenRow] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-row]"), {
        start: "top 92%",
        y: 40,
        stagger: 0.055,
      });
    }, root);
    return () => ctx.revert();
  }, []);

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
          <p className="max-w-sm text-[0.95rem] leading-[1.75] text-ink/60 lg:pb-3">
            Exterior to interior, all under one contractor. Family owned for over twenty-five years
            in La Crosse — so the person who quotes your job is the person who stands behind it.
          </p>
        </div>

        {/* ---- Rows ---- */}
        <div className="relative mt-16 md:mt-20">
          <div className="border-t border-ink/12">
            {SERVICES.map((s, i) => {
              const isOpen = openRow === i;
              return (
                <div key={s.id} data-row className="border-b border-ink/12">
                  <button
                    type="button"
                    onClick={() => setOpenRow(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`svc-panel-${s.id}`}
                    className="tap-row group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-6 text-left md:gap-8 md:py-8"
                  >
                    <span className="eyebrow w-7 text-copper transition-colors duration-500 md:w-9">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span className="block font-accent text-[clamp(1.4rem,4.2vw,2.4rem)] leading-[1.08] font-medium text-ink transition-[color,transform] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 group-hover:text-blue group-active:translate-x-2 group-active:text-blue">
                        {s.title}
                      </span>
                      <span className="mt-2 block max-w-xl text-[0.82rem] leading-relaxed text-ink/55 lg:hidden">
                        {s.blurb}
                      </span>
                    </span>

                    <span className="flex items-center gap-4">
                      <span className="eyebrow hidden text-ink/35 transition-colors duration-500 group-hover:text-blue group-active:text-blue xl:block">
                        {s.tag}
                      </span>
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:border-blue group-hover:bg-blue group-hover:text-white group-active:border-blue group-active:bg-blue group-active:text-white ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.4" />
                        </svg>
                      </span>
                    </span>
                  </button>

                  {/* Expanding detail */}
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
      className="grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div
          className={`pb-9 transition-opacity duration-500 ${
            open ? "opacity-100 delay-150" : "opacity-0"
          }`}
        >
          <div className="md:pl-[2.75rem]">
            <p className="max-w-2xl text-[0.95rem] leading-[1.8] text-ink/70">{service.detail}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {service.points.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-ink/12 bg-cream-2 px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-[0.12em] text-ink/65 uppercase"
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
