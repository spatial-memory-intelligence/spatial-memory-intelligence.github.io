(() => {
  'use strict';
  const methods = ['Base', 'FramePack', 'Deep Forcing', 'MoC', 'VMem', 'MemFlow'];
  const players = [];
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const caseName = c => c.backbone;

  function createPlayer(section, cases) {
    const $ = role => role === "comparison" ? section : section.querySelector(`[data-role="${role}"]`);
    const left = $('baseline-video'), right = $('smi-video'), videos = [left, right];
    const play = $('play-pair'), timeline = $('timeline'), speed = $('playback-speed');
    let selected, wanted = false, starting = false, pendingTime = 0, generation = 0, loaded = false;
    let activeTracks = [], highlightIndex = 0;
    const duration = () => selected?.duration || 0;
    const status = text => { const el = $('playback-status'); el.textContent = text; el.className = /could not|try again|unavailable/i.test(text) ? 'playback-error' : 'sr-only'; };
    const pause = () => { wanted = false; videos.forEach(v => v.pause()); play.textContent = 'Play both'; status('Paused'); };
    const player = { pause, tick };
    players.push(player);

    function showTime(t) {
      timeline.value = String(t);
      timeline.style.setProperty('--progress', `${duration() ? t / duration() * 100 : 0}%`);
      $('time-display').textContent = `${fmt(t)} / ${fmt(duration())}`;
      timeline.setAttribute('aria-valuetext', `${t.toFixed(1)} seconds of ${duration().toFixed(1)} seconds`);
    }
    function prepareHighlights(method) {
      activeTracks = (selected.annotations || []).filter(track => track.method === method || track.method === 'SMI');
      ['baseline-annotations', 'smi-annotations'].forEach(role => $(role).replaceChildren());
      activeTracks = activeTracks.map(track => {
        const box = document.createElement('div'); box.className = 'annotation-box'; box.hidden = true;
        $(track.method === 'SMI' ? 'smi-annotations' : 'baseline-annotations').append(box);
        return { ...track, box };
      });
      highlightIndex = 0;
      $('highlight-jump').hidden = !activeTracks.length;
    }
    function drawHighlights() {
      activeTracks.forEach(track => {
        const video = track.method === 'SMI' ? right : left;
        const t = video.readyState >= 2 && !video.seeking ? video.currentTime : -1;
        const keys = track.keys;
        const active = t >= keys[0][0] && t <= keys[keys.length - 1][0];
        track.box.hidden = !active;
        if (!active) return;
        let i = 1;
        while (i < keys.length - 1 && keys[i][0] < t) i++;
        const a = keys[i - 1], b = keys[i], ratio = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
        const xy = a.slice(1).map((value, j) => value + (b[j + 1] - value) * ratio);
        Object.assign(track.box.style, {left: `${xy[0]*100}%`, top: `${xy[1]*100}%`, width: `${(xy[2]-xy[0])*100}%`, height: `${(xy[3]-xy[1])*100}%`});
      });
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
      prepareHighlights(method);
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
      $('scene-title').textContent = caseName(scene);
      $('scene-meta').textContent = `${scene.duration.toFixed(1)} s${scene.excerpt ? ' · excerpt' : ''}`;
      $('baseline-backbone').textContent = scene.backbone; $('smi-backbone').textContent = scene.backbone;
      section.querySelector('.method-switch').hidden = !scene.all_methods;
      $('coverage-note').textContent = scene.all_methods ? 'Seven comparison methods available' : 'Base and SMI';
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
    $('highlight-jump').addEventListener('click', () => {
      const marks = activeTracks.map(track => track.focusTime ?? (track.keys[0][0] + track.keys[track.keys.length - 1][0]) / 2).sort((a,b) => a-b);
      if (!marks.length) return;
      pause(); loadSources(); seek(marks[highlightIndex++ % marks.length]);
      const toggle = document.getElementById('show-highlights'); toggle.checked = true;
      document.getElementById('demos').classList.remove('annotations-off');
      status('Paused at a highlighted moment');
    });
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
      v.addEventListener('ended', () => { pause(); showTime(duration()); status('Complete · replay or choose another video'); });
    });
    function tick() {
      drawHighlights();
      if (wanted && !right.paused && !right.seeking) {
        if (!left.seeking && Math.abs(left.currentTime - right.currentTime) > .12) left.currentTime = right.currentTime;
        showTime(right.currentTime);
      }
    }
    selectCase(cases[0]);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { loadSources(); observer.disconnect(); }
      }, { rootMargin: '160px' });
      observer.observe($('comparison'));
    }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) players.forEach(p => p.pause()); });
  document.getElementById('show-highlights').addEventListener('change', event => {
    document.getElementById('demos').classList.toggle('annotations-off', !event.target.checked);
  });
  fetch('demo-data.json?v=20260930-square-people').then(r => { if (!r.ok) throw new Error('Manifest unavailable'); return r.json(); }).then(data => {
    const template = document.getElementById('comparison-template');
    document.querySelectorAll('.comparison-grid').forEach(grid => {
      const scenes = data.filter(c => c.backbone === grid.dataset.backbone);
      scenes.forEach(scene => {
        const card = template.content.firstElementChild.cloneNode(true);
        card.dataset.media = scene.id;
        grid.append(card);
        createPlayer(card, [scene]);
      });
    });
    document.querySelector('.demo-load-status').hidden = true;
    function tick() { players.forEach(p => p.tick()); requestAnimationFrame(tick); }
    tick();
  }).catch(() => { document.querySelector('.demo-load-status').textContent = 'The videos could not load. Please refresh the page.'; });
})();
