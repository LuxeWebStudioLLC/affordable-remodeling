/**
 * Tiny persistence layer for the owner console.
 *
 * Serverless functions have no disk worth writing to, so the CRM settings the
 * owner saves have to live in a key/value store. This talks to the Upstash
 * Redis REST API with plain fetch — the same API behind Vercel KV — so there
 * is no SDK to install and no cold-start cost beyond one HTTPS call.
 *
 * Vercel's Upstash integration injects KV_REST_API_URL / KV_REST_API_TOKEN;
 * a store provisioned directly at Upstash uses the UPSTASH_ names. Both work.
 *
 * When neither pair is present the store reports itself unavailable rather
 * than pretending to save. An owner who clicks Save and is told "saved" while
 * nothing persisted is worse off than one who is told to finish the setup.
 * The in-memory fallback is deliberately limited to local development, where
 * losing it on restart is the expected behaviour.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const URL_ENV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN_ENV = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

/* VERCEL_ENV is "development" under `vercel dev` and production/preview once
   deployed, which is the distinction that matters here — VERCEL itself is set
   in both, so it cannot tell them apart. */
const IS_DEPLOYED = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";

export const storeAvailable = Boolean(URL_ENV && TOKEN_ENV);

/* Dev-only scratch file so the console can be exercised end to end before a
   KV store exists. A file rather than a variable because every function runs
   in its own process under `vercel dev`, so an in-process Map would make each
   endpoint look empty to the others. Never reached once deployed. */
const devFile = path.join(os.tmpdir(), "ar-owner-dev-store.json");

function devRead() {
  try {
    return JSON.parse(fs.readFileSync(devFile, "utf8"));
  } catch {
    return {};
  }
}

async function command(args) {
  const res = await fetch(URL_ENV, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN_ENV}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`kv ${res.status}`);
  const body = await res.json();
  if (body && body.error) throw new Error(String(body.error));
  return body ? body.result : null;
}

export async function getJSON(key) {
  if (!storeAvailable) {
    if (IS_DEPLOYED) return null;
    const raw = devRead()[key];
    return raw == null ? null : JSON.parse(raw);
  }
  const raw = await command(["GET", key]);
  if (raw == null) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function setJSON(key, value) {
  const raw = JSON.stringify(value);
  if (!storeAvailable) {
    if (IS_DEPLOYED) throw new Error("storage not configured");
    const all = devRead();
    all[key] = raw;
    fs.writeFileSync(devFile, JSON.stringify(all));
    return;
  }
  await command(["SET", key, raw]);
}

export const SETTINGS_KEY = "ar:crm-settings";
