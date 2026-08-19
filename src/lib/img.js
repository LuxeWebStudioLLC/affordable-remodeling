/**
 * Responsive image helper.
 *
 * Every photo listed here has an 800px-wide companion in public/images
 * (`name-800.jpg`), generated at build-prep time. Phones pick the small one,
 * which cuts roughly 2 MB off a full mobile load and — the reason this exists —
 * shrinks the decode and memory cost of the six photos that ride the pinned
 * horizontal strip, where every dropped frame is visible.
 *
 * Values are the true intrinsic widths of the full-size files; the browser
 * needs them accurate to choose correctly. Photos already under ~900px wide
 * are absent on purpose: they'd gain nothing and a srcset pointing at a
 * missing file is worse than no srcset.
 */
const FULL_WIDTHS = {
  "cta-dusk.jpg": 2000,
  "hero-home.jpg": 2400,
  "job-after.jpg": 1206,
  "job-before.jpg": 1206,
  "job-exterior-cape.jpg": 1170,
  "job-kitchen.jpg": 1125,
  "job-shower.jpg": 1180,
  "job-sunroom.jpg": 1176,
};

/**
 * Spread onto an <img>. Returns `{}` for photos without a variant, so callers
 * can apply it unconditionally and keep their own `src` as the fallback.
 *
 *   <img src={w.src} {...responsive(w.src, "64vw")} />
 */
export function responsive(src, sizes) {
  const full = FULL_WIDTHS[src.split("/").pop()];
  if (!full) return {};
  return {
    srcSet: `${src.replace(/\.jpg$/, "-800.jpg")} 800w, ${src} ${full}w`,
    ...(sizes ? { sizes } : {}),
  };
}
