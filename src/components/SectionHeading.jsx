import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { revealHeadline, revealUp, revealRule } from "../lib/animations";

/**
 * The template's signature heading: small tracked eyebrow, a bold caps
 * line, then an italic serif line in the accent color underneath.
 *
 * `accent` picks which brand hue that script line and its eyebrow take.
 * Blue is the default and carries every section; copper exists as an
 * override but is reserved for small details elsewhere on the page.
 */
export default function SectionHeading({
  eyebrow,
  line1,
  line2,
  body,
  align = "left",
  tone = "dark", // "dark" = ink type on cream, "light" = cream type on ink
  accent = "blue", // "blue" | "copper"
  action,
  className = "",
}) {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealRule(root.current.querySelectorAll("[data-rule]"));
      revealUp(root.current.querySelectorAll("[data-eyebrow]"), { y: 18, duration: 0.8 });
      revealHeadline(root.current.querySelector("[data-h]"));
      revealUp(root.current.querySelectorAll("[data-body], [data-action]"), {
        start: "top 90%",
        y: 24,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const isLight = tone === "light";
  const isBlue = accent === "blue";
  const alignCls =
    align === "center" ? "items-center text-center" : "items-start text-left";

  // Lightened variants on dark grounds, full-strength on cream.
  const accentText = isBlue
    ? isLight
      ? "text-blue-lt"
      : "text-blue"
    : isLight
      ? "text-copper-lt"
      : "text-copper";
  const accentBg = isBlue
    ? isLight
      ? "bg-blue-lt"
      : "bg-blue"
    : isLight
      ? "bg-copper-lt"
      : "bg-copper";

  return (
    <div ref={root} className={`flex flex-col ${alignCls} ${className}`}>
      <div className="flex items-center gap-4">
        {align !== "center" && (
          <span
            data-rule
            className={`hidden h-px w-10 origin-left scale-x-0 md:block ${accentBg}`}
          />
        )}
        <p data-eyebrow className={`eyebrow ${accentText}`}>
          {eyebrow}
        </p>
      </div>

      <h2
        data-h
        className={`mt-5 text-[clamp(2.1rem,6.4vw,4.6rem)] opacity-0 ${
          isLight ? "text-cream" : "text-ink"
        }`}
      >
        {line1}
        {line2 && (
          <>
            <br />
            <span className={`script ${accentText}`}>{line2}</span>
          </>
        )}
      </h2>

      {body && (
        <p
          data-body
          className={`mt-6 max-w-xl text-[0.95rem] leading-[1.75] ${
            isLight ? "text-cream/70" : "text-ink/65"
          }`}
        >
          {body}
        </p>
      )}

      {action && (
        <div data-action className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
}
