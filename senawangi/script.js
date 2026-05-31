/* ============================================================
   SENAWANGI — script.js
   High-grade rebuild of senawangi.id
   ============================================================ */

'use strict';

/* ── UTILITY: isMobile ───────────────────────────────────── */
const isMobile = () => window.matchMedia('(max-width: 768px)').matches
  || ('ontouchstart' in window);

/* ── UTILITY: lerp ───────────────────────────────────────── */
const lerp = (a, b, n) => a + (b - a) * n;

/* ============================================================
   1. PRELOADER
   ============================================================ */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const bar       = document.getElementById('preloaderBar');

  if (!preloader) return;

  document.body.classList.add('is-loading');

  // Fake progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18;
    if (progress >= 90) progress = 90;
    if (bar) bar.style.width = progress + '%';
  }, 120);

  window.addEventListener('load', () => {
    clearInterval(interval);
    if (bar) bar.style.width = '100%';

    setTimeout(() => {
      // GSAP timeline to animate preloader out
      if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({
          onComplete: () => {
            preloader.style.display = 'none';
            document.body.classList.remove('is-loading');
            initHeroAnimations();
          }
        });

        tl.to(preloader, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power3.inOut'
        });
      } else {
        preloader.style.display = 'none';
        document.body.classList.remove('is-loading');
        initHeroAnimations();
      }
    }, 400);
  });
})();


/* ============================================================
   2. LENIS SMOOTH SCROLL + GSAP INTEGRATION
   ============================================================ */
let lenis;

(function initLenis() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.5,
  });

  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
})();


/* ============================================================
   3. DUAL CURSOR
   ============================================================ */
(function initCursor() {
  if (isMobile()) return;

  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  const setDotX  = gsap.quickSetter(dot,  'x', 'px');
  const setDotY  = gsap.quickSetter(dot,  'y', 'px');
  const setRingX = gsap.quickSetter(ring, 'x', 'px');
  const setRingY = gsap.quickSetter(ring, 'y', 'px');

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setDotX(mouseX);
    setDotY(mouseY);
  });

  // Lerp ring in ticker
  gsap.ticker.add(() => {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    setRingX(ringX);
    setRingY(ringY);
  });

  // Hover state on interactive elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .magnetic, .galeri__item, .program__card, .berita__card'
  );

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hovered'));
  });
})();


/* ============================================================
   4. NAV — scroll state + burger menu
   ============================================================ */
(function initNav() {
  const nav    = document.getElementById('mainNav');
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');
  if (!nav) return;

  // Scroll state
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      start: 'top -80',
      onEnter: () => nav.classList.add('scrolled'),
      onLeaveBack: () => nav.classList.remove('scrolled'),
    });
  } else {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  // Burger
  if (burger && links) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('is-open');
      links.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('is-open');
        links.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }
})();


/* ============================================================
   5. CANVAS PARTICLES (hero background)
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT = 150;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    // Re-scatter on resize
    particles.forEach(p => {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
    });
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial) {
      this.x  = Math.random() * (W || 1200);
      this.y  = Math.random() * (H || 800);
      this.r  = Math.random() * 1.2 + 0.4;  // 0.4 – 1.6 px
      this.vx = (Math.random() - 0.5) * 0.28;
      this.vy = (Math.random() - 0.5) * 0.28;
      this.alpha = Math.random() * 0.55 + 0.15;
      this.life  = 0;
      this.maxLife = Math.random() * 400 + 300;
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.life += 1;
      if (this.life > this.maxLife) this.reset(false);
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }

    draw() {
      // Fade in / fade out
      const progress = this.life / this.maxLife;
      const fade = progress < 0.1
        ? progress / 0.1
        : progress > 0.85
          ? 1 - (progress - 0.85) / 0.15
          : 1;

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(191, 155, 69, ${this.alpha * fade})`;
      ctx.fill();
    }
  }

  // Init
  resize();
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  window.addEventListener('resize', resize, { passive: true });

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ============================================================
   6. HERO ANIMATIONS (triggered after preloader exit)
   ============================================================ */
