/**
 * Single source of truth for every piece of copy on the site.
 * All facts below were taken from affordableremodelingwi.com.
 * Nothing here is invented — see `REVIEWS` for the one gap.
 */

export const BUSINESS = {
  name: "Affordable Home Remodeling",
  legalName: "Affordable Home Remodeling Corp.",
  tagline: "Unleash Your Home's True Potential",
  city: "La Crosse",
  state: "WI",
  phone: "(608) 844-8482",
  phoneHref: "tel:+16088448482",
  email: "office@affordableremodelingwi.com",
  emailHref: "mailto:office@affordableremodelingwi.com",
  serviceArea: "La Crosse, WI and surrounding areas up to 50 miles",
  yearsInBusiness: "25+",
  booking: "https://affordableremodeling.as.me/",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61555707055075",
    instagram: "https://www.instagram.com/affordable_remodelingwi/",
  },
};

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Contact", href: "#contact" },
];

/** Rolling strip under the hero. */
export const MARQUEE_WORDS = [
  "Roofing",
  "Siding",
  "Windows",
  "Kitchens",
  "Bathrooms",
  "Decking",
  "Sunrooms",
  "Doors",
  "Flooring",
];

/**
 * Service descriptions are lifted from their services page.
 * `blurb` is the short line used on the index row; `detail` is the
 * fuller sentence revealed in the expanded panel. No images here — the
 * services list is deliberately pure typography.
 */
export const SERVICES = [
  {
    id: "roofing",
    title: "Roofing",
    tag: "Lifetime warranty",
    blurb:
      "Roofing solutions that provide durability, protection, and style for your home.",
    detail:
      "Asphalt shingles and standing seam metal, installed by a crew that has been doing it for over 25 years. Tear-off, deck inspection, ice and water shield, and proper ventilation — every layer done right. We also offer a lifetime warranty.",
    points: ["Asphalt shingles", "Metal roofing", "Lifetime warranty"],
  },
  {
    id: "siding",
    title: "Siding",
    tag: "Vinyl · Fiber cement · Wood",
    blurb:
      "Premium siding that lifts your home's exterior while improving energy efficiency.",
    detail:
      "Vinyl, fiber cement, and wood siding with professional installation. New house wrap, flashing, and trim details that keep Wisconsin weather where it belongs — outside.",
    points: ["Vinyl", "Fiber cement", "Wood"],
  },
  {
    id: "windows",
    title: "Windows",
    tag: "Energy efficient",
    blurb:
      "Top-notch window replacement for better energy efficiency and curb appeal.",
    detail:
      "We help you choose the right material and design, then handle a seamless installation — properly shimmed, insulated, and sealed for optimal performance season after season.",
    points: ["Full-frame & insert", "Double & triple pane", "Custom sizing"],
  },
  {
    id: "kitchens",
    title: "Kitchens",
    tag: "The heart of the home",
    blurb:
      "Beautiful, functional kitchens that become the heart of your home.",
    detail:
      "Cabinetry, countertops, and appliances in modern or classic designs. We plan the layout around how you actually cook and live, then build it clean from demo to final punch list.",
    points: ["Cabinetry", "Countertops", "Appliance fit-out"],
  },
  {
    id: "bathrooms",
    title: "Bathrooms",
    tag: "Full reno or refresh",
    blurb: "We turn your bathroom dreams into reality.",
    detail:
      "Spaces that combine beauty and functionality inside your budget — complete renovations or simple updates, always with high-quality materials and waterproofing done properly the first time.",
    points: ["Tile & waterproofing", "Vanities", "Walk-in showers"],
  },
  {
    id: "decking",
    title: "Decking",
    tag: "Wood or composite",
    blurb: "Expert decking that elevates your outdoor living space.",
    detail:
      "Classic wood or modern composite, customized to your style and budget. Proper footings, framing, and railings built to carry your family for decades.",
    points: ["Composite", "Cedar & treated", "Railings & stairs"],
  },
  {
    id: "sunrooms",
    title: "Sunrooms & Liferooms",
    tag: "Year-round comfort",
    blurb:
      "Stunning sunrooms and liferooms that bring the outdoors into your home.",
    detail:
      "Custom designs that maximize natural light and comfort for year-round enjoyment — insulated, finished, and built to feel like part of the house, not an add-on.",
    points: ["Three & four season", "Insulated glass", "Custom design"],
  },
  {
    id: "doors",
    title: "Door Replacement",
    tag: "Security & style",
    blurb:
      "Professional door replacement that enhances security and aesthetic appeal.",
    detail:
      "Entry doors, patio doors, and interior doors in a wide range of styles. Square, plumb, weather-tight, and locking the way a new door should.",
    points: ["Entry doors", "Patio doors", "Interior doors"],
  },
  {
    id: "flooring",
    title: "Flooring",
    tag: "Hardwood to tile",
    blurb:
      "A wide range of flooring to elevate the beauty and function of your home.",
    detail:
      "Hardwood, laminate, tile, and carpet. Subfloor prepped and levelled first, because the finish is only as good as what is under it.",
    points: ["Hardwood", "Laminate & LVP", "Tile & carpet"],
  },
  {
    id: "additions",
    title: "Additions",
    tag: "More house, same address",
    blurb: "Additions that give you the room you need without moving.",
    detail:
      "From a bump-out to a full second storey — foundation, framing, roofline, and finishes tied into the existing house so it reads like it was always there.",
    points: ["Bump-outs", "Second storey", "Garage & mudroom"],
  },
];

