(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    function onScroll() {
      if (!header) {
        return;
      }
      if (window.scrollY > 20) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll(".js-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (value) {
          window.location.href = "search.html?q=" + encodeURIComponent(value);
        }
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function reset() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        reset();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var filterBars = document.querySelectorAll(".filter-bar");
    filterBars.forEach(function (bar) {
      var scope = document.querySelector(bar.getAttribute("data-scope"));
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-text]"));
      var buttons = Array.prototype.slice.call(bar.querySelectorAll(".filter-button"));

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var filter = button.getAttribute("data-filter") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var text = card.getAttribute("data-filter-text") || "";
            var matched = filter === "all" || text.indexOf(filter) !== -1;
            card.classList.toggle("is-hidden", !matched);
          });
        });
      });
    });
  }

  function setupSearchPage() {
    var page = document.querySelector(".search-results-page");
    if (!page) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("searchPageInput");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
    var status = document.querySelector(".search-status");

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var value = input ? input.value.trim().toLowerCase() : query.toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          shown += 1;
        }
      });
      if (status) {
        status.textContent = value ? "已更新匹配内容" : "可输入片名、地区、类型或标签进行检索";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    apply();
  }

  ready(function () {
    setupHeader();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();
