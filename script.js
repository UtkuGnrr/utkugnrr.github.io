/* ==========================================================
   UgenX Technology · script.js (light)
   ========================================================== */

(function () {
  'use strict';

  /* 1. Sticky nav state */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 16) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 2. Fade reveal — IntersectionObserver, simple */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          // small staggered delay for siblings
          const siblings = Array.from(e.target.parentNode.children).filter(c => c.hasAttribute('data-reveal'));
          const idx = Math.max(0, siblings.indexOf(e.target));
          e.target.style.transitionDelay = (Math.min(idx, 5) * 0.06) + 's';
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* 3. Counter animation when stats come in */
  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* 4. Smooth anchor scroll */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (t) {
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
      }
    });
  });

  /* 5. Active nav state */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach((l) => {
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-30% 0px -50% 0px' });
    sections.forEach((s) => sio.observe(s));
  }

  /* 6. Mobile menu */
  const burger = document.getElementById('burger');
  let mobileMenu = null;
  const openMobileMenu = () => {
    if (!mobileMenu) {
      mobileMenu = document.createElement('div');
      mobileMenu.className = 'nav__menu-mobile';
      mobileMenu.innerHTML = `
        <a href="#hizmetler" data-tr="Hizmetler" data-en="Services">Hizmetler</a>
        <a href="#nasil" data-tr="Nasıl Çalışır" data-en="How It Works">Nasıl Çalışır</a>
        <a href="#sektorler" data-tr="Sektörler" data-en="Industries">Sektörler</a>
        <a href="#basari" data-tr="Başarılar" data-en="Results">Başarılar</a>
        <a href="#referanslar" data-tr="Referanslar" data-en="Cases">Referanslar</a>
        <a href="#iletisim" data-tr="İletişim" data-en="Contact">İletişim</a>
      `;
      // Eğer EN aktifse mobil menüyü de İngilizce yap
      const currentLang = document.documentElement.lang;
      mobileMenu.querySelectorAll('[data-tr][data-en]').forEach((el) => {
        const text = el.getAttribute('data-' + currentLang);
        if (text !== null) el.textContent = text;
      });
      document.body.appendChild(mobileMenu);
      mobileMenu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          const t = document.querySelector(id);
          if (t) {
            e.preventDefault();
            t.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMobileMenu();
          }
        });
      });
    }
    mobileMenu.classList.add('is-open');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('is-open');
    if (burger) {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }
  if (burger) {
    burger.addEventListener('click', () => {
      if (burger.classList.contains('is-open')) closeMobileMenu();
      else openMobileMenu();
    });
  }

  /* 7. Language switcher — gerçek TR/EN geçişi */
  const setLanguage = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-tr][data-en]').forEach((el) => {
      const text = el.getAttribute('data-' + lang);
      if (text !== null) {
        // title etiketinde innerText değil document.title kullan
        if (el.tagName === 'TITLE') {
          document.title = text;
        } else {
          el.textContent = text;
        }
      }
    });
    // Update lang button states
    document.querySelectorAll('.lang-btn').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.lang === lang);
    });
    // Persist preference
    try { localStorage.setItem('ugenx-lang', lang); } catch(e) {}
  };

  // Initialize from localStorage or browser
  let initialLang = 'tr';
  try {
    const saved = localStorage.getItem('ugenx-lang');
    if (saved === 'tr' || saved === 'en') {
      initialLang = saved;
    } else if (navigator.language && navigator.language.toLowerCase().startsWith('en')) {
      initialLang = 'en';
    }
  } catch(e) {}
  if (initialLang !== 'tr') setLanguage(initialLang);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });

})();