/**
 * The gallery — real Affordable Remodeling jobs, supplied by the client.
 * Watermarks were cropped out of the originals (they are for social posts,
 * not the site). Captions describe only what is visible in each frame.
 */
export const WORK = [
  {
    src: "/images/job-exterior-cape.jpg",
    cat: "Siding & Windows",
    alt: "Cape-style home with new siding, trim and windows",
  },
  {
    src: "/images/job-kitchen.jpg",
    cat: "Kitchens",
    alt: "Kitchen with dark shaker cabinetry, farmhouse sink and new flooring",
  },
  {
    src: "/images/job-deck-porch.jpg",
    cat: "Decking",
    alt: "New deck and covered porch with stairs and railings",
  },
  {
    src: "/images/job-sunroom.jpg",
    cat: "Sunrooms",
    alt: "Three-season porch with composite decking and black railings",
  },
  {
    src: "/images/job-shower.jpg",
    cat: "Bathrooms",
    alt: "Walk-in shower with sliding glass door and built-in shelving",
  },
  {
    src: "/images/job-vanity.jpg",
    cat: "Bathrooms",
    alt: "New vanity, countertop and flooring in a finished bathroom",
  },
];

export const WHY_US = [
  {
    n: "01",
    title: "25+ Years In",
    body: "Over twenty-five years of remodeling homes around La Crosse. There is very little on a house we have not already seen, fixed, or rebuilt.",
  },
  {
    n: "02",
    title: "Family Owned",
    body: "Family owned and operated. You deal with the people whose name is on the truck, not a call center or a rotating cast of subs.",
  },
  {
    n: "03",
    title: "Lifetime Warranty",
    body: "Our roofing comes with a lifetime warranty. We stand behind the work long after the dumpster leaves the driveway.",
  },
  {
    n: "04",
    title: "Fits Your Budget",
    body: "Quality craftsmanship and beautiful results that fit your vision and your budget. Clear scope, honest numbers, no surprise line items.",
  },
  {
    n: "05",
    title: "Exterior To Interior",
    body: "Roof, siding, and windows through to kitchens, baths, and flooring. One contractor for the whole house means no finger pointing.",
  },
];

export const APPROACH = {
  eyebrow: "How we work",
  headline: "We walk it first.",
  script: "Then we build.",
  body: [
    "Every project starts with a real conversation at your house — what you want, what it needs, and what the right call is for your budget. Sometimes that is a full kitchen. Sometimes it is a roof and a couple of windows.",
    "We will tell you straight either way. Quality craftsmanship, dependable service, and beautiful results that fit your vision — that is the whole job description.",
  ],
  checks: [
    "Free in-home estimates",
    "Family owned and operated",
    "Lifetime warranty on roofing",
    "La Crosse and 50 miles around it",
  ],
};

/**
 * Financing terms as given by the client. If a specific lending partner is
 * confirmed later (Wisetack, GreenSky, Service Finance, etc.), add its name
 * here and to the disclaimer — regulations around advertising "0% APR" and
 * credit-check language vary by state, so the lender's own compliance copy
 * should replace the generic disclaimer below before this goes live.
 */
export const FINANCING = {
  eyebrow: "Financing available",
  headline: "Get it done now.",
  script: "Pay over time.",
  body: "A big project doesn't have to wait on a full checkbook. Ask about financing when you request your estimate — checking your rate won't affect your credit.",
  stats: [
    { value: "0% APR", label: "Promotional financing offered" },
    { value: "$1k–$200k", label: "In funding available" },
    { value: "Soft pull", label: "Checking your rate is credit-safe" },
  ],
  disclaimer:
    "Financing offered through participating third-party lenders, subject to credit approval. Checking your rate uses a soft credit pull and does not affect your credit score. Terms, rates and available amounts vary by applicant.",
};

