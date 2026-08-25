import { useEffect, useRef } from "react";
import { gsap, EASE, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { revealUp } from "../lib/animations";
import { BUSINESS, SERVICE_AREA } from "../data/site";
import SectionHeading from "./SectionHeading";

/**
 * Hand-drawn service-area map. No map tiles, no Google — concentric distance
 * rings centred on La Crosse with real towns plotted by bearing and distance,
 * drawn like a plate from a county atlas: the Mississippi running through it,
 * cardinal points, ring distances in serif italic, a figure caption.
 *
 * Deliberately NOT an instrument. An earlier version had a rotating radar
 * sweep, pulsing pings, a crosshair and a 72-tick bezel, which read as
 * surveillance equipment rather than cartography. Those are gone; what is
 * left is a drawing.
 *
 * Every town is labelled, at every screen size. Labels are laid out with a
 * vertical de-collision pass and leader lines, because a name you cannot read
 * is the same as a town that is not on the map.
 *
 * Everything animates once on entry (no scrub) so it stays smooth.
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

/**
 * Plot every town, then push labels apart vertically so all 17 names are
 * readable. Each side of the map is de-collided independently; a label that
 * had to move gets a leader line back to its dot.
 */
const LABELS = (() => {
  const MIN_GAP = 17;
  /* Keep every label clear of the "La Crosse" text sitting under the centre. */
  const CLEAR_R = 66;
  const sides = { east: [], west: [] };

  SERVICE_AREA.towns.forEach((t) => {
    const p = plot(t.bearing, t.miles);
    const east = p.x >= C;
    const fromCentre = Math.hypot(p.x - C, p.y - C);
    sides[east ? "east" : "west"].push({
      ...t,
      x: p.x,
      y: p.y,
      /* Close-in towns get their label pushed outward; a leader line keeps it
         attached to the dot. */
      lx: fromCentre < CLEAR_R ? C + (east ? CLEAR_R : -CLEAR_R) : p.x,
      ly: p.y,
    });
  });

  Object.values(sides).forEach((side) => {
    side.sort((a, b) => a.ly - b.ly);
    for (let i = 1; i < side.length; i += 1) {
      const gap = side[i].ly - side[i - 1].ly;
      if (gap < MIN_GAP) side[i].ly = side[i - 1].ly + MIN_GAP;
    }
    /* If the stack ran off the bottom, lift the whole column back inside. */
    const overflow = side[side.length - 1].ly - (SIZE - 10);
    if (overflow > 0) side.forEach((t) => (t.ly -= overflow));
  });

  return [...sides.east, ...sides.west];
})();

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
      const dots = el.querySelectorAll("[data-dot]");
      const leaders = el.querySelectorAll("[data-leader]");
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
      });

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

      tl.from(dots, { attr: { r: 0 }, opacity: 0, duration: 0.7, stagger: 0.03 }, 0.9)
        .from(leaders, { opacity: 0, duration: 0.6, stagger: 0.02 }, 1.1)
        .from(labels, { opacity: 0, duration: 0.8, stagger: 0.025 }, 1.15);


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

        {/* ---- The map ---- */}
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
            </defs>

            <circle data-ring cx={C} cy={C} r={MAX_R} fill="url(#sa-glow)" stroke="none" />

            {/* cardinal points, set in the serif like a compass card */}
            {CARDINALS.map((c) => (
              <text
                key={c.label}
                data-cardinal
                x={c.x} y={c.y}
                textAnchor="middle"
                className="fill-cream/40"
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

            {/* towns — every one named, labels de-collided, leader lines where
                a label had to move off its dot */}
            {LABELS.map((t) => {
              const east = t.x >= C;
              const lx = t.lx + (east ? 11 : -11);
              const moved = Math.abs(t.ly - t.y) > 2.5 || Math.abs(t.lx - t.x) > 2.5;
              return (
                <g key={t.name}>
                  {moved && (
                    <line
                      data-leader
                      x1={t.x + (east ? 4.5 : -4.5)}
                      y1={t.y}
                      x2={lx - (east ? 2 : -2)}
                      y2={t.ly - 3}
                      stroke="rgba(247,244,238,0.2)"
                      strokeWidth="0.75"
                    />
                  )}
                  <circle
                    data-dot
                    cx={t.x} cy={t.y}
                    r={t.major ? 3.6 : 2.6}
                    className={t.major ? "fill-blue-lt" : "fill-blue-lt/70"}
                  />
                  <text
                    data-town-label
                    x={lx}
                    y={t.ly}
                    textAnchor={east ? "start" : "end"}
                    className={t.major ? "fill-cream/80" : "fill-cream/55"}
                    style={{
                      fontSize: t.major ? 12.5 : 11.5,
                      fontWeight: t.major ? 500 : 400,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {t.name}
                  </text>
                </g>
              );
            })}

            {/* La Crosse — the centre. Copper, and the only name set in the
                serif, so it reads as the origin without needing a label like
                "HQ" bolted on. */}
            <circle data-dot cx={C} cy={C} r="5.5" className="fill-copper" />
            <text
              data-town-label
              x={C} y={C + 26}
              textAnchor="middle"
              className="fill-cream"
              style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 17, fontWeight: 600, fontStyle: "italic" }}
            >
              La Crosse
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
