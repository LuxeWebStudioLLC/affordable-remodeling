import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "../data/site";

/**
 * Makes every `tel:` link on the page behave sensibly on every device.
 *
 * A tel: link is a request to the OS to open a phone app — it is not a
 * navigation. On a phone that dials. On a desktop with no dialer registered
 * the click resolves to nothing at all, which reads as a broken button.
 *
 * So: phones keep the native dial (we don't touch the event), and desktops
 * get the number copied to the clipboard with visible confirmation, plus the
 * option to still hand off to a dialer if one exists (FaceTime, Skype, Teams).
 *
 * One delegated listener covers all nine tel: links on the site, so no
 * component needs to know about any of this.
 */
export default function CallHandler() {
  const [toast, setToast] = useState(null); // { copied: boolean }
  const timer = useRef(null);

  useEffect(() => {
    /* Phones and tablets dial natively — never intercept those. */
    const canDial = () =>
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

    const copy = async (text) => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch {
        /* fall through to the legacy path below */
      }
      // Fallback for non-secure contexts / older browsers.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    };

    const onClick = async (e) => {
      // Respect modifier-clicks and anything already handled.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target instanceof Element ? e.target.closest('a[href^="tel:"]') : null;
      if (!link) return;

      // The toast's own escape hatch must reach the OS untouched. An explicit
      // opt-out is safer here than relying on stopPropagation ordering between
      // React's root listener and this document-level one.
      if (link.hasAttribute("data-native-tel")) return;

      if (canDial()) return; // let the phone do its thing

      e.preventDefault();
      const copied = await copy(BUSINESS.phone);
      setToast({ copied });

      clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 4200);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 bottom-6 z-[90] flex justify-center px-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {toast && (
        <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3 border border-white/12 bg-ink/95 p-4 text-cream shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue/20 text-blue-lt">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6.6 2.5h-.9A2.7 2.7 0 0 0 3 5.4c.3 4 2 7.7 4.8 10.5 2.8 2.8 6.5 4.5 10.5 4.8a2.7 2.7 0 0 0 2.9-2.7v-.9a1.8 1.8 0 0 0-1.4-1.8l-2.5-.6a1.8 1.8 0 0 0-1.8.7l-.6.9a13.2 13.2 0 0 1-5.2-5.2l.9-.6a1.8 1.8 0 0 0 .7-1.8l-.6-2.5a1.8 1.8 0 0 0-1.8-1.4Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <p className="min-w-0 flex-1 text-[0.82rem] leading-snug">
            <span className="font-display block text-[0.95rem] tracking-[0.02em] text-cream">
              {BUSINESS.phone}
            </span>
            <span className="text-cream/55">
              {toast.copied
                ? "Copied — paste it into your phone, or call from a mobile device."
                : "Call us at this number, or open the site on your phone to dial."}
            </span>
          </p>

          <a
            href={BUSINESS.phoneHref}
            data-native-tel
            className="shrink-0 border border-white/25 px-3.5 py-2 text-[0.62rem] font-bold tracking-[0.16em] text-cream uppercase transition-colors duration-400 hover:border-blue-lt hover:text-blue-lt"
          >
            Try dialer
          </a>
        </div>
      )}
    </div>
  );
}
