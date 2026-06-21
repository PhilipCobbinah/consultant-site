window.JOEL_USE_GLOBAL_ANIMATION_MANAGER = true;

// === GLOBAL ANIMATION SAFETY FALLBACK ===
// Ensures scroll-animated elements are always visible even if IntersectionObserver fails
(function() {
  'use strict';

  var SELECTORS = [
    '.timeline-entry',
    '.mv-card',
    '.mgmt-card',
    '.story-panel',
    '.story-timeline',
    '[class*="timeline-entry"]',
    '[class*="mv-card"]',
    '[class*="mgmt-card"]',
    '[class*="animate-"]',
    '[class*="-animated"]',
    '.fade-in',
    '.slide-in',
    '.scroll-reveal',
    '[data-aos]',
    '.aos-init'
  ];

  function forceVisibleAll() {
    SELECTORS.forEach(function(sel) {
      try {
        document.querySelectorAll(sel).forEach(function(el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          el.style.visibility = 'visible';
          el.classList.add('visible');
          el.classList.add('animated');
        });
      } catch(e) {}
    });
  }

  // Run immediately (for already-parsed elements)
  forceVisibleAll();

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceVisibleAll);
  } else {
    forceVisibleAll();
  }

  // Run after full page load (images, fonts etc.)
  window.addEventListener('load', forceVisibleAll);

  // Final safety net at 500ms
  setTimeout(forceVisibleAll, 500);
  // And at 1000ms for very slow connections
  setTimeout(forceVisibleAll, 1000);
})();

// === HOME HERO IMAGE / VIDEO SEQUENCE ===
(function initHomeHeroMediaSequence() {
  'use strict';

  const IMAGE_DURATION = 5000;
  const MAX_VIDEO_DURATION = 10000;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function() {
    const root = document.getElementById('homeHeroMedia') || document.querySelector('.hero-right');
    const image = document.getElementById('heroImageMain');
    const carousel = document.getElementById('heroVideoCarousel');
    const videos = carousel ? Array.prototype.slice.call(carousel.querySelectorAll('.hero-video')) : [];

    if (!root || !image || !carousel || videos.length === 0 || root.dataset.homeHeroBound === 'true') return;
    root.dataset.homeHeroBound = 'true';
    root.classList.add('hero-media-sequence');
    image.classList.add('hero-media-item');
    carousel.classList.add('hero-media-video-layer');

    const progress = carousel.querySelector('.progress-fill');
    const currentTime = carousel.querySelector('.current-time');
    const duration = carousel.querySelector('.duration');
    const playPause = document.getElementById('heroVideoPausePlay');

    const items = [{ type: 'image', element: image, duration: IMAGE_DURATION }].concat(
      videos.map(function(video) {
        return { type: 'video', element: video, duration: MAX_VIDEO_DURATION };
      })
    );

    let currentIndex = 0;
    let timer = null;
    let paused = false;
    let activeVideo = null;
    let videoEndedHandler = null;
    let videoMetadataHandler = null;

    videos.forEach(function(video) {
      video.classList.add('hero-media-item');
      video.autoplay = true;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = false;
      video.controls = false;
      video.playsInline = true;
      video.preload = 'auto';
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      video.removeAttribute('loop');
      video.removeAttribute('controls');
      video.setAttribute('playsinline', '');
      video.setAttribute('preload', 'auto');
      try { video.load(); } catch (error) {}
    });

    function formatTime(milliseconds) {
      const seconds = Math.round(milliseconds / 1000);
      return '0:' + String(seconds).padStart(2, '0');
    }

    function resetProgress(item) {
      if (!progress) return;
      const durationMs = item.duration || MAX_VIDEO_DURATION;
      progress.style.transition = 'none';
      progress.style.width = '0%';
      progress.offsetHeight;
      progress.style.transition = 'width ' + durationMs + 'ms linear';
      progress.style.width = '100%';
      if (duration) duration.textContent = formatTime(durationMs);
      if (currentTime) currentTime.textContent = '0:00';
    }

    function setPlayIcon() {
      if (!playPause) return;
      playPause.innerHTML = paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
      playPause.setAttribute('aria-label', paused ? 'Play hero media' : 'Pause hero media');
    }

    function clearVideoTimerAndHandlers(resetActive) {
      window.clearTimeout(timer);
      timer = null;
      if (activeVideo) {
        if (videoEndedHandler) activeVideo.removeEventListener('ended', videoEndedHandler);
        if (videoMetadataHandler) activeVideo.removeEventListener('loadedmetadata', videoMetadataHandler);
        if (resetActive) resetVideo(activeVideo);
      }
      activeVideo = null;
      videoEndedHandler = null;
      videoMetadataHandler = null;
    }

    function resetVideo(video) {
      if (!video) return;
      try { video.pause(); } catch (error) {}
      try { video.currentTime = 0; } catch (error) {}
    }

    function pauseAllVideos(except) {
      videos.forEach(function(video) {
        if (video !== except) {
          resetVideo(video);
          video.classList.remove('active', 'active-video');
        }
      });
    }

    function getKnownVideoDurationMs(video) {
      return Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(video.duration * 1000, MAX_VIDEO_DURATION)
        : MAX_VIDEO_DURATION;
    }

    function scheduleVideoAdvance(video) {
      activeVideo = video;
      const startedAt = Date.now();

      function advance() {
        if (activeVideo !== video || paused) return;
        clearVideoTimerAndHandlers(false);
        resetVideo(video);
        showItem(currentIndex + 1);
      }

      function armMaxTimer() {
        window.clearTimeout(timer);
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, MAX_VIDEO_DURATION - elapsed);
        timer = window.setTimeout(advance, remaining);
      }

      videoEndedHandler = function() {
        window.clearTimeout(timer);
        advance();
      };

      videoMetadataHandler = function() {
        resetProgress({
          type: 'video',
          element: video,
          duration: getKnownVideoDurationMs(video)
        });

        if (Number.isFinite(video.duration) && video.duration > 0 && video.duration <= (MAX_VIDEO_DURATION / 1000)) {
          window.clearTimeout(timer);
          timer = null;
        } else {
          armMaxTimer();
        }
      };

      video.addEventListener('ended', videoEndedHandler);
      video.addEventListener('loadedmetadata', videoMetadataHandler);
      armMaxTimer();

      if (video.readyState >= 1) {
        videoMetadataHandler();
      } else {
        resetProgress({ type: 'video', element: video, duration: MAX_VIDEO_DURATION });
      }
    }

    function showItem(nextIndex) {
      clearVideoTimerAndHandlers(false);
      currentIndex = (nextIndex + items.length) % items.length;
      const item = items[currentIndex];
      const isVideo = item.type === 'video';

      image.classList.toggle('active', !isVideo);
      image.classList.toggle('hidden', isVideo);
      image.style.opacity = isVideo ? '0' : '1';
      image.style.zIndex = isVideo ? '1' : '4';
      image.style.pointerEvents = isVideo ? 'none' : 'auto';

      carousel.classList.toggle('visible', isVideo);
      carousel.style.opacity = isVideo ? '1' : '0';
      carousel.style.zIndex = isVideo ? '4' : '1';
      carousel.style.pointerEvents = isVideo ? 'auto' : 'none';

      if (isVideo) {
        const video = item.element;
        pauseAllVideos(video);
        video.classList.add('active', 'active-video');
        video.style.opacity = '1';
        video.style.zIndex = '3';
        resetVideo(video);
        if (!paused) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function() {});
          }
          scheduleVideoAdvance(video);
        }
      } else {
        pauseAllVideos(null);
      }

      videos.forEach(function(video) {
        if (!isVideo || video !== item.element) {
          video.style.opacity = '0';
          video.style.zIndex = '1';
        }
      });

      if (!isVideo) resetProgress(item);
      setPlayIcon();

      if (!paused && !isVideo) {
        timer = window.setTimeout(function() {
          showItem(currentIndex + 1);
        }, item.duration);
      }
    }

    if (playPause) {
      playPause.addEventListener('click', function(event) {
        event.preventDefault();
        paused = !paused;
        const item = items[currentIndex];
        if (paused) {
          clearVideoTimerAndHandlers(false);
          if (item.type === 'video') item.element.pause();
          if (progress) progress.style.transition = 'none';
        } else {
          if (item.type === 'video') item.element.play().catch(function() {});
          showItem(currentIndex);
        }
        setPlayIcon();
      });
    }

    showItem(0);
  });
})();

