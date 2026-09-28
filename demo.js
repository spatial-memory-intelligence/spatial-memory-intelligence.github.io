(() => {
  'use strict';
  const methods = ['Base', 'FramePack', 'Deep Forcing', 'MoC', 'VMem', 'MemFlow'];
  const players = [];
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const caseName = c => `${c.backbone} · Case ${c.case}`;

  function createPlayer(section, cases) {
    const $ = role => section.querySelector(`[data-role="${role}"]`);
    const left = $('baseline-video'), right = $('smi-video'), videos = [left, right];
    const play = $('play-pair'), timeline = $('timeline'), speed = $('playback-speed');
    let selected, wanted = false, starting = false, pendingTime = 0, generation = 0, loaded = false;
    const duration = () => selected?.duration || 0;
    const status = text => { $('playback-status').textContent = text; };
    const pause = () => { wanted = false; videos.forEach(v => v.pause()); play.textContent = 'Play both'; status('Paused'); };
    const player = { pause, tick };
    players.push(player);

    function showTime(t) {
      timeline.value = String(t);
      timeline.style.setProperty('--progress', `${duration() ? t / duration() * 100 : 0}%`);
      $('time-display').textContent = `${fmt(t)} / ${fmt(duration())}`;
      timeline.setAttribute('aria-valuetext', `${t.toFixed(1)} seconds of ${duration().toFixed(1)} seconds`);
    }
    async function start() {
      if (!wanted || starting || videos.some(v => v.readyState < 3 || v.seeking)) return;
      starting = true;
      const currentGeneration = generation;
      try {
        videos.forEach(v => { v.playbackRate = Number(speed.value); });
        await Promise.all(videos.map(v => v.play()));
        if (currentGeneration !== generation) return;
        if (!wanted) { videos.forEach(v => v.pause()); return; }
        play.textContent = 'Pause both'; status('Playing in sync');
      } catch (error) {
        if (currentGeneration === generation && error.name !== 'AbortError') {
          pause(); status('Playback paused. Press Play both to try again.');
        }
      } finally {
        starting = false;
        if (wanted && currentGeneration !== generation) start();
      }
    }
    function seek(t) {
      pendingTime = Math.max(0, Math.min(t, duration()));
      videos.forEach(v => { if (v.readyState >= 1) v.currentTime = Math.min(pendingTime, v.duration); });
      showTime(pendingTime);
    }
    function loadSources() {
      if (loaded) return;
      loaded = true;
      videos.forEach(v => { v.src = v.dataset.source; v.preload = 'metadata'; v.load(); });
    }
    function loadPair(t = 0, eager = false) {
      pause(); generation++; pendingTime = t; loaded = false;
      const method = $('method-select').value;
      $('baseline-label').textContent = method;
      videos.forEach((v, i) => {
        const name = i ? 'SMI' : method;
        v.removeAttribute('src'); v.load();
        v.poster = selected.posters[name]; v.dataset.source = selected.methods[name];
        $(i ? 'smi-open' : 'baseline-open').href = selected.methods[name];
        v.setAttribute('aria-label', `${name}: ${caseName(selected)}`);
      });
      timeline.max = String(duration());
      [play, timeline, $('restart-pair'), $('method-select')].forEach(el => { el.disabled = false; });
      showTime(t); status('Ready');
      if (eager) loadSources();
    }
    function selectCase(scene, eager = false) {
      selected = scene;
      section.querySelectorAll('.scene-card').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scene === scene.id)));
      $('scene-title').textContent = caseName(scene);
      $('scene-meta').textContent = `${scene.duration.toFixed(1)} s`;
      $('baseline-backbone').textContent = scene.backbone; $('smi-backbone').textContent = scene.backbone;
      $('coverage-note').textContent = scene.all_methods ? '7 methods available' : 'Base + SMI';
      $('method-select').replaceChildren(...methods.filter(m => scene.methods[m]).map(m => new Option(m, m)));
      loadPair(0, eager);
    }
    play.addEventListener('click', () => {
      if (wanted) { pause(); status('Paused'); return; }
      players.filter(p => p !== player).forEach(p => p.pause());
      loadSources();
      if (right.ended || right.currentTime >= duration() - .08) seek(0);
      wanted = true; play.textContent = 'Pause both'; status('Loading both videos…');
      videos.forEach(v => { v.preload = 'auto'; });
      start();
    });
    $('restart-pair').addEventListener('click', () => { pause(); loadSources(); seek(0); status('Ready'); });
    $('method-select').addEventListener('change', () => loadPair(loaded ? right.currentTime : pendingTime, true));
    timeline.addEventListener('input', () => { pause(); loadSources(); seek(Number(timeline.value)); status('Paused'); });
    speed.addEventListener('change', () => videos.forEach(v => { v.playbackRate = Number(speed.value); }));
    $('expand-pair').addEventListener('click', async () => {
      try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('comparison').requestFullscreen(); }
      catch { status('Use Open video for a larger view.'); }
    });
    videos.forEach(v => {
      v.addEventListener('loadedmetadata', () => { if (pendingTime) v.currentTime = Math.min(pendingTime, v.duration); });
      v.addEventListener('canplay', start);
      v.addEventListener('seeked', start);
      v.addEventListener('waiting', () => {
        if (!wanted) return;
        videos.forEach(item => item.pause()); status('Buffering · keeping both views together');
      });
      v.addEventListener('error', () => { if (loaded) { pause(); status('Video could not load. Try another method or use Open video.'); } });
      v.addEventListener('ended', () => { pause(); showTime(duration()); status('Complete · replay or choose another case'); });
    });
    function tick() {
      if (wanted && !right.paused && !right.seeking) {
        if (!left.seeking && Math.abs(left.currentTime - right.currentTime) > .12) left.currentTime = right.currentTime;
        showTime(right.currentTime);
      }
    }
    cases.forEach(scene => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'scene-card'; button.dataset.scene = scene.id;
      button.setAttribute('aria-pressed', 'false');
      const image = document.createElement('img'); image.src = scene.posters.SMI; image.alt = ''; image.width = 832; image.height = 480; image.loading = 'lazy';
      const body = document.createElement('span'); body.className = 'scene-card-copy';
      const title = document.createElement('strong'); title.textContent = caseName(scene);
      const meta = document.createElement('span'); meta.className = 'scene-card-meta'; meta.textContent = `${scene.duration.toFixed(1)} s`;
      const count = document.createElement('span'); count.className = 'scene-method-count'; count.textContent = scene.all_methods ? '7 methods' : 'Base + SMI';
      body.append(title, meta); button.append(image, count, body);
      button.addEventListener('click', () => selectCase(scene, true)); $('scene-list').append(button);
    });
    selectCase(cases[0]);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { loadSources(); observer.disconnect(); }
      }, { rootMargin: '160px' });
      observer.observe($('comparison'));
    }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) players.forEach(p => p.pause()); });
  fetch('demo-data.json?v=20260928-2').then(r => { if (!r.ok) throw new Error('Manifest unavailable'); return r.json(); }).then(data => {
    document.querySelectorAll('.demo-group').forEach(section => createPlayer(section, data.filter(c => c.category.toLowerCase() === section.dataset.category)));
    function tick() { players.forEach(p => p.tick()); requestAnimationFrame(tick); }
    tick();
  }).catch(() => document.querySelectorAll('[data-role="playback-status"]').forEach(el => { el.textContent = 'The case list could not load. Please refresh the page.'; }));
})();
