(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const film = document.getElementById('hero-film');
  const button = document.querySelector('.hero-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  let requested = !reduced.matches;
  let visible = false;
  let source = '';

  function updateButton() {
    const playing = !film.paused;
    button.textContent = playing ? 'Pause background' : 'Play background';
    button.setAttribute('aria-label', button.textContent + ' video');
    button.setAttribute('aria-pressed', String(playing));
  }

  function chooseSource() {
    const next = mobile.matches ? film.dataset.mobile : film.dataset.desktop;
    if (next === source) return;
    source = next;
    film.classList.remove('is-playing');
    film.src = next;
    film.load();
  }

  function sync() {
    if (requested && visible && !document.hidden) {
      chooseSource();
      film.play().catch(updateButton);
    } else {
      film.pause();
    }
    updateButton();
  }

  button.hidden = false;
  button.addEventListener('click', () => { requested = film.paused; sync(); });
  film.addEventListener('playing', () => { film.classList.add('is-playing'); updateButton(); });
  film.addEventListener('pause', updateButton);
  film.addEventListener('error', () => { film.classList.remove('is-playing'); button.hidden = true; });
  document.addEventListener('visibilitychange', sync);
  mobile.addEventListener('change', () => {
    film.classList.remove('is-playing');
    if (requested && visible) { chooseSource(); sync(); }
  });
  reduced.addEventListener('change', () => { requested = !reduced.matches; sync(); });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.05 }).observe(hero);
  } else {
    visible = true;
    sync();
  }

  // Progressive enhancement: figures remain visible if animation is unsupported.
  if (!reduced.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-heading, .operation, .abstract-inner').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
})();
