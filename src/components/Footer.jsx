import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { revealHeadline, revealUp } from "../lib/animations";
import { BUSINESS, NAV_LINKS, SERVICES } from "../data/site";

export default function Footer() {
  const root = useRef(null);
  const bigMark = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealHeadline(root.current.querySelector("[data-cta-h]"), { start: "top 88%" });
      revealUp(root.current.querySelectorAll("[data-f]"), { start: "top 94%", y: 22, stagger: 0.05 });

      /* Oversized wordmark drifts up as the footer arrives. */
      if (!prefersReducedMotion() && bigMark.current) {
        gsap.fromTo(
          bigMark.current,
          { yPercent: 26, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: bigMark.current,
              start: "top 96%",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );
      }

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={root} className="relative grain overflow-hidden bg-ink text-cream">
      {/* ---- Closing CTA ---- */}
      <div className="container-x border-b border-white/10 py-20 text-center md:py-28">
        <p data-f className="eyebrow text-blue-lt">
          {BUSINESS.tagline}
        </p>
        <h2
          data-cta-h
          className="mx-auto mt-6 max-w-5xl text-[clamp(2.5rem,8vw,6.4rem)] opacity-0"
        >
          Let's make your house
          <span className="script block text-blue-lt">feel new again.</span>
        </h2>

        <div data-f className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#contact", 74);
            }}
            className="btn btn-blue w-full sm:w-auto"
          >
            Get a free estimate
          </a>
          <a href={BUSINESS.phoneHref} className="btn btn-outline-light w-full sm:w-auto">
            Call {BUSINESS.phone}
          </a>
        </div>
      </div>

      {/* ---- Columns ---- */}
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div data-f className="lg:col-span-1">
          {/* Mark in full colour; the name is set in type beside it because
              their dark-blue wordmark is unreadable on this background. */}
          <div className="flex items-center gap-3.5">
            <img src="/logo-icon.png" alt="" className="h-12 w-auto md:h-14" />
            <p className="font-display text-[0.82rem] leading-[1.25] tracking-[0.06em] text-cream md:text-[0.9rem]">
              Affordable
              <br />
              <span className="text-blue-lt">Remodeling</span>
            </p>
          </div>
          <p className="mt-6 max-w-xs text-[0.85rem] leading-[1.8] text-cream/55">
            Family owned and operated for over twenty-five years. Roofing, siding, windows, kitchens,
            baths, decks and additions across western Wisconsin.
          </p>
          <div className="mt-6 flex gap-2.5">
            <Social href={BUSINESS.social.facebook} label="Facebook">
              <path d="M13.5 8.5V6.9c0-.7.2-1.1 1.2-1.1h1.3V3.1h-2.1c-2.6 0-3.5 1.2-3.5 3.3v2.1H8.6v2.7h1.8V19h3.1v-7.8h2.1l.3-2.7h-2.4Z" />
            </Social>
            <Social href={BUSINESS.social.instagram} label="Instagram">
              <path d="M11 4.6c2.1 0 2.3 0 3.1.05.8.04 1.2.17 1.5.29.4.15.7.34 1 .64.3.3.5.6.64 1 .12.3.25.7.29 1.5.04.8.05 1 .05 3.1s0 2.3-.05 3.1c-.04.8-.17 1.2-.29 1.5-.15.4-.34.7-.64 1-.3.3-.6.5-1 .64-.3.12-.7.25-1.5.29-.8.04-1 .05-3.1.05s-2.3 0-3.1-.05c-.8-.04-1.2-.17-1.5-.29a2.7 2.7 0 0 1-1-.64 2.7 2.7 0 0 1-.64-1c-.12-.3-.25-.7-.29-1.5C4.6 13.3 4.6 13.1 4.6 11s0-2.3.05-3.1c.04-.8.17-1.2.29-1.5.15-.4.34-.7.64-1 .3-.3.6-.5 1-.64.3-.12.7-.25 1.5-.29C8.7 4.6 8.9 4.6 11 4.6Zm0 3.1a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Zm0 5.45a2.15 2.15 0 1 1 0-4.3 2.15 2.15 0 0 1 0 4.3Zm4.2-5.58a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0Z" />
            </Social>
          </div>
        </div>

        <nav data-f aria-label="Sections">
          <p className="eyebrow text-cream/35">Explore</p>
          <ul className="mt-5 space-y-3">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(l.href, 74);
                  }}
                  className="link-line text-[0.85rem] text-cream/60 transition-colors duration-500 hover:text-cream"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav data-f aria-label="Services">
          <p className="eyebrow text-cream/35">Services</p>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("#services", 74);
                  }}
                  className="link-line text-[0.85rem] text-cream/60 transition-colors duration-500 hover:text-cream"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-f>
          <p className="eyebrow text-cream/35">Get in touch</p>
          <ul className="mt-5 space-y-4 text-[0.85rem]">
            <li>
              <a
                href={BUSINESS.phoneHref}
                className="font-display text-[1.05rem] text-cream transition-colors duration-500 hover:text-blue-lt"
              >
                {BUSINESS.phone}
              </a>
            </li>
            <li>
              <a
                href={BUSINESS.emailHref}
                className="break-all text-cream/60 transition-colors duration-500 hover:text-cream"
              >
                {BUSINESS.email}
              </a>
            </li>
            <li className="text-cream/55">{BUSINESS.serviceArea}</li>
            <li>
              <a
                href={BUSINESS.booking}
                target="_blank"
                rel="noreferrer"
                className="link-line text-blue-lt"
              >
                Book online →
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ---- Oversized wordmark ---- */}
      <div ref={bigMark} className="container-x pointer-events-none pb-6 opacity-0 select-none">
        <p className="script text-center text-[clamp(2.2rem,11.4vw,10rem)] leading-[0.85] whitespace-nowrap text-cream/[0.07]">
          Affordable
        </p>
      </div>

      {/* ---- Legal ---- */}
      <div className="container-x flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-[0.7rem] text-cream/35 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.
        </p>
        <p>
          {BUSINESS.city}, {BUSINESS.state} · Licensed &amp; insured
        </p>
      </div>
    </footer>
  );
}

function Social({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center border border-white/15 text-cream/70 transition-all duration-500 hover:border-blue hover:bg-blue hover:text-white"
    >
      <svg width="20" height="20" viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">
        {children}
      </svg>
    </a>
  );
}