export const STATS = [
  { value: "25+", label: "Years in business" },
  { value: "50mi", label: "Service radius" },
  { value: "10", label: "Trades under one roof" },
  { value: "Lifetime", label: "Roofing warranty" },
];

/**
 * ⚠️ REVIEWS ARE INTENTIONALLY EMPTY.
 * Their current site publishes no testimonials, so there is nothing to
 * quote. Rather than invent them, the Reviews section falls back to a
 * verifiable trust panel until real ones are pasted in here.
 *
 * To switch it on, add the real Google/Facebook reviews:
 *   { quote: "…", name: "First Last", source: "Google Review" }
 * The full marquee layout is already wired up in Reviews.jsx.
 */
export const REVIEWS = [];

/**
 * Service-area map data. Distances and bearings are approximate (marketing
 * map, not navigation) — bearing is degrees clockwise from north, miles is
 * road-crow-flies blend. `major` towns keep their labels on small screens.
 */
export const SERVICE_AREA = {
  center: "La Crosse",
  radiusMiles: 50,
  rings: [15, 30, 50],
  counties: [
    "La Crosse Co.",
    "Monroe Co.",
    "Vernon Co.",
    "Trempealeau Co.",
    "Houston Co. (MN)",
    "Winona Co. (MN)",
  ],
  towns: [
    { name: "Onalaska", bearing: 15, miles: 6, major: true },
    { name: "Holmen", bearing: 0, miles: 12 },
    { name: "West Salem", bearing: 70, miles: 11 },
    { name: "Bangor", bearing: 82, miles: 16 },
    { name: "Sparta", bearing: 72, miles: 26, major: true },
    { name: "Tomah", bearing: 66, miles: 42, major: true },
    { name: "Black River Falls", bearing: 35, miles: 45 },
    { name: "Galesville", bearing: 340, miles: 18 },
    { name: "Trempealeau", bearing: 315, miles: 19 },
    { name: "Arcadia", bearing: 350, miles: 36 },
    { name: "Winona, MN", bearing: 308, miles: 28, major: true },
    { name: "La Crescent, MN", bearing: 250, miles: 4 },
    { name: "Caledonia, MN", bearing: 205, miles: 24, major: true },
    { name: "Viroqua", bearing: 155, miles: 28, major: true },
    { name: "Westby", bearing: 145, miles: 23 },
    { name: "Coon Valley", bearing: 123, miles: 15 },
    { name: "Stoddard", bearing: 185, miles: 11 },
  ],
};

export const FAQS = [
  {
    q: "What areas do you serve?",
    a: "La Crosse, WI and the surrounding areas up to 50 miles — both sides of the river. Not sure whether you are in range? Give us a call and we will tell you straight away.",
  },
  {
    q: "Do you handle both exterior and interior work?",
    a: "Yes. Roofing, siding, windows, doors, decking, and sunrooms on the outside; kitchens, bathrooms, flooring, and additions on the inside. One crew, one point of contact, whole-house scope.",
  },
  {
    q: "Do you provide free estimates?",
    a: "We do. We come out, walk the project with you, and give you a clear scope and an honest price. There is no pressure to book and no charge for the visit.",
  },
  {
    q: "What warranty comes with a new roof?",
    a: "Our roofing carries a lifetime warranty. We will walk you through exactly what it covers before you sign anything.",
  },
  {
    q: "How long does a project take?",
    a: "It depends on scope. A roof or a window package is usually a matter of days. A full kitchen, bathroom, or addition runs longer. You get a real timeline up front rather than a guess.",
  },
  {
    q: "How do I get in contact with you?",
    a: "Call or text (608) 844-8482, email office@affordableremodelingwi.com, or send the form on this page. You can also book a time directly through our online scheduler.",
  },
];

/** Options for the contact form's project-type select. */
export const PROJECT_TYPES = [
  "Roofing",
  "Siding",
  "Windows",
  "Kitchen remodel",
  "Bathroom remodel",
  "Decking",
  "Sunroom or Liferoom",
  "Door replacement",
  "Flooring",
  "Addition",
  "Multiple projects",
  "Not sure yet",
];

export const BUDGETS = [
  "Under $10k",
  "$10k – $25k",
  "$25k – $50k",
  "$50k – $100k",
  "$100k+",
  "Not sure yet",
];

export const TIMELINES = [
  "As soon as possible",
  "Within 1–3 months",
  "Within 3–6 months",
  "Just planning ahead",
];
