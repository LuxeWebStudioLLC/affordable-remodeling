# Affordable Home Remodeling — website

A new marketing site for **Affordable Home Remodeling Corp.** (La Crosse, WI), built to the
structure and visual language of [axelslandscapingdesign.com](https://axelslandscapingdesign.com)
and extended with a multi-step estimate request form, a scroll-driven horizontal project
gallery, a before/after feature, and a custom service-area map.

Stack: **React 19 + Vite 8 + Tailwind CSS 4 + GSAP 3.15** (ScrollTrigger, ScrollSmoother,
SplitText, ScrollToPlugin).

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
`affordable-remodeling.com` and follow the DNS instructions. The canonical
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

## AI website assistant

The "Ask us" bubble bottom-right. Answers come from `api/chat.js`, a Vercel
serverless function that calls Claude — so the API key stays server-side and
never enters the browser bundle.

### Turning it on

Vercel → Project → **Settings → Environment Variables**:

| Variable | Value |
| --- | --- |
| `ANTHROPIC_API_KEY` | a key from console.anthropic.com |
| `ANTHROPIC_MODEL` | optional; defaults to `claude-haiku-4-5-20251001` |

Deliberately NOT prefixed `VITE_` — Vite inlines `VITE_*` into the client
bundle, which would publish the key to every visitor. Redeploy after adding
it (Vercel → Deployments → ⋯ → Redeploy) so the function picks it up.

Until the key is set the endpoint returns 501 and the widget says "I'm not
connected yet — please call…" rather than sitting there looking online.

### How leads actually arrive

The assistant collects project details and promises follow-up, so delivery
cannot depend on the model behaving. A **"Send to the team"** button appears
after two visitor messages and POSTs the whole transcript to the same
FormSubmit inbox the estimate forms use. The system prompt tells the
assistant to point at that button once it has contact details.

### Editing what it knows

The system prompt lives at the top of [`api/chat.js`](api/chat.js) — business
facts, the intake questions, and the guardrails (no invented prices, no
services outside the ten listed trades). Edit there and redeploy.

### Cost and abuse

History is capped to the last 14 messages, each truncated to 1200 characters,
with `max_tokens: 400` on Haiku — so a single exchange is fractions of a cent.
There is no rate limiting: the endpoint is public and holds an API key, so
watch Anthropic usage after launch and add a limiter if it gets hammered.

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
| Before/after pair | `WORK` images + `Transformation.jsx` |
| Financing terms | `FINANCING` |
| Service-area towns | `SERVICE_AREA` |
| Footer studio credit | `CREDIT` |
| Stats strip | `STATS` |
| FAQ questions | `FAQS` |
| Form dropdown options | `PROJECT_TYPES`, `BUDGETS`, `TIMELINES` |
| Customer reviews | `REVIEWS` — **currently empty, see below** |

---

## Before launch

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

### 3. Replace the hero background (optional)

Every photo in the gallery, the before/after, and the approach section is now **real
Affordable Remodeling work**, supplied by the client. The one exception is the hero: the
background video and its poster (`hero-home.jpg`) are still stock, because the supplied
photos top out around 1200px wide and the hero runs full-bleed past 1440px, where they
would visibly soften.

If a camera-original exterior shot turns up (straight off the phone, not routed through
Facebook, which recompresses), drop it in as `public/images/hero-home.jpg` at ~2400px wide
and it is picked up with no code change.

Also worth doing eventually: `public/video/hero.mp4` is 7.4 MB, roughly double ideal. Any
`ffmpeg` re-encode at CRF 28 would roughly halve it with no visible loss.

---

## Logo assets

Generated from the logo on their current site (`public/logo.png`, the only resolution
Squarespace serves):

| File | Use |
| --- | --- |
| `logo.png` | The untouched original, as served by their current site |
| `logo-icon.png` | House mark only — navbar, footer, hero, favicon source |
| `logo-word.png` | Wordmark only — rides the light navbar |
| `favicon.png` | 96px browser tab icon |

Every logo on the site is the **full-colour artwork**. Earlier cream/mono knockouts were
deleted: their wordmark is dark blue, which is unreadable on the dark sections, so the mark
carries dark contexts alone and the footer sets the company name in type beside it.

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
their final state instead of animating. The accordions use real
`aria-expanded`/`aria-controls`, form errors are announced via `role="alert"`, the footer
credit card closes on Escape and outside-click, and there is a skip link.

**SEO.** `index.html` carries the title, meta description, Open Graph tags, and a
`HomeAndConstructionBusiness` JSON-LD block with the real phone, address, service radius, and
social profiles. Update the JSON-LD if the phone number or service area changes.
