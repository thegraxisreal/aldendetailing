const menuToggle = document.querySelector("[data-menu-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");
const header = document.querySelector("[data-header]");
const navLinks = document.querySelectorAll(".primary-nav a");
const sections = [...document.querySelectorAll("main section[id]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const beforeAfterBlocks = document.querySelectorAll("[data-before-after]");

const beforeAfterNudgeObserver = reduceMotion
  ? null
  : new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const beforeAfter = entry.target;

          if (!entry.isIntersecting) {
            beforeAfter.dataset.nudgeReady = "true";
            return;
          }

          if (
            beforeAfter.dataset.nudgeReady !== "true" ||
            beforeAfter.dataset.hasInteracted === "true" ||
            beforeAfter.dataset.isNudging === "true"
          ) {
            return;
          }

          beforeAfter.dataset.nudgeReady = "false";
          beforeAfter.dispatchEvent(new CustomEvent("before-after:nudge"));
        });
      },
      { threshold: 0.55 }
    );

beforeAfterBlocks.forEach((beforeAfter) => {
  const beforeAfterSlider = beforeAfter.querySelector("[data-before-after-slider]");

  if (!beforeAfterSlider) return;

  const updateBeforeAfter = () => {
    beforeAfter.style.setProperty("--position", `${beforeAfterSlider.value}%`);
  };

  const setBeforeAfterPosition = (value) => {
    beforeAfterSlider.value = value;
    updateBeforeAfter();
  };

  beforeAfterSlider.addEventListener("pointerdown", () => {
    beforeAfter.dataset.hasInteracted = "true";
  });

  beforeAfterSlider.addEventListener("input", () => {
    beforeAfter.dataset.hasInteracted = "true";
    updateBeforeAfter();
  });

  beforeAfter.addEventListener("before-after:nudge", () => {
    const positions = [42, 58, 47, 53, 50];
    beforeAfter.dataset.isNudging = "true";
    beforeAfter.classList.add("is-nudging");

    positions.forEach((position, index) => {
      window.setTimeout(() => {
        if (beforeAfter.dataset.hasInteracted !== "true") {
          setBeforeAfterPosition(position);
        }

        if (index === positions.length - 1) {
          window.setTimeout(() => {
            beforeAfter.classList.remove("is-nudging");
            beforeAfter.dataset.isNudging = "false";
          }, 240);
        }
      }, index * 240);
    });
  });

  beforeAfter.dataset.nudgeReady = "true";
  beforeAfterNudgeObserver?.observe(beforeAfter);
  updateBeforeAfter();
});

const closeMenu = () => {
  if (!menuToggle || !mobilePanel) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  mobilePanel.hidden = true;
  document.body.classList.remove("is-menu-open");
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();
    closeMenu();

    const headerOffset = (header?.offsetHeight || 0) + 18;
    const targetTop = targetId === "#home" ? 0 : target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: reduceMotion ? "auto" : "smooth",
    });

    window.history.pushState(null, "", targetId);
  });
});

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

const estimateForm = document.querySelector("[data-estimate-form]");
const demoMessage =
  "This is just a demo. If you choose for me to build the real site, clients could enter their info here and you'd get updated when a new booking comes in right away.";

if (estimateForm) {
  const demoControls = estimateForm.querySelectorAll("input, select, textarea, button");
  const note = estimateForm.querySelector("[data-form-note]");

  const showDemoMessage = () => {
    if (note) {
      note.textContent = demoMessage;
    }
  };

  const resetDemoControl = (control) => {
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
      control.value = "";
    }

    if (control instanceof HTMLSelectElement) {
      control.selectedIndex = 0;
    }
  };

  demoControls.forEach((control) => {
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
      control.readOnly = true;
    }

    if (control instanceof HTMLSelectElement) {
      control.setAttribute("aria-disabled", "true");
    }

    control.addEventListener("focus", showDemoMessage);
    control.addEventListener("click", showDemoMessage);
    control.addEventListener("pointerdown", (event) => {
      if (control instanceof HTMLSelectElement) {
        event.preventDefault();
        showDemoMessage();
      }
    });
    control.addEventListener("beforeinput", (event) => {
      event.preventDefault();
      resetDemoControl(control);
      showDemoMessage();
    });
    control.addEventListener("input", () => {
      resetDemoControl(control);
      showDemoMessage();
    });
    control.addEventListener("keydown", (event) => {
      if (event.key === "Tab" || event.key === "Shift") return;
      event.preventDefault();
      resetDemoControl(control);
      showDemoMessage();
    });
    control.addEventListener("change", (event) => {
      event.preventDefault();
      resetDemoControl(control);
      showDemoMessage();
    });
  });

  estimateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showDemoMessage();
  });
}
