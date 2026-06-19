(function () {
    "use strict";

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function initMobileMenu() {
        var button = qs("[data-menu-toggle]");
        var panel = qs("[data-nav-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initImageFallbacks() {
        qsa("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function initHeroCarousel() {
        var carousel = qs(".hero-carousel");
        if (!carousel) {
            return;
        }
        var slides = qsa("[data-hero-slide]", carousel);
        var dots = qsa("[data-hero-dot]", carousel);
        var prev = qs("[data-hero-prev]", carousel);
        var next = qs("[data-hero-next]", carousel);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function initLocalFilters() {
        var grid = qs("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var input = qs("[data-card-search]");
        var buttons = qsa("[data-local-filter]");
        var activeFilter = "";

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-type"),
                card.textContent
            ].join(" ").toLowerCase();
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            qsa(".movie-card", grid).forEach(function (card) {
                var text = cardText(card);
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
                card.classList.toggle("hidden-by-filter", !(matchedKeyword && matchedFilter));
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-local-filter") || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("active", item === button);
                });
                apply();
            });
        });
    }

    function movieCardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHTML(tag) + "</span>";
        }).join("");
        return "" +
            "<article class=\"movie-card\">" +
                "<a class=\"poster-link\" href=\"./" + escapeHTML(movie.file) + "\" aria-label=\"观看 " + escapeHTML(movie.title) + "\">" +
                    "<img src=\"./" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + " 海报\" loading=\"lazy\">" +
                    "<span class=\"poster-gradient\"></span>" +
                    "<span class=\"play-badge\">▶</span>" +
                    "<span class=\"duration-badge\">" + escapeHTML(movie.duration) + "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-meta-line\">" +
                        "<span>" + escapeHTML(movie.year) + "</span>" +
                        "<span>" + escapeHTML(movie.region) + "</span>" +
                        "<span>" + escapeHTML(movie.type) + "</span>" +
                    "</div>" +
                    "<h3><a href=\"./" + escapeHTML(movie.file) + "\">" + escapeHTML(movie.title) + "</a></h3>" +
                    "<p>" + escapeHTML(movie.oneLine || movie.summary || "") + "</p>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var results = qs("#search-results");
        var input = qs("#search-input");
        var category = qs("#search-category");
        var type = qs("#search-type");
        var panel = qs("#search-panel");
        var summary = qs("#search-summary");
        if (!results || !input || !window.MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        function normalize(value) {
            return String(value == null ? "" : value).toLowerCase();
        }

        function applySearch(event) {
            if (event) {
                event.preventDefault();
            }
            var query = normalize(input.value.trim());
            var categoryValue = category ? category.value : "";
            var typeValue = type ? type.value : "";
            var list = window.MOVIES.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.categoryName,
                    (movie.tags || []).join(" "),
                    movie.oneLine,
                    movie.summary
                ].join(" "));
                var queryMatched = !query || haystack.indexOf(query) !== -1;
                var categoryMatched = !categoryValue || movie.categoryName === categoryValue;
                var typeMatched = !typeValue || normalize(movie.type).indexOf(normalize(typeValue)) !== -1;
                return queryMatched && categoryMatched && typeMatched;
            }).slice(0, 240);

            if (!query && !categoryValue && !typeValue) {
                list = window.MOVIES.slice().sort(function (a, b) {
                    return b.views - a.views;
                }).slice(0, 120);
            }

            results.innerHTML = list.map(movieCardTemplate).join("");
            initImageFallbacks();
            if (summary) {
                summary.textContent = "已显示 " + list.length + " 条结果" + (query ? "，关键词：“" + input.value.trim() + "”" : "");
            }
            var url = new URL(window.location.href);
            if (input.value.trim()) {
                url.searchParams.set("q", input.value.trim());
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState(null, "", url.pathname + url.search);
        }

        if (panel) {
            panel.addEventListener("submit", applySearch);
        }
        [input, category, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applySearch);
                control.addEventListener("change", applySearch);
            }
        });
        applySearch();
    }

    function resetPlayer(video) {
        if (video._hlsInstance) {
            video._hlsInstance.destroy();
            video._hlsInstance = null;
        }
        video.removeAttribute("src");
        video.load();
        video.dataset.loadedSrc = "";
    }

    function loadHls(video, src, status) {
        if (!src) {
            if (status) {
                status.textContent = "当前线路未提供播放地址。";
            }
            return;
        }
        if (video.dataset.loadedSrc === src) {
            return;
        }
        resetPlayer(video);
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.dataset.loadedSrc = src;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            video.dataset.loadedSrc = src;
            return;
        }
        video.src = src;
        video.dataset.loadedSrc = src;
    }

    function initPlayers() {
        qsa("[data-player]").forEach(function (player) {
            var video = qs("video", player);
            var start = qs(".player-start", player);
            var status = qs("[data-player-status]", player);
            var sourceButtons = qsa("[data-source-url]");
            if (!video) {
                return;
            }

            function playCurrent() {
                var src = player.getAttribute("data-hls-src") || "";
                loadHls(video, src, status);
                player.classList.add("is-playing");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        player.classList.remove("is-playing");
                        if (status) {
                            status.textContent = "浏览器阻止了自动播放，请再次点击播放按钮。";
                        }
                    });
                }
            }

            if (start) {
                start.addEventListener("click", playCurrent);
            }

            sourceButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    sourceButtons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    player.setAttribute("data-hls-src", button.getAttribute("data-source-url") || "");
                    resetPlayer(video);
                    player.classList.remove("is-playing");
                    if (status) {
                        status.textContent = "已切换线路，点击播放加载新的 m3u8 视频源。";
                    }
                });
            });

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove("is-playing");
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initImageFallbacks();
        initHeroCarousel();
        initLocalFilters();
        initSearchPage();
        initPlayers();
    });
}());
