/**
 * Validating and delivering leads to whatever CRM the owner has pointed us at.
 *
 * The destination is a plain HTTPS webhook taking JSON, which is the common
 * denominator across the tools a contractor actually ends up using — Zapier,
 * Make, n8n, GoHighLevel, HubSpot workflows, Jobber via Zapier. Anything with
 * a bespoke OAuth flow is out of scope for a console the owner sets up alone
 * in two minutes; if they ever need one, the webhook can point at a Zap that
 * does the talking.
 *
 * The URL is owner-supplied, so the function will happily fetch whatever it is
 * given. That is a request-forgery surface even when the person supplying it
 * is the owner — a mistyped or pasted-in address should not let the console be
 * used to probe the platform's internal network — hence the host rules below.
 */

const PRIVATE_V4 =
  /^(0|10|127|169\.254|192\.168|172\.(1[6-9]|2\d|3[01])|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7]))\./;

const BLOCKED_NAMES = /^(localhost|.*\.local|.*\.internal|metadata.*)$/i;

/**
 * @returns {{ok: true, url: URL} | {ok: false, reason: string}}
 */
export function validateWebhook(raw) {
  const value = String(raw || "").trim();
  if (!value) return { ok: false, reason: "Enter a webhook URL." };

  let url;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, reason: "That is not a valid URL." };
  }

  if (url.protocol !== "https:") {
    return { ok: false, reason: "The URL has to start with https:// — leads carry personal details." };
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_NAMES.test(host) || host === "::1" || PRIVATE_V4.test(host)) {
    return { ok: false, reason: "That address is not reachable from the internet." };
  }
  if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) {
    return { ok: false, reason: "That address is not reachable from the internet." };
  }

  return { ok: true, url };
}

/** Header name the owner may add, e.g. Authorization or X-Api-Key. */
export function validateHeaderName(name) {
  const value = String(name || "").trim();
  if (!value) return { ok: true, value: "" };
  if (!/^[A-Za-z0-9-]{1,64}$/.test(value)) {
    return { ok: false, reason: "Header names can only contain letters, numbers and dashes." };
  }
  return { ok: true, value };
}

/** One shape for every lead, whatever on the site produced it. */
export function normalizeLead(input = {}) {
  const str = (v, max = 2000) => (v == null ? "" : String(v).slice(0, max));
  return {
    source: str(input.source, 60) || "website",
    name: str(input.name, 200),
    email: str(input.email, 200),
    phone: str(input.phone, 60),
    address: str(input.address, 300),
    services: str(input.services, 400),
    budget: str(input.budget, 120),
    timeline: str(input.timeline, 120),
    message: str(input.message, 4000),
    contact_preference: str(input.contact_preference, 60),
    page: str(input.page, 300),
    submitted_at: new Date().toISOString(),
    business: "Affordable Home Remodeling Corp.",
  };
}

/**
 * Deliver one lead. Never throws — the caller's own job (emailing the office)
 * must not fail because someone's CRM is down.
 */
export async function deliver(settings, lead) {
  if (!settings || !settings.webhookUrl) return { ok: false, reason: "no CRM configured" };

  const check = validateWebhook(settings.webhookUrl);
  if (!check.ok) return { ok: false, reason: check.reason };

  const headers = { "Content-Type": "application/json" };
  if (settings.headerName && settings.headerValue) {
    headers[settings.headerName] = settings.headerValue;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(check.url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(lead),
      signal: controller.signal,
      redirect: "error",
    });
    if (!res.ok) return { ok: false, reason: `CRM replied ${res.status}`, status: res.status };
    return { ok: true, status: res.status };
  } catch (err) {
    const reason = err?.name === "AbortError" ? "CRM did not respond within 8 seconds" : "Could not reach that URL";
    return { ok: false, reason };
  } finally {
    clearTimeout(timer);
  }
}
