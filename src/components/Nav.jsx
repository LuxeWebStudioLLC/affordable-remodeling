import { useEffect, useRef, useState } from "react";
import { gsap, EASE, scrollToSection } from "../lib/gsap";
import { BUSINESS, NAV_LINKS, SERVICES } from "../data/site";

const LEFT = NAV_LINKS.slice(0, 2);
const RIGHT = NAV_LINKS.slice(2);
const HEADER_OFFSET = 74;

export default function Nav({ ready }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const header = useRef(null);
  const panel = useRef(null);
  const lastY = useRef(0);

  /* Slide the bar in once the preloader is gone. */
  useEffect(() => {
    if (!ready || !header.current) return;
    gsap.fromTo(
      header.current,
      { yPercent: -110, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: EASE, delay: 0.15 },
    );
  }, [ready]);

  /* Keep the intro's end state from being stranded: if anything kills the
     tween early (a scroll landing mid-animation), force the bar visible. */
  useEffect(() => {
    if (!ready || !header.current) return;
    const t = setTimeout(() => gsap.set(header.current, { autoAlpha: 1 }), 1400);
    return () => clearTimeout(t);
  }, [ready]);

  /* Swap to the solid treatment once we leave the hero, and hide the bar
     while scrolling down so the photography gets the full screen. */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > window.innerHeight * 0.75);

      // Don't touch the bar until the intro has played, and only overwrite
      // the property we're animating — `overwrite: true` would kill the
      // intro's autoAlpha mid-flight and leave the bar invisible for good.
      if (!header.current || open || !ready) return;

      const goingDown = y > lastY.current && y > window.innerHeight;
      gsap.to(header.current, {
        yPercent: goingDown ? -110 : 0,
        duration: 0.6,
        ease: EASE,
        overwrite: "auto",
      });
      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open, ready]);

  /* Mobile menu: lock the page and stagger the panel contents in. */
  useEffect(() => {
    if (!panel.current) return;

    if (open) {
      document.body.style.overflow = "hidden";
      const ctx = gsap.context(() => {
        gsap.set(panel.current, { display: "flex" });
        gsap
          .timeline()
          .fromTo(
            panel.current,
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: EASE },
          )
          .from(
            panel.current.querySelectorAll("[data-mi]"),
            { y: 34, autoAlpha: 0, duration: 0.75, ease: EASE, stagger: 0.055 },
            0.2,
          );
      }, panel);
      return () => ctx.revert();
    }

    document.body.style.removeProperty("overflow");
    gsap.to(panel.current, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => gsap.set(panel.current, { display: "none" }),
    });
  }, [open]);

  /* Escape closes the menu. */
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    // Wait a beat on mobile so the panel is out of the way before scrolling.
    setTimeout(() => scrollToSection(href, HEADER_OFFSET), open ? 420 : 0);
  };

  // While the menu is open the bar sits on the dark panel, so it needs the
  // light treatment regardless of scroll position.
  /* The header is dark in every state now — transparent over the hero, ink
     once you scroll past it. The logo is built for a black ground (its glow
     only exists against one), so it must never sit on the cream navbar. */
  const onDark = true;

  const linkClass = `eyebrow link-line transition-colors duration-500 ${
    onDark ? "text-white/80 hover:text-white" : "text-ink/70 hover:text-ink"
  }`;

  return (
    <>
      <header
        ref={header}
        className={`fixed inset-x-0 top-0 opacity-0 transition-[background-color,box-shadow,backdrop-filter] duration-700 ${
          // The header owns a stacking context, so it has to sit above the
          // menu panel for its own close button to be clickable.
          open ? "z-[70] bg-transparent" : "z-50"
        } ${
          !open && solid
            ? "bg-ink/88 shadow-[0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl"
            : !open
              ? "bg-gradient-to-b from-ink/55 to-transparent"
              : ""
        }`}
      >
        <nav className="container-x flex h-[74px] items-center justify-between gap-6">
          {/* Left links (desktop) */}
          <div className="hidden flex-1 items-center gap-9 lg:flex">
            {LEFT.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} className={linkClass}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Logo — centered like the reference, left-aligned on mobile */}
          <a
            href="#top"
            onClick={(e) => go(e, "#top")}
            className="group flex shrink-0 items-center gap-2.5 lg:absolute lg:left-1/2 lg:-translate-x-1/2"
            aria-label={`${BUSINESS.legalName} — home`}
          >
            {/* Horizontal lockup in full brand colour. Their wordmark is dark
                blue, so it only rides along on the light navbar — over the
                hero it would disappear into the photo. The mark carries it. */}
            <img
              src="/logo-icon.png"
              alt={onDark ? BUSINESS.legalName : ""}
              className="h-8 w-auto transition-transform duration-700 group-hover:scale-[1.06] md:h-9"
            />
            {!onDark && (
              <img
                src="/logo-word.png"
                alt={BUSINESS.legalName}
                className="h-[1.05rem] w-auto md:h-[1.15rem]"
              />
            )}
          </a>

          {/* Right links + phone (desktop) */}
          <div className="hidden flex-1 items-center justify-end gap-9 lg:flex">
            {RIGHT.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)} className={linkClass}>
                {l.label}
              </a>
            ))}
            <a href={BUSINESS.phoneHref} className="btn btn-blue !px-6 !py-3 !text-[11px]">
              {BUSINESS.phone}
            </a>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 lg:hidden">
            <a
              href={BUSINESS.phoneHref}
              aria-label={`Call ${BUSINESS.phone}`}
              className={`grid h-10 w-10 place-items-center rounded-full border transition-colors duration-500 ${
                onDark ? "border-white/30 text-white" : "border-ink/15 text-ink"
              }`}
            >
              <PhoneIcon />
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className={`relative z-[70] grid h-10 w-10 place-items-center transition-colors duration-500 ${
                onDark ? "text-white" : "text-ink"
              }`}
            >
              <span className="relative block h-3 w-6">
                <span
                  className={`absolute left-0 block h-[1.5px] w-full bg-current transition-all duration-500 ${
                    open ? "top-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-[1.5px] bg-current transition-all duration-500 ${
                    open ? "top-1/2 w-full -rotate-45" : "top-full w-2/3"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* ---- Fullscreen mobile menu ---- */}
      <div
        ref={panel}
        className="fixed inset-0 z-[60] hidden flex-col bg-ink grain px-6 pb-10 pt-24 lg:hidden"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        <nav className="flex flex-col">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.href}
              data-mi
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="fine-rule flex items-baseline gap-4 py-5 text-cream"
            >
              <span className="eyebrow text-copper-lt">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-accent text-[2.4rem] leading-none font-medium">{l.label}</span>
            </a>
          ))}
        </nav>

        <div data-mi className="mt-8">
          <p className="eyebrow text-cream/35">Services</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {SERVICES.map((s) => (
              <a
                key={s.id}
                href="#services"
                onClick={(e) => go(e, "#services")}
                className="text-[0.8rem] text-cream/55 transition-colors hover:text-blue-lt"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        <div data-mi className="mt-auto pt-10">
          <a href={BUSINESS.phoneHref} className="btn btn-blue w-full">
            Call {BUSINESS.phone}
          </a>
          <a
            href={BUSINESS.emailHref}
            className="mt-3 block text-center text-[0.8rem] text-cream/50 transition-colors hover:text-cream"
          >
            {BUSINESS.email}
          </a>
        </div>
      </div>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 2.5h-.9A2.7 2.7 0 0 0 3 5.4c.3 4 2 7.7 4.8 10.5 2.8 2.8 6.5 4.5 10.5 4.8a2.7 2.7 0 0 0 2.9-2.7v-.9a1.8 1.8 0 0 0-1.4-1.8l-2.5-.6a1.8 1.8 0 0 0-1.8.7l-.6.9a13.2 13.2 0 0 1-5.2-5.2l.9-.6a1.8 1.8 0 0 0 .7-1.8l-.6-2.5a1.8 1.8 0 0 0-1.8-1.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
