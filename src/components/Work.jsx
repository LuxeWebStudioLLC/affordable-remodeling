import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { responsive } from "../lib/img";
import { WORK } from "../data/site";

/**
 * The gallery as a horizontal editorial strip: scroll down, the strip pans
 * right. Two drivers, one per input type:
 *
 * DESKTOP (≥1024px) — GSAP pin + scrub. A wheel gives a steady main-thread
 *   signal and ScrollSmoother smooths it further; a JS transform is silky.
 *
 * TOUCH — native `position: sticky` does the pinning (compositor-handled on
 *   every phone browser, no reparenting, no fixed-position juggling) and a
 *   rAF loop lerps the track toward the scroll-derived target. The lerp is
 *   the whole trick: iOS delivers scroll positions in bursts during momentum,
 *   and easing toward the target fills the gaps instead of snapping between
 *   them. This is the boring, universal version after two clever ones — a
 *   GSAP pin (janky: fixed-position pinning fights mobile browser chrome) and
 *   a CSS scroll-driven animation (gorgeous in Chrome, unverifiable on the
 *   Safari builds that kept failing on the client's actual phone).
 *
 * If JS never runs, touch falls back to the natively swipeable rail under
 * reduced-motion, where the pan is disabled entirely.
 *
 * Deliberately nothing inside the track is scroll-revealed: content in a
 * pinned strip must be visible by default or the pin and the reveals fight.
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
    const rootEl = root.current;
    const railEl = rail.current;
    const trackEl = track.current;
    if (!rootEl || !railEl || !trackEl) return;

    const isDesktop = () => window.matchMedia(DESKTOP).matches;
    const reduced = prefersReducedMotion();

    /* ---- The one measurement: how far the track has to travel. ----
       This MUST be re-run whenever the track's width can change, not just
       once on mount. Measuring only at mount is what broke this section in
       Safari: the track had not laid out yet, so --pan was written as 0px,
       which collapsed `height: calc(100svh + var(--pan) * 0.8)` to exactly
       one screen — no scroll range, no pan, permanently, with no later event
       to correct it. A ResizeObserver keys off actual layout instead of
       hoping the timing works out. */
    let pan = 0;
    /* Pure: never triggers a refresh. ScrollTrigger calls this from inside
       its own refresh (via the tween's `end`), and refreshing from there
       would recurse. Returns true when the value actually moved. */
    const measure = () => {
      const next = Math.max(0, trackEl.scrollWidth - railEl.clientWidth);
      if (next === pan) return false;
      pan = next;
      rootEl.style.setProperty("--pan", `${Math.round(next)}px`);
      return true;
    };

    /* What observers call: the section's height depends on --pan, so when it
       moves the pinned geometry has to be re-read — but only then. */
    const remeasure = () => {
      if (measure()) ScrollTrigger.refresh();
    };

    const setX = gsap.quickSetter(trackEl, "x", "px");
    const setBar = bar.current ? gsap.quickSetter(bar.current, "scaleX") : null;
    const writeCounter = (p) => {
      if (!counter.current) return;
      const n = Math.min(WORK.length, Math.round(p * (WORK.length - 1)) + 1);
      counter.current.textContent = String(n).padStart(2, "0");
    };

    /* ---- Touch driver: sticky pins, this lerps. ---- */
    let raf = 0;
    let current = 0;
    let running = false;

    const frame = () => {
      raf = 0;
      if (isDesktop()) return; // GSAP owns it up there

      /* Progress of the sticky stage through the section's extra height.
         offsetHeight-based so the collapsing iOS URL bar can't shift it. */
      const span = rootEl.offsetHeight - (rootEl.firstElementChild?.offsetHeight || 0);
      const top = rootEl.getBoundingClientRect().top;
      const target = span > 0 ? Math.min(1, Math.max(0, -top / span)) : 0;

      /* NO smoothing. This was lerped at 0.16/frame to paper over iOS's
         bursty scroll events, and that was the bug users actually felt:
         measured 243px of lag mid-scroll (62% of a phone's width) plus ~430ms
         of continued sliding after the finger left the screen. The strip
         sloshed instead of tracking.

         Smoothing is the wrong tool here. This loop reads scrollY once per
         animation frame rather than listening for scroll events, so the value
         is already current on every painted frame — including during iOS
         momentum, where rAF keeps firing. Writing it straight through welds
         the strip to the scroll position: zero lag, zero drift. */
      current = target;

      setX(-current * pan);
      if (setBar) setBar(Math.max(0.001, current));
      writeCounter(current);

      if (running) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!running) {
        running = true;
        if (!raf) raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      running = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    /* Only spend frames while the section is anywhere near the screen. */
    let io = null;
    if (!reduced && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { rootMargin: "60% 0px" },
      );
      io.observe(rootEl);
    } else if (!reduced) {
      start();
    }

    /* ---- Reduced motion: the rail stays natively swipeable; keep the
            instrument honest from its scroll position. ---- */
    const onRailScroll = () => {
      const max = railEl.scrollWidth - railEl.clientWidth;
      const p = max > 0 ? railEl.scrollLeft / max : 0;
      if (setBar) setBar(Math.max(0.001, p));
      writeCounter(p);
      if (hint.current && railEl.scrollLeft > 24) hint.current.dataset.done = "true";
    };
    railEl.addEventListener("scroll", onRailScroll, { passive: true });

    /* Re-measure on every layout change of the track or the rail: covers
       images decoding, webfonts swapping in, orientation changes, and the
       first paint itself. Observing width-affecting elements only, so the
       --pan write (which changes the section's HEIGHT) cannot feed back. */
    let ro = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(remeasure);
      ro.observe(trackEl);
      ro.observe(railEl);
    }

    const onResize = () => remeasure();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    /* Fonts change text widths, which changes the intro/outro panel widths. */
    if (document.fonts?.ready) document.fonts.ready.then(remeasure).catch(() => {});

    /* Belt and braces for the very first frames, where WebKit can report a
       zero-width track before it has laid anything out. */
    remeasure();
    requestAnimationFrame(remeasure);

    /* ---- Desktop: pinned transform scrub ---- */
    const ctx = gsap.context(() => {
      if (reduced) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP, () => {
        const dist = () => {
          measure();
          return pan;
        };
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
        /* A leftover transform would offset the touch path if the viewport
           later crosses back under 1024px. */
        return () => {
          tween.scrollTrigger?.kill();
          gsap.set(trackEl, { clearProps: "transform" });
          current = 0;
        };
      });

      return () => mm.revert();
    }, root);

    /* Each image landing can widen the track; the ResizeObserver catches the
       resulting layout change, but listening directly costs nothing and helps
       browsers that batch observer callbacks. */
    const imgs = Array.from(trackEl.querySelectorAll("img"));
    const onLoad = () => remeasure();
    imgs.forEach((i) => {
      i.addEventListener("load", onLoad);
      i.addEventListener("error", onLoad);
    });

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      railEl.removeEventListener("scroll", onRailScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      imgs.forEach((i) => {
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
      {/* On touch the rail takes all remaining height (flex-1) instead of the
          photos being sized in svh. The svh heights were tuned for the desktop
          layout, where staggered offsets fill the space; on a phone they left
          the strip occupying barely half the section, with black bands above
          and below and the progress bar floating in dead air. Letting the rail
          claim the leftover height fills any viewport exactly. */}
      <div className="work-stage flex h-[100dvh] flex-col justify-center gap-5 py-5 lg:gap-0 lg:py-0">
        {/* Rail — lerp-panned on touch, transform-driven from lg up, natively
            swipeable only under reduced motion. */}
        <div ref={rail} className="swipe-rail">
          <div
            ref={track}
            className="work-track flex w-max items-center gap-[5vw] px-[6vw] lg:gap-[3.5vw] lg:transform-gpu lg:will-change-transform"
          >
            {/* Intro panel rides inside the strip */}
            <div className="w-[76vw] shrink-0 lg:w-[26vw]">
              <p className="eyebrow text-blue-lt">Recent work</p>
              <h2 className="mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] text-cream">
                A few jobs
                <br />
                <span className="script text-blue-lt">around town.</span>
              </h2>
              <p className="mt-6 max-w-xs text-[0.9rem] leading-[1.8] text-cream/55">
                Roofs, kitchens, baths and everything between — the street keeps going.
              </p>

              {/* Swipe affordance for the reduced-motion fallback, where the
                  strip really does need a finger. Hidden wherever the pan is
                  automatic. */}
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
                    className={`h-[64svh] w-[82vw] overflow-hidden bg-ink-2 lg:w-[var(--w)] ${tall ? "lg:h-[58vh]" : "lg:h-[40vh]"}`}
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
                  <figcaption className="mt-3 flex shrink-0 items-baseline gap-4 lg:mt-4">
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
            <div className="w-[76vw] shrink-0 pr-[6vw] lg:w-[30vw]">
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

        {/* Progress instrument — fed by the lerp on touch, by the pin on
            desktop, by rail scroll under reduced motion. */}
        <div className="container-x flex shrink-0 items-center gap-5 lg:mt-12 lg:gap-6">
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
