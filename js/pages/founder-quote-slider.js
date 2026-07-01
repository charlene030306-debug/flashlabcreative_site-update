/* founder-quote-slider.js
   Animates the two founder quote cards on the homepage with a
   subtle fade-in on scroll (IntersectionObserver). No slider
   behaviour is needed since there are only two cards. */

(function () {
  'use strict';

  const section = document.getElementById('founderQuoteSlider');
  if (!section) return;

  const quotes = section.querySelectorAll('.founder-quote');
  if (!quotes.length) return;

  // Stagger the reveal of each quote card
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fq-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  quotes.forEach((q) => {
    q.classList.add('fq-hidden');
    observer.observe(q);
  });
})();
