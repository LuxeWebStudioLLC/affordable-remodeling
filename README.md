# Affordable Home Remodeling — website

A new marketing site for **Affordable Home Remodeling Corp.** (La Crosse, WI), built to the
structure and visual language of [axelslandscapingdesign.com](https://axelslandscapingdesign.com)
and extended with a multi-step estimate request form, a filterable project gallery, and a
draggable before/after comparison.

Stack: **React 19 + Vite 8 + Tailwind CSS 4 + GSAP 3.15** (ScrollTrigger, ScrollSmoother,
SplitText, Draggable).

---

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build && npm run preview
```

Useful URL flag: append `?nosmooth=1` to disable ScrollSmoother and fall back to native
scrolling. Handy for debugging, and it mirrors what visitors with
`prefers-reduced-motion: reduce` get automatically.

---

## Deploy (GitHub → Vercel)

The site is a fully static Vite build — **no environment variables are
required** to build or run it. `vercel.json` pins the framework, build
command, output directory, long-cache headers for hashed assets, and basic
security headers.

### 1. Push to GitHub

The repo root is this `site/` folder. From here:

```bash
git remote add origin https://github.com/YOUR_USERNAME/affordable-remodeling.git
git push -u origin main
```

(Create the empty repo on github.com first — no README/license, since this
repo already has them.)

### 2. Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** the GitHub repo
2. Vercel auto-detects Vite; `vercel.json` confirms build (`npm run build`)
   and output (`dist`) — accept the defaults
3. Deploy. Every push to `main` redeploys automatically.

### 3. Point the real domain

In Vercel → Project → **Settings → Domains**, add
`affordableremodelingwi.com` and follow the DNS instructions. The canonical
URL, Open Graph tags and JSON-LD in `index.html` already reference that
domain.

### Environment variables

None required today. `.env.example` documents the one reserved for later:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_FORMSPREE_ID` | no (not yet wired) | Formspree form ID once the contact form sends real email |

Set future variables in Vercel → Project → **Settings → Environment
Variables**, never in committed files. Vite only exposes `VITE_`-prefixed
variables to the browser bundle — anything secret must not use that prefix
or live in this repo at all.

---

## Where to edit content

**Everything textual lives in one file: [`src/data/site.js`](src/data/site.js).** Phone, email,
service descriptions, gallery captions, FAQs, form dropdown options, and stats are all there. No
copy is hardcoded into components.

| What | Where |
| --- | --- |
| Phone / email / service area | `BUSINESS` |
| The ten services + descriptions | `SERVICES` |
| Gallery images and category labels | `WORK` |
| "Why hire us" cards | `WHY_US` |
| Stats strip | `STATS` |
| FAQ questions | `FAQS` |
| Form dropdown options | `PROJECT_TYPES`, `BUDGETS`, `TIMELINES` |
| Customer reviews | `REVIEWS` — **currently empty, see below** |

---

## Three things to do before launch

### 1. Wire the contact form to a real inbox

The form validates fully and shows a success state, but **it does not send anything yet** — the
submit handler is a simulated delay. In
[`src/components/Contact.jsx`](src/components/Contact.jsx), find the `submit` function and replace
the placeholder with a real request. With [Formspree](https://formspree.io) that is:

```js
const res = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify(data),
});
if (!res.ok) throw new Error("send failed");
setStatus("sent");
```

Wrap it in `try/catch` and `setStatus("error")` on failure so a dropped submission is not silently
lost. Netlify Forms, Basin, or a small serverless function work the same way.

### 2. Add real reviews

`REVIEWS` in `site.js` is deliberately an empty array. The current site publishes no
testimonials, so rather than invent quotes and attribute them to made-up homeowners, the reviews
section falls back to a **credentials panel** built only from verifiable facts (family owned,
25+ years, lifetime roofing warranty, 50-mile radius).

Paste real Google or Facebook reviews in and the full scrolling testimonial layout — already
written in [`src/components/Reviews.jsx`](src/components/Reviews.jsx) — switches on automatically:

```js
export const REVIEWS = [
  { quote: "…", name: "First Last", source: "Google Review" },
];
```

### 3. Swap in their own project photography

The photos in `public/images/` are licensed Unsplash stock standing in for real work. Affordable's
current site has almost no project photography, so there was nothing to carry over. Replacing
these with actual jobs will do more for conversion than anything else on the page — the gallery
tiles are the first thing people scroll to.

Keep the filenames and the site picks them up with no code changes. Recommended sizes:

- `hero-home.jpg` — 2400px wide, landscape
- `work-*.jpg` — 1800px wide (displayed as 4:5 portrait crops)
- `svc-*.jpg` — 1600px wide
- `ba-before.jpg` / `ba-after.jpg` — **the same room from the same spot**, 1800px wide

The gallery caption in `Work.jsx` currently reads "Photography shown is representative of our
scope of work." Delete that line once the images are their own.

---

## Logo assets

Generated from the logo on their current site (`public/logo.png`, the only resolution
Squarespace serves):

| File | Use |
| --- | --- |
| `logo-full.png` | Full stacked lockup, transparent background |
| `logo-icon.png` / `logo-icon-mono.png` | House mark only — navbar, hero, favicon |
| `logo-word.png` / `logo-word-mono.png` | Wordmark only |
| `logo-mono.png` | Full lockup knocked out in cream, for dark backgrounds |

The navbar and footer compose the icon and wordmark into a **horizontal lockup**, because the
stacked original is unreadable at 40px tall.

⚠️ **The source logo is low resolution.** After trimming the whitespace there are only 372×284
real pixels of artwork. It is sharp at the sizes used here, but ask the client for the original
**vector (SVG/AI/EPS)** before doing anything print-related or displaying it larger.

---

## Architecture notes

```
src/
├── data/site.js          all copy and content
├── lib/gsap.js           plugin registration, shared easing, scroll helper
├── lib/animations.js     reusable reveals (headline, image wipe, counters, marquee)
└── components/           one file per section
```

Animations are centralized in `lib/animations.js` so the whole page shares one motion vocabulary.
Every component wraps its GSAP work in `gsap.context()` and reverts on unmount, so React
remounts never leak triggers.

**Accessibility and motion.** `prefers-reduced-motion: reduce` is honored throughout: the
preloader is skipped, ScrollSmoother never initializes, marquees stop, and reveals resolve to
their final state instead of animating. The before/after divider is keyboard-operable with arrow
keys, the accordions use real `aria-expanded`/`aria-controls`, form errors are announced via
`role="alert"`, and there is a skip link.

**SEO.** `index.html` carries the title, meta description, Open Graph tags, and a
`HomeAndConstructionBusiness` JSON-LD block with the real phone, address, service radius, and
social profiles. Update the JSON-LD if the phone number or service area changes.
