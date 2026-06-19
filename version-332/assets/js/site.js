(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      var target = heroSearch.getAttribute('data-search-target') || 'search.html';
      if (keyword) {
        window.location.href = target + '?q=' + encodeURIComponent(keyword);
      } else {
        window.location.href = target;
      }
    });
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-filter-keyword]');
    var yearSelect = filterRoot.querySelector('[data-filter-year]');
    var regionSelect = filterRoot.querySelector('[data-filter-region]');
    var genreSelect = filterRoot.querySelector('[data-filter-genre]');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
    var noResults = filterRoot.querySelector('[data-no-results]');

    var query = new URLSearchParams(window.location.search).get('q');
    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var year = yearSelect ? yearSelect.value : '';
      var region = regionSelect ? regionSelect.value : '';
      var genre = genreSelect ? genreSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.innerText + ' ' + card.dataset.title + ' ' + card.dataset.genre + ' ' + card.dataset.region);
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchRegion = !region || card.dataset.region === region;
        var matchGenre = !genre || card.dataset.genre.indexOf(genre) !== -1;
        var show = matchKeyword && matchYear && matchRegion && matchGenre;

        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (noResults) {
        noResults.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var source = window.MOVIE_SOURCE || '';
    var initialized = false;

    function attachPlayer() {
      if (!video || initialized || !source) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachPlayer();

      if (overlay) {
        overlay.classList.add('hidden');
      }

      if (video) {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }
  }
})();
