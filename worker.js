/* ============================================================
   Ivorist: contact form endpoint
   POST /api/message  { name, email, message, website }
   The form posts here; every real submission is emailed to the
   founders' inbox through the SEND_EMAIL binding.
   ============================================================ */

const DESTINATION = "hemalviral2011@gmail.com";
const FROM = "team@ivorists.com";

const LIMITS = { name: 120, email: 254, subject: 200, message: 5000 };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Header values must never contain newlines or control characters.
function safeHeader(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/[\r\n\x00-\x1f\x7f]+/g, " ")
    .trim();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/message") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405);
      }
      return handleContact(request, url.hostname);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, host) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // Honeypot: bots fill the invisible "website" field. Respond as if
  // it worked and drop the submission.
  if (safeHeader(body.website)) {
    return json({ ok: true });
  }

  const name = safeHeader(body.name).slice(0, LIMITS.name);
  const email = safeHeader(body.email).slice(0, LIMITS.email);
  const text = String(body.message === null || body.message === undefined ? "" : body.message)
    .replace(/\r/g, "")
    .trim()
    .slice(0, LIMITS.message);

  if (!name || !email || !text) {
    return json({ ok: false, error: "Missing fields" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Invalid email" }, 400);
  }

  const subject = safeHeader("New message from " + name + " (ivorists.com)").slice(0, LIMITS.subject);

  const mime = [
    "From: Ivorist website <" + FROM + ">",
    "To: " + DESTINATION,
    "Reply-To: " + email,
    "Subject: " + subject,
    "Content-Type: text/plain; charset=utf-8",
    "X-Source: ivorists.com contact form",
    "",
    "Name: " + name,
    "Email: " + email,
    "",
    text,
    "",
    "Sent from the contact form on " + host,
  ].join("\r\n") + "\r\n";

  try {
    const mail = new EmailMessage(FROM, DESTINATION, mime);
    await env.SEND_EMAIL.send(mail);
    return json({ ok: true });
  } catch (err) {
    console.error("email send failed:", err instanceof Error ? err.message : err);
    return json({ ok: false, error: "Not sent" }, 500);
  }
}
