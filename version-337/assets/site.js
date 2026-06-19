(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var panel = document.querySelector('.mobile-nav-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.hidden = !panel.hidden;
    });
  }

  function setHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setFilters() {
    var input = document.querySelector('.movie-live-search');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!cards.length) {
      return;
    }
    var active = 'all';
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function textOf(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function apply() {
      var query = input ? normalize(input.value) : '';
      cards.forEach(function (card) {
        var haystack = textOf(card);
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedChip = active === 'all' || haystack.indexOf(normalize(active)) !== -1;
        card.classList.toggle('is-hidden', !(matchedQuery && matchedChip));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        active = chip.getAttribute('data-filter') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });

    if (chips.length) {
      chips[0].classList.add('is-active');
    }
    apply();
  }

  ready(function () {
    setMobileMenu();
    setHero();
    setFilters();
  });
})();

function initMoviePlayer(videoId, source) {
  var video = document.getElementById(videoId);
  if (!video || !source) {
    return;
  }
  var shell = video.closest('.player-shell');
  var overlay = shell ? shell.querySelector('.player-overlay') : null;
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (prepared) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
    prepared = true;
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });
}
