/**
 * Password gate for the owner console.
 *
 * One operator, one password, so there is no user table — OWNER_PASSWORD in
 * the Vercel project's environment is the whole credential store. The browser
 * never holds the password after login: it gets an HttpOnly cookie carrying a
 * signed token, which cannot be read or forged from JavaScript.
 *
 * The token is signed with OWNER_SESSION_SECRET, or, if that is not set, with
 * a key derived from the password itself. Deriving it keeps the required setup
 * to a single variable and has a useful side effect: changing the password
 * changes the key, so every existing session dies with it. That is also the
 * only revocation there is — signing out clears the cookie in that browser,
 * but the token itself stays valid until it expires, as with any stateless
 * session. Changing OWNER_PASSWORD is how you lock everyone out at once.
 *
 * Comparisons are timing-safe. The practical attack on a single-password login
 * is online guessing rather than timing, which is what the rate limit below is
 * for, but constant-time compare costs nothing and removes the question.
 */

import crypto from "node:crypto";

const COOKIE = "ar_owner";
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export const passwordConfigured = Boolean(process.env.OWNER_PASSWORD);

function signingKey() {
  const explicit = process.env.OWNER_SESSION_SECRET;
  if (explicit) return explicit;
  return crypto
    .createHash("sha256")
    .update(`ar-owner-session:${process.env.OWNER_PASSWORD || ""}`)
    .digest("hex");
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

function sign(payload) {
  return crypto.createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

/** Constant-time compare that tolerates differing lengths. */
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) {
    // Still burn a comparison so length alone is not a fast path.
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

export function checkPassword(candidate) {
  const expected = process.env.OWNER_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate ?? "", expected);
}

export function issueCookie() {
  const payload = b64url(JSON.stringify({ exp: Date.now() + TTL_MS }));
  const token = `${payload}.${sign(payload)}`;
  const attrs = [
    `${COOKIE}=${token}`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${Math.floor(TTL_MS / 1000)}`,
  ];
  return attrs.join("; ");
}

export function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function readCookie(req) {
  const header = req.headers?.cookie || "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE) return rest.join("=");
  }
  return null;
}

export function isAuthed(req) {
  if (!passwordConfigured) return false;
  const token = readCookie(req);
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  if (!safeEqual(mac, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

/* Best-effort throttle on login attempts. Serverless instances are not shared,
   so this slows a guessing run without being a guarantee — the real strength
   has to come from the password itself, which is why the console asks for a
   long one. */
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function rateLimited(req) {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(ip, { first: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

export function noteSuccess(req) {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  attempts.delete(ip);
}

export function requireAuth(req, res) {
  if (isAuthed(req)) return true;
  res.status(401).json({ error: "not signed in" });
  return false;
}

export function readBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body && typeof body === "object" ? body : {};
}