function initHeroAnimations() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  // Eyebrow
  tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.8 }, 0);

  // H1 — SplitText char-by-char
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle && typeof SplitText !== 'undefined') {
    const split = new SplitText(heroTitle, { type: 'chars,words,lines' });
    gsap.set(split.chars, { opacity: 0, y: 80 });
    tl.to(split.chars, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.02,
      ease: 'power4.out',
    }, 0.2);
  } else if (heroTitle) {
    // Fallback without SplitText
    tl.from('.hero__line', {
      opacity: 0,
      y: 60,
      duration: 0.9,
      stagger: 0.15,
    }, 0.2);
  }

  // Subtitle + CTAs
  tl.to('.hero__subtitle', { opacity: 1, y: 0, duration: 0.7 }, 0.7);
  tl.to('.hero__ctas',     { opacity: 1, y: 0, duration: 0.7 }, 0.85);

  // Wayang SVG path draw
  initWayangPathDraw();

  // Scroll indicator
  tl.from('.hero__scroll', { opacity: 0, duration: 0.6 }, 1.2);
}


/* ============================================================
   7. WAYANG SVG PATH DRAW ANIMATION
   ============================================================ */
function initWayangPathDraw() {
  const paths = document.querySelectorAll('.w-path');
  if (!paths.length || typeof gsap === 'undefined') return;

  paths.forEach(el => {
    let length;
    try {
      length = el.getTotalLength ? el.getTotalLength() : 300;
    } catch(e) {
      length = 300;
    }

    el.style.strokeDasharray  = length;
    el.style.strokeDashoffset = length;
  });

  gsap.to(paths, {
    strokeDashoffset: 0,
    duration: 2.2,
    stagger: 0.025,
    ease: 'power2.inOut',
    delay: 0.3,
  });
}


/* ============================================================
   8. SCROLL TRIGGER REVEALS
   ============================================================ */
(function initReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Generic [data-reveal] items
  const revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      }
    });
  });
})();


/* ============================================================
   9. COUNTER ANIMATION
   ============================================================ */
(function initCounters() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const counters = document.querySelectorAll('[data-count]');

  counters.forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const obj    = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString('id-ID') + suffix;
          }
        });
      }
    });
  });
})();


/* ============================================================
   10. MAGNETIC EFFECT
   ============================================================ */
(function initMagnetic() {
  if (isMobile() || typeof gsap === 'undefined') return;

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width  / 2) * 0.35;
      const y = (e.clientY - rect.top  - rect.height / 2) * 0.35;
      gsap.to(el, { x, y, duration: 0.4, ease: 'power2.out' });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    });
  });
})();


/* ============================================================
   11. HERO PARALLAX
   ============================================================ */
(function initParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const wayangEl  = document.getElementById('heroWayang');
  const heroLeft  = document.querySelector('.hero__left');

  if (wayangEl) {
    gsap.to(wayangEl, {
      y: () => -window.innerHeight * 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }

  if (heroLeft) {
    gsap.to(heroLeft, {
      y: () => -window.innerHeight * 0.15,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }
})();


/* ============================================================
   12. GALERI — drag to scroll
   ============================================================ */
(function initGaleriScroll() {
  const track = document.querySelector('.galeri__scroll-wrap');
  if (!track) return;

  let isDown = false;
  let startX, scrollLeft;

  track.addEventListener('mousedown', e => {
    isDown = true;
    track.style.cursor = 'grabbing';
    startX     = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });
})();


/* ============================================================
   13. FORM SUBMIT
   ============================================================ */
(function initForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.querySelector('[name="name"]');
    const email   = form.querySelector('[name="email"]');
    const message = form.querySelector('[name="message"]');

    // Simple validation
    let valid = true;
    [name, email, message].forEach(field => {
      if (!field) return;
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!valid) return;

    // Simulate async send
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Mengirim...';
      submitBtn.disabled    = true;
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.style.display = 'none';
      }
      if (success) {
        success.classList.add('is-visible');
        if (typeof gsap !== 'undefined') {
          gsap.from(success, { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out' });
        }
      }
      form.reset();
    }, 900);
  });

  // Remove error state on input
  form.querySelectorAll('.form__input, .form__textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.style.borderColor = '';
    });
  });
})();


/* ============================================================
   14. PROGRAM CARDS — staggered reveal
   ============================================================ */
(function initProgramCards() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.program__card');
  if (!cards.length) return;

  gsap.from(cards, {
    opacity: 0,
    y: 50,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.program__grid',
      start: 'top 80%',
      once: true,
    }
  });
})();


