import { useEffect, useRef } from "react";
import { gsap, SplitText, prefersReducedMotion } from "../lib/gsap";

/**
 * One editorial statement that resolves word by word as it crosses the
 * viewport — the only scrubbed text on the site, used exactly once so it
 * keeps feeling expensive. (Technique borrowed from the Brothers Pool build.)
 */
const LINE =
  "Twenty-five years in, our best advertising is still a tidy jobsite and a roof that doesn't leak — one house, one street at a time.";

export default function Statement() {
  const root = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const el = root.current.querySelector("[data-statement]");
    let split;
    let ctx;

    const run = () => {
      ctx = gsap.context(() => {
        // Split against final font metrics, not the fallback face.
        split = SplitText.create(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.5,
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          },
        );
      }, root);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }

    return () => {
      ctx?.revert();
      split?.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative bg-cream py-24 md:py-36">
      <div className="container-x">
        <p className="eyebrow text-blue">Twenty-five years in</p>
        <p
          data-statement
          className="mt-7 max-w-4xl font-accent text-[clamp(1.6rem,3.6vw,2.9rem)] leading-[1.3] font-medium text-ink"
        >
          {LINE}
        </p>
      </div>
    </section>
  );
}
