(function () {
    const loader = {
        ready: false,
        loading: false,
        callbacks: []
    };

    function safePlay(video) {
        const playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {});
        }
    }

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        loader.callbacks.push(callback);
        if (loader.loading) {
            return;
        }
        loader.loading = true;
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.onload = function () {
            loader.ready = true;
            const callbacks = loader.callbacks.splice(0);
            callbacks.forEach(function (fn) {
                fn();
            });
        };
        document.head.appendChild(script);
    }

    window.initMoviePlayer = function (videoId, coverId, streamUrl) {
        const video = document.getElementById(videoId);
        const cover = document.getElementById(coverId);

        if (!video || !cover || !streamUrl) {
            return;
        }

        function attachAndPlay() {
            cover.classList.add("is-hidden");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.src) {
                    video.src = streamUrl;
                }
                safePlay(video);
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    if (!video._movieHls) {
                        const hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            safePlay(video);
                        });
                        video._movieHls = hls;
                    }
                    safePlay(video);
                }
            });
        }

        cover.addEventListener("click", attachAndPlay);
        video.addEventListener("click", function () {
            if (video.paused) {
                attachAndPlay();
            }
        });
    };
})();
