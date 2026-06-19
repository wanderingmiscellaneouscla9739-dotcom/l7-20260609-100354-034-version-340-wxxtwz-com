(function () {
  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var index = 0;

  function showSlide(next) {
    if (!slides.length) {
      return;
    }
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('is-active', current === index);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('is-active', current === index);
    });
  }

  dots.forEach(function (dot, current) {
    dot.addEventListener('click', function () {
      showSlide(current);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var input = document.querySelector('[data-filter-input]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .media-row'));

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function applyFilter() {
    if (!cards.length) {
      return;
    }

    var query = normalize(input && input.value);
    var year = normalize(yearFilter && yearFilter.value);
    var type = normalize(typeFilter && typeFilter.value);

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year')
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.getAttribute('data-type'));
      var ok = (!query || text.indexOf(query) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
      card.classList.toggle('is-hidden', !ok);
    });
  }

  if (input) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    input.addEventListener('input', applyFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilter);
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', applyFilter);
  }

  applyFilter();
})();
