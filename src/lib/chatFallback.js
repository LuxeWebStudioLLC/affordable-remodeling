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
const CALL = `Call or text ${BUSINESS.phone}, or tap “Send to the team” below and we'll follow up.`;

const FAQ = [
  // — the estimate path first: it is what most visitors are here for —
  [
    /estimate|quote|quoting|price it|come (out|look)|walk(ing)? (it|through)|book|schedule|appointment|consult|get started|next step|ready to/,
    `Estimates are free and in person — we come out, walk the project with you, and quote from what's actually there instead of guessing over the phone. No pitch at the end of it either. What are you thinking about, and roughly where are you?`,
  ],
  [
    /how much|cost|price|pricing|charge|\$|budget|afford|expensive|cheap|ballpark|rough idea/,
    `Honestly? It depends on size, materials, scope, and what turns up once things are opened. Any number I threw out here would be a guess, and a guess helps nobody. What I can tell you: the estimate is free, the quote is itemised so you can see where the money goes, and there's financing if the timing is awkward. ${CALL}`,
  ],
  [
    /financ|payment plan|monthly|apr|credit|loan|pay over time|installment/,
    `Yes — through participating lenders. There's 0% APR promotional financing, funding from $1,000 up to $200,000, and checking your rate is a soft pull, so it won't touch your credit score. Subject to approval, terms vary. Worth asking about when we come out. ${CALL}`,
  ],
  [
    /area|cover|serve|service area|come to|far|drive|located|location|do you (work|go)|my town|zip|within/,
    `La Crosse and about fifty miles out, both sides of the river. That covers Onalaska, Holmen, West Salem, Bangor, Sparta, Tomah, Black River Falls, Galesville, Trempealeau, Arcadia, Viroqua, Westby, Coon Valley, Stoddard, and over into Winona, La Crescent and Caledonia. Right on the edge of that? Call anyway — we've driven farther for the right project.`,
  ],
  [
    /warrant|guarantee|how long (will|does) (it|the roof) last|stand behind/,
    `Roofing carries a lifetime warranty. Past that — twenty-five years in one town means our work has to hold up in front of people we keep running into at the hardware store. That's its own kind of guarantee. ${CALL}`,
  ],
  [
    /roof|shingle|metal roof|tear.?off|leak/,
    `Roofing's our flagship — asphalt shingles and standing seam metal, with a lifetime warranty. Tear-off, deck inspection, ice and water shield, proper ventilation. The layers you never see are the ones that decide how long it lasts. Want us to come look at it?`,
  ],
  [
    /siding|fiber cement|vinyl|house wrap|exterior/,
    `Vinyl, fiber cement and wood, over new house wrap with the flashing detailed at every opening — that's where most siding jobs quietly fail. We'll often do it alongside windows and trim in one go.`,
  ],
  [
    /window|glass|draft|double pane|triple pane/,
    `Full-frame or insert — shimmed square, insulated and sealed. A window's only as good as the opening it sits in, which is why the install matters more than the sticker on the glass.`,
  ],
  [
    /kitchen|cabinet|countertop|backsplash|island/,
    `Cabinetry, counters and appliances planned around how you actually cook, then built clean from demo through to the punch list. Tell me a bit about the space and I'll pass it along.`,
  ],
  [
    /bath|shower|tub|vanity|tile|waterproof/,
    `Anything from a straightforward update to a full gut. We waterproof it properly first, then tile, vanity and fixtures — the part behind the tile is the part that fails.`,
  ],
  [
    /deck|porch|railing|composite|cedar/,
    `Composite or cedar, on footings dug below frost line, framed and railed to carry a full house of people. Wisconsin winters are hard on shallow footings, so that depth isn't optional.`,
  ],
  [
    /sunroom|liferoom|three.?season|four.?season|screened/,
    `Three-season or four — insulated and finished so it reads as part of the house instead of something bolted onto the back of it.`,
  ],
  [
    /door|entry|patio door|slider/,
    `Entry, patio and interior. Hung square, plumb and weather-tight, latching the way a new door should.`,
  ],
  [
    /floor|hardwood|lvp|laminate|carpet|subfloor/,
    `Hardwood, LVP, tile and carpet. We level the subfloor first — the finish only ever looks as good as what's under it.`,
  ],
  [
    /addition|add on|bump.?out|second story|second storey|expand|more space/,
    `Anything from a bump-out to a full second storey — foundation, framing and roofline tied into the existing house so the seam doesn't show. These take the most planning, so the earlier we talk the better.`,
  ],
  [
    /basement|egress|finish(ing)? (the|my) basement/,
    `Basement finishing isn't one of the ten trades we list, so I don't want to promise you either way. Tell me what you're picturing and tap “Send to the team” — we'll give you a straight answer on whether it's something we take on.`,
  ],
  [
    /what do you (do|offer)|services|trades|kind of work|type of work|specialize/,
    `Ten trades under one contractor: roofing, siding, windows, kitchens, bathrooms, decking, sunrooms and liferooms, doors, flooring, additions. Exterior through interior — which matters more than it sounds. When the roof, siding and windows are all on us, there's nobody left to point at if water gets in.`,
  ],
  [
    /how long (will|does|would|is|are|it|to|for|until)|timeline|when can (you|we) (start|come|get)|lead time|booked|how soon|schedule (it|the|a|an)|wait (list|time)/,
    `Depends on the trade and the season — a roof or a window package moves quickly, a kitchen or an addition needs planning time. We can give you a real answer once we know the project. ${CALL}`,
  ],
  [
    /who (are|r) (you|yall|y.all)|who owns|about (you|your|the) (company|business|guys)|family (owned|business)|licensed|insured|bonded|how long have (you|yall)|years (of )?(experience|in business)/,
    `Family owned, twenty-five-plus years on homes in and around La Crosse, licensed and insured. You deal with the people whose name is on the truck — not a call centre or a rotating cast of subs.`,
  ],
  [
    /photo|picture|see (your|some) work|portfolio|examples|gallery|past (job|project)/,
    `Scroll up to “Work we have put our name on” — real jobs, plus a before and after of a farmhouse that went from white clapboard to dark siding. Every photo on this site is our own work, no stock.`,
  ],
  [
    /contact|call|phone|email|reach|talk to|speak|human|person|number/,
    `Call or text ${BUSINESS.phone}, or email ${BUSINESS.email}. Or just leave your details here and tap “Send to the team” and we'll come back to you.`,
  ],
  [
    /insurance|storm|hail|claim|adjuster/,
    `We do storm and insurance work, but it's worth a real conversation rather than a chat answer — it comes down to your carrier and the damage. ${CALL}`,
  ],
  [
    /^\s*(hi|hey|hello|yo|sup|good (morning|afternoon|evening))\b|thanks|thank you/,
    `Hey — happy to help. Ask me about any of the trades, where we work, financing, or getting an estimate booked.`,
  ],

  /* Everything below is personality rather than business. A chat that
     answers "are you a robot" with a services list is the exact thing that
     makes these feel like a phone tree, so the small stuff gets a real
     reply and then hands the conversation back. */
  [
    /\b(are you|r u) (a |an )?(robot|bot|ai|real|human|person)|you(.?re| are) (a )?(robot|bot|ai)|am i talking to|chatgpt|is this (a )?(bot|ai|real)/,
    `I'm an AI, yep — the one that sits on this website so there's someone to answer at 11pm. I know the trades, the service area and how estimates work. Anything I can't answer, I'll point you at the people who can.`,
  ],
  [
    /how (are|r) (you|u)|how(.?s| is) it going|what(.?s| is) up|you (doing )?(ok|okay|good|well)/,
    `Doing fine, thanks for asking 🙂 What's going on with your place?`,
  ],
  [
    /\b(how old|your (age|name|girlfriend|boyfriend|wife|husband)|are you (single|married|gay|straight))|do you (have a|love|like me)|marry me/,
    `Ha — I'm an AI, so no age, no love life, nothing interesting to report. Remodeling I can actually help with though.`,
  ],
  [
    /\b(stupid|dumb|useless|suck|terrible|hate you|shut up|idiot|trash|garbage)\b|f+u+c*k+ (you|off)/,
    `Fair enough — I'm not much use if I can't answer your question. Try me on roofing, siding, windows, kitchens, baths or the service area, or go straight to a human at ${BUSINESS.phone}.`,
  ],
  [
    /\b(joke|funny|lol|haha|😂|🤣)\b/,
    `Best I've got: a contractor's quote and a weather forecast have the same relationship with the word "definitely." What can I help you with?`,
  ],
  [
    /\bweather|snow|rain|cold|winter\b/,
    `Wisconsin, so: eventually, yes. It does matter for the work — roofing and siding go on in most conditions, but concrete and deck footings care a lot about frost. What are you planning?`,
  ],
];

/** First pattern that matches wins; order above is deliberate. */
export function localAnswer(q) {
  const s = " " + String(q).toLowerCase() + " ";
  for (const [re, a] of FAQ) if (re.test(s)) return a;
  return `Not sure I have a good answer for that one, and I'd rather not guess. Here's what I do know: ten trades under one contractor, La Crosse and fifty miles around it, free in-person estimates, a lifetime warranty on roofing, and financing if you need it. For anything specific to your place, ${CALL.charAt(0).toLowerCase() + CALL.slice(1)}`;
}
