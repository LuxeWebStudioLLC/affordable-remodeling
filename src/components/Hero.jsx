import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, EASE, prefersReducedMotion, scrollToSection } from "../lib/gsap";
import { responsive } from "../lib/img";
import { BUSINESS } from "../data/site";

/**
 * Full-bleed hero. The reference site runs video here; until Affordable
 * has footage we use a stills-based Ken Burns push plus a scroll parallax
 * so it still reads as motion rather than a static banner.
 */
export default function Hero({ ready }) {
  const root = useRef(null);
  const media = useRef(null);
  const scrollCue = useRef(null);
  const video = useRef(null);

  /* Video plays on every device, but phones get a lighter encode so the loop
     isn't an expensive download on cellular. The source is chosen once at
     mount and deliberately not re-picked on resize — swapping src would
     restart playback mid-loop. Reduced-motion keeps the still. */
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const small = window.matchMedia("(max-width: 767px)").matches;
    setVideoSrc(small ? "/video/hero-mobile.mp4" : "/video/hero.mp4");
  }, []);

  useEffect(() => {
    if (!videoSrc) return;
    const el = video.current;
    if (!el) return;

    /* iOS only grants muted autoplay when the `muted` ATTRIBUTE is present.
       React sets muted as a DOM *property* and never writes the attribute, so
       Safari refuses to autoplay and paints its own play button over the hero.
       Setting all three forms is what actually unblocks it. */
    el.muted = true;
    el.defaultMuted = true;
    el.setAttribute("muted", "");

    /* Fade in only once it is genuinely PLAYING — not merely loaded. A paused
       inline video gets an iOS play glyph drawn over it, so while it isn't
       playing we keep it fully transparent and let the still show through. */
    const mark = () => setVideoReady(true);
    el.addEventListener("playing", mark);
    if (el.readyState >= 3 && !el.paused) setVideoReady(true);

    let done = false;

    /* If the browser blocks autoplay (Low Power Mode, data saver, strict
       policy) don't give up and strand the still — every browser allows
       playback after a user gesture, and the visitor is about to scroll
       anyway. Retry on the first interaction instead. */
    const gestures = ["touchstart", "pointerdown", "keydown"];
    const onGesture = () => {
      el.play().catch(() => {});
    };
    const addGestureRetry = () => {
      gestures.forEach((g) =>
        document.addEventListener(g, onGesture, { once: true, passive: true }),
      );
    };
    const removeGestureRetry = () => {
      gestures.forEach((g) => document.removeEventListener(g, onGesture));
    };

    const attempt = () => {
      const r = el.play();
      if (!r?.catch) return;
      r.catch(() => {
        if (!done) addGestureRetry();
      });
    };
    attempt();

    /* Backgrounded tabs pause video; resume when the page is visible again. */
    const onVisible = () => {
      if (document.visibilityState === "visible" && el.paused) attempt();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      done = true;
      el.removeEventListener("playing", mark);
      document.removeEventListener("visibilitychange", onVisible);
      removeGestureRetry();
    };
  }, [videoSrc]);

  useEffect(() => {
    if (!ready) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);

      if (prefersReducedMotion()) {
        gsap.set(q("[data-hero]"), { autoAlpha: 1, y: 0 });
        gsap.set(q("[data-hero-frame]"), { clipPath: "inset(0% 0% 0% 0%)" });
      } else {
        const title = root.current.querySelector("[data-hero-title]");
        const split = SplitText.create(title, { type: "lines", mask: "lines" });
        gsap.set(title, { autoAlpha: 1 });

        const tl = gsap.timeline({ delay: 0.1 });

        /* The frame opens outward to full bleed — a curtain parting rather
           than content popping in. */
        tl.fromTo(
          q("[data-hero-frame]"),
          { clipPath: "inset(8% 8% 8% 8%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.9, ease: "expo.inOut" },
          0,
        )
          .from(
            q("[data-hero-mark]"),
            { autoAlpha: 0, y: 26, scale: 0.94, duration: 1.3, ease: EASE },
            0.5,
          )
          .from(
            split.lines,
            { yPercent: 115, duration: 1.25, ease: EASE, stagger: 0.1 },
            0.8,
          )
          .from(
            q("[data-hero-sub]"),
            { autoAlpha: 0, y: 22, duration: 1.1, ease: EASE },
            "-=0.75",
          )
          .from(
            q("[data-hero-cta]"),
            { autoAlpha: 0, y: 24, duration: 0.95, ease: EASE, stagger: 0.1 },
            "-=0.8",
          )
          .from(q("[data-hero-strip]"), { autoAlpha: 0, duration: 1, ease: "power2.out" }, "-=0.7")
          .from(scrollCue.current, { autoAlpha: 0, y: -12, duration: 0.9, ease: EASE }, "-=0.6");

        // Looping nudge on the scroll arrow
        gsap.to(scrollCue.current.querySelector("[data-arrow]"), {
          y: 8,
          duration: 1.1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      /* Parallax + fade as the hero leaves. */
      if (!prefersReducedMotion()) {
        gsap.to(media.current, {
          yPercent: 16,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(q("[data-hero-copy]"), {
          yPercent: -28,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "70% top",
            scrub: true,
          },
        });
      }

      ScrollTrigger.refresh();
    }, root);

    /* Never leave the hero letterboxed: whatever happens to the timeline,
       force the frame fully open once the entrance window has passed. */
    const frameSafety = setTimeout(() => {
      const f = root.current?.querySelector("[data-hero-frame]");
      if (f) gsap.set(f, { clipPath: "inset(0% 0% 0% 0%)" });
    }, 6000);

    return () => {
      clearTimeout(frameSafety);
      ctx.revert();
    };
  }, [ready]);

  return (
    <section
      id="top"
      ref={root}
      className="relative grain flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-ink py-28 sm:py-24"
    >
      {/* ---- Media, inside an opening frame ---- */}
      <div
        data-hero-frame
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ clipPath: "inset(8% 8% 8% 8%)" }}
      >
      <div ref={media} className="absolute inset-0 will-change-transform">
        {/* The still paints instantly and stays underneath as the video's
            poster and fallback, so there is never an empty frame. Ken Burns
            only runs when the video isn't — otherwise two motions fight. */}
        <img
          src="/images/hero-home.jpg"
          {...responsive("/images/hero-home.jpg", "100vw")}
          alt="Remodeled home at dusk with warm lit windows"
          className={`h-[112%] w-full object-cover object-[50%_62%] sm:object-center ${
            ready && !videoSrc ? "kenburns" : ""
          }`}
          fetchPriority="high"
          decoding="async"
        />

        {videoSrc && (
          <video
            ref={video}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            onCanPlay={() => setVideoReady(true)}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              videoReady ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {/* Legibility scrim — vertical for the copy, warm vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/62 to-ink/92" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(11,16,20,0.15)_0%,rgba(11,16,20,0.72)_100%)]" />
      </div>
      </div>

      {/* ---- SEO / positioning strip ---- */}
      <p
        data-hero
        data-hero-strip
        className="container-x absolute top-[86px] left-0 z-10 hidden text-center text-[0.6rem] leading-relaxed tracking-[0.2em] text-white/35 uppercase md:block"
      >
        {BUSINESS.legalName} — La Crosse, Wisconsin remodeling contractor specializing in roofing,
        siding, windows, kitchens, bathrooms, decks and additions for {BUSINESS.yearsInBusiness} years.
      </p>

      {/* ---- Copy ---- */}
      <div data-hero-copy className="container-x relative z-10 flex flex-col items-center text-center">
        {/* Badge and wordmark as ONE asset, cut from the client's artwork.
            They were two separate images nesting by CSS margin, which left
            them reading as pieces floating apart rather than the single
            lockup the artwork is. Shipping the whole thing as one crop means
            the overlap and proportions are the artwork's own and cannot drift
            at any viewport.

            Background removed by flood-filling the page-white inward from the
            edges: connectivity is what tells page-white from the chrome-white
            INSIDE the letterforms, which a brightness threshold would erase.
            The outer glow is then un-matted from white, so it composites over
            the video as light rather than as a pale haze.

            Crop excludes the services list, "Free Estimates" and the phone
            number, as asked. */}
        <img
          data-hero
          data-hero-mark
          src="/logo-lockup.webp"
          alt={BUSINESS.legalName}
          className="h-auto w-[min(84vw,26rem)] sm:w-[min(70vw,30rem)] lg:w-[34rem]"
        />

        <h1
          data-hero
          data-hero-title
          className="mt-6 max-w-4xl text-[clamp(2.5rem,6.2vw,5.4rem)] leading-[1.05] text-white opacity-0 sm:mt-8"
        >
          Remodeling in La Crosse,
          <br />
          <span className="script text-blue-lt">done properly.</span>
        </h1>

        <p
          data-hero
          data-hero-sub
          className="mt-6 max-w-xl text-[0.95rem] leading-[1.8] text-white/70 md:text-[1.05rem]"
        >
          Twenty-five years of roofing, siding, windows and interior work across
          western Wisconsin — one crew, one standard, and a lifetime warranty on
          every roof we lay.
        </p>

        <div className="mt-7 flex w-full flex-col items-center gap-2.5 sm:w-auto sm:flex-row sm:gap-4">
          <a
            data-hero
            data-hero-cta
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("#contact", 74);
            }}
            className="btn btn-blue w-full sm:w-auto"
          >
            Get a free estimate
          </a>
          <a
            data-hero
            data-hero-cta
            href={BUSINESS.phoneHref}
            className="btn btn-outline-light w-full sm:w-auto"
          >
            Call {BUSINESS.phone}
          </a>
        </div>

      </div>

      {/* ---- Scroll cue ---- */}
      <button
        ref={scrollCue}
        type="button"
        onClick={() => scrollToSection("#services", 0)}
        className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 text-center sm:bottom-7 sm:block text-white/55 transition-colors duration-500 hover:text-white"
        aria-label="Scroll to services"
      >
        <span className="eyebrow block">Scroll</span>
        <svg
          data-arrow
          className="mx-auto mt-2"
          width="14"
          height="22"
          viewBox="0 0 14 22"
          fill="none"
          aria-hidden="true"
        >
          <path d="M7 0v19M1 13l6 6 6-6" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
    </section>
  );
}
