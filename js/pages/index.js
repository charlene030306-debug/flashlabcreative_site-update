/* index.js — Homepage-specific scripts */

/* COUNTER ANIMATION */
(function () {
  const counters = document.querySelectorAll('.counter');
  function animate(el) {
    const target = +el.getAttribute('data-target');
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / 1800, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
    })(start);
  }
  const grid = document.querySelector('.stats-grid');
  if (grid) {
    new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) counters.forEach(animate); });
    }, { threshold: 0.3 }).observe(grid);
  }
})();

/* PARALLAX BLOBS */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.blob').forEach((b, i) => {
    b.style.transform = `translateY(${y * (i % 2 === 0 ? 0.08 : 0.05)}px)`;
  });
});

/* OUR WORK AURORA BACKGROUND */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ac = document.getElementById('flAurora');
  const dc = document.getElementById('flDust');
  if (!ac || !dc) return;
  const a = ac.getContext('2d');
  const d = dc.getContext('2d');
  let AW, AH, adpr, DW, DH, ddpr, motes = [];
  const orbs = [
    { c: '241,90,53',  r: 0.55, x: 0.70, y: 0.42, ax: 0.14, ay: 0.10, sx: 0.00021, sy: 0.00027, px: 0,   py: 1.4 },
    { c: '164,232,60', r: 0.46, x: 0.78, y: 0.62, ax: 0.16, ay: 0.12, sx: 0.00026, sy: 0.00019, px: 2.1, py: 0.4 },
    { c: '126,92,255', r: 0.60, x: 0.55, y: 0.50, ax: 0.18, ay: 0.14, sx: 0.00017, sy: 0.00023, px: 3.7, py: 2.6 },
    { c: '255,86,170', r: 0.40, x: 0.86, y: 0.35, ax: 0.10, ay: 0.12, sx: 0.00031, sy: 0.00029, px: 1.2, py: 3.1 },
    { c: '43,217,196', r: 0.38, x: 0.62, y: 0.70, ax: 0.13, ay: 0.09, sx: 0.00023, sy: 0.00033, px: 4.4, py: 0.9 }
  ];
  function sizeAurora() {
    adpr = Math.min(window.devicePixelRatio || 1, 1.5);
    AW = ac.clientWidth; AH = ac.clientHeight;
    ac.width = AW * adpr; ac.height = AH * adpr;
    a.setTransform(adpr, 0, 0, adpr, 0, 0);
  }
  function drawAurora(t) {
    if (!AW || !AH) return;
    a.clearRect(0, 0, AW, AH);
    a.globalCompositeOperation = 'lighter';
    const base = Math.max(AW, AH);
    for (const o of orbs) {
      const x = (o.x + Math.sin(t * o.sx + o.px) * o.ax) * AW;
      const y = (o.y + Math.cos(t * o.sy + o.py) * o.ay) * AH;
      const R = o.r * base;
      const g = a.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0,   'rgba(' + o.c + ',0.55)');
      g.addColorStop(0.4, 'rgba(' + o.c + ',0.22)');
      g.addColorStop(1,   'rgba(' + o.c + ',0)');
      a.fillStyle = g;
      a.beginPath(); a.arc(x, y, R, 0, Math.PI * 2); a.fill();
    }
    a.globalCompositeOperation = 'source-over';
  }
  function sizeDust() {
    ddpr = Math.min(window.devicePixelRatio || 1, 2);
    DW = dc.clientWidth; DH = dc.clientHeight;
    dc.width = DW * ddpr; dc.height = DH * ddpr;
    d.setTransform(ddpr, 0, 0, ddpr, 0, 0);
    motes = [];
    const n = Math.round(DW * DH / 9000);
    for (let i = 0; i < n; i++) {
      motes.push({
        x: Math.random() * DW, y: Math.random() * DH,
        r: Math.random() * 1.4 + 0.3,
        vy: -(Math.random() * 0.18 + 0.04),
        vx: (Math.random() - 0.5) * 0.06,
        tw: Math.random() * Math.PI * 2, sp: Math.random() * 0.03 + 0.008,
        base: Math.random() * 0.4 + 0.2
      });
    }
  }
  function drawDust() {
    if (!DW || !DH) return;
    d.clearRect(0, 0, DW, DH);
    for (const m of motes) {
      if (!reduce) {
        m.x += m.vx;
        m.y += m.vy;
        m.tw += m.sp;
      }
      if (m.y < -4) {
        m.y = DH + 4;
        m.x = Math.random() * DW;
      }
      if (m.x < -4) m.x = DW + 4; else if (m.x > DW + 4) m.x = -4;
      const al = m.base + Math.sin(m.tw) * 0.22;
      d.globalAlpha = Math.max(0, al);
      d.fillStyle = '#ffffff';
      d.beginPath(); d.arc(m.x, m.y, m.r, 0, Math.PI * 2); d.fill();
    }
    d.globalAlpha = 1;
  }
  function loop(t) {
    drawAurora(t);
    drawDust();
    if (!reduce) requestAnimationFrame(loop);
  }
  function start() {
    sizeAurora();
    sizeDust();
    if (reduce) {
      drawAurora(8000);
      drawDust();
    } else {
      requestAnimationFrame(loop);
    }
  }
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(start, 150);
  });
  window.addEventListener('load', start);
  start();
})();

