/* =========================================================
   IVORIST
   Shared interactions
   ========================================================= */


/* -------------------------
   1. FOOTER YEAR
   ------------------------- */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* -------------------------
   2. STICKY HEADER
   ------------------------- */

const header = document.getElementById("siteHeader");

function updateHeader() {
    if (!header) {
        return;
    }

    header.classList.toggle(
        "scrolled",
        window.scrollY > 20
    );
}

window.addEventListener("scroll", updateHeader, {
    passive: true
});

updateHeader();


/* -------------------------
   3. MOBILE NAVIGATION
   ------------------------- */

const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

if (navToggle && navLinks) {

    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");

        navToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    // Close the menu after selecting a page.

    navLinks.addEventListener("click", (event) => {
        const clickedLink = event.target.closest("a");

        if (!clickedLink) {
            return;
        }

        navLinks.classList.remove("open");

        navToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    });


    // Close the menu when clicking outside it.

    document.addEventListener("click", (event) => {
        const clickedInsideMenu = navLinks.contains(event.target);
        const clickedToggle = navToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle) {
            navLinks.classList.remove("open");

            navToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });


    // Close the menu when returning to desktop width.

    window.addEventListener("resize", () => {
        if (window.innerWidth > 700) {
            navLinks.classList.remove("open");

            navToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });

}


/* -------------------------
   4. SCROLL REVEAL
   ------------------------- */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");

                observer.unobserve(entry.target);
            });

        },
        {
            threshold: 0.08,
            rootMargin: "0px 0px -25px 0px"
        }
    );


    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

} else {

    // Fallback for older browsers.

    revealElements.forEach((element) => {
        element.classList.add("is-visible");
    });

}


/* -------------------------
   5. CONTACT FORM
   ------------------------- */

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    const submitButton = document.getElementById("submitButton");

    const successMessage = document.getElementById("formSuccess");
    const errorMessage = document.getElementById("formError");


    contactForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // Let the browser handle required fields and email validation.

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }


        // Prevent multiple submissions.

        if (submitButton.disabled) {
            return;
        }


        const fields = contactForm.elements;


        // Keep the original API payload format.

        const payload = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            message: fields.message.value.trim(),

            // Honeypot field. It should remain empty.
            website: fields.website.value
        };


        // Hide old feedback.

        if (successMessage) {
            successMessage.hidden = true;
        }

        if (errorMessage) {
            errorMessage.hidden = true;
        }


        // Start the loading state.

        submitButton.disabled = true;
        submitButton.classList.add("is-loading");

        submitButton.setAttribute("aria-busy", "true");

        const buttonLabel = submitButton.querySelector(".button-label");

        const originalLabel = buttonLabel
            ? buttonLabel.textContent
            : "Send message";

        if (buttonLabel) {
            buttonLabel.textContent = "Sending...";
        }


        try {

            const response = await fetch("/api/message", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            });


            if (!response.ok) {
                throw new Error("The message could not be sent.");
            }


            // The request succeeded.

            contactForm.reset();

            if (successMessage) {
                successMessage.hidden = false;
            }


        } catch (error) {

            console.error("Contact form error:", error);

            if (errorMessage) {
                errorMessage.hidden = false;
            }


        } finally {

            // Always restore the button.

            submitButton.disabled = false;

            submitButton.classList.remove("is-loading");

            submitButton.removeAttribute("aria-busy");

            if (buttonLabel) {
                buttonLabel.textContent = originalLabel;
            }

        }

    });

}


/* -------------------------
   6. HERO QUOTES
   ------------------------- */

// The home page hero shows one line from the studio; picking
// happens at load time so every refresh can say something
// different. Without JavaScript the first quatrain stays as
// the static fallback.

const heroQuotes = [
    { pre: "We build the", accent: "whole", post: "product" },
    { pre: "Hardware, software,", accent: "one", post: "team" },
    { pre: "From schematic", accent: "to shipped.", post: "" },
    { pre: "Small studio,", accent: "full stack.", post: "" },
    { pre: "Ideas", accent: "made", post: "physical" },
    { pre: "Built to run", accent: "everywhere.", post: "" },
    { pre: "Prototyped", accent: "until", post: "it works" }
];

function renderHeroQuote() {

    const heroTitle = document.getElementById("heroTitle");

    if (!heroTitle) {
        return;
    }

    const quote = heroQuotes[Math.floor(Math.random() * heroQuotes.length)];

    heroTitle.textContent = "";

    if (quote.pre) {

        const preNode = document.createTextNode(quote.pre + " ");
        heroTitle.appendChild(preNode);

    }

    const accentNode = document.createElement("span");
    accentNode.className = "gradient-text";
    accentNode.textContent = quote.accent;
    heroTitle.appendChild(accentNode);

    if (quote.post) {

        const postNode = document.createTextNode(" " + quote.post);
        heroTitle.appendChild(postNode);

    }

}

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", renderHeroQuote);

} else {

    renderHeroQuote();

}


