/* ===========================================
   MOBILE RESPONSIVENESS JAVASCRIPT FIXES
   Handles mobile-specific behaviors
   =========================================== */

(function() {
  'use strict';

  // === PREVENT HORIZONTAL SCROLL ===
  function preventHorizontalScroll() {
    // Remove any elements causing overflow
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowX = 'hidden';

    // Find and fix any overflowing elements
    if (window.innerWidth <= 768) {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(function(el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth) {
          console.warn('Element causing overflow:', el);
          el.style.maxWidth = '100%';
          el.style.overflowX = 'hidden';
        }
      });
    }
  }

  // === FIX iOS INPUT ZOOM ===
  function preventIOSInputZoom() {
    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // Set minimum font size for inputs to prevent zoom
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(function(input) {
        const currentSize = window.getComputedStyle(input).fontSize;
        const size = parseFloat(currentSize);
        if (size < 16) {
          input.style.fontSize = '16px';
        }
      });
    }
  }

  // === FIX VIEWPORT HEIGHT ON MOBILE ===
  function setVHVariable() {
    // Fix for mobile browsers where 100vh includes address bar
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }

  // === OPTIMIZE IMAGES FOR MOBILE ===
  function optimizeImagesForMobile() {
    if (window.innerWidth <= 768) {
      const images = document.querySelectorAll('img');
      images.forEach(function(img) {
        // Force eager loading on mobile for better UX
        img.loading = 'eager';

        // Ensure images fit container
        if (!img.style.maxWidth) {
          img.style.maxWidth = '100%';
        }
        if (!img.style.height || img.style.height === 'auto') {
          img.style.height = 'auto';
        }
      });
    }
  }

  // === FIX CAROUSELS ON MOBILE ===
  function fixCarouselsOnMobile() {
    if (window.innerWidth <= 768) {
      const carousels = document.querySelectorAll('[class*="carousel"], [class*="slider"]');
      carousels.forEach(function(carousel) {
        carousel.style.width = '100%';
        carousel.style.maxWidth = '100%';
        carousel.style.overflowX = 'hidden';
      });
    }
  }

  // === ENABLE TOUCH SWIPE FOR CAROUSELS ===
  function enableTouchSwipe() {
    const carousels = document.querySelectorAll('.carousel-container, .business-slider-container');

    carousels.forEach(function(carousel) {
      let touchStartX = 0;
      let touchEndX = 0;

      carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(carousel);
      }, { passive: true });

      function handleSwipe(element) {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
          if (diff > 0) {
            // Swipe left - next
            const nextBtn = document.querySelector('.business-arrow-next, .carousel-next');
            if (nextBtn) nextBtn.click();
          } else {
            // Swipe right - prev
            const prevBtn = document.querySelector('.business-arrow-prev, .carousel-prev');
            if (prevBtn) prevBtn.click();
          }
        }
      }
    });
  }

  // === FIX VIDEO PLAYBACK ON MOBILE ===
  function fixVideosOnMobile() {
    const videos = document.querySelectorAll('video');
    videos.forEach(function(video) {
      const managedSequence =
        video.classList.contains('hero-cycle-video') ||
        video.classList.contains('contact-cycle-vid') ||
        video.closest('#heroVideoCarousel') ||
        video.closest('.hero-video-cycle') ||
        video.closest('.contact-video-cycle');

      // Ensure mobile-friendly attributes
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('autoplay', '');
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = false;
      video.removeAttribute('loop');

      if (managedSequence) {
        video.setAttribute('preload', 'auto');
        return;
      }

      // Force play on mobile when visible
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              video.play().catch(function() {
                // Autoplay blocked, that's OK
              });
            } else {
              video.pause();
            }
          });
        }, { threshold: 0.5 });

        observer.observe(video);
      }
    });
  }

  // === SMOOTH SCROLL BEHAVIOR ===
  function enableSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = target.offsetTop - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // === DETECT ORIENTATION CHANGE ===
  function handleOrientationChange() {
    window.addEventListener('orientationchange', function() {
      setTimeout(function() {
        setVHVariable();
        preventHorizontalScroll();
        fixCarouselsOnMobile();
      }, 100);
    });
  }

  // === OPTIMIZE PERFORMANCE ON LOW-END DEVICES ===
  function optimizeForLowEndDevices() {
    // Detect if device is low-end (less than 2GB RAM or slow CPU)
    const isLowEnd = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 2;

    if (isLowEnd && window.innerWidth <= 768) {
      console.log('Low-end device detected, optimizing...');

      // Reduce animations
      document.documentElement.style.setProperty('--animation-duration', '0.2s');

      // Disable parallax effects
      const parallaxElements = document.querySelectorAll('[data-parallax]');
      parallaxElements.forEach(function(el) {
        el.removeAttribute('data-parallax');
      });
    }
  }

  // === FIX STICKY HEADER ON MOBILE ===
  function fixStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;

      if (window.innerWidth <= 768) {
        if (currentScroll > lastScroll && currentScroll > 100) {
          // Scrolling down
          header.style.transform = 'translateY(-100%)';
        } else {
          // Scrolling up
          header.style.transform = 'translateY(0)';
        }
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // === INITIALIZE ALL FIXES ===
  function init() {
    console.log('Initializing mobile fixes...');

    // Run immediately
    preventHorizontalScroll();
    preventIOSInputZoom();
    setVHVariable();
    optimizeImagesForMobile();
    fixCarouselsOnMobile();
    fixVideosOnMobile();
    enableSmoothScroll();
    handleOrientationChange();
    optimizeForLowEndDevices();

    // Run after load
    window.addEventListener('load', function() {
      preventHorizontalScroll();
      fixCarouselsOnMobile();
      enableTouchSwipe();
    });

    // Run on resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        setVHVariable();
        preventHorizontalScroll();
        fixCarouselsOnMobile();
      }, 250);
    }, { passive: true });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also run on full page load
  window.addEventListener('load', init);
})();
