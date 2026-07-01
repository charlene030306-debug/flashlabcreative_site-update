/* ============================================================
   main.js — Shared entry point loaded by every page.
   Each module guards against missing elements so it is safe
   to load on all pages.
============================================================ */


/* ─────────────────────────────────────────────────────────────
   1. THEME TOGGLE
───────────────────────────────────────────────────────────── */
(function ()
{
    const toggle = document.getElementById('themeToggle');
    const icon   = document.getElementById('themeIcon');
    const html   = document.documentElement;
    const saved  = localStorage.getItem('flashlab-theme') || 'dark';
    html.setAttribute('data-theme', saved);

    function setIcon(t)
    {
        if (!icon) return;
        icon.className = t === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    }

    setIcon(saved);

    if (!toggle) return;

    toggle.addEventListener('click', () =>
    {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('flashlab-theme', next);
        setIcon(next);
        toggle.style.transform = 'rotate(360deg) scale(1.15)';
        setTimeout(() => toggle.style.transform = '', 400);
    });
})();


/* ─────────────────────────────────────────────────────────────
   2. DESKTOP DROPDOWN
───────────────────────────────────────────────────────────── */
(function ()
{
    const navItems = document.querySelectorAll('.nav-links > li');
    navItems.forEach(li =>
    {
        const sub = li.querySelector('ul');
        if (!sub) return;
        let hideTimer;
        li.addEventListener('mouseenter', () =>
        {
            clearTimeout(hideTimer);
            navItems.forEach(i => { if (i !== li) i.classList.remove('open'); });
            li.classList.add('open');
        });
        li.addEventListener('mouseleave', () =>
        {
            hideTimer = setTimeout(() => li.classList.remove('open'), 150);
        });
        sub.addEventListener('mouseenter', () => clearTimeout(hideTimer));
        sub.addEventListener('mouseleave', () =>
        {
            hideTimer = setTimeout(() => li.classList.remove('open'), 150);
        });
    });
    document.addEventListener('keydown', e =>
    {
        if (e.key === 'Escape') navItems.forEach(i => i.classList.remove('open'));
    });
})();


/* ─────────────────────────────────────────────────────────────
   3. NAVBAR SCROLL SHADOW
───────────────────────────────────────────────────────────── */
window.addEventListener('scroll', () =>
{
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });


/* ─────────────────────────────────────────────────────────────
   4. MOBILE MENU
───────────────────────────────────────────────────────────── */
(function ()
{
    const ham     = document.getElementById('hamburger');
    const menu    = document.getElementById('mobMenu');
    const overlay = document.getElementById('mobOverlay');
    const close   = document.getElementById('mobClose');
    if (!ham || !menu) return;

    function openMenu()
    {
        menu.classList.add('active');
        menu.setAttribute('aria-hidden', 'false');
        overlay.classList.add('active');
        ham.classList.add('open');
        ham.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu()
    {
        menu.classList.remove('active');
        menu.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('active');
        ham.classList.remove('open');
        ham.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    ham.addEventListener('click', openMenu);
    close.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    document.querySelectorAll('.mob-menu a').forEach(a =>
    {
        a.addEventListener('click', closeMenu);
    });

    document.querySelectorAll('.mob-parent-btn').forEach(btn =>
    {
        btn.addEventListener('click', function ()
        {
            const targetId = this.getAttribute('data-target');
            const sub      = document.getElementById(targetId);
            if (!sub) return;
            const isOpen = sub.classList.contains('open');
            document.querySelectorAll('.mob-sub').forEach(s => s.classList.remove('open'));
            document.querySelectorAll('.mob-parent-btn').forEach(b => b.classList.remove('open'));
            if (!isOpen)
            {
                sub.classList.add('open');
                this.classList.add('open');
            }
        });
    });
})();


/* ─────────────────────────────────────────────────────────────
   5. SCROLL REVEAL  (.reveal / .reveal-left / .reveal-right)
───────────────────────────────────────────────────────────── */
(function ()
{
    const obs = new IntersectionObserver(entries =>
    {
        entries.forEach(e =>
        {
            if (e.isIntersecting)
            {
                e.target.classList.add('active');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right')
            .forEach(el => obs.observe(el));
})();

/* SCROLL REVEAL  (.sr / .sr-l / .sr-r)  — portfolio page */
(function ()
{
    const els = document.querySelectorAll('.sr, .sr-l, .sr-r');
    if (!els.length) return;
    const io = new IntersectionObserver(entries =>
    {
        entries.forEach(e =>
        {
            if (e.isIntersecting)
            {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
})();


/* ─────────────────────────────────────────────────────────────
   6. BACK TO TOP
───────────────────────────────────────────────────────────── */
(function ()
{
    const btn = document.getElementById('backTop');
    if (!btn) return;
    window.addEventListener('scroll', () =>
    {
        btn.classList.toggle('active', window.scrollY > 400);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ─────────────────────────────────────────────────────────────
   7. SMOOTH SCROLL
───────────────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link =>
{
    link.addEventListener('click', function (e)
    {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target)
        {
            e.preventDefault();
            const navbarEl = document.getElementById('navbar');
            const offset   = navbarEl ? navbarEl.offsetTop + navbarEl.offsetHeight + 8 : 0;
            window.scrollTo({
                top: target.getBoundingClientRect().top + window.scrollY - offset,
                behavior: 'smooth'
            });
        }
    });
});


/* ─────────────────────────────────────────────────────────────
   8. ACTIVE NAV STATE
───────────────────────────────────────────────────────────── */
(function ()
{
    const PAGE_MAP =
    {
        'index'         : { top: 'index.html',        child: null },
        'about'         : { top: 'about.html',         child: null },
        'services'      : { top: 'services.html',      child: null },
        'portfolio'     : { top: 'portfolio.html',     child: null },
        'clients'       : { top: 'clients.html',       child: null },
        'case-studies'  : { top: 'case-studies.html',  child: null },
        'team'          : { top: 'team.html',           child: null },
        'career'        : { top: 'career.html',         child: null },
        'connect'       : { top: 'connect.html',        child: null },

        'digital-advertising'       : { top: 'services.html', child: 'digital-advertising.html' },
        'seo-sem-marketing'         : { top: 'services.html', child: 'seo-sem-marketing.html' },
        'social-media-management'   : { top: 'services.html', child: 'social-media-management.html' },
        'product-design-strategies' : { top: 'services.html', child: 'product-design-strategies.html' },
        'web-app-development'       : { top: 'services.html', child: 'web-app-development.html' },
        'outdoor-print-ads'         : { top: 'services.html', child: 'outdoor-print-ads.html' },
        'ecommerce'                 : { top: 'services.html', child: 'ecommerce.html' },
        'trademark-registration'    : { top: 'services.html', child: 'trademark-registration.html' },
        'photography-video'         : { top: 'services.html', child: 'photography-video.html' },
        'event-production'          : { top: 'services.html', child: 'event-production.html' },
        'media-consulting'          : { top: 'services.html', child: 'media-consulting.html' },
        'animation-motion'          : { top: 'services.html', child: 'animation-motion.html' },

        'story-1' : { top: 'case-studies.html', child: 'story-1.html' },
        'story-2' : { top: 'case-studies.html', child: 'story-2.html' },
        'story-3' : { top: 'case-studies.html', child: 'story-3.html' },
        'story-4' : { top: 'case-studies.html', child: 'story-4.html' },
        'story-5' : { top: 'case-studies.html', child: 'story-5.html' },
        'story-6' : { top: 'case-studies.html', child: 'story-6.html' },

        'career-intern'               : { top: 'career.html', child: 'career-intern.html' },
        'career-seo-expert'           : { top: 'career.html', child: 'career-seo-expert.html' },
        'career-social-media-manager' : { top: 'career.html', child: 'career-social-media-manager.html' },
        'career-graphic-designer'     : { top: 'career.html', child: 'career-graphic-designer.html' },
        'career-web-developer'        : { top: 'career.html', child: 'career-web-developer.html' },
        'career-animation-designer'   : { top: 'career.html', child: 'career-animation-designer.html' },
        'career-app-developer'        : { top: 'career.html', child: 'career-app-developer.html' },

        'career-join-fulltime'        : { top: 'career.html', child: 'join-fulltime.html' },
        'career-internship'           : { top: 'career.html', child: 'internship.html' },
        'career-hr-policy'            : { top: 'career.html', child: 'hr-policy.html' },
        'career-freelance'            : { top: 'career.html', child: 'freelance.html' },
        'career-influencer-signup'    : { top: 'career.html', child: 'influencer-signup.html' },
    };

    const page  = document.body.getAttribute('data-page');
    const entry = PAGE_MAP[page];
    if (!entry) return;

    function matchLink(selector, hrefTail)
    {
        return Array.from(document.querySelectorAll(selector)).find(a =>
        {
            const h = a.getAttribute('href') || '';
            return h === hrefTail || h.endsWith('/' + hrefTail);
        });
    }

    const topLink = matchLink('.nav-links > li > a', entry.top);
    if (topLink)
    {
        if (entry.child)
        {
            topLink.closest('li').classList.add('nav-parent-active');
        }
        else
        {
            topLink.classList.add('nav-active');
        }
    }

    if (entry.child)
    {
        const childLink = matchLink('.nav-links ul li a', entry.child);
        if (childLink) childLink.classList.add('nav-active');
    }

    const mobTop = matchLink('.mob-links > li > a', entry.top);
    if (mobTop && !entry.child) mobTop.classList.add('nav-active');

    if (entry.child)
    {
        const mobChild = matchLink('.mob-sub li a', entry.child);
        if (mobChild)
        {
            mobChild.classList.add('nav-active');
            const parentBtn = mobChild.closest('.mob-sub')?.previousElementSibling;
            if (parentBtn?.classList.contains('mob-parent-btn'))
            {
                parentBtn.classList.add('nav-parent-active');
            }
        }
    }
})();


/* ─────────────────────────────────────────────────────────────
   PORTFOLIO PAGE — unique functionality
   (filter tabs, counter animation, stagger cards)
───────────────────────────────────────────────────────────── */

/* COUNTER ANIMATION */
(function ()
{
    const counters = document.querySelectorAll('.stat-num[data-count]');
    if (!counters.length) return;
    const io = new IntersectionObserver(entries =>
    {
        entries.forEach(e =>
        {
            if (!e.isIntersecting) return;
            const el     = e.target;
            const target = +el.dataset.count;
            const suffix = target === 98 ? '%' : '+';
            const dur    = 1800;
            const start  = performance.now();
            function tick(now)
            {
                const p    = Math.min((now - start) / dur, 1);
                const ease = 1 - Math.pow(1 - p, 4);
                el.textContent = Math.floor(ease * target) + suffix;
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = target + suffix;
            }
            requestAnimationFrame(tick);
            io.unobserve(el);
        });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
})();

/* FILTER TABS & SHOW MORE/LESS pagination */
(function ()
{
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('#worksGrid .wcard');
    const showMoreWrap = document.getElementById('portShowMoreWrap');
    const showMoreBtn = document.getElementById('portShowMoreBtn');
    
    if (!btns.length || !cards.length) return;
    
    let expanded = false;
    
    function updateWorksGrid(animate = true) {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (!activeBtn) return;
        const filter = activeBtn.dataset.filter;
        
        let matchingIndex = 0;
        cards.forEach(card => {
            const cats = (card.dataset.cats || '').split(',');
            const isMatch = filter === 'all' || cats.includes(filter);
            
            if (isMatch) {
                const shouldDisplay = expanded || matchingIndex < 4;
                if (shouldDisplay) {
                    card.style.display = '';
                    if (animate) {
                        const inner = card.querySelector('.work-card');
                        if (inner) {
                            inner.style.animation = 'none';
                            inner.offsetHeight; // trigger reflow
                            inner.style.animation = `cardReveal .5s cubic-bezier(.22,1,.36,1) ${matchingIndex * 0.06}s both`;
                        }
                    }
                } else {
                    card.style.display = 'none';
                }
                matchingIndex++;
            } else {
                card.style.display = 'none';
            }
        });
        
        if (showMoreWrap && showMoreBtn) {
            if (matchingIndex > 4) {
                showMoreWrap.style.display = '';
                if (expanded) {
                    showMoreBtn.innerHTML = 'Show Less <i class="ri-arrow-up-s-line"></i>';
                } else {
                    showMoreBtn.innerHTML = 'Show More <i class="ri-arrow-down-s-line"></i>';
                }
            } else {
                showMoreWrap.style.display = 'none';
            }
        }
    }
    
    // Initial load
    updateWorksGrid(false);
    
    // Filter click handlers
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            expanded = false; // Reset expand state on filter switch
            updateWorksGrid(true);
        });
    });
    
    // Show More/Less toggle handler
    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', () => {
            expanded = !expanded;
            updateWorksGrid(false); // No need to re-trigger reveal stagger animation
            
            if (!expanded) {
                const grid = document.getElementById('worksGrid');
                if (grid) {
                    const y = grid.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }
        });
    }
})();

/* STAGGER CARDS */
(function ()
{
    const workCards = document.querySelectorAll('#worksGrid .work-card');
    if (!workCards.length) return;
    workCards.forEach((c, i) => { c.style.animationDelay = (i * 0.08) + 's'; });
    document.querySelectorAll('.founder-grid .f-card')
            .forEach((c, i) => { c.style.transitionDelay = (i * 0.1) + 's'; });
})();


/* ─────────────────────────────────────────────────────────────
   FOOTER — data-open-role links
   Sets sessionStorage so career.js can pre-select the panel.
───────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
    const link = e.target.closest('a[data-open-role]');
    if (!link) return;
    sessionStorage.setItem('openRole', link.dataset.openRole);
});


/* ─────────────────────────────────────────────────────────────
   MARQUEE — seamless infinite loop
   Clones all original items once, then measures the exact
   pixel width of set-A and writes it as --tw so the CSS
   keyframe translates by the perfect amount every cycle.
───────────────────────────────────────────────────────────── */
(function () {
    document.querySelectorAll('.marquee-track, .marquee-track-outer').forEach(function (track) {
        var originals = Array.from(track.children);
        if (!originals.length) return;

        originals.forEach(function (item) {
            var clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });

        requestAnimationFrame(function () {
            var items = track.children;
            var half  = originals.length;
            if (items.length < half * 2) return;
            var offset = Math.round(
                items[half].getBoundingClientRect().left -
                items[0].getBoundingClientRect().left
            );
            if (offset > 0) {
                track.style.setProperty('--tw', '-' + offset + 'px');
                // Proportional duration: keeps pixels-per-second identical on every page
                // 80 px/s ≈ the index page's speed (19 items × ~3200 px / 40 s)
                track.style.animationDuration = Math.round(offset / 80) + 's';
            }
        });
    });
})();
