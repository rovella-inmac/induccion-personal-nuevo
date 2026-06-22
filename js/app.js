/* ============================================================
   Inducción Corporativa Rovella-INMAC
   Lógica de la presentación (JavaScript puro, sin frameworks)
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Configuración de las diapositivas ----------
     Cada entrada describe una diapositiva:
       img    -> nombre del archivo PNG
       audio  -> archivo MP3 (null = sin audio propio)
     Casos especiales:
       slide 6  -> video de YouTube tras su audio
       slide 17 -> audio compartido 17-18, cambia a slide 18 al 50%
       slide 18 -> NO tiene audio propio (lo cubre el de la 17)
  -------------------------------------------------------------- */
  var YT_VIDEO_ID = "fwn3IKzY0_Y"; // video diapositiva 06

  var SLIDES = [
    { img: "Diapositiva01.png", audio: "Audio01.mp3" },
    { img: "Diapositiva02.png", audio: "Audio02.mp3" },
    { img: "Diapositiva03.png", audio: "Audio03.mp3" },
    { img: "Diapositiva04.png", audio: "Audio04.mp3" },
    { img: "Diapositiva05.png", audio: "Audio05.mp3" },
    { img: "Diapositiva06.png", audio: "Audio06.mp3", video: true }, // + video
    { img: "Diapositiva07.png", audio: "Audio07.mp3" },
    { img: "Diapositiva08.png", audio: "Audio08.mp3" },
    { img: "Diapositiva09.png", audio: "Audio09.mp3" },
    { img: "Diapositiva10.png", audio: "Audio10.mp3" },
    { img: "Diapositiva11.png", audio: "Audio11.mp3" },
    { img: "Diapositiva12.png", audio: "Audio12.mp3" },
    { img: "Diapositiva13.png", audio: "Audio13.mp3" },
    { img: "Diapositiva14.png", audio: "Audio14.mp3" },
    { img: "Diapositiva15.png", audio: "Audio15.mp3" },
    { img: "Diapositiva16.png", audio: "Audio16.mp3" },
    { img: "Diapositiva17.png", audio: "Audio17-18.mp3", splitNext: true }, // 50% -> 18
    { img: "Diapositiva18.png", audio: null },   // sin audio propio
    { img: "Diapositiva19.png", audio: "Audio19.mp3" },
    { img: "Diapositiva20.png", audio: "Audio20.mp3" }
  ];

  var IMG_DIR   = "img/";
  var AUDIO_DIR = "audio/";

  /* ---------- Estado ---------- */
  var current   = 0;        // índice diapositiva actual
  var autoplay  = true;     // reproducción automática (inicial: ACTIVADO)
  var started   = false;    // ¿el usuario ya presionó Reproducir?
  var splitDone = false;    // ¿ya se cambió a la 18 en el audio 17-18?
  var muted     = false;
  var volume    = 1;

  /* ---------- Elementos DOM ---------- */
  var sidebar    = document.getElementById("sidebar");
  var edgeReveal = document.getElementById("edgeReveal");
  var viewport   = document.getElementById("viewport");
  var videoWrap  = document.getElementById("videoWrap");
  var counterEl  = document.getElementById("counter");
  var progressEl = document.getElementById("progressBar");
  var modeBadge  = document.getElementById("modeBadge");
  var audioBadge = document.getElementById("audioBadge");
  var audioStat  = document.getElementById("audioStatus");
  var modeStat   = document.getElementById("modeStatus");

  /* ---------- Audio único reutilizado ---------- */
  var audio = new Audio();
  audio.preload = "auto";

  /* ---------- Crear elementos <img> de cada diapositiva ---------- */
  var slideEls = SLIDES.map(function (s, i) {
    var img = document.createElement("img");
    img.className = "slide";
    img.src = IMG_DIR + s.img;
    img.alt = "Diapositiva " + (i + 1);
    img.draggable = false;
    viewport.appendChild(img);
    return img;
  });

  /* ============================================================
     YouTube IFrame API (video diapositiva 06)
     ============================================================ */
  var ytPlayer = null;
  var ytReady  = false;
  var videoPrimed = false; // ¿ya se desbloqueó el reproductor con el gesto del usuario?

  // Callback global que invoca la API de YouTube al cargar.
  window.onYouTubeIframeAPIReady = function () {
    ytPlayer = new YT.Player("ytPlayer", {
      videoId: YT_VIDEO_ID,
      playerVars: {
        rel: 0, modestbranding: 1, playsinline: 1, controls: 1,
        enablejsapi: 1,
        origin: window.location.origin // evita Error 153 (config del reproductor)
      },
      events: {
        onReady: function () {
          ytReady = true;
          // Si el usuario ya presionó Reproducir, desbloquear el video ya.
          if (started) primeVideoOnce();
        },
        onStateChange: onYtStateChange
      }
    });
  };

  function onYtStateChange(e) {
    // 0 = ENDED -> avanzar a la diapositiva 07 si autoplay
    if (e.data === YT.PlayerState.ENDED) {
      hideVideo();
      if (autoplay) goTo(6, true); // índice 6 = diapositiva 07
    }
  }

  /* Desbloquea el reproductor de YouTube usando el gesto del usuario
     (clic en Reproducir). Hace un play muteado instantáneo y lo pausa,
     dejándolo listo para autoplay CON sonido al llegar a la lámina 06. */
  function primeVideoOnce() {
    if (videoPrimed || !ytReady || !ytPlayer) return;
    videoPrimed = true;
    try {
      ytPlayer.mute();
      ytPlayer.playVideo();
      setTimeout(function () {
        try {
          ytPlayer.pauseVideo();
          ytPlayer.seekTo(0);
          if (!muted) ytPlayer.unMute();
        } catch (err) {}
      }, 160);
    } catch (err) {}
  }

  function showVideo() {
    videoWrap.classList.add("show");
    if (!ytReady || !ytPlayer) return;

    ytPlayer.seekTo(0);
    if (!muted) ytPlayer.unMute();   // ya desbloqueado por primeVideoOnce()
    ytPlayer.setVolume(volume * 100);
    ytPlayer.playVideo();

    // Última red de seguridad: si aún así el navegador bloquea el autoplay
    // con sonido, reproducir muteado para no detener la secuencia (raro,
    // solo si el gesto inicial no pudo desbloquear el reproductor).
    setTimeout(function () {
      try {
        var st = ytPlayer.getPlayerState();
        if (st !== YT.PlayerState.PLAYING && st !== YT.PlayerState.ENDED) {
          ytPlayer.mute();
          ytPlayer.playVideo();
        }
      } catch (err) {}
    }, 700);
  }
  function hideVideo() {
    videoWrap.classList.remove("show");
    if (ytReady && ytPlayer) {
      try { ytPlayer.stopVideo(); } catch (err) {}
    }
  }

  /* ============================================================
     Render / navegación
     ============================================================ */

  function render() {
    slideEls.forEach(function (el, i) {
      el.classList.toggle("active", i === current);
    });
    counterEl.textContent = (current + 1) + " / " + SLIDES.length;
    progressEl.style.width =
      ((current + 1) / SLIDES.length * 100) + "%";
  }

  /* Reproduce el audio correspondiente a la diapositiva `index`.
     Detiene cualquier audio previo. */
  function playAudioForCurrent() {
    var s = SLIDES[current];
    stopAudio();
    splitDone = false;

    if (!s.audio) return; // diapositiva sin audio (ej. la 18)

    audio.src = AUDIO_DIR + s.audio;
    audio.currentTime = 0;
    audio.volume = volume;
    audio.muted = muted;
    var p = audio.play();
    if (p && p.catch) { p.catch(function () {}); }
    setAudioBadge(true);
  }

  function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
    setAudioBadge(false);
  }

  /* Navega a la diapositiva `index`.
     autoStartAudio: si true, arranca su audio (solo si ya se inició). */
  function goTo(index, autoStartAudio) {
    if (index < 0) index = 0;
    if (index >= SLIDES.length) index = SLIDES.length - 1;

    hideVideo();            // por si veníamos del video
    current = index;
    render();

    // Solo se reproduce audio si la presentación ya fue iniciada.
    if (started && autoStartAudio) {
      playAudioForCurrent();
    } else {
      stopAudio();
    }
  }

  /* ============================================================
     Eventos del audio
     ============================================================ */

  // Cambio 17 -> 18 exactamente al 50% del audio compartido.
  audio.addEventListener("timeupdate", function () {
    var s = SLIDES[current];
    if (s && s.splitNext && !splitDone && audio.duration) {
      if (audio.currentTime >= audio.duration / 2) {
        splitDone = true;
        // Mostrar diapositiva 18 SIN tocar el audio.
        current = 17; // índice 17 = diapositiva 18
        render();
      }
    }
  });

  // Fin de un audio -> decidir siguiente paso.
  audio.addEventListener("ended", function () {
    setAudioBadge(false);
    var s = SLIDES[current];

    // Caso video: tras Audio06 mostrar el video embebido.
    if (s && s.video) {
      showVideo();
      return;
    }

    if (!autoplay) return; // modo manual: esperar al usuario

    if (current < SLIDES.length - 1) {
      // Avance con transición: el CSS hace el crossfade.
      goTo(current + 1, true);
    }
  });

  /* ============================================================
     Auto-ocultar barra lateral durante reproducción automática
     ============================================================ */
  var hoverNearEdge = false;   // mouse cerca del borde derecho
  var hideTimer = null;

  // La barra solo se oculta si: autoplay activo, ya inició, y el mouse
  // no está cerca del borde derecho.
  function refreshSidebar() {
    var shouldHide = autoplay && started && !hoverNearEdge;
    sidebar.classList.toggle("hidden", shouldHide);
  }

  // Mostrar temporalmente al acercar el mouse al borde / sidebar.
  function revealSidebar() {
    hoverNearEdge = true;
    refreshSidebar();
    clearTimeout(hideTimer);
  }
  // Reocultar tras alejar el mouse (con pequeño retardo).
  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      hoverNearEdge = false;
      refreshSidebar();
    }, 800);
  }

  edgeReveal.addEventListener("mouseenter", revealSidebar);
  sidebar.addEventListener("mouseenter", revealSidebar);
  sidebar.addEventListener("mouseleave", scheduleHide);
  edgeReveal.addEventListener("mouseleave", scheduleHide);

  /* ============================================================
     Indicadores de estado
     ============================================================ */
  function setAudioBadge(playing) {
    audioBadge.classList.toggle("playing", playing);
    audioStat.textContent = playing ? "Reproduciendo" : "Pausado";
    // El botón principal muestra Pausa mientras reproduce, Play si no.
    var btn = document.getElementById("btnPlay");
    if (btn) {
      btn.innerHTML = playing ? ICON.pause : ICON.play;
      btn.title = playing ? "Pausar" : "Reproducir";
    }
  }
  function setModeBadge() {
    modeBadge.classList.toggle("auto", autoplay);
    modeStat.textContent = autoplay ? "Automático" : "Manual";
  }

  /* ============================================================
     Controles
     ============================================================ */
  function play() {
    started = true;
    primeVideoOnce(); // usa este gesto para desbloquear el video de YouTube
    refreshSidebar(); // oculta la barra si autoplay sigue activo
    if (audio.src && audio.paused && audio.currentTime > 0) {
      // Reanudar audio pausado.
      audio.play();
      setAudioBadge(true);
    } else if (SLIDES[current].video &&
               videoWrap.classList.contains("show")) {
      if (ytReady) ytPlayer.playVideo();
    } else {
      playAudioForCurrent();
    }
  }

  function pause() {
    audio.pause();
    setAudioBadge(false);
    if (videoWrap.classList.contains("show") && ytReady) {
      ytPlayer.pauseVideo();
    }
  }

  // Botón principal: alterna entre Reproducir y Pausar.
  function togglePlay() {
    var videoMode = videoWrap.classList.contains("show");
    var isPlaying = videoMode
      ? (ytReady && ytPlayer.getPlayerState &&
         ytPlayer.getPlayerState() === YT.PlayerState.PLAYING)
      : (!audio.paused && audio.currentTime > 0);
    isPlaying ? pause() : play();
  }

  // Detener: vuelve a la lámina 01 y deja todo en pausa.
  function stop() {
    started = false;          // requiere presionar Reproducir de nuevo
    goTo(0, false);           // lámina 01 sin reproducir audio
    setAudioBadge(false);
    refreshSidebar();         // barra visible otra vez
  }

  function restartAudio() {
    if (!started) return;
    if (videoWrap.classList.contains("show")) {
      if (ytReady) { ytPlayer.seekTo(0); ytPlayer.playVideo(); }
      return;
    }
    playAudioForCurrent();
  }

  function next() {
    // Navegación manual: detener audio y arrancar el de destino.
    goTo(current + 1, started);
  }
  function prev() {
    goTo(current - 1, started);
  }

  function toggleMute() {
    muted = !muted;
    audio.muted = muted;
    if (ytReady && ytPlayer) {
      muted ? ytPlayer.mute() : ytPlayer.unMute();
    }
    document.getElementById("btnMute")
      .classList.toggle("on", muted);
    setIcon("btnMute", muted ? ICON.muted : ICON.sound);
  }

  function setVolume(v) {
    volume = v;
    audio.volume = v;
    if (ytReady && ytPlayer) ytPlayer.setVolume(v * 100);
  }

  function toggleAutoplay() {
    autoplay = !autoplay;
    document.getElementById("btnAuto").classList.toggle("on", autoplay);
    setModeBadge();
    refreshSidebar(); // al desactivar autoplay, la barra queda visible
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  }

  /* ---------- Íconos SVG ---------- */
  var ICON = {
    sound: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4zM14 3.2v2.1a7 7 0 010 13.4v2.1a9 9 0 000-17.6z"/></svg>',
    muted: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm18.6.4l-1.4-1.4L17.8 10l-2.4-2.4-1.4 1.4L16.4 11l-2.4 2.4 1.4 1.4 2.4-2.4 2.4 2.4 1.4-1.4L19.2 11l2.4-1.6z"/></svg>',
    play:  '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>'
  };
  function setIcon(id, svg) { document.getElementById(id).innerHTML = svg; }

  /* ============================================================
     Enlazar botones
     ============================================================ */
  document.getElementById("btnPlay").addEventListener("click", togglePlay);
  document.getElementById("btnStop").addEventListener("click", stop);
  document.getElementById("btnRestart").addEventListener("click", restartAudio);
  document.getElementById("btnPrev").addEventListener("click", prev);
  document.getElementById("btnNext").addEventListener("click", next);
  document.getElementById("btnMute").addEventListener("click", toggleMute);
  document.getElementById("btnAuto").addEventListener("click", toggleAutoplay);
  document.getElementById("btnFull").addEventListener("click", toggleFullscreen);
  document.getElementById("volume").addEventListener("input", function (e) {
    setVolume(parseFloat(e.target.value));
  });

  // Atajos de teclado
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      case " ":        e.preventDefault(); togglePlay(); break;
      case "ArrowRight": next(); break;
      case "ArrowLeft":  prev(); break;
      case "f": case "F": toggleFullscreen(); break;
      case "m": case "M": toggleMute(); break;
    }
  });

  /* ============================================================
     Arranque
     ============================================================ */
  function init() {
    render();             // muestra Diapositiva01 inmediatamente
    setModeBadge();
    setAudioBadge(false);
    document.getElementById("btnAuto").classList.toggle("on", autoplay);
    setVolume(1);
    // No se reproduce audio: se espera a que el usuario presione Reproducir.
  }

  init();
})();
