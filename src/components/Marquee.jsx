import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { marquee } from "../lib/animations";
import { MARQUEE_WORDS } from "../data/site";

/**
 * The trades as one enormous rolling line — filled serif italic alternating
 * with hairline-outlined words, big enough to be architecture rather than
 * a ticker. Slows underfoot on hover.
 */
export default function Marquee({ words = MARQUEE_WORDS, speed = 90 }) {
  const track = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tween = marquee(track.current, { speed });
      if (!tween) return;

      const el = track.current.parentElement;

      /* An infinite tween ticks forever; pause it whenever the strip is
         offscreen so it costs nothing while the visitor reads elsewhere. */
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => tween.paused(!self.isActive),
      });

      const slow = () => gsap.to(tween, { timeScale: 0.22, duration: 0.6 });
      const fast = () => gsap.to(tween, { timeScale: 1, duration: 0.6 });
      el.addEventListener("pointerenter", slow);
      el.addEventListener("pointerleave", fast);
      return () => {
        el.removeEventListener("pointerenter", slow);
        el.removeEventListener("pointerleave", fast);
      };
    }, track);

    return () => ctx.revert();
  }, [speed]);

  const items = [...words, ...words];

  return (
    <div className="relative overflow-hidden bg-ink py-10 md:py-14" aria-hidden="true">
      <div ref={track} className="marquee-track items-baseline">
        {items.map((w, i) => (
          <span key={`${w}-${i}`} className="flex items-baseline">
            <span
              className={`px-[3vw] font-accent text-[clamp(3rem,7.5vw,7rem)] leading-none whitespace-nowrap ${
                i % 2 ? "text-outline-cream" : "italic text-cream/90"
              }`}
            >
              {w}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 10 10"
              className="shrink-0 -translate-y-[1.2em] text-copper"
              aria-hidden="true"
            >
              <path d="M5 0 6.2 3.8 10 5 6.2 6.2 5 10 3.8 6.2 0 5 3.8 3.8Z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
