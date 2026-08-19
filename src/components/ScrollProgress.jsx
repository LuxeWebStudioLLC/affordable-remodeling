import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/gsap";

/**
 * Hairline reading-progress rail across the top of the page, running from
 * the logo's rust into its blue — the two brand hues in one detail.
 */
export default function ScrollProgress() {
  const rail = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !rail.current) return;

    const ctx = gsap.context(() => {
      gsap.to(rail.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
        },
      });
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return <span ref={rail} className="scroll-rail" aria-hidden="true" />;
}
