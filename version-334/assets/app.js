function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var trigger = document.getElementById("play-trigger");
    if (!video || !trigger || !source) {
        return;
    }
    var started = false;
    function attachSource() {
        if (started) {
            return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }
    function playVideo() {
        attachSource();
        trigger.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                trigger.classList.remove("is-hidden");
            });
        }
    }
    trigger.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (!started || video.paused) {
            playVideo();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (menuButton && menu) {
        menuButton.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        function setSlide(index) {
            current = index;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                setSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    var queryInput = document.querySelector("[data-query-input]");
    if (queryInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        queryInput.value = query;
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var list = document.querySelector(".searchable-list");
    var empty = document.querySelector("[data-empty-state]");
    if (filterInput && list) {
        var items = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-row"));
        function applyFilter() {
            var value = filterInput.value.trim().toLowerCase();
            var visibleCount = 0;
            items.forEach(function (item) {
                var text = (item.getAttribute("data-card-text") || item.textContent || "").toLowerCase();
                var show = !value || text.indexOf(value) !== -1;
                item.style.display = show ? "" : "none";
                if (show) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visibleCount === 0);
            }
        }
        filterInput.addEventListener("input", applyFilter);
        applyFilter();
    }
});
