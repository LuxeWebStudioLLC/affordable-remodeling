import { useEffect, useRef } from "react";
import { gsap, EASE, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { revealUp } from "../lib/animations";
import { BUSINESS, SERVICE_AREA } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * Hand-drawn service-area instrument. No map tiles, no Google — concentric
 * distance rings centred on La Crosse with real towns plotted by bearing and
 * distance, drawn like a plate from an old county atlas: the Mississippi
 * running through it, cardinal points on the bezel, ring distances in serif
 * italic, and a figure caption underneath. Everything animates once on entry
 * (no scrub, transforms/attributes only) so it stays smooth.
 */

const SIZE = 600;                    // viewBox
const C = SIZE / 2;                  // centre
const MAX_R = 250;                   // px radius of the outer (50 mi) ring
const PX_PER_MILE = MAX_R / SERVICE_AREA.radiusMiles;

const rad = (deg) => ((deg - 90) * Math.PI) / 180;
const plot = (bearing, miles) => ({
  x: C + Math.cos(rad(bearing)) * miles * PX_PER_MILE,
  y: C + Math.sin(rad(bearing)) * miles * PX_PER_MILE,
});

/** 72 short ticks around the outer ring, like a bezel. */
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = rad(i * 5);
  const r1 = MAX_R + 6;
  const r2 = i % 18 === 0 ? MAX_R + 18 : MAX_R + 11;
  return {
    x1: C + Math.cos(a) * r1,
    y1: C + Math.sin(a) * r1,
    x2: C + Math.cos(a) * r2,
    y2: C + Math.sin(a) * r2,
    major: i % 18 === 0,
  };
});

/** Cardinal letters sit just past the major ticks. */
const CARDINALS = [
  { label: "N", bearing: 0 },
  { label: "E", bearing: 90 },
  { label: "S", bearing: 180 },
  { label: "W", bearing: 270 },
].map((c) => {
  const a = rad(c.bearing);
  const r = MAX_R + 34;
  return { ...c, x: C + Math.cos(a) * r, y: C + Math.sin(a) * r + 4 };
});

/* The Mississippi, as a lazy meander entering NNW and leaving SSE — it runs
   right past downtown La Crosse, slightly to the west. Purely illustrative,
   like everything else on the plate, but it anchors the drawing to the real
   geography at a glance. */
const RIVER_D = `M 183 60
  C 225 140, 262 200, 282 265
  S 284 350, 296 415
  S 300 505, 312 552`;

