(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const left = $('baseline-video'), right = $('smi-video'), videos = [left, right];
  const play = $('play-pair'), timeline = $('timeline'), speed = $('playback-speed');
  const methods = ['Base', 'FramePack', 'Deep Forcing', 'MoC', 'VMem', 'MemFlow'];
  let cases = [], selected, wanted = false, starting = false, pendingTime = 0, generation = 0;
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const duration = () => selected?.duration || 0;
  const status = text => { $('playback-status').textContent = text; };
  const pause = () => { wanted = false; videos.forEach(v => v.pause()); play.textContent = 'Play both'; };
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
  function loadPair(t = 0) {
    pause(); generation++; pendingTime = t;
    const method = $('method-select').value;
    $('baseline-label').textContent = method;
    videos.forEach((v, i) => {
      const name = i ? 'SMI' : method;
      v.poster = selected.posters[name];
      v.src = selected.methods[name];
      v.preload = 'metadata'; v.load();
      $(i ? 'smi-open' : 'baseline-open').href = selected.methods[name];
      v.setAttribute('aria-label', `${name}: ${selected.title}`);
    });
    timeline.max = String(duration());
    [play, timeline, $('restart-pair'), $('method-select')].forEach(el => { el.disabled = false; });
    showTime(t); status('Ready · press Play both');
  }
  function selectScene(scene) {
    selected = scene;
    document.querySelectorAll('.scene-card').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.scene === scene.id)));
    $('scene-title').textContent = scene.title;
    $('demo-category').textContent = scene.category;
    $('scene-meta').textContent = `${scene.backbone} · Case ${scene.case} · ${scene.duration.toFixed(1)} s`;
    $('baseline-backbone').textContent = scene.backbone; $('smi-backbone').textContent = scene.backbone;
    $('scene-description').textContent = scene.description;
    $('paper-location').textContent = scene.paper;
    $('coverage-note').textContent = scene.all_methods ? 'Six baselines available · SMI stays on the right' : 'Teaser example · Base vs SMI';
    $('method-select').replaceChildren(...methods.filter(m => scene.methods[m]).map(m => new Option(m, m)));
    loadPair();
  }
  play.addEventListener('click', () => {
    if (wanted) { pause(); status('Paused · both views aligned'); return; }
    if (right.ended || right.currentTime >= duration() - .08) seek(0);
    wanted = true; play.textContent = 'Pause both'; status('Loading both videos…');
    videos.forEach(v => { v.preload = 'auto'; });
    start();
  });
  $('restart-pair').addEventListener('click', () => { pause(); seek(0); status('Ready · replay from the start'); });
  $('method-select').addEventListener('change', () => loadPair(right.currentTime));
  timeline.addEventListener('input', () => { pause(); seek(Number(timeline.value)); status('Paused · both views aligned'); });
  speed.addEventListener('change', () => videos.forEach(v => { v.playbackRate = Number(speed.value); }));
  $('expand-pair').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('comparison').requestFullscreen(); }
    catch { status('Full screen is unavailable. Use Open video for a larger view.'); }
  });
  videos.forEach(v => {
    v.addEventListener('loadedmetadata', () => { if (pendingTime) v.currentTime = Math.min(pendingTime, v.duration); });
    v.addEventListener('canplay', start);
    v.addEventListener('seeked', start);
    v.addEventListener('waiting', () => {
      if (!wanted) return;
      videos.forEach(item => item.pause()); status('Buffering · keeping both views together');
    });
    v.addEventListener('error', () => { pause(); status('Video could not load. Try another method or use Open video.'); });
    v.addEventListener('ended', () => { pause(); showTime(duration()); status('Full trajectory complete · replay or choose another scene'); });
  });
  function tick() {
    if (wanted && !right.paused && !right.seeking) {
      if (!left.seeking && Math.abs(left.currentTime - right.currentTime) > .12) left.currentTime = right.currentTime;
      showTime(right.currentTime);
    }
    requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && wanted) { pause(); status('Paused'); } });
  fetch('demo-data.json').then(r => { if (!r.ok) throw new Error('Manifest unavailable'); return r.json(); }).then(data => {
    cases = data;
    cases.forEach((scene, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'scene-card'; button.dataset.scene = scene.id;
      button.setAttribute('aria-pressed', 'false');
      const image = document.createElement('img'); image.src = scene.posters.SMI; image.alt = ''; image.width = 832; image.height = 480;
      const body = document.createElement('span'); body.className = 'scene-card-copy';
      const meta = document.createElement('span'); meta.className = 'scene-card-meta'; meta.textContent = `${scene.backbone} · ${scene.duration.toFixed(1)} s`;
      const title = document.createElement('strong'); title.textContent = scene.title;
      const category = document.createElement('span'); category.className = 'scene-card-category'; category.textContent = scene.category;
      const count = document.createElement('span'); count.className = 'scene-method-count'; count.textContent = scene.all_methods ? '7 methods' : 'Base + SMI';
      body.append(meta, title, category); button.append(image, count, body);
      button.addEventListener('click', () => selectScene(scene)); $('scene-list').append(button);
    });
    selectScene(cases[0]); tick();
  }).catch(() => status('The scene list could not load. Please refresh the page.'));
})();