/* HERO SLIDE CYCLER */
(function () {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.dots span');

    const totalSlides = slides.length;
    let currentSlide = 0;
    let autoSlide;

    if (!slides.length) return; // Prevent script errors on other pages

    function updateIndicators() {
        indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    function goToSlide(index) {

        if (index >= totalSlides) index = 0;
        if (index < 0) index = totalSlides - 1;

        slides.forEach(slide => {
            slide.classList.remove('active');
        });

        slides[index].classList.add('active');

        const title = slides[index].querySelector('h1');
        if (title) {
            title.classList.remove('animate');
            void title.offsetWidth;
            title.classList.add('animate');
        }

        const subtext = slides[index].querySelector('p');
        if (subtext) {
            subtext.classList.remove('animate');
            void subtext.offsetWidth;
            subtext.classList.add('animate');
        }

        const heroBg = document.querySelector('.hero-bg-img');
        const bgImg = slides[index].getAttribute('data-bg');
        if (heroBg && bgImg) {
            heroBg.style.backgroundImage = `url('${encodeURI(bgImg)}')`;
            const bgPos = slides[index].getAttribute('data-bg-pos');
            heroBg.style.backgroundPosition = bgPos || 'center';
        }

        currentSlide = index;

        updateIndicators();
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    indicators.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            restartAutoSlide();
        });
    });

    function startAutoSlide() {
        autoSlide = setInterval(() => {
            nextSlide();
        }, 5000);
    }

    function restartAutoSlide() {
        clearInterval(autoSlide);
        startAutoSlide();
    }

    // Initial Load
    goToSlide(0);
    startAutoSlide();
})();

/* PORTFOLIO CAROUSEL */
(function () {
  const track = document.getElementById('port-track');
  const dotsEl = document.getElementById('port-dots');
  if (!track) return;
  const pages = Array.from(track.querySelectorAll('.port-page'));
  const total = pages.length;
  let current = 0;
  pages.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to page ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });
  function goTo(index) {
    current = Math.max(0, Math.min(index, total - 1));
    track.style.transform = `translateX(calc(-${current} * 100%))`;
    dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) d > 0 ? goTo(current + 1) : goTo(current - 1);
  }, { passive: true });
  goTo(0);
})();

