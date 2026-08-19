import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { WORK } from "../data/site";

/**
 * The gallery as a horizontal editorial strip. The section pins and vertical
 * scroll drives the track sideways — on every screen size, phones included,
 * so the signature move isn't a desktop-only privilege. Mixed image widths
 * and offsets make it read like a magazine spread rather than a grid.
 *
 * Deliberately nothing inside the track is scroll-revealed: content in a
 * pinned scrub must be visible by default or the pin and the reveals fight.
 */

/* Editorial rhythm: [width vw, tall?] per tile at lg. Six real jobs beat
   twelve stock ones — the strip is shorter and every frame earns its place. */
const LAYOUT = [
  [38, true], [26, false], [42, true],
  [28, false], [36, true], [27, false],
];

export default function Work() {
  const root = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const counter = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      const el = track.current;
      if (!el) return;

      const dist = () => Math.max(0, el.scrollWidth - window.innerWidth);

      const setBar = bar.current ? gsap.quickSetter(bar.current, "scaleX") : null;

      const onUpdate = (self) => {
        if (setBar) setBar(Math.max(0.001, self.progress));
        if (counter.current) {
          const n = Math.min(
            WORK.length,
            Math.round(self.progress * (WORK.length - 1)) + 1,
          );
          counter.current.textContent = String(n).padStart(2, "0");
        }
      };

      /* Touch and pointer want different tuning, so each gets its own build
         instead of one compromise that suits neither:

         ratio — how much vertical scroll the strip costs. 1:1 is right for a
           pointer. Phones get 0.72, not the old 0.5: at 0.5 the strip moved
           at double finger speed, which reads as twitchy rather than fast.

         scrub — desktop keeps the 1s lerp because ScrollSmoother already
           hands it a smoothed signal. Touch takes the value straight:
           momentum scrolling IS the smoothing, and stacking a second lerp on
           top of it is what shows up as lag and stutter.

         anticipatePin — earns its keep against a fast mouse wheel, but causes
           a visible hop when a pin engages under a finger, so touch opts out. */
      const CONFIG = {
        "(min-width: 1024px)": { ratio: 1, scrub: 1, anticipatePin: 1 },
        "(max-width: 1023.98px)": { ratio: 0.72, scrub: true, anticipatePin: 0 },
      };

      const mm = gsap.matchMedia();

      Object.entries(CONFIG).forEach(([query, cfg]) => {
        mm.add(query, () => {
          const tween = gsap.to(el, {
            x: () => -dist(),
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + Math.round(dist() * cfg.ratio),
              pin: true,
              scrub: cfg.scrub,
              anticipatePin: cfg.anticipatePin,
              invalidateOnRefresh: true,
              onUpdate,
            },
          });
          return () => tween.scrollTrigger?.kill();
        });
      });

      /* The track's width depends on images having laid out; re-measure once
         they're in so the pin distance isn't short on a cold load. */
      const imgs = Array.from(el.querySelectorAll("img"));
      let pending = imgs.filter((i) => !i.complete).length;
      const onLoad = () => {
        pending -= 1;
        if (pending <= 0) ScrollTrigger.refresh();
      };
      if (pending > 0) {
        imgs.filter((i) => !i.complete).forEach((i) => {
          i.addEventListener("load", onLoad, { once: true });
          i.addEventListener("error", onLoad, { once: true });
        });
      }

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="work" ref={root} className="relative grain overflow-hidden bg-ink">
      <div className="flex h-[100svh] flex-col justify-center">
        {/* Rail — transform-driven at every size; never natively scrollable,
            or the browser and the scrub would both try to move it.
            `contain: paint` keeps repaints inside the rail instead of letting
            them invalidate the whole section on every frame. */}
        <div className="overflow-hidden [contain:paint]">
          <div
            ref={track}
            /* GPU promotion at EVERY size. This was `lg:will-change-transform`,
               so phones — the devices that can least afford it — were
               compositing six full-bleed photos on the CPU every frame. That
               was the bulk of the reported bumpiness. */
            className="flex w-max transform-gpu items-center gap-[5vw] px-[6vw] will-change-transform lg:gap-[3.5vw]"
          >
            {/* Intro panel rides inside the strip */}
            <div className="w-[70vw] shrink-0 lg:w-[26vw]">
              <p className="eyebrow text-blue-lt">Recent work</p>
              <h2 className="mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] text-cream">
                A few jobs
                <br />
                <span className="script text-blue-lt">around town.</span>
              </h2>
              <p className="mt-6 max-w-xs text-[0.9rem] leading-[1.8] text-cream/55">
                Roofs, kitchens, baths and everything between — keep scrolling, the street keeps
                going.
              </p>
            </div>

            {WORK.map((w, i) => {
              const [vw, tall] = LAYOUT[i % LAYOUT.length];
              return (
                <figure
                  key={w.src}
                  className={`group shrink-0 ${i % 2 ? "lg:self-start lg:pt-[6vh]" : "lg:self-end lg:pb-[6vh]"}`}
                  style={{ "--w": `${vw}vw` }}
                >
                  <div
                    className={`w-[64vw] overflow-hidden bg-ink-2 lg:w-[var(--w)] ${tall ? "h-[46svh] lg:h-[58vh]" : "h-[36svh] lg:h-[40vh]"}`}
                  >
                    <img
                      src={w.src}
                      alt={w.alt}
                      loading={i < 2 ? "eager" : "lazy"}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                    />
                  </div>
                  <figcaption className="mt-4 flex items-baseline gap-4">
                    <span className="font-display text-[0.7rem] tracking-[0.14em] text-copper">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="eyebrow text-cream/40">{w.cat}</span>
                    <span className="hidden truncate text-[0.78rem] text-cream/55 lg:inline">
                      {w.alt}
                    </span>
                  </figcaption>
                </figure>
              );
            })}

            {/* Closing panel */}
            <div className="w-[70vw] shrink-0 pr-[6vw] lg:w-[30vw]">
              <h3 className="text-[clamp(1.9rem,3.4vw,3rem)] text-cream">
                Your street
                <br />
                <span className="script text-blue-lt">could be next.</span>
              </h3>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("#contact", 74);
                }}
                className="btn btn-cream mt-8"
              >
                Start your project
              </a>
            </div>
          </div>
        </div>

        {/* Progress instrument — scroll drives the strip everywhere, so it shows
            on phones too. */}
        <div className="container-x mt-10 flex items-center gap-5 lg:mt-12 lg:gap-6">
          <span ref={counter} className="font-display text-[0.8rem] text-cream/70 tabular-nums">
            01
          </span>
          <div className="h-px flex-1 bg-white/10">
            <div ref={bar} className="h-px origin-left scale-x-0 bg-blue-lt" />
          </div>
          <span className="font-display text-[0.8rem] text-cream/40 tabular-nums">
            {String(WORK.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