/* ============================================================
   15. STATS SECTION — reveal row
   ============================================================ */
(function initStatsReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const grid = document.querySelector('.stats__grid');
  if (!grid) return;

  gsap.from('.stats__item', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: grid,
      start: 'top 82%',
      once: true,
    }
  });

  gsap.from('.stats__divider', {
    scaleY: 0,
    duration: 0.7,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: grid,
      start: 'top 82%',
      once: true,
    }
  });
})();


/* ============================================================
   16. BERITA CARDS — stagger
   ============================================================ */
(function initBeritaReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const cards = document.querySelectorAll('.berita__card');
  if (!cards.length) return;

  gsap.from(cards, {
    opacity: 0,
    x: 24,
    duration: 0.65,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.berita__side',
      start: 'top 82%',
      once: true,
    }
  });
})();


/* ============================================================
   17. TENTANG — image reveal
   ============================================================ */
(function initTentangReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const imgWrap = document.querySelector('.tentang__img-wrap');
  if (!imgWrap) return;

  gsap.from(imgWrap, {
    opacity: 0,
    x: -48,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: imgWrap,
      start: 'top 80%',
      once: true,
    }
  });

  const quote = document.querySelector('.tentang__quote');
  if (quote) {
    gsap.from(quote, {
      opacity: 0,
      y: 32,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.4,
      scrollTrigger: {
        trigger: imgWrap,
        start: 'top 80%',
        once: true,
      }
    });
  }
})();


/* ============================================================
   18. CTA BANNER — decorative silhouettes parallax
   ============================================================ */
(function initCtaBannerParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const banner = document.querySelector('.cta-banner');
  if (!banner) return;

  gsap.fromTo('.cta-banner__sil--left',
    { y: 40 },
    {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: banner,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    }
  );

  gsap.fromTo('.cta-banner__sil--right',
    { y: -40 },
    {
      y: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: banner,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    }
  );
})();


/* ============================================================
   19. ANCHOR SMOOTH SCROLL (via lenis)
   ============================================================ */
(function initAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { offset: -72, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ============================================================
   20. GALERI — parallax items on scroll
   ============================================================ */
(function initGaleriParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const galeri = document.querySelector('.galeri');
  if (!galeri) return;

  gsap.from('.galeri__item', {
    opacity: 0,
    y: 48,
    duration: 0.75,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: galeri,
      start: 'top 82%',
      once: true,
    }
  });
})();


/* ============================================================
   21. FOOTER — fade in links
   ============================================================ */
(function initFooterReveal() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const footer = document.querySelector('.footer');
  if (!footer) return;

  gsap.from('.footer__nav-col', {
    opacity: 0,
    y: 24,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: footer,
      start: 'top 90%',
      once: true,
    }
  });
})();


/* ============================================================
   22. WINDOW RESIZE — refresh ScrollTrigger
   ============================================================ */
(function initResizeHandler() {
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 250);
  }, { passive: true });
})();


/* ============================================================
   23. MARQUEE — pause on hover
   ============================================================ */
(function initMarqueePause() {
  const marquee = document.querySelector('.marquee');
  if (!marquee) return;

  const contents = marquee.querySelectorAll('.marquee__content');

  marquee.addEventListener('mouseenter', () => {
    contents.forEach(c => c.style.animationPlayState = 'paused');
  });

  marquee.addEventListener('mouseleave', () => {
    contents.forEach(c => c.style.animationPlayState = 'running');
  });
})();


/* ============================================================
   24. KEYBOARD ACCESSIBILITY — escape closes mobile nav
   ============================================================ */
(function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const burger = document.getElementById('navBurger');
      const links  = document.getElementById('navLinks');
      if (burger && burger.classList.contains('is-open')) {
        burger.classList.remove('is-open');
        links && links.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    }
  });
})();


/* ============================================================
   25. WAYANG SVG — subtle breathing animation after draw
   ============================================================ */
(function initWayangBreath() {
  if (typeof gsap === 'undefined') return;

  const wayang = document.querySelector('.wayang-svg');
  if (!wayang) return;

  // Start breathing after draw animation is done (~2.5s)
  setTimeout(() => {
    gsap.to(wayang, {
      scaleX: 1.01,
      scaleY: 1.015,
      transformOrigin: 'center bottom',
      duration: 3.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });
  }, 2800);
})();