// === JOEL GLOBAL ANIMATION MANAGER ===
(function initJoelGlobalAnimationManager() {
  'use strict';

  const SLIDE_INTERVAL = 3000;
  const MAX_VIDEO_DURATION = 10000;
  const TICK_INTERVAL = 1000;
  const ANIMATION_DURATION = 800;
  const ACTIVE_CLASSES = ['active', 'active-video'];
  const controllers = [];
  let masterTimer = null;
  let globallyPaused = false;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function unique(items) {
    return items.filter(function(item, index) {
      return item && items.indexOf(item) === index;
    });
  }

  function setMediaDefaults(media, eager) {
    if (!media) return;
    if (media.tagName === 'IMG') {
      media.decoding = 'async';
      media.loading = eager ? 'eager' : 'lazy';
      if (media.src) {
        const preloader = new Image();
        preloader.src = media.currentSrc || media.src;
      }
    }
    if (media.tagName === 'VIDEO') {
      media.muted = true;
      media.defaultMuted = true;
      media.loop = false;
      media.autoplay = true;
      media.playsInline = true;
      media.setAttribute('muted', '');
      media.removeAttribute('loop');
      media.setAttribute('autoplay', '');
      media.setAttribute('playsinline', '');
      media.preload = eager || media.closest('[class*="hero"], .contact-video-cycle') ? 'auto' : 'metadata';
      if (media.poster) {
        media.style.setProperty('--video-poster', 'url("' + media.poster + '")');
      }
    }
  }

  function playVideo(video) {
    if (!video || video.tagName !== 'VIDEO') return;
    setMediaDefaults(video, true);
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {
        video.muted = true;
        video.classList.add('video-fallback-active');
      });
    }
  }

  function pauseVideo(video) {
    if (video && video.tagName === 'VIDEO' && !video.paused) {
      video.pause();
    }
  }

  function findDots(root, dotSelector) {
    const scopes = unique([
      root,
      root.parentElement,
      root.closest('section'),
      root.closest('[class*="hero"]'),
      root.closest('[class*="carousel"]'),
      root.closest('[class*="slider"]')
    ]);

    for (const scope of scopes) {
      const dots = toArray(scope.querySelectorAll(dotSelector));
      if (dots.length) return dots;
    }
    return [];
  }

  function findControlButton(root, selectors) {
    const scopes = unique([
      root,
      root.parentElement,
      root.closest('section'),
      root.closest('[class*="carousel"]'),
      root.closest('[class*="slider"]')
    ]);

    for (const scope of scopes) {
      const button = scope.querySelector(selectors);
      if (button) return button;
    }
    return null;
  }

  function setItemState(item, isActive, isPrevious, options) {
    const duration = options && options.animationDuration ? options.animationDuration : ANIMATION_DURATION;
    const fadeOnly = options && options.transitionMode === 'fade';

    item.classList.toggle('active', isActive);
    item.classList.toggle('is-active', isActive);
    item.classList.toggle('is-exiting', !isActive && isPrevious);

    if (item.tagName === 'VIDEO') {
      item.classList.toggle('active-video', isActive);
    }

    item.style.display = 'block';
    item.style.visibility = 'visible';
    item.style.transition = fadeOnly
      ? 'opacity ' + duration + 'ms ease'
      : 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms ease';
    item.style.willChange = 'opacity, transform';
    item.style.opacity = isActive ? '1' : '0';
    item.style.transform = fadeOnly
      ? 'translate3d(0, 0, 0)'
      : (isActive ? 'translateX(0) scale(1)' : (isPrevious ? 'translateX(-100%) scale(0.98)' : 'translateX(100%) scale(0.98)'));
    item.style.zIndex = isActive ? '2' : '1';
    item.style.pointerEvents = isActive ? 'auto' : 'none';

    if (item.tagName === 'VIDEO') {
      if (isActive) {
        if (!options || options.type !== 'video') playVideo(item);
      } else {
        pauseVideo(item);
      }
    }
  }

  function createSequenceController(config) {
    const root = config.root;
    const items = toArray(config.items);
    const dots = config.dots || [];

    if (!root || items.length < 1 || root.dataset.joelAnimationBound === 'true') return null;
    root.dataset.joelAnimationBound = 'true';
    root.classList.add('joel-managed-root');

    let index = Math.max(0, items.findIndex(function(item) {
      return item.classList.contains('active') || item.classList.contains('active-video');
    }));
    if (index < 0) index = 0;
    let activeVideo = null;
    let videoTimer = null;
    let videoEndedHandler = null;
    let videoMetadataHandler = null;

    function getItemVideo(item) {
      if (!item) return null;
      if (item.tagName === 'VIDEO') return item;
      return item.querySelector ? item.querySelector('video') : null;
    }

    function resetManagedVideo(video) {
      if (!video) return;
      try { video.pause(); } catch (error) {}
      try { video.currentTime = 0; } catch (error) {}
    }

    function clearActiveVideoSchedule(resetCurrent) {
      if (videoTimer) {
        window.clearTimeout(videoTimer);
        videoTimer = null;
      }

      if (activeVideo) {
        if (videoEndedHandler) activeVideo.removeEventListener('ended', videoEndedHandler);
        if (videoMetadataHandler) activeVideo.removeEventListener('loadedmetadata', videoMetadataHandler);
        if (resetCurrent) resetManagedVideo(activeVideo);
      }

      activeVideo = null;
      videoEndedHandler = null;
      videoMetadataHandler = null;
    }

    function getVideoDurationMs(video) {
      return Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(video.duration * 1000, controller.maxVideoDuration)
        : controller.maxVideoDuration;
    }

    function scheduleActiveVideo(video) {
      if (!video) return;
      activeVideo = video;
      const startedAt = Date.now();

      function advance() {
        if (activeVideo !== video || controller.paused || globallyPaused) return;
        clearActiveVideoSchedule(false);
        resetManagedVideo(video);
        controller.next();
      }

      function armMaxDurationTimer() {
        if (videoTimer) window.clearTimeout(videoTimer);
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, controller.maxVideoDuration - elapsed);
        videoTimer = window.setTimeout(advance, remaining);
      }

      videoEndedHandler = function() {
        if (videoTimer) window.clearTimeout(videoTimer);
        advance();
      };

      videoMetadataHandler = function() {
        const durationMs = getVideoDurationMs(video);
        if (typeof config.onVideoDuration === 'function') {
          config.onVideoDuration(durationMs, controller.index, video);
        }

        if (Number.isFinite(video.duration) && video.duration > 0 && video.duration <= (controller.maxVideoDuration / 1000)) {
          if (videoTimer) window.clearTimeout(videoTimer);
          videoTimer = null;
        } else {
          armMaxDurationTimer();
        }
      };

      video.addEventListener('ended', videoEndedHandler);
      video.addEventListener('loadedmetadata', videoMetadataHandler);
      armMaxDurationTimer();

      if (video.readyState >= 1) {
        videoMetadataHandler();
      } else if (typeof config.onVideoDuration === 'function') {
        config.onVideoDuration(controller.maxVideoDuration, controller.index, video);
      }

      setMediaDefaults(video, true);
      resetManagedVideo(video);
      playVideo(video);
    }

    const controller = {
      root: root,
      items: items,
      dots: dots,
      index: index,
      visible: true,
      hovered: false,
      paused: false,
      type: config.type || 'sequence',
      interval: config.interval || SLIDE_INTERVAL,
      maxVideoDuration: config.maxVideoDuration || MAX_VIDEO_DURATION,
      animationDuration: config.animationDuration || ANIMATION_DURATION,
      transitionMode: config.transitionMode || (config.type === 'video' ? 'fade' : 'slide'),
      lastTick: Date.now(),
      show: function(nextIndex) {
        if (!items.length) return;
        if (controller.type === 'video') {
          clearActiveVideoSchedule(false);
          items.forEach(function(item) {
            const video = getItemVideo(item);
            if (video) resetManagedVideo(video);
          });
        }

        const previousIndex = controller.index;
        controller.index = (nextIndex + items.length) % items.length;
        controller.lastTick = Date.now();
        items.forEach(function(item, itemIndex) {
          setItemState(item, itemIndex === controller.index, itemIndex === previousIndex, controller);
          const media = item.matches && item.matches('img, video') ? item : item.querySelector && item.querySelector('img, video');
          setMediaDefaults(media, itemIndex === controller.index || itemIndex === (controller.index + 1) % items.length);
        });
        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === controller.index);
          dot.setAttribute('aria-current', dotIndex === controller.index ? 'true' : 'false');
        });
        if (typeof config.onShow === 'function') config.onShow(controller.index);
        if (controller.type === 'video' && !controller.paused && !globallyPaused) {
          scheduleActiveVideo(getItemVideo(items[controller.index]));
        }
      },
      next: function() {
        controller.show(controller.index + 1);
      },
      prev: function() {
        controller.show(controller.index - 1);
      },
      tick: function() {
        if (controller.type === 'video') return;
        if (!controller.visible || controller.hovered || controller.paused || globallyPaused) return;
        if (items.length > 1 && Date.now() - controller.lastTick >= controller.interval) controller.next();
      },
      pause: function() {
        controller.paused = true;
        if (controller.type === 'video') clearActiveVideoSchedule(false);
        items.forEach(pauseVideo);
      },
      resume: function() {
        controller.paused = false;
        if (controller.visible) controller.show(controller.index);
      },
      reset: function() {
        controller.show(0);
      }
    };

    root.addEventListener('mouseenter', function() { controller.hovered = true; });
    root.addEventListener('mouseleave', function() { controller.hovered = false; });
    root.addEventListener('focusin', function() { controller.hovered = true; });
    root.addEventListener('focusout', function() { controller.hovered = false; });

    dots.forEach(function(dot, dotIndex) {
      dot.style.cursor = 'pointer';
      dot.addEventListener('click', function() { controller.show(dotIndex); });
    });

    const prevButton = config.prevButton || findControlButton(root, '.slider-prev, .carousel-prev, .prev-btn, [data-slider-prev], [data-carousel-prev], [aria-label*="Previous"]');
    const nextButton = config.nextButton || findControlButton(root, '.slider-next, .carousel-next, .next-btn, [data-slider-next], [data-carousel-next], [aria-label*="Next"]');
    if (prevButton) prevButton.addEventListener('click', function(event) {
      event.preventDefault();
      controller.prev();
    });
    if (nextButton) nextButton.addEventListener('click', function(event) {
      event.preventDefault();
      controller.next();
    });

    if (typeof addSwipeNavigation === 'function') {
      addSwipeNavigation(root, {
        next: controller.next,
        prev: controller.prev,
        pause: function() { controller.hovered = true; },
        resume: function() { controller.hovered = false; }
      });
    }

    controller.show(index);
    return controller;
  }

  function createBusinessController() {
    const track = document.getElementById('businessCardsTrack');
    if (!track || track.dataset.joelAnimationBound === 'true') return null;

    const cards = toArray(track.querySelectorAll('.business-card'));
    const viewport = track.parentElement;
    const root = track.closest('.business-slider-wrapper') || viewport || track;
    if (!cards.length || !viewport) return null;

    track.dataset.joelAnimationBound = 'true';
    root.classList.add('joel-managed-root');

    let index = window.innerWidth <= 768 ? 0 : Math.min(2, cards.length - 1);
    const controller = {
      root: root,
      visible: true,
      hovered: false,
      paused: false,
      show: function(nextIndex) {
        index = (nextIndex + cards.length) % cards.length;
        cards.forEach(function(card, cardIndex) {
          card.classList.toggle('active', cardIndex === index);
          card.classList.toggle('is-active', cardIndex === index);
        });
        const activeCard = cards[index];
        const maxOffset = Math.max(0, track.scrollWidth - viewport.clientWidth);
        const centeredOffset = activeCard ? activeCard.offsetLeft - ((viewport.clientWidth - activeCard.offsetWidth) / 2) : 0;
        const offset = Math.max(0, Math.min(centeredOffset, maxOffset));
        track.style.transition = 'transform ' + ANIMATION_DURATION + 'ms cubic-bezier(0.22, 1, 0.36, 1)';
        track.style.transform = 'translate3d(' + (-offset) + 'px, 0, 0)';
      },
      next: function() { controller.show(index + 1); },
      prev: function() { controller.show(index - 1); },
      tick: function() {
        if (!controller.visible || controller.hovered || controller.paused || globallyPaused) return;
        controller.next();
      },
      pause: function() { controller.paused = true; },
      resume: function() { controller.paused = false; },
      reset: function() { controller.show(window.innerWidth <= 768 ? 0 : Math.min(2, cards.length - 1)); }
    };

    const prev = document.getElementById('businessPrev');
    const next = document.getElementById('businessNext');
    if (prev) prev.addEventListener('click', function(event) {
      event.preventDefault();
      controller.prev();
    });
    if (next) next.addEventListener('click', function(event) {
      event.preventDefault();
      controller.next();
    });

    root.addEventListener('mouseenter', function() { controller.hovered = true; });
    root.addEventListener('mouseleave', function() { controller.hovered = false; });
    window.addEventListener('resize', function() { controller.show(index); });

    if (typeof addSwipeNavigation === 'function') {
      addSwipeNavigation(viewport, {
        next: controller.next,
        prev: controller.prev,
        pause: function() { controller.hovered = true; },
        resume: function() { controller.hovered = false; }
      });
    }

    controller.show(index);
    return controller;
  }

  function createCeoBioController() {
    const root = document.querySelector('.ceo-bio-container');
    if (!root || root.dataset.joelAnimationBound === 'true') return null;
    const bios = toArray(root.querySelectorAll('.ceo-bio'));
    if (bios.length < 2) return null;

    root.dataset.joelAnimationBound = 'true';
    let index = Math.max(0, bios.findIndex(function(bio) { return bio.classList.contains('active'); }));
    if (index < 0) index = 0;

    const controller = {
      root: root,
      visible: true,
      hovered: false,
      paused: false,
      show: function(nextIndex) {
        index = (nextIndex + bios.length) % bios.length;
        bios.forEach(function(bio, bioIndex) {
          bio.classList.toggle('active', bioIndex === index);
          bio.style.transition = 'opacity ' + ANIMATION_DURATION + 'ms ease, transform ' + ANIMATION_DURATION + 'ms ease';
          bio.style.opacity = bioIndex === index ? '1' : '0';
          bio.style.transform = bioIndex === index ? 'translateX(0)' : 'translateX(18px)';
          bio.style.position = bioIndex === index ? 'relative' : 'absolute';
          bio.style.inset = bioIndex === index ? '' : '0 auto auto 0';
          bio.style.pointerEvents = bioIndex === index ? 'auto' : 'none';
        });
      },
      next: function() { controller.show(index + 1); },
      tick: function() {
        if (!controller.visible || controller.hovered || controller.paused || globallyPaused) return;
        controller.next();
      },
      pause: function() { controller.paused = true; },
      resume: function() { controller.paused = false; },
      reset: function() { controller.show(0); }
    };

    root.addEventListener('mouseenter', function() { controller.hovered = true; });
    root.addEventListener('mouseleave', function() { controller.hovered = false; });
    controller.show(index);
    return controller;
  }

  function createCoreValuesPremiumController() {
    const imagePanel = document.querySelector('.cv-image-panel');
    const cardsPanel = document.querySelector('.cv-cards-panel');
    const slides = toArray(document.querySelectorAll('.cv-image-slide'));
    const cards = toArray(document.querySelectorAll('.cv-card'));
    const overlayLabel = document.querySelector('.cv-overlay-label');
    const progressBar = document.querySelector('.cv-progress-bar');
    const section = imagePanel ? imagePanel.closest('.cv-section') : null;
    const root = section || imagePanel;

    if (!root || !imagePanel || !cardsPanel || slides.length < 1 || cards.length < 1 || root.dataset.joelAnimationBound === 'true') return null;

    root.dataset.joelAnimationBound = 'true';
    root.classList.add('joel-managed-root', 'joel-cv-root');

    const labels = cards.map(function(card, cardIndex) {
      const title = card.querySelector('.cv-card-title');
      return title ? title.textContent.trim() : (slides[cardIndex] ? slides[cardIndex].alt : '');
    });

    let index = Math.max(0, slides.findIndex(function(slide) { return slide.classList.contains('active'); }));

    const controller = {
      root: root,
      visible: true,
      hovered: false,
      paused: false,
      show: function(nextIndex) {
        const previousIndex = index;
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function(slide, slideIndex) {
          const isActive = slideIndex === index;
          const isPrevious = slideIndex === previousIndex && slideIndex !== index;
          slide.classList.toggle('active', isActive);
          slide.classList.toggle('is-active', isActive);
          slide.classList.toggle('is-exiting', isPrevious);
          slide.style.display = 'block';
          slide.style.visibility = 'visible';
          slide.style.transition = 'opacity ' + ANIMATION_DURATION + 'ms ease, transform ' + ANIMATION_DURATION + 'ms cubic-bezier(0.22, 1, 0.36, 1)';
          slide.style.opacity = isActive ? '1' : '0';
          slide.style.transform = isActive ? 'translateX(0) scale(1)' : (isPrevious ? 'translateX(-100%) scale(0.98)' : 'translateX(100%) scale(0.98)');
          slide.style.zIndex = isActive ? '2' : '1';
          setMediaDefaults(slide, isActive || slideIndex === (index + 1) % slides.length);
        });

        cards.forEach(function(card, cardIndex) {
          card.classList.toggle('active', cardIndex === index);
          card.classList.toggle('is-active', cardIndex === index);
        });

        if (overlayLabel) overlayLabel.textContent = labels[index] || '';
        if (progressBar) {
          progressBar.classList.remove('animating');
          progressBar.style.animation = 'none';
          progressBar.offsetHeight;
          progressBar.style.animation = 'cvProgressAnimation ' + SLIDE_INTERVAL + 'ms linear forwards';
          progressBar.classList.add('animating');
        }
      },
      next: function() { controller.show(index + 1); },
      prev: function() { controller.show(index - 1); },
      tick: function() {
        if (!controller.visible || controller.hovered || controller.paused || globallyPaused) return;
        if (slides.length > 1) controller.next();
      },
      pause: function() { controller.paused = true; },
      resume: function() { controller.paused = false; },
      reset: function() { controller.show(0); }
    };

    [imagePanel, cardsPanel].forEach(function(panel) {
      panel.addEventListener('mouseenter', function() { controller.hovered = true; });
      panel.addEventListener('mouseleave', function() { controller.hovered = false; });
      panel.addEventListener('focusin', function() { controller.hovered = true; });
      panel.addEventListener('focusout', function() { controller.hovered = false; });
    });

    cards.forEach(function(card, cardIndex) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function() {
        controller.show(cardIndex);
      });
    });

    controller.show(index);
    return controller;
  }

  function bindVisibilityObserver() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        const controller = controllers.find(function(candidate) {
          return candidate.root === entry.target;
        });
        if (!controller) return;
        controller.visible = entry.isIntersecting && entry.intersectionRatio > 0.15;
        if (controller.visible) {
          controller.resume();
        } else {
          controller.pause();
        }
      });
    }, {
      threshold: [0, 0.15, 0.4],
      rootMargin: '120px 0px'
    });

    controllers.forEach(function(controller) {
      observer.observe(controller.root);
    });
  }

  function register(controller) {
    if (controller) controllers.push(controller);
  }

  function registerSequence(root, itemSelector, dotSelector, options) {
    if (!root) return;
    const items = toArray(root.querySelectorAll(itemSelector));
    if (!items.length) return;
    register(createSequenceController(Object.assign({
      root: root,
      items: items,
      dots: findDots(root, dotSelector || '.indicator, [class*="dot"]')
    }, options || {})));
  }

  function initializeControllers() {
    document.querySelectorAll('img').forEach(function(img, index) {
      setMediaDefaults(img, index < 8);
    });

    document.querySelectorAll('video').forEach(function(video, index) {
      setMediaDefaults(video, index < 2);
    });

    register(createCeoBioController());
    register(createBusinessController());
    register(createCoreValuesPremiumController());

    document.querySelectorAll('.hero-video-cycle').forEach(function(root) {
      const videos = toArray(root.querySelectorAll('video'));
      if (videos.length === 0) return;
      if (root.id === 'heroVideoCarousel') {
        root.classList.add('visible');
        const heroImage = document.getElementById('heroImageMain');
        if (heroImage) heroImage.classList.add('hidden');
      }
      register(createSequenceController({
        root: root,
        items: videos,
        dots: findDots(root, '.about-hero-dot, .services-hero-dot, .leadership-hero-dot, .ccv-dot, .indicator'),
        type: 'video',
        maxVideoDuration: MAX_VIDEO_DURATION
      }));
    });

    const contactCycle = document.getElementById('contactVideoCycle');
    if (contactCycle && contactCycle.dataset.joelAnimationBound !== 'true') {
      const contactController = createSequenceController({
        root: contactCycle,
        items: toArray(contactCycle.querySelectorAll('.contact-cycle-vid')),
        dots: toArray(contactCycle.querySelectorAll('.ccv-dot')),
        type: 'video',
        maxVideoDuration: MAX_VIDEO_DURATION,
        animationDuration: 800,
        transitionMode: 'fade',
        onShow: function(index) {
          const counter = contactCycle.querySelector('#ccvCounter');
          const progress = contactCycle.querySelector('#ccvProgressBar');
          if (counter) counter.textContent = (index + 1) + ' / ' + contactCycle.querySelectorAll('.contact-cycle-vid').length;
          if (progress) progress.style.animation = 'none';
        },
        onVideoDuration: function(durationMs) {
          const progress = contactCycle.querySelector('#ccvProgressBar');
          if (progress) {
            progress.style.animation = 'none';
            progress.offsetHeight;
            progress.style.animation = 'ccvProgressAnimation ' + durationMs + 'ms linear forwards';
          }
        }
      });

      const contactControl = document.getElementById('ccvControlBtn');
      const contactControlIcon = document.getElementById('ccvCtrlIcon');
      if (contactControl && contactController) {
        contactControl.addEventListener('click', function(event) {
          event.preventDefault();
          contactController.paused = !contactController.paused;
          if (contactController.paused) {
            contactController.items.forEach(pauseVideo);
            contactControl.setAttribute('aria-label', 'Play video');
            if (contactControlIcon) contactControlIcon.textContent = '▶';
          } else {
            contactController.show(contactController.index);
            contactControl.setAttribute('aria-label', 'Pause video');
            if (contactControlIcon) contactControlIcon.textContent = '⏸';
          }
        });
      }

      register(contactController);
    }

    document.querySelectorAll('.carousel-container').forEach(function(root) {
      registerSequence(root, '.carousel-slide', '.indicator');
    });

    document.querySelectorAll('.image-carousel .carousel-wrapper').forEach(function(root) {
      registerSequence(root, '.carousel-slide', '.indicator');
    });

    document.querySelectorAll('.mission-slider .slider-container, .vision-slider .slider-container').forEach(function(root) {
      registerSequence(root, '.slide', '.indicator, [class*="dot"]');
    });

    document.querySelectorAll('.values-slider .slider-container').forEach(function(root) {
      registerSequence(root, '.slider-slide', '.indicator, [class*="dot"]');
    });

    document.querySelectorAll('.terms-hero-media').forEach(function(root) {
      registerSequence(root, '.terms-image', '.terms-dot');
    });

    document.querySelectorAll('.privacy-hero-media').forEach(function(root) {
      registerSequence(root, '.privacy-image', '.privacy-dot');
    });

    document.querySelectorAll('.chm-img-panel').forEach(function(root) {
      registerSequence(root, '.chm-slide', '.indicator, [class*="dot"]');
    });

    const flip = document.getElementById('aboutHeroFlip');
    if (flip) {
      const img = flip.querySelector('.flip-card-image');
      if (img) {
        const sources = ['assets/images/about-preview.jpg', 'assets/images/about-preview2.jpg', 'assets/images/about-preview4.jpg'];
        const proxyItems = sources.map(function(src) {
          const item = document.createElement('span');
          item.dataset.src = src;
          return item;
        });
        register(createSequenceController({
          root: flip,
          items: proxyItems,
          dots: [],
          onShow: function(index) {
            img.style.transition = 'opacity ' + (ANIMATION_DURATION / 2) + 'ms ease, transform ' + ANIMATION_DURATION + 'ms ease';
            img.style.opacity = '0';
            img.style.transform = 'translateX(-24px) scale(0.98)';
            window.setTimeout(function() {
              img.src = sources[index];
              img.style.opacity = '1';
              img.style.transform = 'translateX(0) scale(1)';
            }, ANIMATION_DURATION / 2);
          }
        }));
      }
    }

    bindVisibilityObserver();
    resetAnimations();
    startAnimations();
  }

  function tickControllers() {
    controllers.forEach(function(controller) {
      if (controller && typeof controller.tick === 'function') controller.tick();
    });
  }

  function startAnimations() {
    globallyPaused = false;
    if (masterTimer) window.clearInterval(masterTimer);
    masterTimer = window.setInterval(tickControllers, TICK_INTERVAL);
    controllers.forEach(function(controller) {
      if (controller.visible && typeof controller.resume === 'function') controller.resume();
    });
  }

  function pauseAnimations() {
    globallyPaused = true;
    controllers.forEach(function(controller) {
      if (typeof controller.pause === 'function') controller.pause();
    });
  }

  function resumeAnimations() {
    globallyPaused = false;
    controllers.forEach(function(controller) {
      if (typeof controller.resume === 'function') controller.resume();
    });
  }

  function resetAnimations() {
    controllers.forEach(function(controller) {
      if (typeof controller.reset === 'function') controller.reset();
    });
  }

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      pauseAnimations();
    } else {
      resumeAnimations();
    }
  });

  window.JOELAnimationManager = {
    controllers: controllers,
    startAnimations: startAnimations,
    pauseAnimations: pauseAnimations,
    resumeAnimations: resumeAnimations,
    resetAnimations: resetAnimations
  };

  window.startAnimations = startAnimations;
  window.pauseAnimations = pauseAnimations;
  window.resumeAnimations = resumeAnimations;
  window.resetAnimations = resetAnimations;
  window.consultantWebsite = Object.assign(window.consultantWebsite || {}, window.JOELAnimationManager);

  ready(initializeControllers);
})();