export default function ServiceArea() {
  const root = useRef(null);
  const svg = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealUp(root.current.querySelectorAll("[data-map]"), {
        start: "top 85%",
        y: 30,
        stagger: 0.1,
      });

      const el = svg.current;
      if (!el) return;

      if (prefersReducedMotion()) return; // static map is complete on its own

      const rings = el.querySelectorAll("[data-ring]");
      const ticks = el.querySelectorAll("[data-tick]");
      const dots = el.querySelectorAll("[data-dot]");
      const labels = el.querySelectorAll("[data-town-label], [data-ring-label], [data-cardinal]");
      const river = el.querySelector("[data-river]");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
        defaults: { ease: EASE },
      });

      tl.from(rings, {
        scale: 0.5,
        opacity: 0,
        svgOrigin: `${C} ${C}`,
        duration: 1.5,
        stagger: 0.14,
      })
        .from(ticks, { opacity: 0, duration: 0.5, stagger: 0.008 }, 0.3);

      /* The river draws itself in, source to mouth. */
      if (river) {
        const len = river.getTotalLength();
        tl.fromTo(
          river,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" },
          0.5,
        );
      }

      tl.from(
        dots,
        { attr: { r: 0 }, opacity: 0, duration: 0.7, stagger: 0.045 },
        0.9,
      ).from(labels, { opacity: 0, duration: 0.8, stagger: 0.03 }, 1.2);

      /* Radar ping on HQ — slow, quiet, forever. */
      el.querySelectorAll("[data-ping]").forEach((ping, i) => {
        gsap.fromTo(
          ping,
          { attr: { r: 8 }, opacity: 0.45 },
          {
            attr: { r: 52 },
            opacity: 0,
            duration: 3.2,
            delay: 1.4 + i * 1.6,
            repeat: -1,
            repeatDelay: (2 - 1) * 1.6,
            ease: "power1.out",
          },
        );
      });

      /* A very slow sweep hand, barely-there. */
      gsap.to(el.querySelector("[data-sweep]"), {
        rotation: 360,
        svgOrigin: `${C} ${C}`,
        duration: 48,
        repeat: -1,
        ease: "none",
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="service-area" ref={root} className="relative grain overflow-hidden bg-ink py-24 md:py-32 lg:py-40">
      <div className="container-x grid items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        {/* ---- Copy ---- */}
        <div data-map>
          <SectionHeading
            eyebrow="Where we work"
            line1="Fifty miles out."
            line2="Both sides of the river."
            tone="light"
            body={`${BUSINESS.serviceArea}. Wisconsin or Minnesota, town or township — if you're inside the ring, the estimate is free and we'll come walk it.`}
          />

          <div className="mt-9">
            <p className="eyebrow text-cream/35">Counties inside the radius</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SERVICE_AREA.counties.map((c) => (
                <li
                  key={c}
                  className="border border-white/12 px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.1em] text-cream/65 uppercase"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#contact", 74);
              }}
              className="btn btn-blue"
            >
              Check your address
            </a>
            <a href={BUSINESS.phoneHref} className="link-line text-[0.85rem] text-cream/60">
              or just call — we'll tell you straight
            </a>
          </div>

          <p className="mt-8 max-w-md text-[0.7rem] leading-relaxed text-cream/35">
            Map is illustrative and distances are approximate. On the edge of the ring? Call anyway
            — we've been known to drive a little farther for the right project.
          </p>
        </div>

        {/* ---- Instrument ---- */}
        <div data-map className="relative mx-auto w-full max-w-[560px]">
          <svg
            ref={svg}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="h-auto w-full select-none"
            role="img"
            aria-label={`Service area map: ${SERVICE_AREA.radiusMiles} miles around La Crosse, covering towns on both sides of the Mississippi.`}
          >
            <defs>
              {/* A whisper of atmosphere so the plate sits IN the page rather
                  than on it. */}
              <radialGradient id="sa-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(10,106,166,0.14)" />
                <stop offset="55%" stopColor="rgba(10,106,166,0.05)" />
                <stop offset="100%" stopColor="rgba(10,106,166,0)" />
              </radialGradient>
              {/* Invisible path the river's label rides along. */}
              <path id="sa-river-label" d="M 236 250 C 258 300, 262 340, 280 405" fill="none" />
            </defs>

            <circle data-ring cx={C} cy={C} r={MAX_R} fill="url(#sa-glow)" stroke="none" />

            {/* bezel ticks */}
            {TICKS.map((t, i) => (
              <line
                key={i}
                data-tick
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={t.major ? "rgba(247,244,238,0.35)" : "rgba(247,244,238,0.14)"}
                strokeWidth={t.major ? 1.5 : 1}
              />
            ))}

            {/* cardinal points, set in the serif like a compass card */}
            {CARDINALS.map((c) => (
              <text
                key={c.label}
                data-cardinal
                x={c.x} y={c.y}
                textAnchor="middle"
                className="fill-cream/45"
                style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 15, fontStyle: "italic", fontWeight: 500 }}
              >
                {c.label}
              </text>
            ))}

            {/* distance rings */}
            {SERVICE_AREA.rings.map((mi) => (
              <g key={mi}>
                <circle
                  data-ring
                  cx={C} cy={C} r={mi * PX_PER_MILE}
                  fill="none"
                  stroke="rgba(247,244,238,0.13)"
                  strokeWidth="1"
                  strokeDasharray={mi === SERVICE_AREA.radiusMiles ? "none" : "2 7"}
                />
                <text
                  data-ring-label
                  x={C - mi * PX_PER_MILE + 6} y={C - 9}
                  textAnchor="start"
                  className="fill-cream/40"
                  style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 13, fontStyle: "italic", fontWeight: 500, letterSpacing: "0.04em" }}
                >
                  {mi} mi
                </text>
              </g>
            ))}

            {/* the Mississippi */}
            <path
              data-river
              d={RIVER_D}
              fill="none"
              stroke="rgba(85,163,214,0.28)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <text
              data-ring-label
              className="fill-cream/30"
              style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 11.5, fontStyle: "italic", letterSpacing: "0.14em" }}
            >
              <textPath href="#sa-river-label" startOffset="8%">
                Mississippi River
              </textPath>
            </text>

            {/* crosshair */}
            <line data-tick x1={C - 14} y1={C} x2={C + 14} y2={C} stroke="rgba(247,244,238,0.25)" strokeWidth="1" />
            <line data-tick x1={C} y1={C - 14} x2={C} y2={C + 14} stroke="rgba(247,244,238,0.25)" strokeWidth="1" />

            {/* sweep hand */}
            <line
              data-sweep
              x1={C} y1={C} x2={C} y2={C - MAX_R}
              stroke="rgba(85,163,214,0.10)"
              strokeWidth="2"
            />

            {/* towns */}
            {SERVICE_AREA.towns.map((t) => {
              const p = plot(t.bearing, t.miles);
              const east = p.x >= C;
              const labelled = t.miles >= 14;
              return (
                <g key={t.name}>
                  {t.major && (
                    <circle
                      data-dot
                      cx={p.x} cy={p.y} r="7.5"
                      fill="none"
                      stroke="rgba(85,163,214,0.35)"
                      strokeWidth="1"
                    />
                  )}
                  <circle data-dot cx={p.x} cy={p.y} r="3.4" className="fill-blue-lt" opacity="0.9" />
                  {labelled && (
                    <text
                      data-town-label
                      x={p.x + (east ? 12 : -12)}
                      y={p.y + 4}
                      textAnchor={east ? "start" : "end"}
                      className={t.major ? "fill-cream/75" : "hidden fill-cream/45 md:inline"}
                      style={{ fontSize: 12.5, letterSpacing: "0.02em" }}
                    >
                      {t.name}
                    </text>
                  )}
                </g>
              );
            })}

            {/* HQ */}
            <circle data-ping cx={C} cy={C} r="8" fill="none" stroke="rgba(208,138,70,0.8)" strokeWidth="1.5" />
            <circle data-ping cx={C} cy={C} r="8" fill="none" stroke="rgba(208,138,70,0.8)" strokeWidth="1.5" />
            <circle data-dot cx={C} cy={C} r="6" className="fill-copper" />
            <text
              data-town-label
              x={C} y={C + 27}
              textAnchor="middle"
              className="fill-cream"
              style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em" }}
            >
              LA CROSSE — HQ
            </text>
          </svg>

          {/* Figure caption, like a plate in a printed atlas. */}
          <div data-map className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-4">
            <p className="text-[0.68rem] tracking-[0.18em] text-cream/35 uppercase">
              Fig. 01 — Service radius
            </p>
            <p
              className="text-[0.8rem] text-cream/45"
              style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic" }}
            >
              surveyed from La Crosse, Wis.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
