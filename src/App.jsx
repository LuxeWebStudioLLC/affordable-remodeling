import { useCallback, useEffect, useState } from "react";
import { gsap, ScrollSmoother, ScrollTrigger, prefersReducedMotion } from "./lib/gsap";
import { refreshWhenReady, installRevealFailsafe, initMagnetic } from "./lib/animations";

import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import ScrollProgress from "./components/ScrollProgress";
import CallHandler from "./components/CallHandler";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Services from "./components/Services";
import Work from "./components/Work";
import Statement from "./components/Statement";
import Transformation from "./components/Transformation";
import Approach from "./components/Approach";
import About from "./components/About";
import Reviews from "./components/Reviews";
import ServiceArea from "./components/ServiceArea";
import Financing from "./components/Financing";
import Contact from "./components/Contact";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import Debug from "./components/Debug";
import QuotePopup from "./components/QuotePopup";

export default function App() {
  const [ready, setReady] = useState(false);
  const onLoaded = useCallback(() => setReady(true), []);

  /* ScrollSmoother owns the scroll on pointer devices. Touch keeps native
     scrolling so mobile momentum stays exactly as the OS intends. */
  useEffect(() => {
    // ?nosmooth=1 falls back to native scrolling — handy for debugging and
    // for anyone who finds momentum scrolling uncomfortable.
    const noSmooth = new URLSearchParams(window.location.search).has("nosmooth");

    if (prefersReducedMotion() || noSmooth) {
      refreshWhenReady();
      return;
    }

    const ctx = gsap.context(() => {
      ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.1,
        smoothTouch: 0,
        effects: true,
        normalizeScroll: false,
        ignoreMobileResize: true,
      });
    });

    refreshWhenReady();

    return () => ctx.revert();
  }, []);

  /* Content must never be permanently trapped behind an animation. */
  useEffect(() => installRevealFailsafe(), []);

  /* Primary buttons lean gently toward the cursor (desktop only). */
  useEffect(() => {
    let cleanup;
    const t = setTimeout(() => {
      cleanup = initMagnetic(".btn");
    }, 1200);
    return () => {
      clearTimeout(t);
      cleanup?.();
    };
  }, []);

  /* Keep triggers honest when the viewport changes size. */
  useEffect(() => {
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", onResize);
    return () => window.removeEventListener("orientationchange", onResize);
  }, []);

  return (
    <>
      <a
        href="#services"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[120] focus:bg-ink focus:px-4 focus:py-2 focus:text-cream"
      >
        Skip to content
      </a>

      {new URLSearchParams(window.location.search).has("debug") && <Debug />}
      <QuotePopup />
      <Preloader onDone={onLoaded} />
      <ScrollProgress />
      <CallHandler />
      <Nav ready={ready} />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main>
            <Hero ready={ready} />
            <Marquee />
            <Services />
            <Work />
            <Statement />
            <Transformation />
            <Approach />
            <About />
            <Reviews />
            <ServiceArea />
            <Financing />
            <Contact />
            <Faq />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
