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
