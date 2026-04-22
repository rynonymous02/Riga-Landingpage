/* ============================================================
   GW Interior — Main Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ──────────────────────────────────────────
       1. CAROUSEL
    ────────────────────────────────────────── */
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    const SLIDE_INTERVAL = 5000;
    let intervalId;

    function showSlide(index) {
        if (index === currentSlide && slides[currentSlide].classList.contains('active')) return;

        // Freeze the outgoing slide's image at its current Ken-Burns position
        const prevSlide = slides[currentSlide];
        const prevImg = prevSlide ? prevSlide.querySelector('img') : null;
        if (prevImg) {
            const cs = window.getComputedStyle(prevImg);
            prevImg.style.transform = cs.transform || 'none';
            prevImg.style.transformOrigin = cs.transformOrigin || '';
            prevImg.style.transition = 'none';
        }

        prevSlide && prevSlide.classList.remove('active');
        dots[currentSlide] && dots[currentSlide].classList.remove('active');

        // Clean up stale inline styles after opacity transition
        if (prevImg) {
            setTimeout(() => {
                prevImg.style.transform = prevImg.style.transformOrigin = prevImg.style.transition = '';
            }, 1100);
        }

        // Restart Ken-Burns on the incoming image
        const img = slides[index].querySelector('img');
        if (img) {
            img.style.animation = 'none';
            img.offsetWidth; // force reflow
            img.style.animation = '';
        }

        slides[index].classList.add('active');
        dots[index] && dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() { showSlide((currentSlide + 1) % slides.length); }
    function prevSlide() { showSlide((currentSlide - 1 + slides.length) % slides.length); }
    function startSlideShow() { intervalId = setInterval(nextSlide, SLIDE_INTERVAL); }
    function stopSlideShow() { clearInterval(intervalId); }

    if (nextBtn) nextBtn.addEventListener('click', () => { stopSlideShow(); nextSlide(); startSlideShow(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopSlideShow(); prevSlide(); startSlideShow(); });

    dots.forEach((dot, i) => dot.addEventListener('click', () => {
        stopSlideShow(); showSlide(i); startSlideShow();
    }));

    // Initialise
    showSlide(0);
    startSlideShow();


    /* ──────────────────────────────────────────
       2. HEADER SCROLL EFFECT
    ────────────────────────────────────────── */
    const header = document.getElementById('mainHeader') || document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });


    /* ──────────────────────────────────────────
       3. MOBILE MENU
    ────────────────────────────────────────── */
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navEl = document.getElementById('mainNav') || document.querySelector('nav');

    if (mobileToggle && navEl) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navEl.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', isOpen);
            mobileToggle.classList.toggle('active', isOpen);
        });

        navEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            navEl.classList.remove('open');
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }));

        document.addEventListener('click', (e) => {
            if (!navEl.contains(e.target) && !mobileToggle.contains(e.target)) {
                navEl.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }


    /* ──────────────────────────────────────────
       4. SMOOTH SCROLL (anchor links)
    ────────────────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const id = link.getAttribute('href');
            const target = id && id !== '#' ? document.querySelector(id) : null;
            if (!target) return;
            e.preventDefault();
            const offset = (header ? header.offsetHeight : 76);
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });


    /* ──────────────────────────────────────────
       5. SCROLL INDICATOR FADE
    ────────────────────────────────────────── */
    const scrollInd = document.querySelector('.scroll-indicator');
    if (scrollInd) {
        window.addEventListener('scroll', () => {
            scrollInd.style.opacity = window.scrollY > 80 ? '0' : '1';
        }, { passive: true });
    }


    /* ──────────────────────────────────────────
       6. SECTION FADE-IN (IntersectionObserver)
    ────────────────────────────────────────── */
    const sectionObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            const hl = entry.target.querySelector('.highlight-title');
            if (hl) setTimeout(() => hl.classList.add('animate'), 300);
            sectionObs.unobserve(entry.target);
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.section').forEach(s => sectionObs.observe(s));


    /* ──────────────────────────────────────────
       7. STAGGERED CARD ANIMATIONS
    ────────────────────────────────────────── */
    const cardObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target
                .querySelectorAll('.service-card, .advantage-item, .testimonial-card, .process-step')
                .forEach((card, i) => setTimeout(() => card.classList.add('card-visible'), i * 80));
            cardObs.unobserve(entry.target);
        });
    }, { threshold: 0.08 });

    document.querySelectorAll(
        '.services-grid, .advantages-grid, .testimonial-grid, .process-steps'
    ).forEach(g => cardObs.observe(g));


    /* ──────────────────────────────────────────
       8. HERO STATS — ANIMATED NUMBER COUNTER
    ────────────────────────────────────────── */

    /**
     * Easing function: ease-out cubic
     */
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Animate a single stat element.
     * @param {HTMLElement} el    – the <strong> element
     * @param {number}  target   – final numeric value
     * @param {string}  suffix   – e.g. '+', '%', ' Tahun'
     * @param {number}  duration – ms (default 1800)
     */
    function animateCounter(el, target, suffix, duration) {
        duration = duration || 1800;

        // Determine a sensible starting value:
        // If target ≤ 20 start from 1, else start from ~2% of target (min 10)
        const startVal = target <= 20 ? 1 : Math.max(10, Math.round(target * 0.02));
        const range = target - startVal;

        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const current = Math.round(startVal + range * eased);

            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix; // ensure exact final value
            }
        }

        requestAnimationFrame(step);
    }

    /**
     * Parse a stat element's text to extract numeric value and suffix.
     * Handles: "500+", "100%", "5 Tahun"
     */
    function parseStatText(text) {
        text = text.trim();

        // Pattern: digits, then suffix
        const match = text.match(/^(\d+)(.*)$/);
        if (!match) return null;

        return {
            value: parseInt(match[1], 10),
            suffix: match[2] || ''          // e.g. '+', '%', ' Tahun'
        };
    }

    // Observe the hero-stats element so counters start when visible
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        let countersStarted = false;

        const statsObs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || countersStarted) return;
            countersStarted = true;

            heroStats.querySelectorAll('.stat-item strong').forEach(strong => {
                const parsed = parseStatText(strong.textContent);
                if (!parsed) return;

                // Stagger each counter slightly
                const delay = Array.from(heroStats.querySelectorAll('.stat-item strong'))
                    .indexOf(strong) * 120;

                setTimeout(() => animateCounter(strong, parsed.value, parsed.suffix), delay);
            });

            statsObs.disconnect();
        }, { threshold: 0.5 });

        statsObs.observe(heroStats);
    }


    /* ──────────────────────────────────────────
       DONE
    ────────────────────────────────────────── */
    console.log('GW Interior — script loaded ✓');
});