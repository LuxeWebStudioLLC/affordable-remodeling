// GET -> the current CRM settings, with the secret masked.
// PUT -> save new settings.
// Both require a signed-in owner.

import { readBody, requireAuth } from "../_lib/auth.js";
import { validateHeaderName, validateWebhook } from "../_lib/crm.js";
import { SETTINGS_KEY, getJSON, setJSON, storeAvailable } from "../_lib/store.js";

/** The stored secret never goes back to the browser in full. */
function present(settings) {
  if (!settings) return { enabled: false, webhookUrl: "", headerName: "", headerHint: "", updatedAt: null };
  const v = settings.headerValue || "";
  return {
    enabled: Boolean(settings.enabled),
    webhookUrl: settings.webhookUrl || "",
    headerName: settings.headerName || "",
    headerHint: v ? `${"•".repeat(Math.max(0, Math.min(12, v.length - 4)))}${v.slice(-4)}` : "",
    updatedAt: settings.updatedAt || null,
    lastResult: settings.lastResult || null,
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    if (!storeAvailable && process.env.VERCEL_ENV === "production") {
      return res.status(200).json({ storage: false, settings: present(null) });
    }
    const settings = await getJSON(SETTINGS_KEY).catch(() => null);
    return res.status(200).json({ storage: storeAvailable, settings: present(settings) });
  }

  if (req.method !== "PUT") return res.status(405).json({ error: "GET or PUT" });

  const body = readBody(req);
  const enabled = Boolean(body.enabled);

  const url = validateWebhook(body.webhookUrl);
  if (!url.ok) return res.status(400).json({ error: url.reason });

  const header = validateHeaderName(body.headerName);
  if (!header.ok) return res.status(400).json({ error: header.reason });

  const existing = await getJSON(SETTINGS_KEY).catch(() => null);

  /* An unchanged secret arrives as the masked placeholder, so keep the stored
     one rather than overwriting it with dots. */
  const incoming = typeof body.headerValue === "string" ? body.headerValue : "";
  const headerValue =
    incoming && !incoming.includes("•") ? incoming.slice(0, 500) : existing?.headerValue || "";

  const next = {
    enabled,
    webhookUrl: url.url.toString(),
    headerName: header.value,
    headerValue: header.value ? headerValue : "",
    updatedAt: new Date().toISOString(),
    lastResult: existing?.lastResult || null,
  };

  try {
    await setJSON(SETTINGS_KEY, next);
  } catch {
    return res.status(503).json({
      error: "Nothing was saved — the site has no storage connected yet.",
      storage: false,
    });
  }

  return res.status(200).json({ storage: storeAvailable, settings: present(next) });
}
