import { gsap, ScrollTrigger, SplitText, EASE, prefersReducedMotion } from "./gsap";

/**
 * Reveal helpers used across the site. Each returns nothing and relies on
 * gsap.context() (owned by the calling component) for cleanup.
 */

/** Word-by-word rise for display headlines. */
export function revealHeadline(el, { start = "top 85%", stagger = 0.045, delay = 0 } = {}) {
  if (!el) return;

  if (prefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1 });
    return;
  }

  const split = new SplitText(el, {
    type: "lines,words",
    linesClass: "split-line",
  });

  // Each line gets a clipping wrapper so words rise out of nothing.
  split.lines.forEach((line) => {
    line.style.overflow = "hidden";
    line.style.paddingBottom = "0.06em";
    line.style.marginBottom = "-0.06em";
  });

  gsap.set(el, { autoAlpha: 1 });

  gsap.from(split.words, {
    yPercent: 112,
    duration: 1.15,
    ease: EASE,
    stagger,
    delay,
    scrollTrigger: { trigger: el, start, once: true },
  });
}

/** Generic fade + rise for blocks of content. */
export function revealUp(targets, { start = "top 88%", y = 34, stagger = 0.09, duration = 1 } = {}) {
  const list = gsap.utils.toArray(targets);
  if (!list.length) return;

  if (prefersReducedMotion()) {
    gsap.set(list, { autoAlpha: 1, y: 0 });
    return;
  }

  gsap.from(list, {
    autoAlpha: 0,
    y,
    duration,
    ease: EASE,
    stagger,
    scrollTrigger: { trigger: list[0], start, once: true },
  });
}

/**
 * Wipe an image in behind a clip-path and let it settle from a slight
 * over-scale — the move that makes photography feel expensive.
 */
export function revealImage(wrapper, { start = "top 85%", scale = 1.22 } = {}) {
  if (!wrapper) return;
  const img = wrapper.querySelector("img");

  if (prefersReducedMotion()) {
    gsap.set(wrapper, { clipPath: "inset(0% 0% 0% 0%)" });
    if (img) gsap.set(img, { scale: 1 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: wrapper, start, once: true },
  });

  tl.fromTo(
    wrapper,
    { clipPath: "inset(0% 0% 100% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: EASE },
  );

  if (img) tl.from(img, { scale, duration: 1.7, ease: EASE }, 0);
}

/** Draws a hairline rule left-to-right as it enters. */
export function revealRule(targets, { start = "top 92%" } = {}) {
  const list = gsap.utils.toArray(targets);
  if (!list.length) return;

  if (prefersReducedMotion()) {
    gsap.set(list, { scaleX: 1 });
    return;
  }

  list.forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        transformOrigin: "left center",
        duration: 1.3,
        ease: EASE,
        scrollTrigger: { trigger: el, start, once: true },
      },
    );
  });
}

/** Counts a number up when it scrolls into view. Handles "25+", "50mi". */
export function countUp(el) {
  if (!el) return;
  const raw = el.dataset.value ?? el.textContent;
  const match = raw.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);

  if (!match || prefersReducedMotion()) {
    el.textContent = raw;
    return;
  }

  const [, prefix, digits, suffix] = match;
  const target = parseFloat(digits);
  const obj = { v: 0 };

  gsap.to(obj, {
    v: target,
    duration: 1.9,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 90%", once: true },
    onUpdate: () => {
      el.textContent = `${prefix}${Math.round(obj.v)}${suffix}`;
    },
  });
}

/**
 * Seamless infinite marquee. Duplicates are already in the DOM; this just
 * translates the track by exactly half its width and loops.
 */
export function marquee(track, { speed = 34, reverse = false } = {}) {
  if (!track || prefersReducedMotion()) return null;

  const half = track.scrollWidth / 2;
  gsap.set(track, { x: reverse ? -half : 0 });

  return gsap.to(track, {
    x: reverse ? 0 : -half,
    duration: half / speed,
    ease: "none",
    repeat: -1,
  });
}

/** Refresh once fonts and images have settled so triggers land correctly. */
export function refreshWhenReady() {
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}

/* ------------------------------------------------------------------
   REVEAL FAILSAFE

   Every section on this page starts hidden and is only made visible by a
   scroll-triggered tween. That's a single point of failure for the entire
   page's content: if GSAP can't tick (a tab opened in the background has
   requestAnimationFrame suspended), or a ScrollTrigger resolves its start
   position wrongly after a late layout shift, the affected sections stay
   invisible forever and the visitor sees blank bands.

   This sweeps for reveal targets that are *on screen* yet still hidden and
   forces them to their finished state. On-screen only, so genuine
   below-the-fold reveals still animate normally when scrolled to.
   ------------------------------------------------------------------ */
const REVEAL_HOOKS = [
  "[data-hero]",
  "[data-hero-copy]",
  "[data-h]",
  "[data-eyebrow]",
  "[data-body]",
  "[data-action]",
  "[data-rule]",
  "[data-stat]",
  "[data-stat-rule]",
  "[data-card]",
  "[data-card-rule]",
  "[data-row]",
  "[data-tile]",
  "[data-t]",
  "[data-check]",
  "[data-q]",
  "[data-cred]",
  "[data-c]",
  "[data-map]",
  "[data-cta-h]",
].join(",");

function onScreen(el) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  return r.top < window.innerHeight && r.bottom > 0;
}

/** Force any on-screen reveal target that is still hidden into view. */
export function sweepStuckReveals() {
  document.querySelectorAll(REVEAL_HOOKS).forEach((el) => {
    if (!onScreen(el)) return;

    const cs = getComputedStyle(el);
    const hiddenByAlpha = cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.02;
    // Tiles/images reveal via a clip-path inset; rules via scaleX.
    const clipped = /inset\(/.test(cs.clipPath) && !/inset\(0%? 0%? 0%? 0%?\)/.test(cs.clipPath);
    const flattened = /matrix\(0[,.]/.test(cs.transform);

    if (hiddenByAlpha) gsap.set(el, { autoAlpha: 1, y: 0 });
    if (clipped) gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)" });
    if (flattened) gsap.set(el, { scaleX: 1 });
  });
}

/**
 * Run the sweep a few times over the first several seconds, then on every
 * scroll settle. Cheap (a handful of rect reads) and it only ever adds
 * visibility — it can't hide anything.
 */
export function installRevealFailsafe() {
  const times = [1200, 2600, 5000];
  const timers = times.map((t) => setTimeout(sweepStuckReveals, t));

  let idle;
  const onScroll = () => {
    clearTimeout(idle);
    idle = setTimeout(sweepStuckReveals, 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    timers.forEach(clearTimeout);
    clearTimeout(idle);
    window.removeEventListener("scroll", onScroll);
  };
}

/**
 * Magnetic buttons: the element leans a few pixels toward the cursor while
 * hovered and springs back on leave. quickTo keeps it on the compositor —
 * no layout work, no jitter. Desktop fine-pointer only; reduced-motion off.
 */
export function initMagnetic(selector = ".btn", strength = 0.22) {
  if (prefersReducedMotion()) return () => {};
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};

  const cleanups = gsap.utils.toArray(selector).map((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      xTo(0);
      yTo(0);
    };
  });

  return () => cleanups.forEach((c) => c());
}
