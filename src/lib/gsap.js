import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, ScrollToPlugin);

/* On phones the browser chrome collapsing on scroll fires a resize, which
   would otherwise re-measure every trigger mid-scroll and make pinned
   sections visibly jump. Ignoring it is the documented fix. */
ScrollTrigger.config({ ignoreMobileResize: true });

/** Shared easing so every motion on the page feels like one hand made it. */
export const EASE = "expo.out";
export const EASE_SOFT = "power3.out";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scroll to a hash target through ScrollSmoother when it exists so the
 * easing matches the rest of the page, and fall back to native otherwise.
 */
export function scrollToSection(hash, offset = 0) {
  const el = document.querySelector(hash);
  if (!el) return;

  const smoother = ScrollSmoother.get();
  if (smoother) {
    smoother.scrollTo(el, true, `top ${offset}px`);
    return;
  }

  const y = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/* Dev-only handle so scroll behaviour can be inspected from the console. */
if (import.meta.env.DEV && typeof window !== "undefined") {
  window.__gsap = { gsap, ScrollTrigger, ScrollSmoother };
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
