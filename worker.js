/* ============================================================
   Ivorist: contact form endpoint
   POST /api/message  { name, email, message, website }
   The form posts here; every real submission is emailed to the
   founders' inbox through the SEND_EMAIL binding.
   ============================================================ */

const DESTINATION = "team@ivorists.com"; // real mailbox on IONOS
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
      return handleContact(request, env, url.hostname);
    }

    if (url.pathname === "/api/notify") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed" }, 405);
      }
      return handleNotify(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env, host) {
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

  const bodyText = [
    "Name: " + name,
    "Email: " + email,
    "",
    text,
    "",
    "Sent from the contact form on " + host,
  ].join("\r\n");

  try {
    const result = await env.SEND_EMAIL.send({
      to: DESTINATION,
      from: FROM,
      subject,
      text: bodyText,
      replyTo: email,
      headers: { "X-Source": "ivorists.com contact form" },
    });
    console.log("email sent, id:", result && result.messageId);
    return json({ ok: true });
  } catch (err) {
    const code = err && err.code ? err.code : "";
    console.error("email send failed:", code, err && err.message);
    return json({ ok: false, error: "Not sent" }, 500);
  }
}

const NOTIFY_PROJECTS = new Set(["archivist", "frostos", "strova"]);

async function handleNotify(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // Same honeypot as /api/message: pretend it worked.
  if (safeHeader(body.website)) {
    return json({ ok: true });
  }

  const email = safeHeader(body.email).slice(0, LIMITS.email);
  const project = safeHeader(body.project).toLowerCase();

  if (!email || !project) {
    return json({ ok: false, error: "Missing fields" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Invalid email" }, 400);
  }
  if (!NOTIFY_PROJECTS.has(project)) {
    return json({ ok: false, error: "Unknown project" }, 400);
  }

  try {
    await env.NOTIFY_DB.prepare(
      "INSERT INTO notify_signups (email, project) VALUES (?1, ?2) ON CONFLICT (email, project) DO NOTHING"
    )
      .bind(email, project)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error("notify insert failed:", err && err.message);
    return json({ ok: false, error: "Not saved" }, 500);
  }
}
