import { BUSINESS } from "../data/site";

/**
 * Built-in answers for the site assistant.
 *
 * The Luxe Web Studio build works this way too, and the reason matters: a chat
 * that announces it is "not connected" is worse than no chat at all — the
 * visitor came with a question and got a status message about our
 * infrastructure. These answers cover what people actually ask a remodeling
 * contractor, so the widget is useful the moment it ships and gets smarter,
 * not functional, when ANTHROPIC_API_KEY is set.
 *
 * Every fact here is drawn from the site's own content. Nothing about price is
 * ever quoted, because a remodel cannot be priced without seeing the property.
 */
const CALL = `Call or text ${BUSINESS.phone}, or tap “Send to the team” below and the office will follow up.`;

const FAQ = [
  // — the estimate path first: it is what most visitors are here for —
  [
    /estimate|quote|quoting|price it|come (out|look)|walk(ing)? (it|through)|book|schedule|appointment|consult|get started|next step|ready to/,
    `Estimates are free and in person — someone comes out, walks the project with you, and quotes from what is actually there rather than a guess over the phone. There is no high-pressure pitch at the end of it. Tell me what you are thinking about and roughly where you are, then tap “Send to the team” below and the office will get in touch to set a time.`,
  ],
  [
    /how much|cost|price|pricing|charge|\$|budget|afford|expensive|cheap|ballpark|rough idea/,
    `Honest answer: it depends on size, materials, scope, and what we find once things are opened up — so quoting a number here would be a guess, and a guess helps nobody. What I can tell you is the in-home estimate is free, the quote is itemised so you can see where the money goes, and financing is available if the timing is awkward. ${CALL}`,
  ],
  [
    /financ|payment plan|monthly|apr|credit|loan|pay over time|installment/,
    `Financing is available through participating lenders: 0% APR promotional financing is offered, funding runs from $1,000 up to $200,000, and checking your rate is a soft credit pull — it will not affect your credit score. Subject to credit approval, terms vary by applicant. Ask about it when you request the estimate. ${CALL}`,
  ],
  [
    /area|cover|serve|service area|come to|far|drive|located|location|do you (work|go)|my town|zip|within/,
    `La Crosse and about fifty miles around it — both sides of the river, Wisconsin and Minnesota. That takes in Onalaska, Holmen, West Salem, Bangor, Sparta, Tomah, Black River Falls, Galesville, Trempealeau, Arcadia, Viroqua, Westby, Coon Valley, Stoddard, and across into Winona, La Crescent and Caledonia. On the edge of that? Call anyway — they have been known to drive a little farther for the right project.`,
  ],
  [
    /warrant|guarantee|how long (will|does) (it|the roof) last|stand behind/,
    `The roofing carries a lifetime warranty. Beyond that, twenty-five years in one town means the work has to hold up in front of people they keep running into — which is its own kind of guarantee. ${CALL}`,
  ],
  [
    /roof|shingle|metal roof|tear.?off|leak/,
    `Roofing is the flagship trade — asphalt shingles and standing seam metal, with a lifetime warranty. Tear-off, deck inspection, ice and water shield and proper ventilation all get done properly; the layers you never see are the ones that decide how long it lasts. Want someone to come look at it?`,
  ],
  [
    /siding|fiber cement|vinyl|house wrap|exterior/,
    `Siding in vinyl, fiber cement and wood, over new house wrap with the flashing detailed properly at every opening — that detail is where most siding jobs quietly fail. Often done alongside windows and trim in one go.`,
  ],
  [
    /window|glass|draft|double pane|triple pane/,
    `Windows, full-frame or insert — shimmed square, insulated and sealed. A window is only as good as the opening it sits in, which is why the install matters more than the sticker on the glass.`,
  ],
  [
    /kitchen|cabinet|countertop|backsplash|island/,
    `Kitchens — cabinetry, counters and appliances planned around how you actually cook, then built clean from demo through to the punch list. Tell me a bit about the space and I can pass it along.`,
  ],
  [
    /bath|shower|tub|vanity|tile|waterproof/,
    `Bathrooms, from a straightforward update to a full renovation. Waterproofing gets done right the first time, then tile, vanity and fixtures — because the part behind the tile is the part that fails.`,
  ],
  [
    /deck|porch|railing|composite|cedar/,
    `Decking in composite or cedar, on footings dug below frost line, framed and railed to carry a full house of people. Wisconsin winters are hard on shallow footings, so that depth is not optional.`,
  ],
  [
    /sunroom|liferoom|three.?season|four.?season|screened/,
    `Sunrooms and liferooms, three-season or four — insulated and finished so the room reads as part of the house rather than something bolted onto the back of it.`,
  ],
  [
    /door|entry|patio door|slider/,
    `Door replacement — entry, patio and interior. Hung square, plumb and weather-tight, latching the way a new door should.`,
  ],
  [
    /floor|hardwood|lvp|laminate|carpet|subfloor/,
    `Flooring in hardwood, LVP, tile and carpet. The subfloor gets levelled first, because the finish only ever looks as good as what is underneath it.`,
  ],
  [
    /addition|add on|bump.?out|second story|second storey|expand|more space/,
    `Additions, from a bump-out to a full second storey — foundation, framing and roofline tied into the existing house so the seam does not show. These take the most planning, so the earlier the conversation the better.`,
  ],
  [
    /basement|egress|finish(ing)? (the|my) basement/,
    `Basements are not one of the ten trades listed on the site, so I would not want to promise it either way. Tell me what you are picturing and tap “Send to the team” — the office can tell you straight whether it is something they take on.`,
  ],
  [
    /what do you (do|offer)|services|trades|kind of work|type of work|specialize/,
    `Ten trades under one contractor: roofing, siding, windows, kitchens, bathrooms, decking, sunrooms and liferooms, doors, flooring, and additions. Exterior through interior — which matters more than it sounds, because when the roof, siding and windows are one company's responsibility there is nobody left to point at when water gets in.`,
  ],
  [
    /how long|timeline|when can you|start|schedule|lead time|booked|wait/,
    `It depends on the trade and the season — a roof or a window package moves quickly, a kitchen or an addition needs planning time. The office can give you a real answer once they know the project. ${CALL}`,
  ],
  [
    /who|about|family|years|experience|licensed|insured|how long have/,
    `Family owned and operated, twenty-five-plus years working on homes in and around La Crosse — licensed and insured. You deal with the people whose name is on the truck, not a call centre or a rotating cast of subs.`,
  ],
  [
    /photo|picture|see (your|some) work|portfolio|examples|gallery|past (job|project)/,
    `There are real jobs on this page — scroll to “Work we have put our name on”, plus a before and after of a farmhouse that went from white clapboard to dark siding. Every photo on the site is their own work, no stock.`,
  ],
  [
    /contact|call|phone|email|reach|talk to|speak|human|person|number/,
    `Call or text ${BUSINESS.phone}, or email ${BUSINESS.email}. If it is easier, leave your details here and tap “Send to the team” — the office will come back to you.`,
  ],
  [
    /insurance|storm|hail|claim|adjuster/,
    `Storm and insurance work is worth a direct conversation rather than a chat answer, since it depends on your carrier and the damage. ${CALL}`,
  ],
  [
    /^\s*(hi|hey|hello|yo|sup|good (morning|afternoon|evening))\b|thanks|thank you/,
    `Hey — happy to help. Ask me about any of the trades, the service area, financing, or getting an estimate booked.`,
  ],
];

/** First pattern that matches wins; order above is deliberate. */
export function localAnswer(q) {
  const s = " " + String(q).toLowerCase() + " ";
  for (const [re, a] of FAQ) if (re.test(s)) return a;
  return `That one is better answered by someone who can see the property. Here is what I do know: ten trades under one contractor, La Crosse and fifty miles around it, free in-home estimates, a lifetime warranty on roofing, and financing if you need it. For your specific situation, ${CALL.charAt(0).toLowerCase() + CALL.slice(1)}`;
}
