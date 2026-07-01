/* about.js — About page scripts */

/* PORTRAIT CARD image fallback */
document.querySelectorAll('.pcard').forEach(card => {
  const img = card.querySelector('.pcard-photo');
  if (img) img.addEventListener('error', () => img.style.display = 'none');
});

/* TIMELINE */
(function () {
  const YEARS = [
    {
      year: '2016', title: 'The Spark &mdash; Pre-Launch', tag: 'Foundation',
      body: 'The idea of Flashlab Creative was born. Ankith and Anuraj Kedar identified a gap in Goa\'s creative market &mdash; businesses needed world-class creative services, and no one was delivering them locally. One of the earliest projects: a cinematic branding video for The SouthDeck, setting the tone for the bold storytelling Flashlab Creative would become known for.',
      images: [
        { c: 'yr-c1', s: 'images/timeline/southdeck1.jpg', cap: 'The SouthDeck &mdash; Branding Video' },
        { c: 'yr-c3', s: 'images/timeline/southdeck2.jpg', cap: 'The SouthDeck &mdash; Branding Video' },
        { c: 'yr-c5', s: 'images/timeline/southdeck3.jpg', cap: 'The SouthDeck &mdash; Branding Video' },
        { c: 'yr-c7', s: 'images/timeline/southdeck4.jpg', cap: 'The SouthDeck &mdash; Branding Video' }
      ]
    },
    {
      year: '2017', title: 'Building the Blueprint', tag: 'Pre-Launch',
      body: 'Brand identity designed. Business model refined. Flashlab Creative took on early collaborations to build a portfolio before the official launch &mdash; including video production for The Mambo Halloween Event promo and a cinematic piece covering Max Vangeli\'s first experience in Goa. By year\'s end, everything was set for launch.',
      images: [
        { c: 'yr-c2', s: 'images/timeline/mambo1.jpg', cap: 'The Mambo Halloween Event' },
        { c: 'yr-c4', s: 'images/timeline/mambo2.jpg', cap: 'The Mambo Halloween Event' },
        { c: 'yr-c6', s: 'images/timeline/mambo3.jpg', cap: "Max Vangeli's First Goa Experience" },
        { c: 'yr-c8', s: 'images/timeline/mambo4.png', cap: "Max Vangeli's First Goa Experience" }
      ]
    },
    {
      year: '2018', title: 'Flashlab Creative Officially Founded', tag: 'Year One',
      body: 'Established in Margao, Goa, starting from a small godown room with passion and purpose. First paying clients onboarded. Projects included Cyrus Berne\'s Ed Sheeran & Chainsmokers "Shape of You" video production, the Ashley + Melita Wedding Film Teaser, and the Five Six Zero 2017 ft. Blasterjaxx event &mdash; a landmark electronic music production in Goa. The Flashlab Creative era officially began.',
      images: [
        { c: 'yr-c1', s: 'images/timeline/2018-cyrus.png', cap: 'Cyrus Berne &mdash; Shape of You' },
        { c: 'yr-c2', s: 'images/timeline/2018-marriage.png', cap: 'Ashley & Melita Wedding Film' },
        { c: 'yr-c5', s: 'images/timeline/2018-marriage2.png', cap: 'Ashley + Melita Wedding' },
        { c: 'yr-c7', s: 'images/timeline/2018-blasterjaxx.png', cap: 'Five Six Zero ft. Blasterjaxx' }
      ]
    },
    {
      year: '2019', title: 'Building Our Foundation', tag: 'Growth',
      body: 'Expanded into digital marketing, graphic design, web design, photography, and video production. Key highlights: the FC Goa 2018&ndash;19 Jersey Launch Event, a Deltin Casino "Deltin Select" promo, and a fashion film for Pipa Bella featuring Snehal Fernandes. This year established Flashlab Creative as Goa\'s trusted creative partner across sports, hospitality, and lifestyle brands.',
      images: [
        { c: 'yr-c3', s: 'images/timeline/2019-jersey.png', cap: 'FC Goa Jersey Launch' },
        { c: 'yr-c4', s: 'images/timeline/2019-deltin-life.png', cap: 'Deltin Casino &mdash; Deltin Select' },
        { c: 'yr-c6', s: 'images/timeline/2019pipa.png', cap: 'Pipa Bella Fashion Film' },
        { c: 'yr-c8', s: 'images/timeline/2019deltin.png', cap: 'Deltin Casino Promo' }
      ]
    },
    {
      year: '2020', title: 'Resilience &amp; Digital Push', tag: 'Pivot',
      body: 'Navigated the pandemic by doubling down on digital strategy and content production. Helped local businesses pivot online &mdash; producing a cinematic branding video for European Bartender School, Goa, and a stunning property shoot for Mystras Assagao. Flashlab Creative emerged stronger, more versatile, and with a wider client base than before.',
      images: [
        { c: 'yr-c1', s: 'images/timeline/2020-bartend.png', cap: 'European Bartender School, Goa' },
        { c: 'yr-c5', s: 'images/timeline/2020-bartend2.png', cap: 'European Bartender School, Goa' },
        { c: 'yr-c2', s: 'images/timeline/2020-mystras.png', cap: 'Mystras Assagao Property Shoot' },
        { c: 'yr-c7', s: 'images/timeline/2020-mystras2.png', cap: 'Mystras Assagao Property Shoot' }
      ]
    },
    {
      year: '2021', title: 'Parashoot Studios Launch', tag: 'New Venture',
      body: 'Launched Parashoot Studios &mdash; a dedicated content production arm specialising in weddings, food, aerial, and commercial photography. Armed with cinema-grade cameras, professional studio setups, and advanced drones, Parashoot quickly became the go-to photography and film partner for Goa\'s premium hospitality and lifestyle brands.',
      images: [
        { c: 'yr-c4', s: 'images/timeline/2021-1.jpg', cap: 'Parashoot Studios Launch' },
        { c: 'yr-c3', s: 'images/timeline/2021-2.jpg', cap: 'Aerial & Drone Work' },
        { c: 'yr-c6', s: 'images/timeline/2021-3.jpg', cap: 'Food Photography' },
        { c: 'yr-c8', s: 'images/timeline/2021-4.jpg', cap: 'Wedding Coverage' }
      ]
    },
    {
      year: '2022', title: 'Premium Brand Partnerships', tag: 'Major Wins',
      body: 'Secured major contracts with high-profile brands and events. Captured the Goa Experience Stage at Sunburn Goa 2022 for Sunburn x Deltin &mdash; where music, culture, and visuals collided. Also produced cinematic coverage of the Deltin Life activation at IFFI Goa 2022, with celebrated guests including Rishab Shetty, Ajay Devgn, and Anupam Kher. Campaigns that set new standards in Goa\'s creative industry.',
      images: [
        { c: 'yr-c2', s: 'images/timeline/2022-sunburn.png', cap: 'Sunburn x Deltin &mdash; Goa Experience Stage' },
        { c: 'yr-c1', s: 'images/timeline/2022-sunburn2.png', cap: 'Sunburn x Deltin 2022' },
        { c: 'yr-c5', s: 'images/timeline/2022-deltin.png', cap: 'Deltin at IFFI 2022' },
        { c: 'yr-c7', s: 'images/timeline/2022-deltin2.png', cap: 'Deltin at IFFI 2022' }
      ]
    },
    {
      year: '2023', title: 'Office Expansion &amp; National Games', tag: 'Milestone',
      body: 'Expanded to G26 Vikrant Complex, Margao &mdash; a professional, inspiring workspace for the growing team. From a small godown room to a full creative hub. Also delivered comprehensive multi-sport media coverage for the National Games 2023 hosted in Goa. More staff, more capabilities, more impact.',
      images: [
        { c: 'yr-c3', s: 'images/timeline/2023-1.jpg', cap: 'New Office &mdash; Vikrant Complex' },
        { c: 'yr-c6', s: 'images/timeline/2023-2.jpg', cap: 'Team Expansion' },
        { c: 'yr-c4', s: 'images/timeline/2023-3.jpg', cap: 'National Games 2023 Coverage' },
        { c: 'yr-c8', s: 'images/timeline/2023-4.jpg', cap: 'National Games 2023 Coverage' }
      ]
    },
    {
      year: '2024', title: 'Record-Breaking Year', tag: 'Peak Year',
      body: 'One of Flashlab Creative\'s biggest years. Delivered cinematic coverage for Netflix at IFFI 2024 &mdash; capturing red-carpet moments, exclusive talent interviews, and on-ground activations. Also covered the Ironman 70.3 Goa for MP Tejasvi Surya, and launched "Your Origin Story" podcast at The Origin Goa. Bold visuals and immersive storytelling defined the year.',
      images: [
        { c: 'yr-c1', s: 'images/timeline/2024-iffi.png', cap: 'Netflix at IFFI 2024' },
        { c: 'yr-c2', s: 'images/timeline/2024-iffi2.png', cap: 'Netflix at IFFI 2024' },
        { c: 'yr-c5', s: 'images/timeline/2024-iffi3.png', cap: 'Netflix at IFFI 2024' },
        { c: 'yr-c7', s: 'images/timeline/2024-iffi-4.png', cap: 'Netflix at IFFI 2024' }
      ]
    },
    {
      year: '2025', title: '7 Years &amp; Looking Forward', tag: 'Present',
      body: 'Celebrating 7 years of creativity, innovation, and impact. Delivered a cinematic property showcase for Deltin Daman, and captured the FIDE Chess World Cup 2025 launch in Goa &mdash; covering the logo and anthem reveal, cultural performances, and key moments with precision and style. With celebrity collaborations and campaigns pushing creative limits, the Flashlab Creative story is far from over.',
      images: [
        { c: 'yr-c4', s: 'images/timeline/2025-deltin.png', cap: 'Deltin Daman &mdash; Property Showcase' },
        { c: 'yr-c3', s: 'images/timeline/2025-deltin2.png', cap: 'Deltin Daman' },
        { c: 'yr-c6', s: 'images/timeline/2025-fide.png', cap: 'FIDE Chess World Cup 2025, Goa' },
        { c: 'yr-c8', s: 'images/timeline/2025-fide2.png', cap: 'FIDE Chess World Cup 2025, Goa' }
      ]
    },
  ];

  /* LIGHTBOX */
  const lb = document.createElement('div');
  lb.id = 'fl-lightbox';
  lb.innerHTML =
    '<div id="fl-lb-overlay"></div>' +
    '<div id="fl-lb-inner">' +
    '<button id="fl-lb-close" aria-label="Close"><i class="ri-close-line"></i></button>' +
    '<button id="fl-lb-prev" aria-label="Previous"><i class="ri-arrow-left-s-line"></i></button>' +
    '<button id="fl-lb-next" aria-label="Next"><i class="ri-arrow-right-s-line"></i></button>' +
    '<div id="fl-lb-img-wrap"><img id="fl-lb-img" src="" alt=""></div>' +
    '<p id="fl-lb-caption"></p>' +
    '</div>';
  document.body.appendChild(lb);

  let lbImages = [], lbIdx = 0;
  function openLb(imgs, idx) {
    lbImages = imgs;
    lbIdx = idx;
    showLbSlide();
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }
  function showLbSlide() {
    const img = document.getElementById('fl-lb-img');
    const cap = document.getElementById('fl-lb-caption');
    img.style.opacity = '0';
    img.src = lbImages[lbIdx].s;
    img.alt = lbImages[lbIdx].cap;
    cap.textContent = lbImages[lbIdx].cap;
    img.onload = function () { img.style.opacity = '1'; };
  }
  document.getElementById('fl-lb-overlay').addEventListener('click', closeLb);
  document.getElementById('fl-lb-close').addEventListener('click', closeLb);
  document.getElementById('fl-lb-prev').addEventListener('click', function () {
    lbIdx = (lbIdx - 1 + lbImages.length) % lbImages.length;
    showLbSlide();
  });
  document.getElementById('fl-lb-next').addEventListener('click', function () {
    lbIdx = (lbIdx + 1) % lbImages.length;
    showLbSlide();
  });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') {
      lbIdx = (lbIdx - 1 + lbImages.length) % lbImages.length;
      showLbSlide();
    }
    if (e.key === 'ArrowRight') {
      lbIdx = (lbIdx + 1) % lbImages.length;
      showLbSlide();
    }
  });

  const tabsEl = document.getElementById('yearTabs');
  const panelsEl = document.getElementById('yearPanels');

  YEARS.forEach(function (yr, i) {
    const tab = document.createElement('button');
    tab.className = 'year-tab' + (i === 0 ? ' active' : '');
    tab.textContent = yr.year;
    tab.addEventListener('click', function () { switchYear(i); });
    tabsEl.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'year-panel' + (i === 0 ? ' active' : '');
    panel.innerHTML =
      '<div class="year-panel-header">' +
      '<div class="year-big">' + yr.year + '</div>' +
      '<div class="year-text-block">' +
      '<span class="year-tag"><i class="ri-map-pin-2-line"></i>' + yr.tag + '</span>' +
      '<h3 class="year-title">' + yr.title + '</h3>' +
      '<p class="year-body">' + yr.body + '</p>' +
      '</div>' +
      '</div>' +
      '<div class="year-images">' +
      yr.images.map(function (img, ci) {
        return '<div class="yr-img-card" data-year-idx="' + i + '" data-img-idx="' + ci + '" title="Click to enlarge">' +
          '<div class="yr-img-bg ' + img.c + '"><img src="' + img.s + '" alt="' + img.cap + '" onerror="this.style.display=\'none\'"></div>' +
          '<div class="yr-img-label">' +
          '<span class="yr-img-num">0' + (ci + 1) + '</span>' +
          '<p class="yr-img-caption">' + img.cap + '</p>' +
          '</div>' +
          '<div class="yr-img-zoom-hint"><i class="ri-zoom-in-line"></i></div>' +
          '</div>';
      }).join('') +
      '</div>';
    panelsEl.appendChild(panel);
  });

  panelsEl.addEventListener('click', function (e) {
    const card = e.target.closest('.yr-img-card');
    if (!card) return;
    const yi = parseInt(card.dataset.yearIdx);
    const ii = parseInt(card.dataset.imgIdx);
    openLb(YEARS[yi].images, ii);
  });

  function switchYear(idx) {
    tabsEl.querySelectorAll('.year-tab').forEach(function (t, i) {
      t.classList.toggle('active', i === idx);
    });
    panelsEl.querySelectorAll('.year-panel').forEach(function (p, i) {
      if (i === idx) {
        p.style.display = 'block';
        void p.offsetWidth;
        p.classList.add('active');
      } else {
        p.classList.remove('active');
        p.style.display = 'none';
      }
    });
    tabsEl.querySelectorAll('.year-tab')[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  tabsEl.addEventListener('keydown', function (e) {
    const tabs = Array.from(tabsEl.querySelectorAll('.year-tab'));
    const cur = tabs.findIndex(function (t) { return t.classList.contains('active'); });
    if (e.key === 'ArrowRight' && cur < tabs.length - 1) switchYear(cur + 1);
    if (e.key === 'ArrowLeft' && cur > 0) switchYear(cur - 1);
  });
})();

/* MOBILE CAROUSEL ARROWS */
(function() {
  const whoGrid = document.getElementById('whoGrid');
  const whoPrev = document.getElementById('whoPrev');
  const whoNext = document.getElementById('whoNext');
  if(whoGrid && whoPrev && whoNext) {
    whoPrev.addEventListener('click', () => {
      const cardWidth = whoGrid.querySelector('.who-card').offsetWidth + 22;
      whoGrid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
    whoNext.addEventListener('click', () => {
      const cardWidth = whoGrid.querySelector('.who-card').offsetWidth + 22;
      whoGrid.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
  }

  const whyGrid = document.getElementById('whyGrid');
  const whyPrev = document.getElementById('whyPrev');
  const whyNext = document.getElementById('whyNext');
  if(whyGrid && whyPrev && whyNext) {
    whyPrev.addEventListener('click', () => {
      const cardWidth = whyGrid.querySelector('.why-card').offsetWidth + 18;
      whyGrid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
    whyNext.addEventListener('click', () => {
      const cardWidth = whyGrid.querySelector('.why-card').offsetWidth + 18;
      whyGrid.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
  }
})();
