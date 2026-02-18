/* ===========================
   SHARED SLIDE NAV — Prompt Wars
   Used by all 3 slide decks
   =========================== */

/**
 * initDeck(options)
 *   options.onSlideChange(oldIndex, newIndex) — optional callback
 *
 * Expects these IDs in the DOM:
 *   #deck, #btnPrev, #btnNext, #counter, #progressBar
 */
function initDeck(options) {
  var opts = options || {};
  var slides = document.querySelectorAll('.slide');
  var total = slides.length;
  var current = 0;
  var transitioning = false;

  var counter = document.getElementById('counter');
  var progressBar = document.getElementById('progressBar');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');

  /* Back-to-hub button — shown on last slide */
  var homeLink = document.querySelector('.nav-bar .home-link');
  var hubHref = homeLink ? homeLink.getAttribute('href') : '../index.html';
  var backBtn = document.createElement('a');
  backBtn.className = 'back-to-hub';
  backBtn.href = hubHref;
  backBtn.innerHTML = '&#9664; BACK TO HUB';
  document.body.appendChild(backBtn);

  function updateBackBtn() {
    backBtn.classList.toggle('visible', current === total - 1);
  }

  function cleanupClasses(slide) {
    slide.classList.remove('enter-fwd', 'enter-bwd', 'exit-fwd', 'exit-bwd');
  }

  function onAnimEnd(el, cb, fallbackMs) {
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      el.removeEventListener('animationend', finish);
      cb();
    }
    el.addEventListener('animationend', finish, { once: true });
    setTimeout(finish, fallbackMs);
  }

  function goTo(index) {
    if (index < 0 || index >= total || index === current) return;
    if (transitioning) return;
    transitioning = true;

    var old = current;
    var fwd = index > old;
    var oldSlide = slides[old];
    var newSlide = slides[index];

    /* Exit old slide */
    oldSlide.classList.remove('active');
    cleanupClasses(oldSlide);
    oldSlide.style.opacity = '1';
    oldSlide.style.pointerEvents = 'none';
    oldSlide.classList.add(fwd ? 'exit-fwd' : 'exit-bwd');

    onAnimEnd(oldSlide, function () {
      cleanupClasses(oldSlide);
      oldSlide.style.opacity = '';
      oldSlide.style.pointerEvents = '';
    }, 450);

    /* Enter new slide */
    current = index;
    cleanupClasses(newSlide);
    newSlide.classList.add('active');
    newSlide.classList.add(fwd ? 'enter-fwd' : 'enter-bwd');

    onAnimEnd(newSlide, function () {
      cleanupClasses(newSlide);
      transitioning = false;
    }, 550);

    /* Update UI immediately */
    counter.textContent = (current + 1) + ' / ' + total;
    progressBar.style.width = ((current + 1) / total * 100) + '%';
    updateBackBtn();
    if (opts.onSlideChange) opts.onSlideChange(old, current);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  btnPrev.addEventListener('click', prev);
  btnNext.addEventListener('click', next);

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
  });

  /* Touch / swipe support */
  var touchStartX = 0;
  var touchStartY = 0;
  document.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  /* Initial slide — enter forward, no exit */
  slides[0].classList.add('active', 'enter-fwd');
  counter.textContent = '1 / ' + total;
  progressBar.style.width = (1 / total * 100) + '%';
  onAnimEnd(slides[0], function () { cleanupClasses(slides[0]); }, 550);
}
