/* clients.js — Clients page scripts */

/* STAR RATINGS */
document.querySelectorAll('.star-rating').forEach(el => el.innerHTML = '&#9733;'.repeat(5));

/* COUNTER ANIMATION */
(function () {
  const counters = document.querySelectorAll('.counter');
  function animate(el) {
    const target = +el.getAttribute('data-target');
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / 1600, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    })(start);
  }
  const heroStats = document.querySelector('.hero-ed-right');
  if (heroStats) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          counters.forEach(animate);
        }
      });
    }, { threshold: 0.3 }).observe(heroStats);
  }
})();

/* TESTIMONIAL SLIDER */
(function () {
  const slider = document.getElementById('testiSlider');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  if (!slider || !dotsWrap) return;
  const slides = slider.querySelectorAll('.testi-slide');
  let current = 0, autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
    dotsWrap.appendChild(dot);
  });

  function goTo(n) {
    current = (n + slides.length) % slides.length;
    slider.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.testi-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  prevBtn.addEventListener('click', () => {
    goTo(current - 1);
    startAuto();
  });
  nextBtn.addEventListener('click', () => {
    goTo(current + 1);
    startAuto();
  });

  let startX = 0;
  slider.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
  });

  startAuto();
})();

/* GRAPHIC DESIGN TABS */
(function () {
  const TABS = {
    'brand-identity':    { icon: 'ri-palette-fill',        label: 'Brand Identity',   title: 'Brand Identity Design',     desc: 'Logos, color systems, typography, and visual language — cohesive identities built to leave a lasting mark.', image: '' },
    'print-collateral':  { icon: 'ri-printer-fill',        label: 'Print Collateral', title: 'Print Collateral Design',   desc: 'Brochures, flyers, business cards, and marketing materials — designed to impress in the physical world.', image: '' },
    'outdoor-ads':       { icon: 'ri-megaphone-fill',      label: 'Outdoor Ads',      title: 'Outdoor Advertising',       desc: 'Hoardings, banners, bus shelters, and transit ads — bold creatives that command attention at scale.', image: '' },
    'menu-design':       { icon: 'ri-restaurant-2-fill',   label: 'Menu Design',      title: 'Menu & F&B Design',         desc: 'Restaurant and café menus, drink lists, and F&B marketing — designed to delight and upsell.', image: '' },
    'product-packaging': { icon: 'ri-gift-fill',           label: 'Product Packaging',title: 'Product Packaging Design',  desc: 'Packaging systems that stand out on shelf — structural design, labels, and unboxing experiences that convert.', image: '' },
    'ui-ux':             { icon: 'ri-layout-masonry-fill', label: 'UI / UX Design',   title: 'UI / UX Interface Design',  desc: 'Web and app interfaces designed with precision — wireframes, prototypes, and pixel-perfect final designs.', image: '' },
  };

  const tabs = document.querySelectorAll('.graphic-tab');
  const showcase = document.getElementById('graphicShowcase');
  const captionTag = document.getElementById('captionTag');
  const captionTitle = document.getElementById('captionTitle');
  const captionDesc = document.getElementById('captionDesc');
  if (!tabs.length || !showcase) return;

  function activate(key) {
    const data = TABS[key];
    if (!data) return;
    document.querySelectorAll('.graphic-showcase-fallback').forEach(f => f.classList.remove('active'));
    if (data.image) {
      const old = showcase.querySelector('.graphic-showcase-img');
      if (old) old.remove();
      const img = document.createElement('img');
      img.className = 'graphic-showcase-img';
      img.src = data.image;
      img.alt = data.label;
      img.style.objectFit = 'cover';
      showcase.insertBefore(img, showcase.querySelector('.graphic-caption-bar'));
      requestAnimationFrame(() => img.classList.add('active'));
    } else {
      const fallback = document.getElementById('tab-' + key);
      if (fallback) fallback.classList.add('active');
      const old = showcase.querySelector('.graphic-showcase-img');
      if (old) old.remove();
    }
    captionTag.innerHTML = `<i class="${data.icon}"></i> ${data.label}`;
    captionTitle.textContent = data.title;
    captionDesc.textContent = data.desc;
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === key));
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => activate(tab.getAttribute('data-tab')));
  });

  activate('brand-identity');
})();
