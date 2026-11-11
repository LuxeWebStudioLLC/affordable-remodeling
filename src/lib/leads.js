/**
 * Copies a lead to the site's own endpoint, which forwards it to whatever CRM
 * the owner connected at /owner.
 *
 * Fired alongside the existing FormSubmit call rather than replacing it, and
 * deliberately not awaited: the visitor's confirmation should never wait on a
 * third-party CRM, and if this fails the office still gets the email, which is
 * how they actually work today. Failures are swallowed for the same reason —
 * there is nothing a customer could usefully do about someone else's webhook.
 */
export function copyLeadToCrm(payload) {
  try {
    void fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, page: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* no-op: never let lead forwarding affect the form the visitor sees */
  }
}
