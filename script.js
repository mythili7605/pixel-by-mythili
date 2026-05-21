/* ==========================================================================
   PixelByMythili - Interactive Javascript Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Page Animations & Interactions
  initCustomCursor();
  initScrollReveal();
  initStatsCounter();
  initGalleryDragScroll();
  initEmailClipboard();
  initBackToTop();
});

/**
 * 1. Custom Cursor Lag Effect
 */
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const dot = document.querySelector('.custom-cursor-dot');
  
  // Disable custom cursor on mobile/touch devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice || !cursor || !dot) return;

  // Make cursor visible once mouse moves
  cursor.style.display = 'block';
  dot.style.display = 'block';

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let dotX = 0;
  let dotY = 0;

  // Track real mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth interpolation loop (lerp)
  function animateCursor() {
    // Lerp for the outer ring (slower lag)
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // Lerp for the inner dot (faster, almost instant)
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states expansion
  const interactiveElements = document.querySelectorAll('a, button, .btn, .social-icon, .gallery-btn, .gallery-item, .service-card, .testimonial-card');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering');
    });
  });
}

/**
 * 2. Scroll Reveal Observer
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, we don't need to observe it anymore
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' // Triggers slightly before entering view
  });

  revealElements.forEach((el) => revealObserver.observe(el));
}

/**
 * 3. Stats Counter Animation
 */
function initStatsCounter() {
  const statsSection = document.querySelector('.stats-bar');
  const statNumbers = document.querySelectorAll('.stat-num');
  if (!statsSection || statNumbers.length === 0) return;

  let animated = false;

  const countUp = () => {
    statNumbers.forEach((stat) => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const duration = 2000; // 2 seconds
      const startTime = performance.now();
      const prefix = stat.getAttribute('data-prefix') || '';
      const suffix = stat.getAttribute('data-suffix') || '';

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        let currentValue = easeProgress * target;

        // Formats float or integer nicely
        if (target % 1 !== 0) {
          stat.textContent = `${prefix}${currentValue.toFixed(1)}${suffix}`;
        } else {
          stat.textContent = `${prefix}${Math.floor(currentValue)}${suffix}`;
        }

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          // Ensure exact target is set at the end
          if (target % 1 !== 0) {
            stat.textContent = `${prefix}${target.toFixed(1)}${suffix}`;
          } else {
            stat.textContent = `${prefix}${target}${suffix}`;
          }
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !animated) {
        countUp();
        animated = true;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsSection);
}

/**
 * 4. Horizontal Gallery Drag & Swipe + Buttons
 */
function initGalleryDragScroll() {
  const container = document.querySelector('.gallery-container');
  const btnPrev = document.querySelector('.gallery-btn.prev');
  const btnNext = document.querySelector('.gallery-btn.next');
  if (!container) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  // Drag Events
  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.style.cursor = 'grabbing';
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener('mouseleave', () => {
    isDown = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mouseup', () => {
    isDown = false;
    container.style.cursor = 'grab';
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2.5; // Scroll speed multiplier
    container.scrollLeft = scrollLeft - walk;
  });

  // Scroll Buttons Click
  if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      container.scrollBy({ left: -440, behavior: 'smooth' });
    });
    btnNext.addEventListener('click', () => {
      container.scrollBy({ left: 440, behavior: 'smooth' });
    });
  }
}

/**
 * 5. Email Clipboard Copier
 */
function initEmailClipboard() {
  const emailBtn = document.getElementById('copy-email-btn');
  const tooltip = document.getElementById('copy-tooltip');
  if (!emailBtn || !tooltip) return;

  emailBtn.addEventListener('click', () => {
    const emailText = emailBtn.getAttribute('data-email');
    navigator.clipboard.writeText(emailText)
      .then(() => {
        tooltip.textContent = 'Copied to clipboard! 📋';
        tooltip.classList.add('show');
        
        setTimeout(() => {
          tooltip.classList.remove('show');
        }, 2000);
      })
      .catch((err) => {
        console.error('Clipboard copy failed: ', err);
        // Fallback if permission is denied
        tooltip.textContent = 'Press Ctrl+C to copy';
        tooltip.classList.add('show');
        setTimeout(() => {
          tooltip.classList.remove('show');
        }, 3000);
      });
  });
}

/**
 * 6. Back To Top
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  // Show/Hide button depending on scroll position
  window.addEventListener('scroll', () => {
    if (window.scrollY > 800) {
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.pointerEvents = 'all';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.pointerEvents = 'none';
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
