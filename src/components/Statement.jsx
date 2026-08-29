import { useEffect, useRef } from "react";
import { scrubWords } from "../lib/animations";

/**
 * One editorial statement that resolves word by word as it crosses the
 * viewport. Originally the only scrubbed text on the site; the client liked
 * it enough that it became the house treatment for body copy (scrubWords in
 * lib/animations), and this section now just uses the shared helper at
 * display scale.
 */
const LINE =
  "Twenty-five years in, our best advertising is still a tidy jobsite and a roof that doesn't leak — one house, one street at a time.";

export default function Statement() {
  const root = useRef(null);

  useEffect(() => {
    /* Same treatment as every paragraph now, tuned slightly wider because
       this line is display-scale. */
    const clean = scrubWords(root.current.querySelector("[data-statement]"), {
      start: "top 80%",
      end: "bottom 55%",
      from: 0.14,
    });
    return clean;
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
