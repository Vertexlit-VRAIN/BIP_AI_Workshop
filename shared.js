/* ===========================
   SHARED JS — Prompt Wars
   Pixel particles, stars, glitch auto-apply
   =========================== */

(function () {
  /* Floating pixel particles */
  var c = document.createElement('div');
  c.className = 'pixel-particles';
  c.setAttribute('aria-hidden', 'true');
  var colors = ['#00ffff', '#ff00ff', '#ffff00', '#39ff14'];
  for (var i = 0; i < 12; i++) {
    var p = document.createElement('div');
    p.className = 'pxl';
    var s = 2 + Math.floor(Math.random() * 3);
    p.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (Math.random() * 100).toFixed(1) + '%;background:' + colors[i % 4] + ';box-shadow:0 0 ' + (s + 2) + 'px ' + colors[i % 4] + ';animation-duration:' + (14 + Math.random() * 16).toFixed(1) + 's;animation-delay:' + (Math.random() * 12).toFixed(1) + 's;';
    c.appendChild(p);
  }
  document.body.appendChild(c);

  /* Twinkling pixel cross-stars */
  var sc = ['#00ffff', '#ff00ff', '#ffff00'];
  for (var j = 0; j < 5; j++) {
    var st = document.createElement('div');
    st.className = 'pixel-star';
    st.setAttribute('aria-hidden', 'true');
    st.style.cssText = 'color:' + sc[j % 3] + ';left:' + (8 + Math.random() * 84).toFixed(1) + '%;top:' + (8 + Math.random() * 78).toFixed(1) + '%;animation-duration:' + (2.5 + Math.random() * 3).toFixed(1) + 's;animation-delay:' + (Math.random() * 4).toFixed(1) + 's;';
    document.body.appendChild(st);
  }

  /* Auto-apply glitch effect to headings */
  document.querySelectorAll('h1, .intro-category, .big-question .lead').forEach(function (el) {
    el.classList.add('glitch-text');
    el.setAttribute('data-text', el.textContent);
  });

  /* Theme toggle: press T to switch dark/light, persisted via localStorage */
  var hint = document.createElement('div');
  hint.className = 'theme-toggle-hint';
  hint.textContent = 'Press T: toggle theme';
  document.body.appendChild(hint);

  /* Apply saved theme on load */
  if (localStorage.getItem('pw-theme') === 'light') {
    document.body.classList.add('light-theme');
  }

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 't' || e.key === 'T') {
      document.body.classList.toggle('light-theme');
      localStorage.setItem('pw-theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
    }
  });

  /* CRT page transition */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Synthesise a CRT power-off or power-on whine + static using Web Audio */
  function playCRTSound(direction) {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var dur = direction === 'off' ? 0.42 : 0.52;
      var t = ctx.currentTime;

      /* --- Oscillator: the frequency whine --- */
      var osc = ctx.createOscillator();
      var oscGain = ctx.createGain();
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      /* --- White noise buffer: the static crackle --- */
      var bufLen = Math.ceil(ctx.sampleRate * dur);
      var noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      var nd = noiseBuf.getChannelData(0);
      for (var i = 0; i < bufLen; i++) nd[i] = Math.random() * 2 - 1;
      var noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;

      /* Bandpass filter shapes the noise toward a harsh CRT hiss */
      var noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 4000;
      noiseFilter.Q.value = 0.4;
      var noiseGain = ctx.createGain();
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      if (direction === 'off') {
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.32);
        oscGain.gain.setValueAtTime(0.11, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        noiseGain.gain.setValueAtTime(0.18, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      } else {
        osc.frequency.setValueAtTime(55, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.28);
        oscGain.gain.setValueAtTime(0.001, t);
        oscGain.gain.linearRampToValueAtTime(0.11, t + 0.08);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        /* Noise bursts loudest at the very start, then dies away */
        noiseGain.gain.setValueAtTime(0.001, t);
        noiseGain.gain.linearRampToValueAtTime(0.22, t + 0.05);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.55);
      }

      osc.start(t);   osc.stop(t + dur);
      noise.start(t); noise.stop(t + dur);
      setTimeout(function () { ctx.close(); }, (dur + 0.1) * 1000);
    } catch (_) {}
  }

  /* Returns the Y pixel position, within the document, of the visible viewport centre */
  function viewportCentreY() {
    return window.scrollY + window.innerHeight / 2;
  }

  /* Enter: power-on animation on every page load */
  if (!reducedMotion) {
    playCRTSound('on');
    document.body.style.transformOrigin = 'center ' + viewportCentreY() + 'px';
    document.body.classList.add('crt-enter');
    document.body.addEventListener('animationend', function onEnterDone(e) {
      if (e.animationName === 'crt-power-on') {
        document.body.classList.remove('crt-enter');
        document.body.style.transformOrigin = '';
        document.body.removeEventListener('animationend', onEnterDone);
      }
    });
  }

  /* Exit: intercept all internal link clicks, play power-off, then navigate */
  document.addEventListener('click', function (e) {
    if (reducedMotion) return;
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;
    var dest = link.href;
    try {
      if (new URL(dest).origin !== location.origin) return;
    } catch (_) { return; }
    e.preventDefault();
    playCRTSound('off');
    document.body.classList.remove('crt-enter');
    document.body.style.transformOrigin = 'center ' + viewportCentreY() + 'px';
    document.body.classList.add('crt-exit');
    setTimeout(function () { window.location.href = dest; }, 430);
  }, true);

})();
