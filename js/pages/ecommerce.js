/* ecommerce.js — E-commerce page scripts */

(function () {
  const track = document.getElementById('typesGrid');
  const dotsWrap = document.getElementById('typesDots');
  const prevBtn = document.getElementById('typesPrev');
  const nextBtn = document.getElementById('typesNext');
  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const cards = track.querySelectorAll('.type-card');
  let current = 0;
  let cardsPerView = getCardsPerView();

  function getCardsPerView() {
    return window.innerWidth > 900 ? 2 : 1;
  }

  function getMaxIndex() {
    return cards.length - cardsPerView;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const numDots = getMaxIndex() + 1;
    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('button');
      dot.className = 'types-dot' + (i === current ? ' active' : '');
      dot.addEventListener('click', () => {
        current = i;
        updateSlider();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateSlider() {
    const maxIdx = getMaxIndex();
    if (current > maxIdx) current = maxIdx;
    if (current < 0) current = 0;

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 20; // 20px gap from css
    const step = cardWidth + gap;
    track.style.transform = `translateX(-${current * step}px)`;

    const dots = dotsWrap.querySelectorAll('.types-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn.addEventListener('click', () => {
    if (current > 0) {
      current--;
      updateSlider();
    } else {
      current = getMaxIndex();
      updateSlider();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (current < getMaxIndex()) {
      current++;
      updateSlider();
    } else {
      current = 0;
      updateSlider();
    }
  });

  window.addEventListener('resize', () => {
    const oldPerView = cardsPerView;
    cardsPerView = getCardsPerView();
    if (oldPerView !== cardsPerView) {
      buildDots();
      updateSlider();
    } else {
      updateSlider();
    }
  });

  // Touch Swipe Support
  let startX = 0;
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        if (current < getMaxIndex()) {
          current++;
          updateSlider();
        }
      } else {
        if (current > 0) {
          current--;
          updateSlider();
        }
      }
    }
  });

  buildDots();
  // Small delay to ensure browser layout is ready before reading widths
  setTimeout(updateSlider, 100);
})();
