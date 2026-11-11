import { useCallback, useEffect, useState } from "react";

/**
 * Owner console at /owner — sign in, point the site's forms at a CRM.
 *
 * Deliberately one screen with one job. The person using it runs a remodeling
 * company, opens this perhaps twice a year, and needs to answer one question:
 * are the leads from my website arriving in my system? So the page states
 * what is connected, lets them change it, and lets them prove it with a test
 * lead rather than waiting to find out on a real customer.
 *
 * Every failure here is reported as it happened. A console that says "saved"
 * when nothing persisted would quietly lose the leads it exists to protect.
 */

const api = async (path, options = {}) => {
  const res = await fetch(path, {
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
};

function StorageNotice() {
  return (
    <div className="note warn">
      <strong>No storage connected yet.</strong> Settings can't be saved until the site has
      somewhere to keep them. It takes about two minutes:
      <ol>
        <li>
          In Vercel, open this project → <strong>Storage</strong> → create an{" "}
          <strong>Upstash for Redis</strong> database.
        </li>
        <li>Connect it to this project — Vercel adds the keys for you.</li>
        <li>Redeploy, then come back here.</li>
      </ol>
    </div>
  );
}

function Login({ onIn, configured }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    const { ok, body } = await api("/api/owner/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!ok) {
      setErr(body.error || "Could not sign in.");
      setPassword("");
      return;
    }
    onIn(body);
  };

  return (
    <div className="wrap">
      <p className="eyebrow">Affordable Home Remodeling</p>
      <h1>Owner console</h1>
      <p className="sub">Sign in to connect the website's forms to your CRM.</p>

      {!configured && (
        <div className="note warn">
          <strong>No password is set on the server yet.</strong> Add an environment variable named{" "}
          <code>OWNER_PASSWORD</code> to this project in Vercel, redeploy, and use it here. Pick a
          long one — it is the only thing guarding this page.
        </div>
      )}

      <form className="card" onSubmit={submit}>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!configured || busy}
          />
        </div>
        {err && (
          <p className="note err" style={{ marginTop: "1rem", marginBottom: 0 }} role="alert">
            {err}
          </p>
        )}
        <div className="actions">
          <button className="primary" type="submit" disabled={!configured || busy || !password}>
            {busy ? "Checking…" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Console({ storage, onOut }) {
  const [form, setForm] = useState({
    enabled: false,
    webhookUrl: "",
    headerName: "",
    headerValue: "",
  });
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState(null); // { kind, text }

  const load = useCallback(async () => {
    const { ok, body } = await api("/api/owner/settings");
    if (ok && body.settings) {
      setSaved(body.settings);
      setForm({
        enabled: body.settings.enabled,
        webhookUrl: body.settings.webhookUrl,
        headerName: body.settings.headerName,
        headerValue: body.settings.headerHint,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: k === "enabled" ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy("save");
    setMsg(null);
    const { ok, body } = await api("/api/owner/settings", {
      method: "PUT",
      body: JSON.stringify(form),
    });
    setBusy("");
    if (!ok) {
      setMsg({ kind: "err", text: body.error || "Could not save." });
      return;
    }
    setSaved(body.settings);
    setForm((p) => ({ ...p, headerValue: body.settings.headerHint }));
    setMsg({ kind: "ok", text: "Saved." });
  };

  const sendTest = async () => {
    setBusy("test");
    setMsg(null);
    const { ok, body } = await api("/api/owner/test", { method: "POST" });
    setBusy("");
    setMsg(
      ok
        ? { kind: "ok", text: "Test lead delivered. Check your CRM for “Test Lead (ignore)”." }
        : { kind: "err", text: body.error || "The test did not go through." },
    );
    load();
  };

  const signOut = async () => {
    await api("/api/owner/login", { method: "DELETE" });
    onOut();
  };

  if (loading) {
    return (
      <div className="wrap">
        <p className="sub">Loading…</p>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="top">
        <div>
          <p className="eyebrow">Affordable Home Remodeling</p>
          <h1>Owner console</h1>
        </div>
        <button className="ghost" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>

      {!storage && <StorageNotice />}
      {msg && (
        <p className={`note ${msg.kind}`} role="status">
          {msg.text}
        </p>
      )}

      <form className="card" onSubmit={save}>
        <h2>Your CRM</h2>
        <p className="hint" style={{ margin: "0 0 1.4rem" }}>
          Every estimate request, call-back request and chat enquiry from the website gets sent to
          this address as JSON — on top of the email you already receive, which does not change.
        </p>

        <div className="field">
          <label htmlFor="url">Webhook URL</label>
          <input
            id="url"
            type="url"
            inputMode="url"
            placeholder="https://hooks.zapier.com/hooks/catch/…"
            value={form.webhookUrl}
            onChange={set("webhookUrl")}
          />
          <p className="hint">
            In Zapier use a “Catch Hook” trigger; in Make a “Custom webhook”; GoHighLevel and HubSpot
            call it an inbound webhook. Paste the URL it gives you. Must start with https://
          </p>
        </div>

        <div className="field">
          <label>If your CRM needs a key (optional)</label>
          <div className="row">
            <input
              type="text"
              placeholder="Header name, e.g. Authorization"
              aria-label="Header name"
              value={form.headerName}
              onChange={set("headerName")}
            />
            <input
              type="text"
              placeholder="Value, e.g. Bearer abc123"
              aria-label="Header value"
              value={form.headerValue}
              onChange={set("headerValue")}
            />
          </div>
          <p className="hint">
            Leave both blank unless your CRM asked for one. Saved keys are never shown again in
            full — the dots mean one is stored, and typing over them replaces it.
          </p>
        </div>

        <div className="field">
          <label className="toggle" htmlFor="enabled">
            <input id="enabled" type="checkbox" checked={form.enabled} onChange={set("enabled")} />
            <span>
              Send leads to this CRM
              <br />
              <span className="hint" style={{ display: "block", marginTop: "0.15rem" }}>
                Turn this off to pause forwarding without losing the settings.
              </span>
            </span>
          </label>
        </div>

        <div className="actions">
          <button className="primary" type="submit" disabled={busy === "save"}>
            {busy === "save" ? "Saving…" : "Save"}
          </button>
          <button
            className="ghost"
            type="button"
            onClick={sendTest}
            disabled={!saved?.webhookUrl || busy === "test"}
          >
            {busy === "test" ? "Sending…" : "Send a test lead"}
          </button>
        </div>

        {saved?.updatedAt && (
          <p className="meta">
            Last saved {new Date(saved.updatedAt).toLocaleString()}
            {saved.lastResult &&
              ` · last test ${saved.lastResult.ok ? "succeeded" : `failed (${saved.lastResult.reason})`} ${new Date(
                saved.lastResult.at,
              ).toLocaleString()}`}
          </p>
        )}
      </form>

      <div className="card">
        <h2>What gets sent</h2>
        <p className="hint" style={{ margin: 0 }}>
          A JSON object with: source, name, email, phone, address, services, budget, timeline,
          message, contact_preference, page, submitted_at and business. Empty fields are sent as
          empty strings, so your CRM always sees the same shape.
        </p>
      </div>
    </div>
  );
}

export default function Owner() {
  const [state, setState] = useState(null); // null = checking

  const check = useCallback(async () => {
    const { body } = await api("/api/owner/login");
    setState({
      signedIn: Boolean(body.signedIn),
      configured: body.configured !== false,
      storage: Boolean(body.storage),
    });
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (!state) {
    return (
      <div className="wrap">
        <p className="sub">Loading…</p>
      </div>
    );
  }

  if (!state.signedIn) {
    return (
      <Login
        configured={state.configured}
        onIn={(body) => setState((p) => ({ ...p, signedIn: true, storage: Boolean(body.storage) }))}
      />
    );
  }

  return <Console storage={state.storage} onOut={() => setState((p) => ({ ...p, signedIn: false }))} />;
}
