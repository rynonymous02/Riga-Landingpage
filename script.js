// Carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentSlide = 0;
    const slideInterval = 5000; // 5 detik
    let intervalId;

    // Function to show a specific slide
    // Start with no slide active so the first showSlide triggers animation
    let initial = true;
    function showSlide(index) {
        // If requested slide is already active and not initial call, do nothing.
        if (!initial && index === currentSlide) return;

        // Remove active class from previous slide and dot only (if any)
        if (!initial) {
            const prevSlide = slides[currentSlide];
            const prevImg = prevSlide.querySelector('img');
            // Capture current computed transform so the image doesn't snap back
            // to its original state when we remove the .active class.
            if (prevImg) {
                const cs = window.getComputedStyle(prevImg);
                const currentTransform = cs.transform || cs.webkitTransform || 'none';
                const currentTransformOrigin = cs.transformOrigin || cs.webkitTransformOrigin || '';
                // Apply the computed transform and transform-origin inline to preserve visual state
                prevImg.style.transform = currentTransform;
                prevImg.style.transformOrigin = currentTransformOrigin;
                // Also ensure transitions on transform don't override the preserved state
                prevImg.style.transition = 'none';
            }

            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');

            // After the opacity transition (1s), remove the inline transform and transition
            // so the DOM doesn't keep stale inline styles. Use a small buffer.
            (function(img) {
                setTimeout(() => {
                    if (img) {
                        // Only clear if it still has the inline transform/transformOrigin we applied
                        img.style.transform = '';
                        img.style.transformOrigin = '';
                        img.style.transition = '';
                    }
                }, 1100);
            })(prevImg);
        }

        // Restart Ken Burns animation on the incoming slide's image so it runs
        // each time the slide becomes active.
        const img = slides[index].querySelector('img');
        if (img) {
            // Remove inline animation to reset, force reflow, then let CSS rule run
            img.style.animation = 'none';
            // Force reflow
            // eslint-disable-next-line no-unused-expressions
            img.offsetWidth;
            img.style.animation = '';
        }

        // Add active class to new slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');

        currentSlide = index;
        initial = false;
    }

    // Function to go to next slide
    function nextSlide() {
        let nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }

    // Function to go to previous slide
    function prevSlide() {
        let prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }

    // Function to start the automatic slideshow
    function startSlideShow() {
        intervalId = setInterval(nextSlide, slideInterval);
    }

    // Function to stop the automatic slideshow
    function stopSlideShow() {
        clearInterval(intervalId);
    }

    // Event listeners for buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            stopSlideShow();
            nextSlide();
            startSlideShow();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            stopSlideShow();
            prevSlide();
            startSlideShow();
        });
    }

    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            stopSlideShow();
            showSlide(index);
            startSlideShow();
        });
    });

    // Initialize first slide so its Ken Burns animation starts, then start slideshow
    currentSlide = -1; // so showSlide(0) is treated as a new activation
    showSlide(0);
    startSlideShow();

    // Header scroll effect: toggle .scrolled class
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (!header) return;
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply smooth scrolling to anchor links
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Calculate offset for fixed header
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Also handle other anchor links (like the "Lihat Produk" button in hero section)
    const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    allAnchorLinks.forEach(link => {
        // Skip if already handled by navLinks
        if (!link.closest('nav')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    // Calculate offset for fixed header
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    });

    // Initialize any other interactive elements
    console.log('Website Riga Jaya Malang telah dimuat');

    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navEl = document.querySelector('nav');
    if (mobileToggle && navEl) {
        mobileToggle.addEventListener('click', function(e) {
            const isOpen = navEl.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close nav when clicking a link
        navEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            navEl.classList.remove('open');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }));

        // Close on outside click
        document.addEventListener('click', (ev) => {
            if (!navEl.contains(ev.target) && !mobileToggle.contains(ev.target)) {
                navEl.classList.remove('open');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Scroll animation functionality
    const sections = document.querySelectorAll('.section');
    const productsSection = document.getElementById('products');
    const titles = document.querySelectorAll('.highlight-title');

    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
            rect.bottom >= 0
        );
    }

    // Function to handle scroll animations
    function handleScrollAnimations() {
        // Section fade-in animations
        sections.forEach(section => {
            if (isInViewport(section)) {
                section.classList.add('visible');
            }
        });

        // Special animation for products section
        if (productsSection && isInViewport(productsSection)) {
            productsSection.classList.add('animate');
        }

        // Title highlight animations
        titles.forEach(title => {
            if (isInViewport(title) && !title.classList.contains('animate')) {
                // Small delay to ensure section is visible first
                setTimeout(() => {
                    title.classList.add('animate');
                }, 300);
            }
        });
    }

    // Initial check in case sections are already in view
    handleScrollAnimations();

    // Add scroll event listener
    window.addEventListener('scroll', handleScrollAnimations);
});
