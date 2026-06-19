(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var layer = box.querySelector('.play-layer');
    var stream = box.getAttribute('data-stream');
    var ready = false;

    function setStream() {
      if (!video || !stream || ready) {
        return;
      }
      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = stream;
      }
    }

    function begin() {
      if (!video) {
        return;
      }
      setStream();
      video.controls = true;
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', begin);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          begin();
        }
      });
    }
  });
})();
