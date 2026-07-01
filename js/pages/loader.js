(function () {
  // show loader on first visit OR page refresh — skip on internal navigation
  var loader = document.getElementById('loader');
  var navType = (performance.getEntriesByType('navigation')[0] || {}).type;
  var isReload = navType === 'reload';
  var alreadyShown = sessionStorage.getItem('flLoaderShown');

  if (alreadyShown && !isReload) {
    if (loader) { loader.style.display = 'none'; }
    return;
  }

  // lock scroll immediately so the page content never shows through the loader
  document.documentElement.style.overflow = 'hidden';

  var liquid   = document.getElementById('liquid');
  var surface  = document.getElementById('surface');
  var swirl    = document.getElementById('swirl');
  var barFill  = document.getElementById('barFill');
  var pctText  = document.getElementById('pctText');
  var statusEl = document.getElementById('statusText');

  // cavity fill geometry — matches clipPath bottom & usable shoulder top
  var BOTTOM = 340;
  var TOP    = 138;
  var SPAN   = BOTTOM - TOP;

  var stages = [
    [0,   'Mixing the formula'],
    [30,  'Charging the bolt'],
    [62,  'Calibrating creative'],
    [88,  'Almost there'],
    [100, 'Ready']
  ];

  function setStatus(p) {
    var label = stages[0][1];
    for (var i = 0; i < stages.length; i++) {
      if (p >= stages[i][0]) label = stages[i][1];
    }
    statusEl.textContent = label;
  }

  function render(p) {
    var fillH = SPAN * (p / 100);
    var y = BOTTOM - fillH;
    liquid.setAttribute('y', y);
    liquid.setAttribute('height', fillH);
    surface.setAttribute('cy', y);
    swirl.setAttribute('cy', y + 40);
    surface.setAttribute('rx', 120);
    barFill.style.width = p + '%';
    pctText.textContent = Math.round(p) + '%';
    setStatus(p);
  }

  function run() {
    var p = 0, last = performance.now();
    function tick(now) {
      var dt = (now - last) / 1000;
      last = now;
      // fast early, slow approach to 100
      var speed = p < 80 ? 90 : 40;
      p = Math.min(100, p + speed * dt);
      render(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(function () {
          loader.classList.add('done');
          document.documentElement.style.overflow = '';
          sessionStorage.setItem('flLoaderShown', '1');
        }, 300);
      }
    }
    render(0);
    requestAnimationFrame(tick);
  }

  window.addEventListener('load', function () { setTimeout(run, 50); });
  if (document.readyState === 'complete') setTimeout(run, 50);
})();

