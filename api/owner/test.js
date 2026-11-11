// POST -> send one clearly-marked sample lead to the saved CRM webhook, so the
// owner can confirm it lands before a real customer depends on it.

import { requireAuth } from "../_lib/auth.js";
import { deliver, normalizeLead } from "../_lib/crm.js";
import { SETTINGS_KEY, getJSON, setJSON } from "../_lib/store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!requireAuth(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const settings = await getJSON(SETTINGS_KEY).catch(() => null);
  if (!settings?.webhookUrl) {
    return res.status(400).json({ error: "Save a webhook URL first." });
  }

  const lead = normalizeLead({
    source: "test",
    name: "Test Lead (ignore)",
    email: "test@example.com",
    phone: "(608) 555-0123",
    address: "La Crosse, WI",
    services: "Roofing",
    budget: "$10,000 – $25,000",
    timeline: "1–3 months",
    message: "This is a test sent from the owner console. No action needed.",
    contact_preference: "Phone",
  });

  const result = await deliver(settings, lead);

  /* Record the outcome so the console can say when it last worked, rather
     than only what happened in this tab. */
  await setJSON(SETTINGS_KEY, {
    ...settings,
    lastResult: { ok: result.ok, reason: result.reason || null, at: new Date().toISOString() },
  }).catch(() => {});

  if (!result.ok) return res.status(502).json({ error: result.reason || "Delivery failed." });
  return res.status(200).json({ ok: true, status: result.status });
}