/* CLIENTS THREE-ROW BELT */
(function () {
  const row1Logos = [
    { src: 'images/logos/tikibab-final.png',              alt: 'Tikibab' },
    { src: 'images/logos/susegad.png',              alt: 'Susegad' },
    { src: 'images/logos/backyard.png',             alt: 'Backyard' },
    { src: 'images/logos/mikes.png',                alt: "Mike's Place" },
    { src: 'images/logos/gen.png',                  alt: 'Gen' },
    { src: 'images/logos/noorbridals.png',          alt: 'Noor Bridals' },
    { src: 'images/logos/brane.png',                alt: 'Brane' },
    { src: 'images/logos/theorigin.png',               alt: 'Origin' },
    { src: 'images/logos/pedros.png',               alt: "Pedro's" },
    { src: 'images/logos/magzika.png',              alt: 'Magzika' },
    { src: 'images/logos/ewater.png',               alt: 'eWater' },
    { src: 'images/logos/colvaplaza.png',                alt: 'Colva Plaza' },
    { src: 'images/logos/caliber2.png',              alt: 'Caliber' },
    { src: 'images/logos/babshideout.png',          alt: "Bab's Hideout" },
    { src: 'images/logos/akshay.png',         alt: 'Akshay' },
    { src: 'images/logos/armond - Edited.png',               alt: 'Armond' },
    { src: 'images/logos/Astro.png',                alt: 'Astro' },
    { src: 'images/logos/bakeshop.png',             alt: 'Bakeshop' },
    { src: 'images/logos/bastil.png',               alt: 'Bastil' },
    { src: 'images/logos/Boleir.png',               alt: 'Boleir' },
    { src: 'images/logos/boltshift.png',            alt: 'Boltshift' },
    { src: 'images/logos/caeiro.png',               alt: 'Caeiro' },
    { src: 'images/logos/cali-logo.png',            alt: 'Cali' },
    { src: 'images/logos/Car-Glaze-black-bg.png',            alt: 'Car Glaze' },
    { src: 'images/logos/Caravel-Logo.png',         alt: 'Caravel' },
    { src: 'images/logos/cloudwatch.png',          alt: 'Cloud Watch' },
    { src: 'images/logos/darkside.png',             alt: 'Darkside' },
    { src: 'images/logos/Digit.png',                alt: 'Digit' },
    { src: 'images/logos/dilige.png',               alt: 'Dilige' },
    { src: 'images/logos/EdgeWater.png',            alt: 'Edge Water' },
    { src: 'images/logos/featherdev.png',              alt: 'Feather' },
    { src: 'images/logos/fifthflour.png',           alt: 'Fifth Flour' },
    { src: 'images/logos/flowbase.png',             alt: 'Flowbase' },
    { src: 'images/logos/ghaas phoos.png',          alt: 'Ghaas Phoos' },
  ];
  const row2Logos = [
    { src: 'images/logos/Club-Rickys-Logo.png',     alt: "Ricky's" },
    { src: 'images/logos/reginaldo.png',            alt: 'Reginaldo Connect' },
    { src: 'images/logos/regtrust.png',                alt: 'Trust' },
    { src: 'images/logos/Deltin-casino.png',        alt: 'Deltin Casino' },
    { src: 'images/logos/Dwarka.png',          alt: 'Dwarka' },
    { src: 'images/logos/Crafted-Couches.png',      alt: 'Crafted Couches' },
    { src: 'images/logos/heineken.png',   alt: 'Krank' },
    { src: 'images/logos/pronature.png',            alt: 'Pronature' },
    { src: 'images/logos/KOA.png',                  alt: 'KOA' },
    { src: 'images/logos/Fomento-Reality.png',      alt: 'Fomento Reality' },
    { src: 'images/logos/featherdev.png',           alt: 'Featherdev' },
    { src: 'images/logos/Papiillon-Logo.png',       alt: 'Papillon' },
    { src: 'images/logos/the red ginger.png',       alt: 'Red Ginger' },
    { src: 'images/logos/severos.png',              alt: 'Severos' },
    { src: 'images/logos/Latin-Quarter-Blue.png',   alt: 'Latin Quarter' },
    { src: 'images/logos/labarca.png', alt: 'La Barraca' },
    { src: 'images/logos/patisserie.png',           alt: 'Patisserie' },
    { src: 'images/logos/Southern-cost.png',        alt: 'Southern Coast' },
    { src: 'images/logos/Surf-house-logo.png',      alt: 'Surf House' },
    { src: 'images/logos/avtar-kitchen.png',        alt: 'Avtar Kitchen' },
    { src: 'images/logos/Pipa-Bela.png',            alt: 'Pipa Bela' },
    { src: 'images/logos/fc-goa.png',               alt: 'FC Goa' },
    { src: 'images/logos/Robins-ark.png',           alt: "Robin's Ark" },
    { src: 'images/logos/globalbank.png',           alt: 'Global Bank' },
    { src: 'images/logos/Hide-Expo.png',            alt: 'Hide Expo' },
    { src: 'images/logos/holi.png',            alt: 'Holi Dhun' },
    { src: 'images/logos/KAP.png', alt: 'KAP Panandiker' },
    { src: 'images/logos/koso.png',                  alt: 'KOS' },
    { src: 'images/logos/lightbox.png',             alt: 'Lightbox' },
    { src: 'images/logos/logoips.png',              alt: 'Logoips' },
    { src: 'images/logos/lumino.png',               alt: 'Lumino' },
    { src: 'images/logos/madrin.png',               alt: 'Madrin' },
    { src: 'images/logos/Modal.png',                alt: 'Modal' },
    { src: 'images/logos/Permaguard-final - Edited.png',           alt: 'Permaguard' },
    { src: 'images/logos/renew.png',                alt: 'Renew' },
    { src: 'images/logos/siteman.png',              alt: 'Siteman' },
    { src: 'images/logos/spherule.png',             alt: 'Spherule' },
    { src: 'images/logos/tataki.png',               alt: 'Tataki' },
    { src: 'images/logos/tulum.png',                alt: 'Tulum' },
    { src: 'images/logos/twitch.png',               alt: 'Twitch' },
    { src: 'images/logos/waveless.png',             alt: 'Waveless' },
    { src: 'images/logos/xfinity.png',              alt: 'Xfinity' },
    { src: 'images/logos/YU hotel.png',             alt: 'YU Hotel' },
  ];
  function buildBelt(list) {
    const doubled = [...list, ...list];
    const frag = document.createDocumentFragment();
    doubled.forEach(logo => {
      const item = document.createElement('div');
      item.className = 'cl-item';
      const img = document.createElement('img');
      img.src = logo.src;
      img.alt = logo.alt;
      img.loading = 'lazy';
      img.draggable = false;
      item.appendChild(img);
      frag.appendChild(item);
      const sep = document.createElement('div');
      sep.className = 'cl-sep';
      frag.appendChild(sep);
    });
    return frag;
  }
  const t1 = document.getElementById('cl-row1-track');
  const t2 = document.getElementById('cl-row2-track');
  if (t1) t1.appendChild(buildBelt(row1Logos));
  if (t2) t2.appendChild(buildBelt(row2Logos));
})();