// === GLOBAL IMAGE ERROR HANDLER ===
(function() {
  'use strict';

  function attachImageErrorHandlers() {
    document.querySelectorAll('img').forEach(function(img) {
      if (img.dataset.errHandled) return;
      img.dataset.errHandled = '1';

      // Force display visible
      img.style.display = 'block';
      img.style.opacity = '1';
      img.style.visibility = 'visible';
      img.style.minHeight = '20px';

      img.addEventListener('error', function() {
        console.warn('[IMG ERROR] Failed to load:', img.src || img.currentSrc || '(no src)');
        // Show a dark placeholder so layout doesn't collapse
        img.style.background = '#0a1f4e';
        img.style.minHeight = '200px';
        img.style.display = 'block';
      });

      img.addEventListener('load', function() {
        img.style.opacity = '1';
        img.style.visibility = 'visible';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachImageErrorHandlers);
  } else {
    attachImageErrorHandlers();
  }

  // Re-run at 1s to catch dynamically added images
  setTimeout(attachImageErrorHandlers, 1000);
})();

// === GLOBAL VIDEO AUTOPLAY ENFORCER ===
(function() {
  'use strict';

  function enforceVideoAutoplay() {
    document.querySelectorAll('video').forEach(function(video) {
      if (video.dataset.autoplayEnforced) return;
      video.dataset.autoplayEnforced = '1';

      const isManagedCarouselVideo =
        video.classList.contains('hero-cycle-video') ||
        video.classList.contains('contact-cycle-vid') ||
        video.closest('#heroVideoCarousel');
      const isActiveManagedVideo =
        video.classList.contains('active') ||
        video.classList.contains('active-video');

      // Ensure required attributes
      video.muted = true;
      video.defaultMuted = true;
      video.loop = false;
      video.playsInline = true;
      video.autoplay = true;
      video.removeAttribute('loop');
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');

      // If video has a poster, use it as a CSS fallback background
      if (video.poster) {
        video.style.setProperty('--video-poster', 'url("' + video.poster + '")');
        video.style.background = 'url("' + video.poster + '") center/cover no-repeat #040f2e';
      }

      if (isManagedCarouselVideo && !isActiveManagedVideo) return;

      // Attempt to play
      var playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function() {
          // Autoplay blocked — show poster as background
          video.classList.add('video-fallback-active');
          if (video.poster) {
            video.style.backgroundImage = 'url("' + video.poster + '")';
            video.style.backgroundSize = 'cover';
            video.style.backgroundPosition = 'center';
          }
          // Try again on user interaction
          document.addEventListener('click', function tryPlay() {
            var isManagedCarouselVideo =
              video.classList.contains('hero-cycle-video') ||
              video.classList.contains('contact-cycle-vid') ||
              video.closest('#heroVideoCarousel');
            var isActiveManagedVideo =
              video.classList.contains('active') ||
              video.classList.contains('active-video');
            if (!isManagedCarouselVideo || isActiveManagedVideo) {
              video.play().catch(function() {});
            }
            document.removeEventListener('click', tryPlay);
          }, { once: true });
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enforceVideoAutoplay);
  } else {
    enforceVideoAutoplay();
  }

  // Re-enforce at 1.5s to catch any late-rendered videos
  setTimeout(enforceVideoAutoplay, 1500);
})();

// === PRODUCTION VIDEO DELIVERY FALLBACK ===
(function() {
  const GITHUB_MEDIA_BASE = 'https://media.githubusercontent.com/media/PhilipCobbinah/consultant-site/main/';
  const VIDEO_LOAD_TIMEOUT = 4500;

  function toRepoPath(src) {
    if (!src) return '';

    try {
      const url = new URL(src, window.location.href);
      return decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    } catch (error) {
      return src.replace(/^\/+/, '');
    }
  }

  function encodeRepoPath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }

  function getVideoSource(video) {
    const directSrc = video.getAttribute('src');
    if (directSrc) return directSrc;

    const source = video.querySelector('source[src]');
    return source ? source.getAttribute('src') : '';
  }

  function setVideoSource(video, src) {
    if (video.hasAttribute('src')) {
      video.setAttribute('src', src);
    } else {
      const source = video.querySelector('source[src]');
      if (source) {
        source.setAttribute('src', src);
      } else {
        video.setAttribute('src', src);
      }
    }

    video.load();
  }

  function playWhenReady(video) {
    const isManagedCarouselVideo =
      video.classList.contains('hero-cycle-video') ||
      video.classList.contains('contact-cycle-vid') ||
      video.closest('#heroVideoCarousel');
    const isActiveManagedVideo =
      video.classList.contains('active') ||
      video.classList.contains('active-video');

    if (isManagedCarouselVideo && !isActiveManagedVideo) return;
    if (!video.autoplay && !isActiveManagedVideo) return;

    video.muted = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  function applyPosterFallback(video) {
    const poster = video.getAttribute('poster');
    video.classList.add('video-fallback-active');

    if (poster) {
      video.style.setProperty('--video-poster', `url("${poster}")`);
    }

    try {
      video.pause();
    } catch (error) {}
  }

  function retryWithRemoteVideo(video) {
    const originalPath = video.dataset.localVideoPath;
    if (!originalPath || video.dataset.remoteVideoTried === 'true') {
      applyPosterFallback(video);
      return;
    }

    video.dataset.remoteVideoTried = 'true';
    setVideoSource(video, GITHUB_MEDIA_BASE + encodeRepoPath(originalPath));
    playWhenReady(video);

    window.setTimeout(function() {
      if (video.readyState === 0 && video.dataset.videoLoaded !== 'true') {
        applyPosterFallback(video);
      }
    }, VIDEO_LOAD_TIMEOUT);
  }

  function prepareVideo(video) {
    if (!video || video.dataset.videoDeliveryBound === 'true') return;

    const src = getVideoSource(video);
    const repoPath = toRepoPath(src);
    if (!repoPath.startsWith('assets/videos/')) return;

    video.dataset.videoDeliveryBound = 'true';
    video.dataset.localVideoPath = repoPath;
    video.preload = 'metadata';

    video.addEventListener('loadedmetadata', function() {
      video.dataset.videoLoaded = 'true';
      video.classList.remove('video-fallback-active');
    });

    video.addEventListener('canplay', function() {
      video.dataset.videoLoaded = 'true';
      video.classList.remove('video-fallback-active');
    });

    video.addEventListener('error', function() {
      retryWithRemoteVideo(video);
    });

    window.setTimeout(function() {
      if (video.readyState === 0 && video.dataset.videoLoaded !== 'true') {
        retryWithRemoteVideo(video);
      }
    }, VIDEO_LOAD_TIMEOUT);
  }

  function prepareAllVideos() {
    document.querySelectorAll('video').forEach(prepareVideo);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prepareAllVideos);
  } else {
    prepareAllVideos();
  }

  window.addEventListener('load', prepareAllVideos);
})();

// === GLOBAL HERO VIDEO AUTOPLAY ENFORCER ===
(function() {
  function forcePlayAllHeroVideos() {
    const heroVideos = document.querySelectorAll(
      '.contact-hero video, .about-hero video, .services-hero video, .leadership-hero video, .hero video, [class*="hero"] video, [class*="-hero"] video'
    );
    heroVideos.forEach(function(video) {
      const isManagedCarouselVideo =
        video.classList.contains('hero-cycle-video') ||
        video.classList.contains('contact-cycle-vid') ||
        video.closest('#heroVideoCarousel');
      const isActiveManagedVideo =
        video.classList.contains('active') ||
        video.classList.contains('active-video');
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = false;
      video.playsInline = true;
      video.preload = 'auto';
      video.removeAttribute('loop');
      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');
      if (isManagedCarouselVideo && !isActiveManagedVideo) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function() {
          // Retry on user interaction if autoplay blocked
          function retryHeroVideoPlay() {
            if (!isManagedCarouselVideo || video.classList.contains('active') || video.classList.contains('active-video')) {
              video.play().catch(function() {});
            }
          }

          document.addEventListener('click', retryHeroVideoPlay, { once: true });
          document.addEventListener('touchstart', retryHeroVideoPlay, { once: true });
          document.addEventListener('scroll', retryHeroVideoPlay, { once: true });
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forcePlayAllHeroVideos);
  } else {
    forcePlayAllHeroVideos();
  }

  // Also try again after full page load (images, scripts done)
  window.addEventListener('load', forcePlayAllHeroVideos);
})();

// Main JavaScript for Consultant Website

function addSwipeNavigation(element, handlers = {}, options = {}) {
    if (!element || element.dataset.swipeNavigationBound === 'true') return;

    element.dataset.swipeNavigationBound = 'true';
    element.classList.add('swipe-navigation');
    const threshold = options.threshold || 45;
    const restraint = options.restraint || 90;
    const resumeDelay = options.resumeDelay || 1400;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let resumeTimer = null;

    function pause() {
        if (resumeTimer) clearTimeout(resumeTimer);
        if (typeof handlers.pause === 'function') handlers.pause();
    }

    function resume() {
        if (typeof handlers.resume !== 'function') return;
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
            handlers.resume();
        }, resumeDelay);
    }

    function finishDrag() {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('is-dragging');

        const deltaX = currentX - startX;
        const deltaY = Math.abs(currentY - startY);

        if (Math.abs(deltaX) >= threshold && deltaY <= restraint) {
            if (deltaX < 0 && typeof handlers.next === 'function') {
                handlers.next();
            } else if (deltaX > 0 && typeof handlers.prev === 'function') {
                handlers.prev();
            }
        }

        resume();
    }

    element.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        currentX = event.clientX;
        currentY = event.clientY;
        element.classList.add('is-dragging');
        pause();

        if (typeof element.setPointerCapture === 'function') {
            element.setPointerCapture(event.pointerId);
        }
    });

    element.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        currentX = event.clientX;
        currentY = event.clientY;
    });

    element.addEventListener('pointerup', finishDrag);
    element.addEventListener('pointercancel', () => {
        isDragging = false;
        element.classList.remove('is-dragging');
        resume();
    });
}

