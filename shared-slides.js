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

  var counter = document.getElementById('counter');
  var progressBar = document.getElementById('progressBar');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');

  function goTo(index) {
    if (index < 0 || index >= total) return;
    var old = current;
    slides[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    counter.textContent = (current + 1) + ' / ' + total;
    progressBar.style.width = ((current + 1) / total * 100) + '%';
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

  goTo(0);
}
