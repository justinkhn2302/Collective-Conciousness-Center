(() => {
  const hero = document.getElementById("hero");
  const waveReveals = document.querySelectorAll("[data-wave-reveal]");

  function updateHeroProgress() {
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const scrollable = hero.offsetHeight - window.innerHeight;
    const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
    const progress = scrollable > 0 ? traveled / scrollable : 0;

    hero.style.setProperty("--progress", progress.toFixed(4));
  }

  let heroTicking = false;

  function requestHeroUpdate() {
    if (heroTicking) return;

    heroTicking = true;

    requestAnimationFrame(() => {
      updateHeroProgress();
      heroTicking = false;
    });
  }

  updateHeroProgress();

  window.addEventListener(
    "scroll",
    requestHeroUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestHeroUpdate
  );

  const readyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const reveal = entry.target;

        if (!reveal.classList.contains("is-revealed")) {
          reveal.classList.add("is-ready");
        }

        readyObserver.unobserve(reveal);
      });
    },
    {
      threshold: 0.28
    }
  );

  waveReveals.forEach((reveal) => {
    const trigger =
      reveal.querySelector(".wave-reveal-trigger");

    readyObserver.observe(reveal);

    if (!trigger) return;

    trigger.addEventListener("click", () => {
      if (reveal.classList.contains("is-revealed")) return;

      reveal.classList.add("is-ready");
      reveal.classList.add("is-revealed");

      trigger.setAttribute(
        "aria-expanded",
        "true"
      );
    });
  });
})();