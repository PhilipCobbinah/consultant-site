// === GLOBAL HERO VIDEO AUTOPLAY ENFORCER ===
(function() {
  function forcePlayAllHeroVideos() {
    const heroVideos = document.querySelectorAll(
      '.contact-hero video, .about-hero video, .services-hero video, .leadership-hero video, .hero video, [class*="hero"] video, [class*="-hero"] video'
    );
    heroVideos.forEach(function(video) {
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'auto';
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function() {
          // Retry on user interaction if autoplay blocked
          document.addEventListener('click', function() { video.play(); }, { once: true });
          document.addEventListener('touchstart', function() { video.play(); }, { once: true });
          document.addEventListener('scroll', function() { video.play(); }, { once: true });
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

// === HERO VIDEO CYCLING (10 seconds per video) ===
(function() {
  function initHeroVideoCycle() {
    const cycleContainers = document.querySelectorAll('.hero-video-cycle');
    
    cycleContainers.forEach(function(container) {
      const videos = container.querySelectorAll('.hero-cycle-video');
      if (!videos.length) return;
      
      let currentIndex = 0;
      
      // Play first video immediately
      function playVideo(index) {
        videos.forEach(function(v, i) {
          v.classList.remove('active-video');
          if (i !== index) {
            v.pause();
            v.currentTime = 0;
          }
        });
        
        const current = videos[index];
        current.muted = true;
        current.currentTime = 0;
        current.classList.add('active-video');
        
        const playPromise = current.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {
            document.addEventListener('click', function() { current.play(); }, { once: true });
          });
        }
      }
      
      // Start first video
      playVideo(0);
      
      // Cycle every 10 seconds
      setInterval(function() {
        currentIndex = (currentIndex + 1) % videos.length;
        playVideo(currentIndex);
      }, 10000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroVideoCycle);
  } else {
    initHeroVideoCycle();
  }

  window.addEventListener('load', initHeroVideoCycle);
})();

// Main JavaScript for Consultant Website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('open');
            mobileMenuBtn.classList.toggle('active');
        });

        // Close menu when a nav link is clicked
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            const isClickInsideNav = e.target.closest('.navbar') || e.target.closest('.mobile-menu');
            if (!isClickInsideNav && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
            }
        });

        // Close menu on window resize (if resizing to desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.classList.remove('open');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }

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
        setInterval(rotateCeoBio, 4000);
    }

    // Hero Image + Video Carousel - Show image for 10s, then 3 videos for 10s each, then loop
    (function initHeroMediaCarousel() {
        const heroImage = document.getElementById('heroImageMain');
        const heroVideoCarousel = document.getElementById('heroVideoCarousel');
        const videos = heroVideoCarousel.querySelectorAll('.hero-video');
        const playPauseBtn = document.getElementById('heroVideoPausePlay');
        const progressBar = heroVideoCarousel.querySelector('.progress-fill');
        const currentTimeEl = heroVideoCarousel.querySelector('.current-time');
        
        if (!heroImage || !heroVideoCarousel || videos.length === 0) return;

        let isPlaying = true;
        let autoplayInterval;
        let globalTimer = 0; // 0-10: image, 10-20: video1, 20-30: video2, 30-40: video3, repeat
        const TOTAL_CYCLE = 40; // Total seconds before loop (10 image + 30 videos)
        const ITEM_DURATION = 10; // Each item plays for 10 seconds

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        function updateDisplay() {
            const cyclePosition = globalTimer % TOTAL_CYCLE;
            
            // Determine what should be shown
            if (cyclePosition < 10) {
                // Show image (0-10 seconds)
                heroImage.classList.remove('hidden');
                heroVideoCarousel.classList.remove('visible');
                progressBar.style.width = (cyclePosition / 10) * 100 + '%';
                currentTimeEl.textContent = formatTime(cyclePosition);
            } else {
                // Show videos (10-40 seconds)
                heroImage.classList.add('hidden');
                heroVideoCarousel.classList.add('visible');
                
                const videoPhase = Math.floor((cyclePosition - 10) / 10); // 0, 1, or 2
                const videoTime = (cyclePosition - 10) % 10; // 0-10 within this video
                
                // Show appropriate video
                videos.forEach((video, i) => {
                    video.classList.toggle('active', i === videoPhase);
                    if (i === videoPhase) {
                        video.currentTime = videoTime;
                        if (isPlaying) {
                            video.play().catch(err => console.log('Autoplay prevented:', err));
                        } else {
                            video.pause();
                        }
                    }
                });
                
                progressBar.style.width = (videoTime / 10) * 100 + '%';
                currentTimeEl.textContent = formatTime(videoTime);
            }
        }

        function togglePlayPause() {
            isPlaying = !isPlaying;
            const cyclePosition = globalTimer % TOTAL_CYCLE;
            
            if (isPlaying) {
                // Resume playing
                if (cyclePosition >= 10) {
                    const videoPhase = Math.floor((cyclePosition - 10) / 10);
                    videos[videoPhase].play().catch(err => console.log('Autoplay prevented:', err));
                }
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                startAutoplay();
            } else {
                // Pause
                videos.forEach(video => video.pause());
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                clearInterval(autoplayInterval);
            }
        }

        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                if (isPlaying) {
                    globalTimer++;
                    updateDisplay();
                }
            }, 1000);
        }

        // Event listeners
        playPauseBtn.addEventListener('click', togglePlayPause);

        // Progress bar click to seek (within current item)
        heroVideoCarousel.querySelector('.video-progress-bar').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const cyclePosition = globalTimer % TOTAL_CYCLE;
            
            if (cyclePosition >= 10) {
                const videoPhase = Math.floor((cyclePosition - 10) / 10);
                videos[videoPhase].currentTime = percent * ITEM_DURATION;
            }
        });

        // Initialize
        updateDisplay();
        startAutoplay();
    })();

    // Services Hero Video Carousel - 5 videos, 10 seconds each, auto-play on page load
    (function initServicesHeroVideoCarousel() {
        const videosContainer = document.getElementById('servicesHeroVideos');
        if (!videosContainer) return;

        const videos = videosContainer.querySelectorAll('.services-hero-video');
        const dots = document.querySelectorAll('.services-hero-dot');
        
        if (videos.length === 0 || dots.length === 0) return;

        let currentVideoIndex = 0;
        let autoplayInterval;
        let isPlaying = true;
        let videoTimer = 0;

        function updateDisplay() {
            videos.forEach((video, index) => {
                video.classList.toggle('active', index === currentVideoIndex);
            });

            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentVideoIndex);
            });

            const currentVideo = videos[currentVideoIndex];
            if (videoTimer === 0) {
                currentVideo.currentTime = 0;
                if (isPlaying) {
                    currentVideo.play().catch(err => console.log('Autoplay prevented:', err));
                }
            }
        }

        function nextVideo() {
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;
            videoTimer = 0;
            updateDisplay();
        }

        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                if (isPlaying) {
                    videoTimer++;
                    if (videoTimer >= 10) {
                        nextVideo();
                    }
                }
            }, 1000);
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentVideoIndex = index;
                videoTimer = 0;
                updateDisplay();
            });
        });

        updateDisplay();
        startAutoplay();
    })();

    (function initAboutHeroVideoCarousel() {
        const videosContainer = document.getElementById('aboutHeroVideos');
        if (!videosContainer) return;

        const videos = videosContainer.querySelectorAll('.about-hero-video');
        const dots = document.querySelectorAll('.about-hero-dot');
        
        if (videos.length === 0 || dots.length === 0) return;

        let currentVideoIndex = 0;
        let autoplayInterval;
        let isPlaying = true;
        let videoTimer = 0; // Track time within current video

        function updateDisplay() {
            // Hide all videos, show only current
            videos.forEach((video, index) => {
                video.classList.toggle('active', index === currentVideoIndex);
            });

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentVideoIndex);
            });

            // Reset video and play if we just switched
            const currentVideo = videos[currentVideoIndex];
            if (videoTimer === 0) {
                currentVideo.currentTime = 0;
                if (isPlaying) {
                    currentVideo.play().catch(err => console.log('Autoplay prevented:', err));
                }
            }
        }

        function nextVideo() {
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;
            videoTimer = 0;
            updateDisplay();
        }

        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                if (isPlaying) {
                    videoTimer++;
                    if (videoTimer >= 10) {
                        nextVideo();
                    }
                }
            }, 1000);
        }

        // Click on dots to jump to that video
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentVideoIndex = index;
                videoTimer = 0;
                updateDisplay();
            });
        });

        // Initialize
        updateDisplay();
        startAutoplay();
    })();

    (function initLeadershipHeroVideoCarousel() {
        const videosContainer = document.getElementById('leadershipHeroVideos');
        if (!videosContainer) return;

        const videos = videosContainer.querySelectorAll('.leadership-hero-video');
        const dots = document.querySelectorAll('.leadership-hero-dot');
        
        if (videos.length === 0) return;

        let currentVideoIndex = 0;
        let autoplayInterval;
        let isPlaying = true;
        let videoTimer = 0;

        function updateDisplay() {
            // Hide all videos, show only current
            videos.forEach((video, index) => {
                video.classList.toggle('active', index === currentVideoIndex);
            });

            // Update dots if they exist
            if (dots.length > 0) {
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentVideoIndex);
                });
            }

            // Reset video and play if we just switched
            const currentVideo = videos[currentVideoIndex];
            if (videoTimer === 0) {
                currentVideo.currentTime = 0;
                if (isPlaying) {
                    currentVideo.play().catch(err => console.log('Autoplay prevented:', err));
                }
            }
        }

        function nextVideo() {
            currentVideoIndex = (currentVideoIndex + 1) % videos.length;
            videoTimer = 0;
            updateDisplay();
        }

        function startAutoplay() {
            autoplayInterval = setInterval(() => {
                if (isPlaying) {
                    videoTimer++;
                    if (videoTimer >= 10) {
                        nextVideo();
                    }
                }
            }, 1000);
        }

        // Click on dots to jump to that video
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentVideoIndex = index;
                videoTimer = 0;
                updateDisplay();
            });
        });

        // Initialize
        updateDisplay();
        startAutoplay();
    })();

    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        const slides = carouselContainer.querySelectorAll('.carousel-slide');
        const indicators = carouselContainer.querySelectorAll('.indicator');
        
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

        // Initialize first slide with active class
        slides[0].classList.add('active');
        updateIndicators(0);

        // Auto-play carousel every 3.5 seconds
        setInterval(nextSlide, 3500);

        // Allow clicking on indicators to navigate
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (currentSlide !== index && !isAnimating) {
                    transitionToSlide(index);
                }
            });
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
    btn.className = 'scroll-to-top';
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
    
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    btn.addEventListener('mouseover', () => {
        btn.style.backgroundColor = 'var(--secondary-color)';
    });
    
    btn.addEventListener('mouseout', () => {
        btn.style.backgroundColor = 'var(--primary-color)';
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
    
    .scroll-to-top:hover {
        transform: translateY(-3px);
    }
`;
document.head.appendChild(style);

// === TERMS HERO IMAGE CAROUSEL ===
(function() {
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

// === CONTACT HERO VIDEO CYCLING ===
(function() {
  const contactVidCycle = document.querySelector('#contactVideoCycle');
  if (contactVidCycle) {
    const videos = contactVidCycle.querySelectorAll('.contact-cycle-vid');
    const dots = contactVidCycle.querySelectorAll('.ccv-dot');
    const counter = contactVidCycle.querySelector('#ccvCounter');
    const progressBar = contactVidCycle.querySelector('#ccvProgressBar');
    const controlBtn = contactVidCycle.querySelector('#ccvControlBtn');
    const ctrlIcon = contactVidCycle.querySelector('#ccvCtrlIcon');
    
    let current = 0;
    let isPlaying = true;
    let cycleInterval = null;
    let progressInterval = null;

    function updateCounter() {
      if (counter) counter.textContent = `${current + 1} / ${videos.length}`;
    }

    function showVideo(next) {
      const prev = current;
      current = next;
      
      videos[prev].style.opacity = '0';
      videos[prev].style.zIndex = '1';
      
      videos[current].style.opacity = '1';
      videos[current].style.zIndex = '2';
      
      // Attempt to play
      if (isPlaying) {
        videos[current].play().catch(() => {
          console.log('Autoplay prevented, waiting for user interaction');
        });
      }

      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      updateCounter();
      
      // Reset progress bar
      if (progressBar) {
        progressBar.style.animation = 'none';
        progressBar.offsetHeight; // Trigger reflow
        progressBar.style.animation = 'ccvProgressAnimation 10s linear forwards';
      }
    }

    // Pause all videos except current
    function pauseOtherVideos() {
      videos.forEach((v, i) => {
        if (i !== current) {
          v.pause();
        }
      });
    }

    // Control button toggle
    if (controlBtn) {
      controlBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        ctrlIcon.textContent = isPlaying ? '⏸' : '▶';
        if (isPlaying) {
          videos[current].play().catch(() => {});
          controlBtn.setAttribute('aria-label', 'Pause video');
        } else {
          videos[current].pause();
          controlBtn.setAttribute('aria-label', 'Play video');
        }
      });
    }

    // Dot click handlers
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showVideo(index);
      });
    });

    // Initialize first video
    videos[0].style.opacity = '1';
    videos[0].style.zIndex = '2';
    dots[0].classList.add('active');
    updateCounter();
    
    // Start progress animation
    if (progressBar) {
      progressBar.style.animation = 'ccvProgressAnimation 10s linear forwards';
    }

    // Cycle videos every 10 seconds
    cycleInterval = setInterval(() => {
      if (isPlaying) {
        showVideo((current + 1) % videos.length);
      }
    }, 10000);

    // Ensure all videos start with pause (will be controlled by our logic)
    videos.forEach(v => {
      v.pause();
      v.muted = true;
      v.playsInline = true;
    });
  }
})();

// Initialize Testimonials Carousel (if you have multiple testimonials)
function initializeCarousels() {
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
  const track = document.getElementById('businessCardsTrack');
  const cards = Array.from(document.querySelectorAll('.business-card'));
  const prevBtn = document.getElementById('businessPrev');
  const nextBtn = document.getElementById('businessNext');
  
  if (!track || cards.length === 0) return;
  
  let currentIndex = 2; // Start with card-2 (Manufacturing) as featured
  let autoplayTimer = null;
  const AUTOPLAY_INTERVAL = 3000; // 3 seconds
  const TOTAL_CARDS = cards.length;
  const CARD_WIDTH = 100 / 3; // 3 cards per view on desktop
  
  // Calculate translate amount based on viewport
  function getCardWidth() {
    const containerWidth = track.parentElement.offsetWidth;
    const gapCount = 2; // 2 gaps between 3 cards
    const gap = 30;
    const totalGap = gapCount * gap;
    return (containerWidth - totalGap) / 3;
  }
  
  // Update slider position and card states
  function updateSlider() {
    cards.forEach((card, index) => {
      card.classList.remove('active');
    });
    
    // Mark current active card
    if (cards[currentIndex]) {
      cards[currentIndex].classList.add('active');
    }
    
    // Calculate transform: show 3 cards with current in center
    // For infinite loop: show [prev, current, next] cards
    const offset = -((currentIndex - 1) * (CARD_WIDTH + 2.5)) + '%';
    track.style.transform = `translateX(${offset})`;
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
    updateSlider();
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
        
        // Optionally stop observing after animation triggers
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  timelineEntries.forEach(entry => {
    observer.observe(entry);
  });
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
            card.style.animation = 'slideInLeft 0.8s ease forwards';
          }, 0);
        } else if (card.classList.contains('mv-card-vision')) {
          setTimeout(() => {
            card.classList.add('visible');
            card.style.animation = 'slideInRight 0.8s ease forwards 0.15s';
          }, 0);
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  observer.observe(missionCard);
  observer.observe(visionCard);
})();

// Core Values - Premium Two-Column Auto-Sliding Carousel
(function initCoreValuesCarousel() {
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
        }, index * 120);
        
        // Stop observing after animation triggers
        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  cards.forEach((card) => {
    observer.observe(card);
  });
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
    
    // Pause on hover
    wrapper.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
    });
    
    wrapper.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(nextSlide, 4000);
    });
    
    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            clearInterval(carouselInterval);
            goToSlide(index);
            carouselInterval = setInterval(nextSlide, 4000);
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            clearInterval(carouselInterval);
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            showSlide(currentIndex);
            carouselInterval = setInterval(nextSlide, 4000);
        } else if (e.key === 'ArrowRight') {
            clearInterval(carouselInterval);
            nextSlide();
            carouselInterval = setInterval(nextSlide, 4000);
        }
    });
})();

// Premium Mission & Vision Sliders
(function initPremiumSliders() {
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
        
        // Show first slide
        showSlide(0);
        
        // Auto-advance every 4 seconds
        let sliderInterval = setInterval(nextSlide, slideDuration);
        
        // Pause on hover
        slider.addEventListener('mouseenter', () => {
            clearInterval(sliderInterval);
        });
        
        slider.addEventListener('mouseleave', () => {
            sliderInterval = setInterval(nextSlide, slideDuration);
        });
    }
})();

// Core Values Image Slider
(function initCoreValuesSlider() {
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
    
    // Show first slide
    showSlide(0);
    
    // Auto-advance every 4 seconds
    let sliderInterval = setInterval(nextSlide, 4000);
    
    // Pause on hover
    valuesSlider.addEventListener('mouseenter', () => {
        clearInterval(sliderInterval);
    });
    
    valuesSlider.addEventListener('mouseleave', () => {
        sliderInterval = setInterval(nextSlide, 4000);
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

    // Add dot click handlers
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            clearInterval(carouselInterval);
            currentIndex = (idx - 1 + images.length) % images.length;
            cycleImages();
            carouselInterval = setInterval(cycleImages, 3000);
        });
    });

    // Start auto-cycle after page load
    window.addEventListener('load', () => {
        carouselInterval = setInterval(cycleImages, 3000);
    }, { once: true });
    
    // Pause carousel on hover
    servicesHeroSection.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
    });
    
    servicesHeroSection.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(cycleImages, 3000);
    });
})();

/* ===========================================
   SERVICES CARDS TOGGLE BUTTON + VIDEO PANEL
   =========================================== */

(function initServicesToggle() {
    const toggleBtn = document.getElementById('servicesToggleBtn');
    if (!toggleBtn) return;

    const hiddenCards = document.querySelectorAll('.service-card--hidden');
    const videoPanel = document.getElementById('servicesVideoPanel');
    const servicesGrid = document.querySelector('[style*="grid-template-columns: repeat(3"]') || 
                          document.querySelector('.services-grid');
    let isExpanded = false;

    toggleBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;

        if (isExpanded) {
            // Show hidden cards one by one with stagger
            hiddenCards.forEach((card, i) => {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, i * 120);
            });
            toggleBtn.querySelector('.toggle-btn-text').textContent = 'Show Less';
            toggleBtn.querySelector('.toggle-btn-count').textContent = '';
            toggleBtn.classList.add('is-expanded');

            // Handle video panel: compact mode and reposition to end of grid
            if (videoPanel && servicesGrid) {
                videoPanel.classList.add('svp-compact');
                servicesGrid.appendChild(videoPanel);
            }
        } else {
            // Hide cards with animation
            hiddenCards.forEach((card, i) => {
                setTimeout(() => {
                    card.classList.remove('animate-in');
                    card.classList.add('service-card--hiding');
                    setTimeout(() => {
                        card.style.display = 'none';
                        card.classList.remove('service-card--hiding');
                    }, 400);
                }, i * 80);
            });
            toggleBtn.querySelector('.toggle-btn-text').textContent = 'View All Services';
            toggleBtn.querySelector('.toggle-btn-count').textContent = '(4 more)';
            toggleBtn.classList.remove('is-expanded');

            // Handle video panel: expand mode and move back after 4th card
            if (videoPanel && servicesGrid) {
                videoPanel.classList.remove('svp-compact');
                const fourthCard = document.querySelector('[data-card-index="4"]');
                if (fourthCard) {
                    fourthCard.insertAdjacentElement('afterend', videoPanel);
                }
            }

            // Scroll back up to the services section smoothly
            setTimeout(() => {
                document.querySelector('.services-toggle-wrapper').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, hiddenCards.length * 80 + 500);
        }
    });
})();

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
window.consultantWebsite = {
    showNotification,
    isValidEmail,
    handleContactFormSubmit,
    handleNewsletterSubmit
};

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
      }, 300);
    }
  });
})();
