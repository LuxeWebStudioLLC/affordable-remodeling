import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { responsive } from "../lib/img";
import { WORK } from "../data/site";

/**
 * The gallery as a horizontal editorial strip: scroll down, the strip pans
 * right. Same effect everywhere, but driven three different ways, because
 * "smooth" means something different on each.
 *
 * DESKTOP (≥1024px) — GSAP pin + scrub. A wheel gives a steady main-thread
 *   signal and ScrollSmoother smooths it further, so a JS transform is silky.
 *
 * TOUCH, modern browsers — CSS scroll-driven animation. The section is its own
 *   `view-timeline`, the pan is a keyframe animation against it, and sticky
 *   does the pinning. The compositor evaluates all of it, so it cannot stutter.
 *   Doing this in JS is what made it bumpy before: iOS throttles main-thread
 *   JS during momentum scrolling, so a scrollY-derived transform is always
 *   late. Handing the whole thing to CSS removes the main thread entirely.
 *
 * TOUCH, older browsers — native horizontal swipe. Manual, but perfectly
 *   smooth, and nobody gets a broken section.
 *
 * All this component does at runtime is measure the pan distance and keep the
 * counter honest. Nothing here runs per frame.
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

const DESKTOP = "(min-width: 1024px)";

/** True when the browser can run the CSS-driven pan (Chrome 115+, Safari 26+). */
const cssTimeline = () =>
  typeof CSS !== "undefined" &&
  CSS.supports &&
  CSS.supports("animation-timeline", "view()");

