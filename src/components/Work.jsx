import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { responsive } from "../lib/img";
import { WORK } from "../data/site";

/**
 * The gallery as a horizontal editorial strip — driven two different ways,
 * because the two input types have genuinely different physics.
 *
 * DESKTOP (≥1024px): the section pins and vertical scroll drives the track
 * sideways by transform. A mouse wheel produces a steady main-thread signal
 * and ScrollSmoother smooths it further, so this feels silky.
 *
 * TOUCH: native horizontal scrolling. No pin, no transform, no JS in the
 * gesture at all. Earlier versions transformed the track from scrollY here
 * too, and it was visibly bumpy no matter how much cost was removed — because
 * iOS scrolls on the compositor thread and throttles main-thread JS during
 * momentum, so the transform can only ever arrive late and in bursts. Handing
 * the gesture to the browser is not a downgrade; it is the only way to get a
 * guaranteed-smooth 60fps on a phone.
 *
 * The progress instrument reads whichever source is active.
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

export default function Work() {
  const root = useRef(null);
  const rail = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const counter = useRef(null);
  const hint = useRef(null);

  useEffect(() => {
    const railEl = rail.current;
    const trackEl = track.current;
    if (!railEl || !trackEl) return;

    /* One writer for the instrument, whichever source drives it. */
    const setBar = bar.current ? gsap.quickSetter(bar.current, "scaleX") : null;
    const report = (progress) => {
      const p = Math.min(1, Math.max(0, progress));
      if (setBar) setBar(Math.max(0.001, p));
      if (counter.current) {
        const n = Math.min(WORK.length, Math.round(p * (WORK.length - 1)) + 1);
        counter.current.textContent = String(n).padStart(2, "0");
      }
    };

    /* ---- Touch: native scroll. Works with reduced motion too, since
            nothing here is an animation. ---- */
    let hinted = false;
    const onRailScroll = () => {
      const max = railEl.scrollWidth - railEl.clientWidth;
      report(max > 0 ? railEl.scrollLeft / max : 0);

      /* Retire the swipe hint the moment they've understood it. */
      if (!hinted && railEl.scrollLeft > 24) {
        hinted = true;
        if (hint.current) hint.current.dataset.done = "true";
      }
    };
    railEl.addEventListener("scroll", onRailScroll, { passive: true });

    /* ---- Desktop: pinned transform scrub ---- */
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;

      const dist = () => Math.max(0, trackEl.scrollWidth - railEl.clientWidth);
      const mm = gsap.matchMedia();

      mm.add(DESKTOP, () => {
        const tween = gsap.to(trackEl, {
          x: () => -dist(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + Math.round(dist()),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => report(self.progress),
          },
        });
        /* Leaving a transform behind would offset the native scroller if the
           viewport later crosses back under 1024px. */
        return () => {
          tween.scrollTrigger?.kill();
          gsap.set(trackEl, { clearProps: "transform" });
          report(0);
        };
      });

      return () => mm.revert();
    }, root);

    /* The track's width depends on images having laid out; re-measure once
       they're in so the pin distance isn't short on a cold load. */
    const imgs = Array.from(trackEl.querySelectorAll("img"));
    const waiting = imgs.filter((i) => !i.complete);
    let pending = waiting.length;
    const onLoad = () => {
      pending -= 1;
      if (pending <= 0) {
        ScrollTrigger.refresh();
        onRailScroll();
      }
    };
    waiting.forEach((i) => {
      i.addEventListener("load", onLoad, { once: true });
      i.addEventListener("error", onLoad, { once: true });
    });

    return () => {
      railEl.removeEventListener("scroll", onRailScroll);
      waiting.forEach((i) => {
        i.removeEventListener("load", onLoad);
        i.removeEventListener("error", onLoad);
      });
      ctx.revert();
    };
  }, []);

  return (
    <section id="work" ref={root} className="relative grain overflow-hidden bg-ink">
      <div className="flex h-[100svh] flex-col justify-center">
        {/* Rail — native scroller on touch, transform-driven from lg up. */}
        <div ref={rail} className="swipe-rail">
          <div
            ref={track}
            /* will-change only where a transform actually runs. On touch the
               browser composites its own scroll and the hint is wasted. */
            className="flex w-max items-center gap-[5vw] px-[6vw] lg:gap-[3.5vw] lg:transform-gpu lg:will-change-transform"
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

              {/* Touch affordance: the strip scrolls sideways, which isn't
                  obvious until you try. Fades out for good on first swipe. */}
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

        {/* Progress instrument — fed by native scroll on touch, by the pin
            on desktop. */}
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
