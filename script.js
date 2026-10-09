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
// Videos load only when requested; the static catalog also works from file://.
(() => {
  const mediaItems = [...document.querySelectorAll('.product-media')];
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = null;
  const states = new WeakMap();

  function stop(media) {
    const state = states.get(media);
    state.request++;
    state.wanted = false;
    state.manual = false;
    media.querySelector('video').pause();
    media.classList.remove('is-playing');
    const button = media.querySelector('button');
    button.textContent = 'Play video';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `Play video of ${button.dataset.productName}`);
    if (active === media) active = null;
  }

  async function play(media, manual) {
    const state = states.get(media);
    if (active && active !== media) stop(active);
    active = media;
    const request = ++state.request;
    state.wanted = true;
    state.manual = manual;
    const video = media.querySelector('video');
    const button = media.querySelector('button');
    const status = media.querySelector('.media-status');
    status.textContent = '';
    button.textContent = 'Loading…';
    if (!video.getAttribute('src')) {
      video.src = video.dataset.src;
      video.load();
    }
    try {
      await video.play();
      if (request !== state.request || !state.wanted) return;
      media.classList.add('is-playing');
      button.textContent = 'Pause video';
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', `Pause video of ${button.dataset.productName}`);
    } catch (error) {
      if (request !== state.request) return;
      stop(media);
      if (error.name !== 'AbortError') {
        status.textContent = 'Video unavailable. You can still browse the photo and details.';
      }
    }
  }

  mediaItems.forEach(media => {
    states.set(media, {request: 0, wanted: false, manual: false});
    const button = media.querySelector('button');
    button.addEventListener('click', () => {
      if (states.get(media).wanted) stop(media);
      else play(media, true);
    });
    media.addEventListener('pointerenter', () => {
      if (hover.matches && !reducedMotion.matches && !states.get(media).wanted) play(media, false);
    });
    media.addEventListener('pointerleave', () => {
      if (!states.get(media).manual) stop(media);
    });
    media.querySelector('video').addEventListener('error', () => {
      if (!states.get(media).wanted) return;
      stop(media);
      media.querySelector('.media-status').textContent = 'Video unavailable. You can still browse the photo and details.';
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) stop(entry.target);
      });
    });
    mediaItems.forEach(media => observer.observe(media));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && active) stop(active);
  });
  window.addEventListener('pagehide', () => { if (active) stop(active); });
})();