document.addEventListener('DOMContentLoaded', function() {

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmit(this);
        });
    }

    // Newsletter Form Handling
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleNewsletterSubmit(this);
        });
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const title = item.querySelector('h3');
        if (title) {
            title.addEventListener('click', function() {
                this.classList.toggle('active');
                const answer = this.nextElementSibling;
                if (answer) {
                    answer.style.display = answer.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
    });

    // CEO Bio Rotation
    const ceoBioContainer = document.querySelector('.ceo-bio-container');
    if (ceoBioContainer) {
        // Array of 4 bio snippets
        const bioSnippets = [
            "Economist & CEO with expertise in financial systems and international trade dynamics.",
            "Specialist in investment analysis and cross-border trade facilitation.",
            "Connecting African resources and businesses to international markets.",
            "Building a trusted global brand in African business consultancy."
        ];

        let currentBioIndex = 0;
        const bioElement = ceoBioContainer.querySelector('.ceo-bio');

        function rotateCeoBio() {
            if (!bioElement) return;

            // Fade out current text (0.5s transition)
            bioElement.style.opacity = '0';
            bioElement.style.transition = 'opacity 0.5s ease-in-out';

            // Wait 500ms, then swap text and fade back in
            setTimeout(() => {
                bioElement.textContent = bioSnippets[currentBioIndex];

                // Fade in new text (0.5s transition)
                bioElement.style.opacity = '1';
                bioElement.style.transition = 'opacity 0.5s ease-in-out';

                // Move to next bio for next cycle
                currentBioIndex = (currentBioIndex + 1) % bioSnippets.length;
            }, 500);
        }

        // Start rotation every 4 seconds
        if (!window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) {
            setInterval(rotateCeoBio, 4000);
        }
    }

    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer && !window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) {
        const slides = carouselContainer.querySelectorAll('.carousel-slide');
        const indicators = carouselContainer.querySelectorAll('.indicator');

        console.log('Carousel initialized with', slides.length, 'slides');

        // Force eager loading and log image sources
        slides.forEach((slide, index) => {
            const img = slide.querySelector('img');
            if (img) {
                img.loading = 'eager';
                console.log('Slide', index, 'image src:', img.src);
            }
        });

        // Define enter/exit animation directions for each slide
        const slideAnimations = [
            { enter: 'enterFromLeft', exit: 'exitToRight' },    // Slide 0
            { enter: 'enterFromRight', exit: 'exitToLeft' },    // Slide 1
            { enter: 'enterFromTop', exit: 'exitToBottom' },    // Slide 2
            { enter: 'enterFromBottom', exit: 'exitToTop' },    // Slide 3
            { enter: 'enterFromLeft', exit: 'exitToRight' }     // Slide 4
        ];

        let currentSlide = 0;
        let isAnimating = false;

        function updateIndicators(index) {
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        }

        function transitionToSlide(newIndex) {
            if (isAnimating) return;
            isAnimating = true;

            const currentElement = slides[currentSlide];
            const nextElement = slides[newIndex];
            const currentAnimations = slideAnimations[currentSlide];
            const nextAnimations = slideAnimations[newIndex];

            // Apply exit animation to current slide
            currentElement.classList.add(currentAnimations.exit);

            // Wait for exit animation to complete (700ms)
            setTimeout(() => {
                // Hide current slide and remove animation classes
                currentElement.classList.remove('active', currentAnimations.exit);

                // Show next slide and apply enter animation
                nextElement.classList.add('active', nextAnimations.enter);

                // Update indicators
                updateIndicators(newIndex);

                // Update current slide index
                currentSlide = newIndex;

                // Remove enter animation after it completes so next transition is clean
                setTimeout(() => {
                    nextElement.classList.remove(nextAnimations.enter);
                    isAnimating = false;
                }, 700);
            }, 700);
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            transitionToSlide(nextIndex);
        }

        function prevSlide() {
            const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
            transitionToSlide(prevIndex);
        }

        let carouselInterval = null;

        function startCarouselAutoplay() {
            if (carouselInterval) clearInterval(carouselInterval);
            carouselInterval = setInterval(nextSlide, 3500);
        }

        function stopCarouselAutoplay() {
            if (carouselInterval) clearInterval(carouselInterval);
            carouselInterval = null;
        }

        // Initialize first slide with active class
        slides[0].classList.add('active');
        updateIndicators(0);

        // Auto-play carousel every 3.5 seconds
        startCarouselAutoplay();

        // Allow clicking on indicators to navigate
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (currentSlide !== index && !isAnimating) {
                    stopCarouselAutoplay();
                    transitionToSlide(index);
                    startCarouselAutoplay();
                }
            });
        });

        addSwipeNavigation(carouselContainer, {
            next: () => {
                stopCarouselAutoplay();
                nextSlide();
            },
            prev: () => {
                stopCarouselAutoplay();
                prevSlide();
            },
            pause: stopCarouselAutoplay,
            resume: startCarouselAutoplay
        });
    }

    // Active navigation link
    highlightActiveNavLink();

    // Load More Articles Button
    const loadMoreBtn = document.querySelector('.pagination button');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            loadMoreArticles();
        });
    }

    // Force video play on mobile scroll into view
    const allHeroVideos = document.querySelectorAll('[class*="hero"] video, .hero-cycle-video');
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const vid = entry.target;
            const isManagedCarouselVideo =
              vid.classList.contains('hero-cycle-video') ||
              vid.classList.contains('contact-cycle-vid') ||
              vid.closest('#heroVideoCarousel');
            const isActiveManagedVideo =
              vid.classList.contains('active') ||
              vid.classList.contains('active-video');

            if (isManagedCarouselVideo && !isActiveManagedVideo) return;
            vid.muted = true;
            vid.play().catch(function(){});
          }
        });
      }, { threshold: 0.3 });

      allHeroVideos.forEach(function(video) {
        videoObserver.observe(video);
      });
    }
});

