// NAV scroll behavior
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile burger menu
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  const open = navLinks.classList.contains('open');
  spans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)' : '';
  spans[1].style.opacity = open ? '0' : '';
  spans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity = '';
    });
  });
});

// Contact form
function handleSubmit(e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  success.style.display = 'block';
  e.target.reset();
  setTimeout(() => { success.style.display = 'none'; }, 5000);
}

// Scroll reveal animation
const observerOpts = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOpts);

document.querySelectorAll(
  '.stats__item, .program__card, .galeri__item, .berita__card, .tentang__value'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  observer.observe(el);
});

// Counter animation for stats
const statsItems = document.querySelectorAll('.stats__item strong');
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = el.textContent;
      const num = parseInt(target.replace(/\D/g, ''));
      if (!isNaN(num) && num > 0) {
        const suffix = target.replace(/[\d,]/g, '').replace(/^\d+/, '');
        let start = 0;
        const dur = 1500;
        const step = dur / 60;
        const inc = num / 60;
        const timer = setInterval(() => {
          start += inc;
          if (start >= num) { start = num; clearInterval(timer); }
          el.textContent = Math.floor(start).toLocaleString('id-ID') + suffix;
        }, step);
      }
      statsObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

statsItems.forEach(el => statsObserver.observe(el));
