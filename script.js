/* ============================================================
   IVORIST: interactions
   ============================================================ */

// ----- sticky header -----
const header = document.getElementById("siteHeader");
const toTop = document.getElementById("toTop");

function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 24);
  toTop.classList.toggle("show", window.scrollY > 600);
  highlightNav();
  revealInView();
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

// ----- mobile menu -----
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

// close menu when a link is clicked
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

// ----- active nav highlighting -----
const sections = Array.from(document.querySelectorAll("main section[id]"));
const links = Array.from(document.querySelectorAll(".nav-links a"));

function highlightNav() {
  const pos = window.scrollY + 140;
  let current = "";
  for (const sec of sections) {
    if (sec.offsetTop <= pos) current = sec.id;
  }
  links.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === "#" + current);
  });
}

// ----- scroll reveal -----
// Deterministic: reveal anything at or above the trigger line, regardless
// of how the page was scrolled (wheel, jump, keyboard, anchor links).
const revealItems = Array.from(document.querySelectorAll(".reveal"));

function revealInView() {
  const trigger = window.innerHeight * 0.92;
  for (const el of revealItems) {
    if (!el.classList.contains("in") && el.getBoundingClientRect().top < trigger) {
      el.classList.add("in");
    }
  }
}

// ----- contact form -----
// The form posts to /api/message (handled by worker.js on Cloudflare),
// which emails the message to the founders' inbox.
const form = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");
const formError = document.getElementById("formError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const fields = form.elements;
  const button = form.querySelector("button[type=submit]");
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "Sending...";
  formSuccess.hidden = true;
  formError.hidden = true;

  const payload = {
    name: fields.name.value.trim(),
    email: fields.email.value.trim(),
    message: fields.message.value.trim(),
    website: fields.website.value, // honeypot, must stay empty
  };

  try {
    const res = await fetch("/api/message", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("send failed");
    form.reset();
    formSuccess.hidden = false;
    setTimeout(() => (formSuccess.hidden = true), 6000);
  } catch {
    formError.hidden = false;
    setTimeout(() => (formError.hidden = true), 8000);
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
});

// ----- footer year -----
document.getElementById("year").textContent = new Date().getFullYear();

// ----- initial paint state -----
// Called last, so every const/function it touches is initialized.
onScroll();