/* TESTIMONIALS */
(function () {
  const TESTIMONIALS = [
    { stars: 5, text: "Finally a team that genuinely knows their stuff! They seamlessly blend creativity with strategy, providing services in digital marketing, websites, reputation management, photography and videography. Love their energy, attention to detail, and the insights they bring to every project. Definitely my go-to team for any business looking to grow its online presence.", name: "Ervin Sequeira", role: "Google Review", initial: "E", color: "#a8e832", link: "https://share.google/WvRLau5CdmCwfIjYH" },
    { stars: 5, text: "We've had a fantastic experience with Flashlab Creative. Their social media strategies are creative and impactful. Our engagement and reach have grown steadily since we started working with them. Anura and his team are professional, easy to communicate with, and always on top of trends. Highly recommended!", name: "Kelton D'mello", role: "Google Review", initial: "K", color: "#7c3aed", link: "https://share.google/XAdubvNbttGH4bZMF" },
    { stars: 5, text: "Thoroughly impressed with Flashlab Creative's work on Bab's Hideout's social media! Their content is engaging, and they post regularly, keeping our audience entertained and informed. Their promptness and fast response times are top-notch. Highly recommend Flashlab Creative for all your social media needs!", name: "Bab's Hideout", role: "Google Review", initial: "B", color: "#0891b2", link: "https://share.google/V5yeDY0rmCyif1FbT" },
    { stars: 5, text: "They followed the brief to the T and the outcome was amazing. Super happy with the professionalism and the creativity involved. They are not your standard studio &mdash; they think out of the box and deliver perfection. Thanks guys for capturing all the amazing moments. You've given us a perfect box of memories!", name: "Giselle Marie", role: "Google Review", initial: "G", color: "#15803d", link: "https://share.google/a8asQUj0AykU7TZFA" },
    { stars: 5, text: "Had an incredible experience, the environment was always professional. A big shoutout to Anuraj for being the most down-to-earth person I've worked with.", name: "Meliston Pinto", role: "Google Review", initial: "M", color: "#b45309", link: "https://share.google/Tz02QKfK0rHk1CsVa" },
    { stars: 5, text: "Flashlab Creative is the premium sector of all things creative. Had appointed them for graphic designing work and they delivered with exceeding expectations. They made whatever changes I wanted till I was satisfied with the outcome. I would recommend for all their services!", name: "Anushka Rodrigues", role: "Google Review", initial: "A", color: "#be185d", link: "https://share.google/L1DO36QQrqbjRB8UO" },
    { stars: 5, text: "I chose Oliver and team to help me with our wedding. It was beautifully captured, the team was really accommodating, and helpful. I couldn't have asked for more. Thank you for helping me create beautiful memories.", name: "Karen Callaghan", role: "Google Review", initial: "K", color: "#6d28d9", link: "https://share.google/Qdw9Tc0Zw5Cun4SpO" },
    { stars: 5, text: "Excellent marketing agency, very professional and great delivery.", name: "Clevio Pinto", role: "Google Review", initial: "C", color: "#0f766e", link: "https://share.google/TBYUkAMnAPzhcJgMe" },
    { stars: 5, text: "Really well executed Promoshoot for our Showroom. Well planned and delivery of final output was really beautiful. Thanks guys!", name: "Saish Borkar", role: "Google Review", initial: "S", color: "#a8e832", link: "https://share.google/1NUlHtBbrFnGKiEYw" },
    { stars: 5, text: "Amazing group of minds at Flashlab Creative. Got my website done here &mdash; couldn't be happier.", name: "Elsa Lumia", role: "Google Review", initial: "E", color: "#f97316", link: "https://share.google/O5dzxfHCk5Z6s1TlV" },
    { stars: 5, text: "Always great to see these guys do great video & editing work. These people are the best ones in Goa.", name: "Mayuresh Naik", role: "Google Review", initial: "P", color: "#dc2626", link: "https://share.google/PMMh4Tba7yjtRyKcY" },
  ];
  const track = document.getElementById('testiCarouselTrack');
  const dotsEl = document.getElementById('testiDots');
  const prevBtn = document.getElementById('testiPrev');
  const nextBtn = document.getElementById('testiNext');
  if (!track || !dotsEl) return;
  const N = TESTIMONIALS.length;
  const CLONE_COUNT = 4;
  const GAP = 20;
  function getStep() {
    const c = track.firstElementChild;
    return c ? c.offsetWidth + GAP : 300;
  }
  function makeCard(t) {
    const card = document.createElement('a');
    card.className = 'testi-card';
    card.href = t.link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.innerHTML = '<div class="testi-stars">' + '★'.repeat(t.stars) + '</div><p>' + t.text + '</p><div class="testi-author"><div class="testi-avatar" style="background:' + t.color + '20; border-color:' + t.color + '60; color:' + t.color + '">' + (t.img ? '<img src="' + t.img + '" alt="' + t.name + '">' : t.initial) + '</div><div class="testi-author-info"><strong>' + t.name + '</strong><span>' + t.role + '</span></div></div>';
    return card;
  }
  TESTIMONIALS.forEach(t => track.appendChild(makeCard(t)));
  const realCards = Array.from(track.children);
  for (let i = 0; i < CLONE_COUNT; i++) track.appendChild(realCards[i].cloneNode(true));
  for (let i = N - 1; i >= N - CLONE_COUNT; i--) track.insertBefore(realCards[i].cloneNode(true), track.firstChild);
  TESTIMONIALS.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-nav-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(CLONE_COUNT + i);
      startAuto();
    });
    dotsEl.appendChild(dot);
  });
  let current = CLONE_COUNT;
  let busy = false;
  let autoTimer = null;
  function updateDots(abs) {
    const real = ((abs - CLONE_COUNT) % N + N) % N;
    dotsEl.querySelectorAll('.testi-nav-dot').forEach((d, i) => d.classList.toggle('active', i === real));
  }
  function jumpTo(idx) {
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + (idx * getStep()) + 'px)';
    current = idx;
    track.offsetHeight;
    track.style.transition = '';
  }
  function goTo(idx) {
    if (busy) return;
    busy = true;
    current = idx;
    track.style.transform = 'translateX(-' + (idx * getStep()) + 'px)';
    updateDots(idx);
    track.addEventListener('transitionend', function onEnd() {
      track.removeEventListener('transitionend', onEnd);
      if (current >= N + CLONE_COUNT) jumpTo(current - N);
      else if (current < CLONE_COUNT) jumpTo(current + N);
      busy = false;
    }, { once: true });
  }
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 3500);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  prevBtn.addEventListener('click', () => {
    stopAuto();
    goTo(current - 1);
    startAuto();
  });
  nextBtn.addEventListener('click', () => {
    stopAuto();
    goTo(current + 1);
    startAuto();
  });
  const outer = document.querySelector('.testi-carousel-outer');
  if (outer) {
    outer.addEventListener('mouseenter', stopAuto);
    outer.addEventListener('mouseleave', startAuto);
  }
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? goTo(current + 1) : goTo(current - 1);
    startAuto();
  }, { passive: true });
  jumpTo(CLONE_COUNT);
  startAuto();
})();

