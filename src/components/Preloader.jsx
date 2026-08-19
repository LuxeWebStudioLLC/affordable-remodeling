import { useEffect, useRef } from "react";
import { gsap, EASE, prefersReducedMotion } from "../lib/gsap";

/**
 * Curtain intro. Counts to 100 while the hero image decodes, then lifts
 * away and hands off to the hero timeline via the `onDone` callback.
 */
export default function Preloader({ onDone }) {
  const root = useRef(null);
  const count = useRef(null);
  const bar = useRef(null);
  const wordmark = useRef(null);

  useEffect(() => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      document.body.style.removeProperty("overflow");
      /* Dismiss the curtain here too, not just in the timeline: if the timeline
         is what stalled, it will never run its own hide step. */
      if (root.current) gsap.set(root.current, { autoAlpha: 0, display: "none" });
      onDone?.();
    };

    /* Failsafe. The entire page sits behind this curtain and only the intro
       timeline lifts it, so anything that stalls that timeline — a tab opened
       in the background (rAF is suspended there, so GSAP never ticks), a
       throttled device, an error mid-sequence — would leave a visitor staring
       at a black screen forever. Hand off regardless after a beat. */
    const failsafe = setTimeout(finish, 3200);

    if (prefersReducedMotion()) {
      clearTimeout(failsafe);
      gsap.set(root.current, { autoAlpha: 0, display: "none" });
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    const ctx = gsap.context(() => {
      const progress = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });

      tl.to(wordmark.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE }, 0)
        .to(
          progress,
          {
            v: 100,
            duration: 1.1,
            ease: "power2.inOut",
            onUpdate: () => {
              if (count.current) {
                count.current.textContent = String(Math.round(progress.v)).padStart(2, "0");
              }
            },
          },
          0.15,
        )
        .fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power2.inOut" }, 0.15)
        // Curtain lifts
        .to([wordmark.current, count.current, bar.current?.parentElement], {
          autoAlpha: 0,
          y: -18,
          duration: 0.5,
          ease: "power2.in",
        })
        .to(
          root.current,
          {
            yPercent: -100,
            duration: 1.1,
            ease: EASE,
          },
          "-=0.1",
        )
        .set(root.current, { display: "none" });
    }, root);

    return () => {
      clearTimeout(failsafe);
      ctx.revert();
      document.body.style.removeProperty("overflow");
    };
  }, [onDone]);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink grain"
      aria-hidden="true"
    >
      <div ref={wordmark} className="translate-y-6 opacity-0 text-center">
        <img
          src="/logo-icon.png"
          alt=""
          className="mx-auto h-16 w-auto md:h-20"
        />
        <p className="eyebrow mt-6 text-cream/45">Affordable Home Remodeling</p>
      </div>

      <div className="absolute bottom-10 left-0 w-full px-6 md:bottom-14">
        <div className="mx-auto flex max-w-xl items-center gap-5">
          <span className="h-px flex-1 origin-left scale-x-0 bg-cream/25" ref={bar} />
          <span
            ref={count}
            className="font-display text-xs tracking-[0.2em] text-cream/60 tabular-nums"
          >
            00
          </span>
        </div>
      </div>
    </div>
  );
}