export default function Work() {
  const root = useRef(null);
  const rail = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const counter = useRef(null);
  const hint = useRef(null);

  useEffect(() => {
    const rootEl = root.current;
    const railEl = rail.current;
    const trackEl = track.current;
    if (!rootEl || !railEl || !trackEl) return;

    const isDesktop = () => window.matchMedia(DESKTOP).matches;
    /* The CSS path is gated on the same conditions as the stylesheet. */
    const cssPanActive = () =>
      cssTimeline() && !isDesktop() && !prefersReducedMotion();

    /* ---- The one measurement: how far the track has to travel. ---- */
    const measure = () => {
      const pan = Math.max(0, trackEl.scrollWidth - railEl.clientWidth);
      rootEl.style.setProperty("--pan", `${Math.round(pan)}px`);
      return pan;
    };
    measure();

    /* ---- Counter. The bar is animated by CSS on the touch path and by GSAP
            on desktop; only the digits need writing by hand. Text lagging a
            frame is invisible, and it never touches the strip's smoothness. ---- */
    const setBar = bar.current ? gsap.quickSetter(bar.current, "scaleX") : null;
    const writeCounter = (p) => {
      if (!counter.current) return;
      const c = Math.min(1, Math.max(0, p));
      const n = Math.min(WORK.length, Math.round(c * (WORK.length - 1)) + 1);
      counter.current.textContent = String(n).padStart(2, "0");
    };

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (isDesktop()) return; // GSAP owns it

        if (cssPanActive()) {
          /* Mirror the CSS `contain` range: progress through the window where
             the section fully covers the viewport. */
          const r = rootEl.getBoundingClientRect();
          const span = r.height - window.innerHeight;
          writeCounter(span > 0 ? -r.top / span : 0);
        } else {
          const max = railEl.scrollWidth - railEl.clientWidth;
          const p = max > 0 ? railEl.scrollLeft / max : 0;
          writeCounter(p);
          if (setBar) setBar(Math.max(0.001, p));
          if (hint.current && railEl.scrollLeft > 24) {
            hint.current.dataset.done = "true";
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    railEl.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("resize", onResize);

    /* ---- Desktop: pinned transform scrub ---- */
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP, () => {
        const dist = () => measure();
        const tween = gsap.to(trackEl, {
          x: () => -dist(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: rootEl,
            start: "top top",
            end: () => "+=" + Math.round(dist()),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (setBar) setBar(Math.max(0.001, self.progress));
              writeCounter(self.progress);
            },
          },
        });
        /* A leftover transform would offset the CSS/native path if the
           viewport later crosses back under 1024px. */
        return () => {
          tween.scrollTrigger?.kill();
          gsap.set(trackEl, { clearProps: "transform" });
          if (setBar) setBar(0.001);
          writeCounter(0);
        };
      });

      return () => mm.revert();
    }, root);

    /* Track width depends on images having laid out; re-measure once they're
       in so neither the pan distance nor the pin is short on a cold load. */
    const waiting = Array.from(trackEl.querySelectorAll("img")).filter((i) => !i.complete);
    let pending = waiting.length;
    const onLoad = () => {
      pending -= 1;
      if (pending <= 0) {
        measure();
        ScrollTrigger.refresh();
        onScroll();
      }
    };
    waiting.forEach((i) => {
      i.addEventListener("load", onLoad, { once: true });
      i.addEventListener("error", onLoad, { once: true });
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      railEl.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      waiting.forEach((i) => {
        i.removeEventListener("load", onLoad);
        i.removeEventListener("error", onLoad);
      });
      ctx.revert();
    };
  }, []);

  return (
    /* `overflow-x-clip`, NOT `overflow-hidden`: `hidden` makes this section a
       scroll container, which would make the sticky stage stick to the section
       instead of the viewport — it scrolls away and leaves an empty black
       panel. `clip` clips just as well without creating a scrollport. The rail
       does the real horizontal clipping anyway. */
    <section id="work" ref={root} className="work-strip relative grain overflow-x-clip bg-ink">
      <div className="work-stage flex h-[100svh] flex-col justify-center">
        {/* Rail — CSS-panned or natively scrollable on touch, transform-driven
            from lg up. */}
        <div ref={rail} className="swipe-rail">
          <div
            ref={track}
            className="work-track flex w-max items-center gap-[5vw] px-[6vw] lg:gap-[3.5vw] lg:transform-gpu lg:will-change-transform"
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
                Roofs, kitchens, baths and everything between — the street keeps going.
              </p>

              {/* Only shown on the fallback path, where the strip really does
                  need a finger. CSS hides it wherever the pan is automatic. */}
              <p
                ref={hint}
                data-hint
                className="mt-5 flex items-center gap-2 text-[0.7rem] tracking-[0.14em] text-cream/40 uppercase transition-opacity duration-500 data-[done=true]:opacity-0 lg:hidden"
              >
                Swipe
                <span aria-hidden="true" className="swipe-nudge inline-block">
                  →
                </span>
              </p>
            </div>

            {WORK.map((w, i) => {
              const [vw, tall] = LAYOUT[i % LAYOUT.length];
              return (
                <figure
                  key={w.src}
                  className={`group shrink-0 snap-center ${i % 2 ? "lg:self-start lg:pt-[6vh]" : "lg:self-end lg:pb-[6vh]"}`}
                  style={{ "--w": `${vw}vw` }}
                >
                  <div
                    className={`w-[64vw] overflow-hidden bg-ink-2 lg:w-[var(--w)] ${tall ? "h-[46svh] lg:h-[58vh]" : "h-[36svh] lg:h-[40vh]"}`}
                  >
                    <img
                      src={w.src}
                      {...responsive(w.src, "(min-width: 1024px) 42vw, 64vw")}
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

        {/* Progress instrument — CSS drives the bar off the same timeline as
            the strip on touch, GSAP drives it on desktop. */}
        <div className="container-x mt-10 flex items-center gap-5 lg:mt-12 lg:gap-6">
          <span ref={counter} className="font-display text-[0.8rem] text-cream/70 tabular-nums">
            01
          </span>
          <div className="h-px flex-1 bg-white/10">
            <div ref={bar} className="work-bar h-px origin-left scale-x-0 bg-blue-lt" />
          </div>
          <span className="font-display text-[0.8rem] text-cream/40 tabular-nums">
            {String(WORK.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