/* VIDEO MODAL — self-hosted file first, YouTube as fallback */
(function () {
  const VIDEO_ID  = 'H2MknxI6G2E';
  const LOCAL_SRC = 'videos/our-story.mp4';
  const btn = document.getElementById('videoPlayBtn');
  const modal = document.getElementById('videoModal');
  const backdrop = document.getElementById('videoModalBackdrop');
  const closeBtn = document.getElementById('videoModalClose');
  const iframe = document.getElementById('videoIframe');
  const videoEl = document.getElementById('videoFile');
  const ytLink = document.getElementById('videoYtLink');
  if (!btn || !modal) return;
  if (ytLink) ytLink.href = 'https://www.youtube.com/watch?v=' + VIDEO_ID;

  function useYouTube() {
    if (videoEl) {
      videoEl.style.display = 'none';
      videoEl.removeAttribute('src');
      try { videoEl.load(); } catch (e) {}
    }
    iframe.style.display = '';
    iframe.src = 'https://www.youtube.com/embed/' + VIDEO_ID + '?autoplay=1&rel=0&modestbranding=1';
  }

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (videoEl) {
      videoEl.onerror = useYouTube;
      videoEl.oncanplay = function () {
        iframe.style.display = 'none';
        iframe.src = '';
        videoEl.style.display = 'block';
      };
      iframe.style.display = 'none';
      videoEl.style.display = 'block';
      videoEl.src = LOCAL_SRC;
      const p = videoEl.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      useYouTube();
    }
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(function () {
      iframe.src = '';
      if (videoEl) {
        try {
          videoEl.pause();
          videoEl.removeAttribute('src');
          videoEl.load();
        } catch (e) {}
      }
    }, 380);
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
})();

/* PORTFOLIO OVERLAY */
(function () {
  const openBtn = document.getElementById('openPortfolioOverlay');
  const panel = document.getElementById('portOverlayPanel');
  if (!openBtn || !panel) return;
  openBtn.addEventListener('click', () => {
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
  const closeBtn = document.getElementById('closePortfolioOverlay');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.remove('active');
      document.body.style.overflow = '';
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('active')) {
      panel.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
})();

/* TAP-TO-FLIP for touch devices */
(function () {
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.flip-card').forEach(function (card) {
      card.addEventListener('click', function () {
        card.classList.toggle('flipped');
      });
    });
  }
})();
