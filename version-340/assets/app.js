(function () {
    var header = document.querySelector('[data-site-header]');
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function bootHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function activate(index) {
            activeIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function next() {
            activate((activeIndex + 1) % slides.length);
        }

        if (slides.length <= 1) {
            return;
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(next, 5200);
            });
        });

        timer = window.setInterval(next, 5200);
    }

    function bootPlayer() {
        var video = document.querySelector('[data-video-player]');
        var trigger = document.querySelector('[data-player-trigger]');
        var source = window.__MOVIE_SOURCE__;
        var loaded = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attachSource() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            video.controls = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            }
                        }
                    });
                });
            }

            video.src = source;
            return Promise.resolve();
        }

        function playVideo() {
            attachSource().then(function () {
                if (trigger) {
                    trigger.hidden = true;
                }
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            });
        }

        if (trigger) {
            trigger.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function bootSearch() {
        var target = document.querySelector('[data-search-results]');
        if (!target || !window.SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-input]');

        if (input) {
            input.value = query;
        }

        if (!query) {
            return;
        }

        var words = query.toLowerCase().split(/\s+/).filter(Boolean);
        var results = window.SEARCH_INDEX.filter(function (item) {
            var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.description, item.category]
                .join(' ')
                .toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);

        if (!results.length) {
            target.innerHTML = '<div class="empty-state"><h2>没有找到相关内容</h2><p>换一个片名、类型、地区或年份试试。</p></div>';
            return;
        }

        target.innerHTML = [
            '<div class="section-heading"><div><h2>搜索结果</h2><p>为你找到相关影片入口</p></div></div>',
            '<div class="movie-grid">',
            results.map(function (item) {
                return '<article class="movie-card">' +
                    '<a class="movie-card__poster" href="' + escapeHtml(item.url) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="movie-card__badge">' + escapeHtml(item.category) + '</span>' +
                    '</a>' +
                    '<div class="movie-card__body">' +
                    '<h2 class="movie-card__title"><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>' +
                    '<p class="movie-card__desc">' + escapeHtml(item.description) + '</p>' +
                    '<p class="movie-card__meta">' + escapeHtml([item.year, item.region, item.type].filter(Boolean).join(' · ')) + '</p>' +
                    '<div class="movie-card__tags"><span>' + escapeHtml(item.genre || item.category) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join(''),
            '</div>'
        ].join('');
    }

    bootHero();
    bootPlayer();
    bootSearch();
})();