// Handle Contact Form Submission
function handleContactFormSubmit(form) {
    const formData = new FormData(form);

    // Here you would typically send the data to your backend
    // For now, we'll just show a success message
    console.log('Form submitted with data:', Object.fromEntries(formData));

    // Show success message
    showNotification('Thank you! We received your message. We will get back to you soon.', 'success');

    // Reset form
    form.reset();
}

// Handle Newsletter Submission
function handleNewsletterSubmit(form) {
    const email = form.querySelector('input[type="email"]').value;

    // Validate email
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    // Here you would typically send the email to your backend/newsletter service
    console.log('Newsletter signup:', email);

    // Show success message
    showNotification('Thank you for subscribing!', 'success');

    // Reset form
    form.reset();
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease-in-out;
    `;

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Validate Email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Highlight Active Navigation Link
function highlightActiveNavLink() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage ||
            (currentPage.endsWith('/') && href === '/') ||
            (currentPage.includes(href) && href !== '/')) {
            link.classList.add('active');
        }
    });
}

// Load More Articles
function loadMoreArticles() {
    // This would typically fetch more articles from your backend
    console.log('Loading more articles...');
    showNotification('Loading more articles...', 'info');
}

// Scroll to Top Button
window.addEventListener('scroll', function() {
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (window.scrollY > 300) {
        if (!scrollBtn) {
            createScrollToTopButton();
        }
    } else if (scrollBtn) {
        scrollBtn.remove();
    }
});

function createScrollToTopButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scroll-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 999;
        font-size: 20px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        min-width: 60px;
        min-height: 60px;
        max-width: 60px;
        max-height: 60px;
        background-color: #f0a500;
        color: #04175e;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 9999;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: all 0.3s ease;
        box-shadow: 0 10px 24px rgba(0,0,0,0.2);
        animation: floatButton 3s ease infinite;
    `;

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    btn.addEventListener('mouseover', () => {
        btn.style.backgroundColor = '#d4920a';
    });

    btn.addEventListener('mouseout', () => {
        btn.style.backgroundColor = '#f0a500';
    });

    document.body.appendChild(btn);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes floatButton {
        0% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-5px);
        }
        100% {
            transform: translateY(0);
        }
    }

    .scroll-to-top:hover {
        animation-play-state: paused;
        transform: scale(1.1);
        box-shadow: 0 12px 30px rgba(0,0,0,.25);
    }
