(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    scopes.forEach(function (scope) {
      var query = scope.querySelector("[data-filter-query]");
      var region = scope.querySelector("[data-filter-region]");
      var type = scope.querySelector("[data-filter-type]");
      var year = scope.querySelector("[data-filter-year]");
      var reset = scope.querySelector("[data-filter-reset]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-result]");
      if (!cards.length) {
        return;
      }

      var urlParams = new URLSearchParams(window.location.search);
      if (query && urlParams.get("q")) {
        query.value = urlParams.get("q");
      }

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function apply() {
        var q = valueOf(query);
        var r = valueOf(region);
        var t = valueOf(type);
        var y = valueOf(year);
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
          ].join(" ").toLowerCase();
          var match = true;
          if (q && text.indexOf(q) === -1) {
            match = false;
          }
          if (r && String(card.dataset.region || "").toLowerCase() !== r) {
            match = false;
          }
          if (t && String(card.dataset.type || "").toLowerCase() !== t) {
            match = false;
          }
          if (y && String(card.dataset.year || "").toLowerCase() !== y) {
            match = false;
          }
          card.style.display = match ? "" : "none";
          if (match) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [query, region, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          [query, region, type, year].forEach(function (element) {
            if (element) {
              element.value = "";
            }
          });
          apply();
        });
      }

      apply();
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button || !streamUrl) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    attach();
    button.classList.add("is-hidden");
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  function toggleVideo() {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("click", toggleVideo);
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove("is-hidden");
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
