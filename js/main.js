/* ===============================
   FOOTER YEAR
================================ */
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ===============================
   PAGE-LOAD ANIMATION TRIGGER
   (THIS FIXES THE MISSING HERO)
================================ */
requestAnimationFrame(() => {
  document.documentElement.classList.add("is-loaded");
});

/* ===============================
   BIZ CAROUSEL AUTO-SCROLL
================================ */
(() => {
  const strip = document.querySelector(".biz-strip");
  const track = document.getElementById("bizTrack");
  if (!strip || !track) return;

  let intervalId = null;
  let paused = false;
  let userInteracting = false;
  const STEP_DELAY = 3000;

  const getStep = () => {
    const firstCard = track.querySelector(".biz-card");
    if (!firstCard) return 250;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || "0");
    const cardWidth = firstCard.getBoundingClientRect().width;
    return cardWidth + gap;
  };

  const next = () => {
    if (paused || userInteracting) return;

    const step = getStep();
    const maxScroll = strip.scrollWidth - strip.clientWidth;

    if (strip.scrollLeft >= maxScroll - 5) {
      strip.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    strip.scrollBy({ left: step, behavior: "smooth" });
  };

  const start = () => {
    if (intervalId) return;
    intervalId = setInterval(next, STEP_DELAY);
  };

  strip.addEventListener("mouseenter", () => paused = true);
  strip.addEventListener("mouseleave", () => paused = false);

  let scrollTimeout = null;
  strip.addEventListener("scroll", () => {
    userInteracting = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => userInteracting = false, 400);
  }, { passive: true });

  strip.addEventListener("touchstart", () => userInteracting = true, { passive: true });
  strip.addEventListener("touchend", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => userInteracting = false, 700);
  }, { passive: true });

  start();
})();

/* ===============================
   BIZ CAROUSEL ARROWS
================================ */
(() => {
  const strip = document.querySelector(".biz-strip");
  const track = document.getElementById("bizTrack");
  const leftBtn = document.querySelector(".biz-arrow.left");
  const rightBtn = document.querySelector(".biz-arrow.right");
  if (!strip || !track || !leftBtn || !rightBtn) return;

  const getStep = () => {
    const firstCard = track.querySelector(".biz-card");
    if (!firstCard) return 250;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || "0");
    const cardWidth = firstCard.getBoundingClientRect().width;
    return cardWidth + gap;
  };

  leftBtn.addEventListener("click", () => {
    strip.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    strip.scrollBy({ left: getStep(), behavior: "smooth" });
  });
})();

/* ===============================
   MOBILE SERVICES DROPDOWN
================================ */
(() => {
  const dd = document.querySelector(".nav-dropdown");
  const btn = dd?.querySelector(".nav-dropbtn");
  const menu = dd?.querySelector(".nav-dropmenu");
  if (!dd || !btn || !menu) return;

  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (!isTouch) return;

  const close = () => {
    dd.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const open = dd.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  menu.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", (e) => {
    if (!dd.contains(e.target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

/* ===============================
   FORM SUBMISSION HANDLER
================================ */
(() => {
  const forms = document.querySelectorAll(".quote-form");

  forms.forEach((form) => {
    const card = form.closest(".hero-form-card");
    const thanks = card?.querySelector(".quote-thanks");
    if (!card || !thanks) return;

    let submitting = false;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (submitting) return;
      submitting = true;

      const formData = new FormData(form);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: formData
        });

        if (response.ok) {
          form.style.display = "none";
          thanks.style.display = "block";
        } else {
          submitting = false;
          alert("Something went wrong. Please try again or call us.");
        }
      } catch {
        submitting = false;
        alert("Network error. Please try again.");
      }
    });
  });
})();

<!-- GHL FORM SCRIPT (REQUIRED) -->
<script src="https://links.summitflowcrm.com/js/form_embed.js"></script>