/* -------------------------
   7. PROJECT DIRECTORY
   ------------------------- */

// The projects page and the home page featured project are
// rendered from projects.json at load time. The markup already
// on the pages stays in place as a fallback in case the fetch
// fails (for example when opened without a server).

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

}

const statusLabels = {
    "in-development": "IN DEVELOPMENT",
    "released": "RELEASED",
    "live": "LIVE"
};

function statusClass(project) {

    if (project.status === "released" || project.status === "live") {
        return "status-released";
    }

    return "status-development";

}


function buildProjectCard(project) {

    const statusLabel = statusLabels[project.status] || "IN DEVELOPMENT";

    const actions = [];

    if (project.url) {
        actions.push(
            `<a href="${escapeHtml(project.url)}" class="button button-outline">View project <span aria-hidden="true">↗</span></a>`
        );
    }

    if (project.liveUrl) {
        actions.push(
            `<a href="${escapeHtml(project.liveUrl)}" class="button button-primary" target="_blank" rel="noopener noreferrer">Visit live <span aria-hidden="true">↗</span></a>`
        );
    }

    if (project.repoUrl) {
        actions.push(
            `<a href="${escapeHtml(project.repoUrl)}" class="text-link" target="_blank" rel="noopener noreferrer">View source <span aria-hidden="true">↗</span></a>`
        );
    }

    const highlights = (project.highlights || []).map((item) => `<span>${escapeHtml(String(item).toUpperCase())}</span>`).join("");

    return `
        <article class="project-card">

            <div class="project-card-top">
                <span class="project-number">${escapeHtml(project.number || "")}</span>
                <span class="status ${statusClass(project)}">${statusLabel}</span>
            </div>

            <div class="project-card-content">

                <div>
                    <p class="eyebrow">${escapeHtml(String(project.category || "").toUpperCase())}</p>

                    <h2>${escapeHtml(project.name || "")}</h2>

                    <p>${escapeHtml(project.summary || "")}</p>
                </div>

                <div class="project-actions">
                    ${actions.join("\n\n                    ")}
                </div>

            </div>

            <div class="project-card-footer">${highlights}</div>

        </article>
    `;

}


function applyFeaturedProject(project) {

    if (!project) {
        return;
    }

    const numberElement = document.getElementById("featuredNumber");
    const statusElement = document.getElementById("featuredStatus");
    const nameElement = document.getElementById("featuredName");
    const summaryElement = document.getElementById("featuredSummary");
    const featureElement = document.getElementById("featuredFeature");
    const linkElement = document.getElementById("featuredLink");

    if (numberElement && project.number) {
        numberElement.textContent = `PROJECT ${project.number}`;
    }

    if (statusElement) {
        statusElement.textContent = statusLabels[project.status] || "IN DEVELOPMENT";
    }

    if (nameElement && project.name) {
        nameElement.textContent = project.name;
    }

    if (summaryElement && project.summary) {
        summaryElement.textContent = project.summary;
    }

    if (featureElement) {

        if (project.feature) {
            featureElement.textContent = project.feature;
        } else {
            featureElement.remove();
        }

    }

    if (linkElement) {

        if (project.url) {
            linkElement.href = project.url;
        }

        if (project.name) {
            linkElement.innerHTML = `Explore ${escapeHtml(project.name)} <span aria-hidden="true">↗</span>`;
        }

    }

}


function renderProjects() {

    const list = document.getElementById("projectList");
    const counter = document.getElementById("projectCount");
    const featured = document.getElementById("featuredName");

    if (!list && !featured) {
        return;
    }

    fetch("projects.json")
        .then((response) => {

            if (!response.ok) {
                throw new Error("projects.json could not be loaded.");
            }

            return response.json();

        })
        .then((data) => {

            const projects = Array.isArray(data.projects) ? data.projects : [];

            if (!projects.length) {
                return;
            }

            if (list) {
                list.innerHTML = projects.map(buildProjectCard).join("\n\n");
            }

            if (counter) {
                counter.textContent = `${String(projects.length).padStart(2, "0")} LISTED`;
            }

            if (featured) {
                applyFeaturedProject(projects[0]);
            }

        })
        .catch(() => {

            // The static markup on the page stays visible as the fallback.

        });

}

renderProjects();
