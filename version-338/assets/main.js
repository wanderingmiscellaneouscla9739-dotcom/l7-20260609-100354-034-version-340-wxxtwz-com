(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                });
            });
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        searchInputs.forEach(function (input) {
            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                var items = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
                items.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || '').toLowerCase();
                    var year = item.getAttribute('data-year') || '';
                    var matched = !keyword || text.indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
                    item.classList.toggle('is-hidden', !matched);
                });
            });
        });
    });
})();

function setupHlsPlayer(videoId, sourceUrl, maskId) {
    var video = document.getElementById(videoId);
    var mask = document.getElementById(maskId);
    if (!video || !sourceUrl) {
        return;
    }

    var loaded = false;
    var load = function () {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    };

    var play = function () {
        load();
        if (mask) {
            mask.classList.add('is-hidden');
        }
        var started = video.play();
        if (started && typeof started.catch === 'function') {
            started.catch(function () {});
        }
    };

    if (mask) {
        mask.addEventListener('click', play);
    }
    video.addEventListener('play', load);
}
