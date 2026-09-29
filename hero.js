(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const film = document.getElementById('hero-film');
  const button = document.querySelector('.hero-pause');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const poster = document.querySelector('.hero-still img');
  const canvas = document.getElementById('hero-grid');
  const context = canvas?.getContext('2d', { alpha: false });
  let frameCallback = 0;
  let requested = !reduced.matches;
  let visible = false;
  let source = '';

  // Crop each tile independently, keeping all 16 cells equal at any viewport ratio.
  // A single decoded mosaic supplies the cells, including while the cover is paused.
  function paint() {
    if (!context) return;
    const media = film.readyState >= 2 ? film : poster;
    const sw = media === film ? film.videoWidth : poster.naturalWidth;
    const sh = media === film ? film.videoHeight : poster.naturalHeight;
    if (!sw || !sh) return;
    const sourceColumns = sw > sh ? 4 : 2;
    const columns = mobile.matches ? 2 : 4, rows = 16 / columns;
    const tileWidth = sw / sourceColumns, tileHeight = sh / (16 / sourceColumns);
    for (let i = 0; i < 16; i++) {
      const column = i % columns, row = Math.floor(i / columns);
      const x = Math.round(column * canvas.width / columns);
      const y = Math.round(row * canvas.height / rows);
      const width = Math.round((column + 1) * canvas.width / columns) - x;
      const height = Math.round((row + 1) * canvas.height / rows) - y;
      const scale = Math.max(width / tileWidth, height / tileHeight);
      const cropWidth = width / scale, cropHeight = height / scale;
      const sx = (i % sourceColumns) * tileWidth + (tileWidth - cropWidth) / 2;
      const sy = Math.floor(i / sourceColumns) * tileHeight + (tileHeight - cropHeight) / 2;
      context.drawImage(media, sx, sy, cropWidth, cropHeight, x, y, width, height);
    }
    canvas.dataset.columns = String(columns);
    canvas.dataset.rows = String(rows);
    canvas.parentElement.classList.add('canvas-ready');
  }

  function resizeGrid() {
    if (!context) return;
    const rect = hero.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2, 2560 / rect.width);
    canvas.width = Math.max(1, Math.round(rect.width * scale));
    canvas.height = Math.max(1, Math.round(rect.height * scale));
    paint();
  }

  function stopFrames() {
    if (!frameCallback) return;
    if ('cancelVideoFrameCallback' in film) film.cancelVideoFrameCallback(frameCallback);
    else cancelAnimationFrame(frameCallback);
    frameCallback = 0;
  }

  function nextFrame() {
    frameCallback = 0;
    paint();
    if (film.paused || document.hidden || !visible || !context) return;
    frameCallback = 'requestVideoFrameCallback' in film
      ? film.requestVideoFrameCallback(nextFrame) : requestAnimationFrame(nextFrame);
  }

  poster.addEventListener('load', paint);
  film.addEventListener('loadeddata', paint);
  film.addEventListener('seeked', paint);
  if ('ResizeObserver' in window) new ResizeObserver(resizeGrid).observe(hero);
  else window.addEventListener('resize', resizeGrid);
  resizeGrid();

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
    stopFrames();
    film.classList.remove('is-playing');
    film.src = next;
    film.load();
    paint();
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
  film.addEventListener('playing', () => { film.classList.add('is-playing'); updateButton(); stopFrames(); nextFrame(); });
  film.addEventListener('pause', () => { stopFrames(); paint(); updateButton(); });
  film.addEventListener('error', () => { stopFrames(); paint(); film.classList.remove('is-playing'); button.hidden = true; });
  document.addEventListener('visibilitychange', sync);
  mobile.addEventListener('change', () => {
    film.classList.remove('is-playing');
    if (requested && visible) { chooseSource(); sync(); }
    resizeGrid();
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