`;
document.head.appendChild(style);

// === TERMS HERO IMAGE CAROUSEL ===
(function() {
  if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
  const termsHero = document.querySelector('.terms-hero');
  if (termsHero) {
    const slides = termsHero.querySelectorAll('.terms-image');
    const dots = termsHero.querySelectorAll('.terms-dot');
    const transitions = ['slide', 'flip', 'zoom', 'slideUp'];
    let current = 0;

    function showTermsSlide(next) {
      const prev = current;
      current = next;
      const type = transitions[prev % transitions.length];

      slides[prev].style.zIndex = '1';
      slides[current].style.zIndex = '2';

      if (type === 'slide') {
        slides[current].style.transform = 'translateX(100%)';
        slides[current].style.opacity = '1';
        setTimeout(() => {
          slides[current].style.transition = 'transform 0.8s ease';
          slides[current].style.transform = 'translateX(0)';
          slides[prev].style.transition = 'transform 0.8s ease';
          slides[prev].style.transform = 'translateX(-100%)';
        }, 20);
      } else if (type === 'flip') {
        slides[current].style.transform = 'rotateY(-15deg)';
        slides[current].style.opacity = '0';
        setTimeout(() => {
          slides[current].style.transition = 'all 0.8s ease';
          slides[current].style.transform = 'rotateY(0)';
          slides[current].style.opacity = '1';
          slides[prev].style.transition = 'all 0.8s ease';
          slides[prev].style.opacity = '0';
        }, 20);
      } else if (type === 'zoom') {
        slides[current].style.transform = 'scale(1.15)';
        slides[current].style.opacity = '0';
        setTimeout(() => {
          slides[current].style.transition = 'all 0.8s ease';
          slides[current].style.transform = 'scale(1)';
          slides[current].style.opacity = '1';
          slides[prev].style.transition = 'opacity 0.8s ease';
          slides[prev].style.opacity = '0';
        }, 20);
      } else {
        slides[current].style.transform = 'translateY(100%)';
        slides[current].style.opacity = '1';
        setTimeout(() => {
          slides[current].style.transition = 'transform 0.8s ease';
          slides[current].style.transform = 'translateY(0)';
          slides[prev].style.transition = 'transform 0.8s ease';
          slides[prev].style.transform = 'translateY(-100%)';
        }, 20);
      }

      dots.forEach((d, i) => d.classList.toggle('active', i === current));

      setTimeout(() => {
        slides.forEach((s, i) => {
          if (i !== current) {
            s.style.transition = 'none';
            s.style.transform = 'translateX(0)';
            s.style.opacity = '0';
            s.style.zIndex = '1';
          }
        });
      }, 900);
    }

    slides[0].style.opacity = '1';
    slides[0].style.zIndex = '2';
    if (dots.length) dots[0].classList.add('active');

    setInterval(() => {
      showTermsSlide((current + 1) % slides.length);
    }, 3000);
  }
})();

// === PRIVACY HERO IMAGE CAROUSEL ===
(function() {
  if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
  const privacyHero = document.querySelector('.privacy-hero');
  if (privacyHero) {
    const slides = privacyHero.querySelectorAll('.privacy-image');
    const dots = privacyHero.querySelectorAll('.privacy-dot');
    const transitions = ['zoom', 'slide', 'flip', 'slideUp'];
    let current = 0;

    function showPrivacySlide(next) {
      const prev = current;
      current = next;
      const type = transitions[prev % transitions.length];

      slides[prev].style.zIndex = '1';
      slides[current].style.zIndex = '2';

      if (type === 'slide') {
        slides[current].style.transform = 'translateX(100%)';
        slides[current].style.opacity = '1';
        setTimeout(() => {
          slides[current].style.transition = 'transform 0.8s ease';
          slides[current].style.transform = 'translateX(0)';
          slides[prev].style.transition = 'transform 0.8s ease';
          slides[prev].style.transform = 'translateX(-100%)';
        }, 20);
      } else if (type === 'flip') {
        slides[current].style.transform = 'rotateY(-15deg)';
        slides[current].style.opacity = '0';
        setTimeout(() => {
          slides[current].style.transition = 'all 0.8s ease';
          slides[current].style.transform = 'rotateY(0)';
          slides[current].style.opacity = '1';
          slides[prev].style.transition = 'all 0.8s ease';
          slides[prev].style.opacity = '0';
        }, 20);
      } else if (type === 'zoom') {
        slides[current].style.transform = 'scale(1.15)';
        slides[current].style.opacity = '0';
        setTimeout(() => {
          slides[current].style.transition = 'all 0.8s ease';
          slides[current].style.transform = 'scale(1)';
          slides[current].style.opacity = '1';
          slides[prev].style.transition = 'opacity 0.8s ease';
          slides[prev].style.opacity = '0';
        }, 20);
      } else {
        slides[current].style.transform = 'translateY(100%)';
        slides[current].style.opacity = '1';
        setTimeout(() => {
          slides[current].style.transition = 'transform 0.8s ease';
          slides[current].style.transform = 'translateY(0)';
          slides[prev].style.transition = 'transform 0.8s ease';
          slides[prev].style.transform = 'translateY(-100%)';
        }, 20);
      }

      dots.forEach((d, i) => d.classList.toggle('active', i === current));

      setTimeout(() => {
        slides.forEach((s, i) => {
          if (i !== current) {
            s.style.transition = 'none';
            s.style.transform = 'translateX(0)';
            s.style.opacity = '0';
            s.style.zIndex = '1';
          }
        });
      }, 900);
    }

    slides[0].style.opacity = '1';
    slides[0].style.zIndex = '2';
    if (dots.length) dots[0].classList.add('active');

    setInterval(() => {
      showPrivacySlide((current + 1) % slides.length);
    }, 3000);
  }
})();

// Initialize Testimonials Carousel (if you have multiple testimonials)
function initializeCarousels() {
    if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
    const carousels = document.querySelectorAll('[class*="carousel"]');
    carousels.forEach(carousel => {
        let currentSlide = 0;
        const slides = carousel.querySelectorAll('[class*="card"], [class*="item"]');

        if (slides.length > 1) {
            // Rotate slides every 5 seconds
            setInterval(() => {
                slides.forEach(slide => slide.style.display = 'none');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].style.display = 'block';
            }, 5000);
        }
    });
}

// Premium Business Areas Slider - Horizontal Carousel
(function initBusinessAreasSlider() {
  if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
  const track = document.getElementById('businessCardsTrack');
  const cards = Array.from(document.querySelectorAll('.business-card'));
  const prevBtn = document.getElementById('businessPrev');
  const nextBtn = document.getElementById('businessNext');

  if (!track || cards.length === 0) return;

  let currentIndex = 2; // Start with card-2 (Manufacturing) as featured
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 3000; // 3 seconds
  const TOTAL_CARDS = cards.length;
  const sliderViewport = track.parentElement;
  if (window.innerWidth <= 768) currentIndex = 0;

  // Update slider position and card states
  function updateSlider() {
    cards.forEach((card, index) => {
      card.classList.remove('active');
    });

    // Mark current active card
    if (cards[currentIndex]) {
      cards[currentIndex].classList.add('active');
    }

    const activeCard = cards[currentIndex];
    const maxOffset = Math.max(0, track.scrollWidth - sliderViewport.clientWidth);
    const centeredOffset = activeCard
      ? activeCard.offsetLeft - ((sliderViewport.clientWidth - activeCard.offsetWidth) / 2)
      : 0;
    const offset = Math.max(0, Math.min(centeredOffset, maxOffset));
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
  }

  // Move to next card
  function nextCard() {
    currentIndex = (currentIndex + 1) % TOTAL_CARDS;
    updateSlider();
    resetAutoplay();
  }

  // Move to previous card
  function prevCard() {
    currentIndex = (currentIndex - 1 + TOTAL_CARDS) % TOTAL_CARDS;
    updateSlider();
    resetAutoplay();
  }

  // Autoplay logic
  function startAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      nextCard();
    }, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', prevCard);
  if (nextBtn) nextBtn.addEventListener('click', nextCard);

  // Pause on hover
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  cards.forEach(card => {
    card.addEventListener('mouseenter', stopAutoplay);
    card.addEventListener('mouseleave', startAutoplay);
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && currentIndex > TOTAL_CARDS - 1) currentIndex = 0;
    updateSlider();
  });

  addSwipeNavigation(sliderViewport, {
    next: nextCard,
    prev: prevCard,
    pause: stopAutoplay,
    resume: startAutoplay
  });

  // Initialize
  updateSlider();
  startAutoplay();

  // Cleanup
  window.addEventListener('beforeunload', () => {
    stopAutoplay();
  });
})();

// About Hero - Flipping Image Carousel
(function initAboutHeroFlip() {
  if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
  const flipElement = document.getElementById('aboutHeroFlip');
  if (!flipElement) return;

  const images = [
    'assets/images/about-preview.jpg',
    'assets/images/about-preview2.jpg',
    'assets/images/about-preview4.jpg'
  ];

  let currentIndex = 0;
  const flipCardInner = flipElement.querySelector('.flip-card-inner');
  const imageElement = flipElement.querySelector('.flip-card-image');

  if (!flipCardInner || !imageElement) return;

  function flipToNextImage() {
    // Add flipOut animation
    flipCardInner.classList.add('flipOut');

    // Swap image after half flip (300ms)
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % images.length;
      imageElement.src = images[currentIndex];

      // Remove flipOut and add flipIn
      flipCardInner.classList.remove('flipOut');
      flipCardInner.classList.add('flipIn');
    }, 300);

    // Remove flipIn after animation completes
    setTimeout(() => {
      flipCardInner.classList.remove('flipIn');
    }, 600);
  }

  // Start the carousel - flip every 3 seconds
  setInterval(flipToNextImage, 3000);
})();

/* ===== CONTACT HERO - VIDEO & IMAGE CAROUSEL ===== */
(function initContactHero() {
  if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER && document.querySelector('.chm-slide')) return;
  if (!document.querySelector('.contact-hero')) return;

  // Video play/pause control
  const chmPlayBtn = document.getElementById('chmPlayBtn');
  const chmVideo = document.querySelector('.chm-video');

  if (chmPlayBtn && chmVideo) {
    chmPlayBtn.addEventListener('click', () => {
      if (chmVideo.paused) {
        chmVideo.play();
        chmPlayBtn.querySelector('.chm-play-icon').textContent = '⏸';
      } else {
        chmVideo.pause();
        chmPlayBtn.querySelector('.chm-play-icon').textContent = '▶';
      }
    });

    // Sync icon with video play/pause events
    chmVideo.addEventListener('play', () => {
      chmPlayBtn.querySelector('.chm-play-icon').textContent = '⏸';
    });
    chmVideo.addEventListener('pause', () => {
      chmPlayBtn.querySelector('.chm-play-icon').textContent = '▶';
    });
  }

  // Image carousel cycling
  const slides = document.querySelectorAll('.chm-slide');
  if (slides.length > 0) {
    const transitions = ['slide', 'zoom-in', 'slide-up', 'zoom-out'];
    let current = 0;

    // Initialize first slide
    slides[0].style.opacity = '1';
    slides[0].style.transform = 'translateX(0) scale(1)';
    slides[0].style.zIndex = '2';

    setInterval(() => {
      const prev = current;
      current = (current + 1) % slides.length;
      const type = transitions[prev % transitions.length];

      slides[prev].style.transition = 'all 0.7s ease';
      slides[current].style.zIndex = '2';
      slides[prev].style.zIndex = '1';

      if (type === 'slide') {
        // Slide from right
        slides[current].style.transform = 'translateX(100%)';
        slides[current].style.opacity = '1';
        setTimeout(() => {
          slides[current].style.transition = 'transform 0.7s ease';
          slides[current].style.transform = 'translateX(0)';
          slides[prev].style.transform = 'translateX(-100%)';
        }, 20);
      } else if (type === 'zoom-in') {
        // Zoom in
        slides[current].style.transform = 'scale(1.15)';
        slides[current].style.opacity = '0';
        setTimeout(() => {
          slides[current].style.transition = 'all 0.7s ease';
          slides[current].style.transform = 'scale(1)';
          slides[current].style.opacity = '1';
          slides[prev].style.opacity = '0';
        }, 20);
      } else if (type === 'slide-up') {
        // Slide up
        slides[current].style.transform = 'translateY(100%)';
        slides[current].style.opacity = '1';
        setTimeout(() => {
          slides[current].style.transition = 'transform 0.7s ease';
          slides[current].style.transform = 'translateY(0)';
          slides[prev].style.transform = 'translateY(-100%)';
        }, 20);
      } else if (type === 'zoom-out') {
        // Zoom out
        slides[current].style.transform = 'scale(0.88)';
        slides[current].style.opacity = '0';
        setTimeout(() => {
          slides[current].style.transition = 'all 0.7s ease';
          slides[current].style.transform = 'scale(1)';
          slides[current].style.opacity = '1';
          slides[prev].style.opacity = '0';
        }, 20);
      }
    }, 2500);
  }
})();

/* ===== CONSULTATION FORM - FORMSPREE INTEGRATION ===== */
(function initConsultationForm() {
  const consultForm = document.getElementById('consultationForm');
  if (consultForm) {
    consultForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const btnText = document.getElementById('btnText');
      const btnSpinner = document.getElementById('btnSpinner');
      const submitBtn = document.getElementById('contactSubmitBtn');

      // Show loading state
      btnText.style.display = 'none';
      btnSpinner.style.display = 'inline';
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.75';

      const formData = new FormData(consultForm);

      // Validate phone number before submission
      const phoneInput = document.getElementById('phoneNumber');
      const fullPhoneInput = document.getElementById('fullPhoneNumber');

      if (phoneInput && phoneInput.value) {
        if (phoneInput.classList.contains('error')) {
          alert('Please enter a valid phone number for the selected country');
          btnText.style.display = 'inline';
          btnSpinner.style.display = 'none';
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          return;
        }

        // Use the combined phone number (country code + phone)
        if (fullPhoneInput) {
          formData.set('Phone Number', fullPhoneInput.value);
        console.log(`📞 Phone submitted: ${fullPhoneInput.value}`);
      }

      }

      try {
        const response = await fetch('https://formspree.io/f/mrevbbyv', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Success — show popup
          if (typeof window.openSuccessModal === 'function') {
            window.openSuccessModal();
          } else {
            const popup = document.getElementById('successModal') || document.getElementById('enquiryPopup');
          if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log("✅ Success modal displayed");
          }
          }
          console.log('Success modal displayed');
          consultForm.reset();
          // Reset phone selector display
          const countryBtn = document.getElementById('countrySelectorBtn');
          if (countryBtn) {
            countryBtn.innerHTML = `
              <span class="country-flag">🇬🇭</span>
              <span class="country-info">
                <span class="country-name">Ghana</span>
                <span class="country-code">+233</span>
              </span>
              <span class="selector-arrow">▼</span>
            `;
          }
        } else {
          const data = await response.json();
          const errorMsg = data.errors
            ? data.errors.map(e => e.message).join(', ')
            : 'Submission failed. Please try again.';
          alert('Error: ' + errorMsg);
        }
      } catch (error) {
        alert('Network error. Please check your connection and try again, or email us directly at joelinvestmentltd@gmail.com');
        console.error('Form error:', error);
      } finally {
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
    });
  }
})();

/* ===== RELIABLE SUCCESS MODAL HANDLER ===== */
(function initReliableSuccessModal() {
  let globalModalEventsBound = false;

  function getSuccessModal() {
    return document.getElementById('successModal') || document.getElementById('enquiryPopup');
  }

  function getSuccessCloseButton() {
    return document.getElementById('closeSuccessModal') || document.getElementById('epbCloseBtn');
  }

  function isModalVisible(modal) {
    return modal && window.getComputedStyle(modal).display !== 'none';
  }

  function closeModal() {
    const modal = getSuccessModal();

    if (!modal) {
      console.error('Modal not found');
      return;
    }

    console.log('Modal closing...');

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = 'auto';

    console.log('Modal closed');
  }

  function bindSuccessModalEvents() {
    const closeBtn = getSuccessCloseButton();

    if (closeBtn && closeBtn.dataset.modalCloseBound !== 'true') {
      console.log('Close button found');
      closeBtn.dataset.modalCloseBound = 'true';
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('Close button clicked');
        closeModal();
      }, true);
    }

    if (globalModalEventsBound) {
      return;
    }

    document.addEventListener('keydown', function(e) {
      const modal = getSuccessModal();

      if (e.key === 'Escape' && isModalVisible(modal)) {
        closeModal();
      }
    });

    window.addEventListener('click', function(e) {
      const modal = getSuccessModal();

      if (e.target === modal) {
        closeModal();
      }
    });

    globalModalEventsBound = true;
  }

  function openSuccessModal() {
    const modal = getSuccessModal();

    if (!modal) {
      console.error('Modal not found');
      return;
    }

    bindSuccessModalEvents();

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const closeBtn = getSuccessCloseButton();
    if (closeBtn) {
      closeBtn.focus({ preventScroll: true });
    }
  }

  window.closeModal = closeModal;
  window.openSuccessModal = openSuccessModal;
  window.bindSuccessModalEvents = bindSuccessModalEvents;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSuccessModalEvents, { once: true });
  } else {
    bindSuccessModalEvents();
  }
})();

/* ===== LEGACY SUCCESS MODAL HANDLER ===== */
(function initSuccessModal() {
  if (typeof window.closeModal === 'function') {
    return;
  }

  const popup = document.getElementById('enquiryPopup');
  const closeBtn = document.getElementById('epbCloseBtn');
  const consultForm = document.getElementById('consultationForm');

  if (!popup || !closeBtn) {
    console.warn('Modal elements not found');
    return;
  }

  // Function to close modal and reset form
  function closeModal() {
    console.log('🔴 Close button clicked - closing modal');

    // Hide popup
    popup.style.display = 'none';
    console.log('Modal hidden');

    // Reset form fields
    if (consultForm) {
      consultForm.reset();
      console.log('Form reset complete');
    }

    // Restore scrolling
    document.body.style.overflow = '';
    console.log('Page scrolling restored');
  }

  // Close button click handler
  closeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button click event triggered');
    closeModal();
  });

  // Backdrop click handler (click outside modal)
  popup.addEventListener('click', function(e) {
    console.log('Modal overlay clicked, target:', e.target.className);
    if (e.target === this) {
      console.log('Backdrop click detected - closing modal');
      closeModal();
    }
  });

  // ESC key handler
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popup.style.display === 'flex') {
      console.log('ESC key pressed - closing modal');
      closeModal();
    }
  });

  // Disable scrolling when modal is shown
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (popup.style.display === 'flex') {
        document.body.style.overflow = 'hidden';
        console.log('Page scrolling disabled (modal open)');
      } else {
        document.body.style.overflow = '';
        console.log('Page scrolling enabled (modal closed)');
      }
    });
  });

  observer.observe(popup, { attributes: true, attributeFilter: ['style'] });

  console.log('✅ Success modal handler initialized');
})();

// Story Timeline - Scroll Animation
(function initStoryTimeline() {
  const timelineEntries = document.querySelectorAll('.timeline-entry');
  if (timelineEntries.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation by 150ms per entry
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 150);

        // Stop observing after animation triggers
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
  });

  timelineEntries.forEach(entry => {
    observer.observe(entry);
  });

  // Fallback: force visible after 500ms if observer never fired
  setTimeout(function() {
    document.querySelectorAll('.timeline-entry').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      el.style.visibility = 'visible';
      el.classList.add('visible');
    });
  }, 500);
})();

// Mission & Vision Cards - Scroll Animation
(function initMissionVisionCards() {
  const missionCard = document.querySelector('.mv-card-mission');
  const visionCard = document.querySelector('.mv-card-vision');

  if (!missionCard || !visionCard) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;

        // Stagger the animations
        if (card.classList.contains('mv-card-mission')) {
          setTimeout(() => {
            card.classList.add('visible');
            card.style.opacity = '1';
            card.style.visibility = 'visible';
          }, 0);
        } else if (card.classList.contains('mv-card-vision')) {
          setTimeout(() => {
            card.classList.add('visible');
            card.style.opacity = '1';
            card.style.visibility = 'visible';
          }, 150);
        }

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
  });

  observer.observe(missionCard);
  observer.observe(visionCard);

  // Fallback: force visible after 500ms if observer never fired
  setTimeout(function() {
    document.querySelectorAll('.mv-card, [class*="mv-card"]').forEach(function(card) {
      card.style.opacity = '1';
      card.style.transform = 'translateX(0)';
      card.style.visibility = 'visible';
      card.classList.add('visible');
    });
  }, 500);
})();

// Core Values - Premium Two-Column Auto-Sliding Carousel
(function initCoreValuesCarousel() {
  if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
  const imagePanel = document.querySelector('.cv-image-panel');
  const cardsPanel = document.querySelector('.cv-cards-panel');
  const imageSlides = document.querySelectorAll('.cv-image-slide');
  const overlayLabel = document.querySelector('.cv-overlay-label');
  const progressBar = document.querySelector('.cv-progress-bar');
  const cards = document.querySelectorAll('.cv-card');

  if (!imagePanel || !cardsPanel || imageSlides.length === 0 || cards.length === 0) return;

  const SLIDE_INTERVAL = 3500; // 3.5 seconds
  const valueNames = ['Integrity', 'Excellence', 'Innovation', 'Partnership', 'Sustainability'];

  let currentIndex = 0;
  let autoplayTimeout;
  let progressTimeout;

  function updateSlide(newIndex) {
    // Remove active class from current image
    imageSlides[currentIndex].classList.remove('active');
    imageSlides[currentIndex].classList.add(newIndex > currentIndex ? 'next' : 'prev');

    // Remove active class from current card
    cards[currentIndex].classList.remove('active');

    // Update index
    currentIndex = newIndex % imageSlides.length;

    // Add active class to new image
    imageSlides[currentIndex].classList.remove('prev', 'next');
    imageSlides[currentIndex].classList.add('active');

    // Add active class to new card
    cards[currentIndex].classList.add('active');

    // Update overlay label
    overlayLabel.textContent = valueNames[currentIndex];

    // Reset and restart progress bar
    progressBar.classList.remove('animating');
    clearTimeout(progressTimeout);
    progressTimeout = setTimeout(() => {
      progressBar.classList.add('animating');
    }, 10);

    // Reset autoplay
    clearTimeout(autoplayTimeout);
    startAutoplay();
  }

  function nextSlide() {
    updateSlide(currentIndex + 1);
  }

  function startAutoplay() {
    autoplayTimeout = setTimeout(nextSlide, SLIDE_INTERVAL);
  }

  function stopAutoplay() {
    clearTimeout(autoplayTimeout);
  }

  // Add click handlers to cards for manual selection
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      updateSlide(index);
    });
  });

  // Add hover pause/resume
  imagePanel.addEventListener('mouseenter', stopAutoplay);
  imagePanel.addEventListener('mouseleave', startAutoplay);
  cardsPanel.addEventListener('mouseenter', stopAutoplay);
  cardsPanel.addEventListener('mouseleave', startAutoplay);

  // Initial progress bar animation
  progressBar.classList.add('animating');

  // Start autoplay
  startAutoplay();
})();

// Management Team - Scroll Animations
(function initManagementTeamAnimations() {
  const cards = document.querySelectorAll('.mgmt-card');
  if (cards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const index = parseInt(card.getAttribute('data-index')) || 0;

        // Add visible class with stagger delay
        setTimeout(() => {
          card.classList.add('visible');
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          card.style.visibility = 'visible';
        }, index * 120);

        // Stop observing after animation triggers
        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 0px 0px'
  });

  cards.forEach((card) => {
    observer.observe(card);
  });

  // Fallback: force visible after 500ms if observer never fired
  setTimeout(function() {
    document.querySelectorAll('.mgmt-card').forEach(function(card) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.visibility = 'visible';
      card.classList.add('visible');
    });
  }, 500);
})();

// Orbit Carousel - DEPRECATED (kept for reference)
(function initOrbitCarousel() {
  const container = document.querySelector('.orbit-carousel-container');
  if (!container) return;

  // Old orbit carousel code - replaced by business areas slider
  // Kept for backward compatibility if needed
})();


// Call carousel initialization
initializeCarousels();

// Lazy Load Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
}

// Analytics Tracking (add your analytics code here)
function trackPageView() {
    // Example: Google Analytics
    // window.dataLayer = window.dataLayer || [];
    // function gtag(){dataLayer.push(arguments);}
    // gtag('js', new Date());
    // gtag('config', 'YOUR_GA_ID');
}

// Call tracking on page load
trackPageView();

// Scroll Reveal Animation for Why Choose Us Section
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe why-choose-us section
    const whyChooseSection = document.querySelector('.why-choose-us');
    if (whyChooseSection) {
        revealObserver.observe(whyChooseSection);
    }

    // Observe gallery items and cards for staggered reveal
    const valueCards = document.querySelectorAll('.premium-card');
    valueCards.forEach((card, index) => {
        card.style.setProperty('--reveal-delay', `${index * 0.1}s`);
        revealObserver.observe(card);
    });
}

// Image Carousel - Why Choose Us Section
(function initGalleryCarousel() {
    if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
    const whyChooseSection = document.querySelector('.why-choose-us');
    if (!whyChooseSection) return;

    const slides = whyChooseSection.querySelectorAll('.carousel-slide');
    const indicators = whyChooseSection.querySelectorAll('.carousel-indicators .indicator');
    const wrapper = whyChooseSection.querySelector('.carousel-wrapper');
    const cards = whyChooseSection.querySelectorAll('.premium-card');

    if (slides.length === 0 || !wrapper) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;

    // Map slide values to card indices
    const valueToCardIndex = {
        'integrity': 0,
        'excellence': 1,
        'innovation': 2,
        'partnership': 3,
        'sustainability': 4,
        'global_perspective': 5
    };

    function highlightCard(value) {
        // Remove highlight from all cards
        cards.forEach(card => card.classList.remove('highlighted'));

        // Find and highlight the card matching this value
        const cardIndex = valueToCardIndex[value];
        if (cardIndex !== undefined && cards[cardIndex]) {
            cards[cardIndex].classList.add('highlighted');
        }
    }

    function showSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        // Remove active class from all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Add active class to current slide
        slides[index].classList.add('active');

        // Get the slide value and highlight corresponding card
        const slideValue = slides[index].dataset.value;
        if (slideValue) {
            highlightCard(slideValue);
        }

        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });

        // Reset transition flag after animation
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    function goToSlide(index) {
        currentIndex = index;
        showSlide(currentIndex);
    }

    // Initialize first slide
    showSlide(0);

    // Auto-advance carousel every 4 seconds
    let carouselInterval = setInterval(nextSlide, 4000);

    function stopGalleryAutoplay() {
        clearInterval(carouselInterval);
    }

    function startGalleryAutoplay() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, 4000);
    }

    // Pause on hover
    wrapper.addEventListener('mouseenter', () => {
        stopGalleryAutoplay();
    });

    wrapper.addEventListener('mouseleave', () => {
        startGalleryAutoplay();
    });

    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopGalleryAutoplay();
            goToSlide(index);
            startGalleryAutoplay();
        });
    });

    addSwipeNavigation(wrapper, {
        next: () => {
            stopGalleryAutoplay();
            nextSlide();
        },
        prev: () => {
            stopGalleryAutoplay();
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            showSlide(currentIndex);
        },
        pause: stopGalleryAutoplay,
        resume: startGalleryAutoplay
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopGalleryAutoplay();
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            showSlide(currentIndex);
            startGalleryAutoplay();
        } else if (e.key === 'ArrowRight') {
            stopGalleryAutoplay();
            nextSlide();
            startGalleryAutoplay();
        }
    });
})();

// Premium Mission & Vision Sliders
(function initPremiumSliders() {
    if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
    // Initialize Mission Slider
    initPremiumSlider('.mission-slider', 4000);

    // Initialize Vision Slider
    initPremiumSlider('.vision-slider', 4000);

    function initPremiumSlider(sliderSelector, slideDuration) {
        const slider = document.querySelector(sliderSelector);
        if (!slider) return;

        const track = slider.querySelector('.slider-track');
        const slides = slider.querySelectorAll('.slide');

        if (slides.length === 0) return;

        let currentIndex = 0;
        const totalSlides = slides.length;

        function showSlide(index) {
            // Remove active class from all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Add active class to current slide
            slides[index].classList.add('active');
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            showSlide(currentIndex);
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            showSlide(currentIndex);
        }

        // Show first slide
        showSlide(0);

        // Auto-advance every 4 seconds
        let sliderInterval = setInterval(nextSlide, slideDuration);

        function stopSliderAutoplay() {
            clearInterval(sliderInterval);
        }

        function startSliderAutoplay() {
            clearInterval(sliderInterval);
            sliderInterval = setInterval(nextSlide, slideDuration);
        }

        // Pause on hover
        slider.addEventListener('mouseenter', () => {
            stopSliderAutoplay();
        });

        slider.addEventListener('mouseleave', () => {
            startSliderAutoplay();
        });

        addSwipeNavigation(slider.querySelector('.slider-container') || slider, {
            next: () => {
                stopSliderAutoplay();
                nextSlide();
            },
            prev: () => {
                stopSliderAutoplay();
                prevSlide();
            },
            pause: stopSliderAutoplay,
            resume: startSliderAutoplay
        });
    }
})();

// Core Values Image Slider
(function initCoreValuesSlider() {
    if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
    const valuesSlider = document.querySelector('.values-slider');
    if (!valuesSlider) return;

    const track = valuesSlider.querySelector('.slider-track');
    const slides = valuesSlider.querySelectorAll('.slider-slide');

    if (slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    }

    // Show first slide
    showSlide(0);

    // Auto-advance every 4 seconds
    let sliderInterval = setInterval(nextSlide, 4000);

    function stopValuesAutoplay() {
        clearInterval(sliderInterval);
    }

    function startValuesAutoplay() {
        clearInterval(sliderInterval);
        sliderInterval = setInterval(nextSlide, 4000);
    }

    // Pause on hover
    valuesSlider.addEventListener('mouseenter', () => {
        stopValuesAutoplay();
    });

    valuesSlider.addEventListener('mouseleave', () => {
        startValuesAutoplay();
    });

    addSwipeNavigation(valuesSlider.querySelector('.slider-container') || valuesSlider, {
        next: () => {
            stopValuesAutoplay();
            nextSlide();
        },
        prev: () => {
            stopValuesAutoplay();
            prevSlide();
        },
        pause: stopValuesAutoplay,
        resume: startValuesAutoplay
    });
})();

// Initialize Industries Interactive Section
(function initIndustriesSection() {
    const featuredImage = document.getElementById('industry-featured-image');
    const industryCards = document.querySelectorAll('.industry-card');

    if (!featuredImage || industryCards.length === 0) return;

    // Change featured image with fade animation
    function changeImage(card) {
        const imageUrl = card.dataset.image;

        // Update active state on all cards
        industryCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Fade out current image
        featuredImage.style.opacity = '0';

        setTimeout(() => {
            featuredImage.src = imageUrl;
            featuredImage.style.transition = 'none';

            // Trigger reflow to reset transition
            void featuredImage.offsetWidth;

            // Fade in new image
            featuredImage.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            featuredImage.style.opacity = '1';
        }, 300);
    }

    // Add hover listeners to cards
    industryCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            changeImage(card);
        });
    });

    // Set first card as active on load
    if (industryCards.length > 0) {
        industryCards[0].classList.add('active');
    }
})();

// Initialize About Hero Image Carousel
(function initAboutHeroCarousel() {
    if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
    const aboutHeroSection = document.getElementById('aboutHeroSection');
    if (!aboutHeroSection) return;

    const images = aboutHeroSection.querySelectorAll('.about-hero-image');
    const dots = aboutHeroSection.querySelectorAll('.about-hero-dot');

    if (images.length === 0) return;

    // Transition types cycling array
    const transitionTypes = ['slide-right', 'zoom-in', 'slide-up', 'flip', 'zoom-out'];

    let currentIndex = 0;
    let transitionIndex = 0;
    let isTransitioning = false;

    // Map transition types to CSS class names
    const transitionClassMap = {
        'slide-right': { exit: 'slide-exit-left', enter: 'slide-enter-right' },
        'zoom-in': { exit: 'zoom-exit', enter: 'zoom-enter' },
        'slide-up': { exit: 'slideup-exit', enter: 'slideup-enter' },
        'flip': { exit: 'flip-exit', enter: 'flip-enter' },
        'zoom-out': { exit: 'zoomout-exit', enter: 'zoomout-enter' }
    };

    function updateDots(index) {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function cycleImages() {
        if (isTransitioning) return;
        isTransitioning = true;

        const currentImage = images[currentIndex];
        const nextIndex = (currentIndex + 1) % images.length;
        const nextImage = images[nextIndex];

        // Get transition type for this cycle
        const transType = transitionTypes[transitionIndex];
        const classes = transitionClassMap[transType];

        // Apply exit animation to current image
        currentImage.classList.remove('active');
        currentImage.classList.add(classes.exit);

        // Apply enter animation to next image
        nextImage.classList.add(classes.enter);

        // After animation completes, cleanup and prepare for next cycle
        setTimeout(() => {
            // Remove all animation classes
            currentImage.classList.remove(classes.exit);
            nextImage.classList.remove(classes.enter);

            // Mark new image as active
            nextImage.classList.add('active');

            // Update indices
            currentIndex = nextIndex;
            transitionIndex = (transitionIndex + 1) % transitionTypes.length;

            // Update dots
            updateDots(currentIndex);

            isTransitioning = false;
        }, 900);
    }

    // Initialize carousel
    updateDots(0);

    // Start auto-cycling every 3 seconds
    const carouselInterval = setInterval(cycleImages, 3000);

    // Allow manual dot clicks
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isTransitioning || index === currentIndex) return;

            clearInterval(carouselInterval);

            // Show image at clicked index
            images.forEach(img => img.classList.remove('active'));
            images[index].classList.add('active');
            currentIndex = index;
            updateDots(index);

            // Restart carousel
            setTimeout(() => {
                carouselInterval = setInterval(cycleImages, 3000);
            }, 1000);
        });
    });

    // Pause carousel on hover
    aboutHeroSection.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
    });

    aboutHeroSection.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(cycleImages, 3000);
    });
})();

/* ===========================================
   SERVICES HERO CAROUSEL
   =========================================== */

(function initServicesHero() {
    if (window.JOEL_USE_GLOBAL_ANIMATION_MANAGER) return;
    const servicesHeroSection = document.getElementById('servicesHeroSection');
    if (!servicesHeroSection) return;

    const images = servicesHeroSection.querySelectorAll('.services-hero-image');
    const dots = servicesHeroSection.querySelectorAll('.services-hero-dot');

    if (images.length === 0) return;

    const transitionTypes = ['slide-right', 'zoom-in', 'slide-up', 'flip', 'zoom-out'];
    let currentIndex = 0;
    let transitionIndex = 0;
    let carouselInterval;

    function cycleImages() {
        const currentImage = images[currentIndex];
        const nextIndex = (currentIndex + 1) % images.length;
        const nextImage = images[nextIndex];
        const transitionType = transitionTypes[transitionIndex];

        // Apply exit animation
        const exitClass = `${transitionType.split('-')[0]}-exit-${transitionType.split('-')[1] || 'left'}`;
        currentImage.classList.add(exitClass);

        // Apply enter animation
        const enterClass = `${transitionType.split('-')[0]}-enter-${transitionType.split('-')[1] || 'right'}`;
        nextImage.classList.add(enterClass);

        setTimeout(() => {
            currentImage.classList.remove('active', exitClass);
            nextImage.classList.remove(enterClass);
            nextImage.classList.add('active');

            // Update dots
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === nextIndex);
            });

            currentIndex = nextIndex;
            transitionIndex = (transitionIndex + 1) % transitionTypes.length;
        }, 900);
    }

    function showImageDirect(nextIndex) {
        images.forEach((image) => {
            image.classList.remove('active');
        });

        images[nextIndex].classList.add('active');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === nextIndex);
        });
        currentIndex = nextIndex;
        transitionIndex = (transitionIndex + 1) % transitionTypes.length;
    }

    function stopServicesHeroAutoplay() {
        clearInterval(carouselInterval);
    }

    function startServicesHeroAutoplay() {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(cycleImages, 3000);
    }

    // Add dot click handlers
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            stopServicesHeroAutoplay();
            showImageDirect(idx);
            startServicesHeroAutoplay();
        });
    });

    // Start auto-cycle after page load
    window.addEventListener('load', () => {
        startServicesHeroAutoplay();
    }, { once: true });

    // Pause carousel on hover
    servicesHeroSection.addEventListener('mouseenter', () => {
        stopServicesHeroAutoplay();
    });

    servicesHeroSection.addEventListener('mouseleave', () => {
        startServicesHeroAutoplay();
    });

    addSwipeNavigation(servicesHeroSection, {
        next: () => {
            stopServicesHeroAutoplay();
            cycleImages();
        },
        prev: () => {
            stopServicesHeroAutoplay();
            showImageDirect((currentIndex - 1 + images.length) % images.length);
        },
        pause: stopServicesHeroAutoplay,
        resume: startServicesHeroAutoplay
    });
})();

/* Services toggle code removed */

/* ===========================================
   SERVICES VIDEO PLAY/PAUSE LOGIC
   =========================================== */

(function initServicesVideoPlayer() {
    const playBtn = document.getElementById('svpPlayBtn');
    const video = document.getElementById('servicesPromoVideo');
    const videoPanel = document.getElementById('servicesVideoPanel');

    if (!playBtn || !video) return;

    // Play/pause button click
    playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (video.paused) {
            video.play();
            playBtn.classList.add('is-playing');
        } else {
            video.pause();
            playBtn.classList.remove('is-playing');
        }
    });

    // When video ends, remove playing state
    video.addEventListener('ended', () => {
        playBtn.classList.remove('is-playing');
    });

    // IntersectionObserver: Auto-pause when video panel is out of view
    if (videoPanel) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.intersectionRatio < 0.3) {
                    // Less than 30% visible, pause the video
                    if (!video.paused) {
                        video.pause();
                        playBtn.classList.remove('is-playing');
                    }
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(videoPanel);
    }
})();


// Export functions for external use
window.consultantWebsite = Object.assign(window.consultantWebsite || {}, {
    showNotification,
    isValidEmail,
    handleContactFormSubmit,
    handleNewsletterSubmit
});

/* ===== LEADERSHIP PROFILE EXPANDABLE SECTION ===== */
(function initLeadershipProfileToggle() {
  const profileBtn = document.querySelector('.leadership-profile-btn');
  const fullProfile = document.getElementById('fullLeadershipProfile');

  if (!profileBtn || !fullProfile) return;

  let isOpen = false;

  profileBtn.addEventListener('click', () => {
    isOpen = !isOpen;

    if (isOpen) {
      fullProfile.classList.add('is-open');
      profileBtn.textContent = 'Show Less ↑';
      profileBtn.classList.add('is-expanded');
      // Smooth scroll to reveal the content
      setTimeout(() => {
        fullProfile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } else {
      fullProfile.classList.remove('is-open');
      profileBtn.textContent = 'View Full Leadership Profile ↓';
      profileBtn.classList.remove('is-expanded');
      // Scroll back to button
      setTimeout(() => {
        profileBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  });
})();

/* Mobile nav handled by inline scripts in each HTML page */

// Services Grid — Collapsed & Expanded Layout Manager
(function() {
  function initServicesGrid() {
    if (window.JOEL_USE_INLINE_SERVICES_TOGGLE) return;
    var toggleBtn  = document.getElementById('servicesToggleBtn');
    var videoPanel = document.getElementById('servicesVideoPanel');
    var grid       = document.getElementById('servicesGrid');

    if (!toggleBtn || !videoPanel || !grid) return;

    var hiddenCards = Array.from(document.querySelectorAll('.service-card.svc-hidden'));
    var isExpanded  = false;

    // ── COLLAPSED: Row2 = [Card4 | VIDEO(span2)] ──
    function setCollapsedLayout() {
      hiddenCards.forEach(function(card) {
        card.style.display    = 'none';
        card.style.opacity    = '';
        card.style.transform  = '';
        card.style.transition = '';
      });
      videoPanel.classList.remove('svp-expanded');
      videoPanel.style.gridColumn = 'span 2';
      var c4 = grid.querySelector('[data-card-index="4"]');
      if (c4) grid.insertBefore(videoPanel, c4.nextSibling);
    }

    // ── EXPANDED: Row3 = [Card7 | Card8 | VIDEO(span1)] ──
    function setExpandedLayout() {
      hiddenCards.forEach(function(card, i) {
        card.style.display    = 'flex';
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(20px)';
        card.style.transition = 'none';
        setTimeout(function() {
          card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          card.style.opacity    = '1';
          card.style.transform  = 'translateY(0)';
        }, i * 100);
      });
      setTimeout(function() {
        videoPanel.classList.add('svp-expanded');
        videoPanel.style.gridColumn = 'span 1';
        var c8 = grid.querySelector('[data-card-index="8"]');
        if (c8) grid.insertBefore(videoPanel, c8.nextSibling);
      }, 50);
    }

    // Init
    setCollapsedLayout();

    // Toggle click
    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isExpanded = !isExpanded;

      var btnText  = toggleBtn.querySelector('.toggle-btn-text');
      var btnCount = toggleBtn.querySelector('.toggle-btn-count');
      var btnIcon  = toggleBtn.querySelector('.toggle-btn-icon');

      if (isExpanded) {
        setExpandedLayout();
        if (btnText)  btnText.textContent  = 'Show Less';
        if (btnCount) btnCount.textContent = '';
        if (btnIcon)  btnIcon.textContent  = '↑';
        toggleBtn.classList.add('is-expanded');
      } else {
        // Animate cards out
        hiddenCards.forEach(function(card, i) {
          setTimeout(function() {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity    = '0';
            card.style.transform  = 'translateY(20px)';
            setTimeout(function() { card.style.display = 'none'; }, 320);
          }, i * 60);
        });
        // After animation, reset layout
        setTimeout(function() {
          setCollapsedLayout();
          var section = grid.closest('section') || grid.parentElement;
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, hiddenCards.length * 60 + 380);

        if (btnText)  btnText.textContent  = 'View All Services';
        if (btnCount) btnCount.textContent = '(4 more)';
        if (btnIcon)  btnIcon.textContent  = '↓';
        toggleBtn.classList.remove('is-expanded');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicesGrid);
  } else {
    initServicesGrid();
  }
})();

(function() {
  function initServicesToggle() {
    if (window.JOEL_USE_INLINE_SERVICES_TOGGLE) return;
    var toggleBtn = document.getElementById('servicesToggleBtn');
    if (!toggleBtn) return;

    // Collect the 4 hidden cards by data-card-index
    var hiddenCards = Array.from(
      document.querySelectorAll('[data-card-index="5"],[data-card-index="6"],[data-card-index="7"],[data-card-index="8"]')
    );

    // Also catch anything with the hidden class that wasn't caught above
    document.querySelectorAll('.service-card--hidden').forEach(function(c) {
      if (!hiddenCards.includes(c)) hiddenCards.push(c);
    });

    // Force all hidden cards to truly be hidden on load
    // by removing any inline style and relying on the CSS class
    hiddenCards.forEach(function(card) {
      card.style.display = '';        // clear any inline display
      card.style.opacity = '';
      card.style.transform = '';
      card.style.transition = '';
      // Make sure the hiding class is present
      if (!card.classList.contains('service-card--hidden')) {
        card.classList.add('service-card--hidden');
      }
    });

    var isExpanded = false;

    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      isExpanded = !isExpanded;

      if (isExpanded) {
        // --- SHOW ---
        hiddenCards.forEach(function(card, i) {
          // Remove the CSS class so display:none no longer applies
          card.classList.remove('service-card--hidden');
          // Set starting state for animation
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          card.style.transition = 'none';
          // Animate in with stagger
          setTimeout(function() {
            card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 30 + i * 100);
        });

        // Update button
        var txt = toggleBtn.querySelector('.toggle-btn-text');
        var cnt = toggleBtn.querySelector('.toggle-btn-count');
        var ico = toggleBtn.querySelector('.toggle-btn-icon');
        if (txt) txt.textContent = 'Show Less';
        if (cnt) cnt.textContent = '';
        if (ico) ico.textContent = '↑';
        toggleBtn.classList.add('is-expanded');

      } else {
        // --- HIDE ---
        hiddenCards.forEach(function(card, i) {
          setTimeout(function() {
            card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            // After animation ends, re-add the class (restores display:none)
            setTimeout(function() {
              card.style.display = '';
              card.style.opacity = '';
              card.style.transform = '';
              card.style.transition = '';
              card.classList.add('service-card--hidden');
            }, 380);
          }, i * 60);
        });

        // Update button
        var txt2 = toggleBtn.querySelector('.toggle-btn-text');
        var cnt2 = toggleBtn.querySelector('.toggle-btn-count');
        var ico2 = toggleBtn.querySelector('.toggle-btn-icon');
        if (txt2) txt2.textContent = 'View All Services';
        if (cnt2) cnt2.textContent = '(4 more)';
        if (ico2) ico2.textContent = '↓';
        toggleBtn.classList.remove('is-expanded');

        // Scroll back up to the cards section
        setTimeout(function() {
          var section = document.getElementById('services-grid') ||
                        toggleBtn.closest('section');
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, hiddenCards.length * 60 + 420);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicesToggle);
  } else {
    initServicesToggle();
  }
})();

// === MISSION & VISION IMAGE LOADER ===
(function() {
  'use strict';

  function loadMissionVisionImages() {
    // Mission Image
    var missionImg = document.querySelector('.mission-img-container img, .mission-image img');
    if (missionImg) {
      missionImg.src = 'assets/images/mission.jpg';
      missionImg.style.display = 'block';
      missionImg.style.width = '100%';
      missionImg.style.height = '100%';
      missionImg.style.objectFit = 'cover';
      missionImg.style.minHeight = '320px';
      missionImg.loading = 'eager';
      missionImg.onerror = function() {
        this.onerror = null;
        this.src = 'assets/images/mission1.jpg';
      };
    }

    // Vision Image
    var visionImg = document.querySelector('.vision-img-container img, .vision-image img');
    if (visionImg) {
      visionImg.src = 'assets/images/vision.jpg';
      visionImg.style.display = 'block';
      visionImg.style.width = '100%';
      visionImg.style.height = '100%';
      visionImg.style.objectFit = 'cover';
      visionImg.style.minHeight = '320px';
      visionImg.loading = 'eager';
      visionImg.onerror = function() {
        this.onerror = null;
        this.src = 'assets/images/vision1.jpg';
      };
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMissionVisionImages);
  } else {
    loadMissionVisionImages();
  }

  // Also run on window load as safety
  window.addEventListener('load', loadMissionVisionImages);
})();
