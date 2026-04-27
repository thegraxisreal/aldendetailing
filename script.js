const menuToggle = document.querySelector("[data-menu-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const header = document.querySelector("[data-header]");
const navLinks = document.querySelectorAll(".primary-nav a");
const sections = [...document.querySelectorAll("main section[id]")];

const closeMenu = () => {
  if (!menuToggle || !mobilePanel) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  mobilePanel.hidden = true;
  document.body.classList.remove("is-menu-open");
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  mobilePanel.hidden = isOpen;
  document.body.classList.toggle("is-menu-open", !isOpen);
});

mobilePanel?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 45, 180)}ms`;
  revealObserver.observe(element);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  {
    rootMargin: "-45% 0px -48% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener(
  "scroll",
  () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  },
  { passive: true }
);

document.querySelector("[data-estimate-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const note = form.querySelector("[data-form-note]");
  const body = [
    `Name: ${data.get("name") || ""}`,
    `Phone: ${data.get("phone") || ""}`,
    `Vehicle: ${data.get("vehicle") || ""}`,
    `Service: ${data.get("service") || ""}`,
    "",
    `${data.get("message") || ""}`,
  ].join("\n");

  const subject = encodeURIComponent("Detailing estimate request");
  const message = encodeURIComponent(body);
  window.location.href = `mailto:aldensallindetailing@gmail.com?subject=${subject}&body=${message}`;

  if (note) {
    note.textContent = "Opening your email app with the estimate request.";
  }
});
