/**
 * Public endpoint every form on the site also posts to, so leads reach the
 * CRM the owner connected in the console.
 *
 * Deliberately a second, parallel path rather than a replacement for the
 * existing FormSubmit call. Email is how the office actually hears about a
 * job today; routing it through here would mean a bug in CRM forwarding could
 * cost a real customer. The browser keeps emailing exactly as before and this
 * runs alongside it, which also means the visitor's "thanks, we'll call you"
 * never waits on someone else's CRM being up.
 *
 * It answers 200 even when there is no CRM configured, because from the
 * caller's point of view there is nothing wrong: the lead was emailed, and
 * whether a CRM exists is the owner's business, not the visitor's.
 */

import { readBody } from "./_lib/auth.js";
import { deliver, normalizeLead } from "./_lib/crm.js";
import { SETTINGS_KEY, getJSON } from "./_lib/store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const lead = normalizeLead(readBody(req));

  /* A lead with no way to reach anyone is almost certainly a bot hitting the
     endpoint directly; there is nothing to forward. */
  if (!lead.email && !lead.phone) {
    return res.status(200).json({ forwarded: false, reason: "no contact details" });
  }

  let settings = null;
  try {
    settings = await getJSON(SETTINGS_KEY);
  } catch {
    return res.status(200).json({ forwarded: false, reason: "settings unavailable" });
  }

  if (!settings?.enabled || !settings.webhookUrl) {
    return res.status(200).json({ forwarded: false, reason: "no CRM connected" });
  }

  const result = await deliver(settings, lead);
  return res.status(200).json({ forwarded: result.ok, reason: result.reason || null });
}
