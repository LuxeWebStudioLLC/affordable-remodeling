// POST { password } -> sets the owner session cookie.
// GET  -> reports whether a session is already valid, and whether the server
//         is even set up, so the console can show the right screen first.

import {
  checkPassword,
  clearCookie,
  isAuthed,
  issueCookie,
  noteSuccess,
  passwordConfigured,
  rateLimited,
  readBody,
} from "../_lib/auth.js";
import { storeAvailable } from "../_lib/store.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({
      configured: passwordConfigured,
      storage: storeAvailable,
      signedIn: isAuthed(req),
    });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearCookie());
    return res.status(200).json({ signedIn: false });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  if (!passwordConfigured) {
    return res.status(503).json({
      error: "No owner password is set on the server yet.",
      configured: false,
    });
  }

  if (rateLimited(req)) {
    return res.status(429).json({ error: "Too many attempts. Wait a few minutes and try again." });
  }

  const { password } = readBody(req);
  if (!checkPassword(password)) {
    /* A small constant delay blunts rapid guessing without making a correct
       login feel sluggish. */
    await new Promise((r) => setTimeout(r, 400));
    return res.status(401).json({ error: "That password is not right." });
  }

  noteSuccess(req);
  res.setHeader("Set-Cookie", issueCookie());
  return res.status(200).json({ signedIn: true, storage: storeAvailable });
}
