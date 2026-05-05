(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Header scroll state ---
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');

    const btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile nav toggle ---
  const nav = document.getElementById('primary-nav');
  const toggle = document.querySelector('.nav-toggle');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // --- Smooth scroll for in-page anchors ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (nav?.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // --- Back to top ---
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  // --- Hero slider ---
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    const prev = slider.querySelector('.hero-prev');
    const next = slider.querySelector('.hero-next');
    let index = slides.findIndex(s => s.classList.contains('is-active'));
    if (index < 0) index = 0;
    let timer;

    const go = (n) => {
      index = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        const active = i === index;
        s.classList.toggle('is-active', active);
        s.toggleAttribute('hidden', !active);
      });
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', String(i === index));
      });
    };
    const nextSlide = () => go(index + 1);
    const prevSlide = () => go(index - 1);

    const start = () => {
      if (reduceMotion) return;
      stop();
      timer = setInterval(nextSlide, 6500);
    };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };

    next?.addEventListener('click', () => { nextSlide(); start(); });
    prev?.addEventListener('click', () => { prevSlide(); start(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); start(); }));

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { nextSlide(); start(); }
      if (e.key === 'ArrowLeft') { prevSlide(); start(); }
    });

    let touchStart = 0;
    slider.addEventListener('touchstart', (e) => { touchStart = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStart;
      if (Math.abs(dx) > 60) { dx < 0 ? nextSlide() : prevSlide(); start(); }
    });

    start();
  }

  // --- Reveal-on-scroll animation ---
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  }

  // --- Count-up animation for stats ---
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1800;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(step);
  };
  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach(el => {
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = parseFloat(el.dataset.count).toFixed(decimals);
    });
  } else {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  // --- Footer year ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
