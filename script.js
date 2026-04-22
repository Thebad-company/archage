document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const navbar = document.getElementById('navbar');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealElements = [...document.querySelectorAll('.fade-in-premium, .reveal-left, .reveal-right, .reveal-image')];
    const heroRevealElements = [...document.querySelectorAll('.hero .reveal-text')];
    const parallaxElements = [...document.querySelectorAll('.parallax-shift')];
    const staggerGroups = document.querySelectorAll('.stagger-group');

    staggerGroups.forEach(group => {
        [...group.children].forEach((child, index) => {
            child.style.setProperty('--delay', `${index * 0.12}s`);
        });
    });

    const activateHero = () => {
        body.classList.add('is-loaded');
        heroRevealElements.forEach((el, index) => {
            window.setTimeout(() => el.classList.add('active'), 140 + (index * 150));
        });
    };

    if (prefersReducedMotion) {
        revealElements.forEach(el => el.classList.add('active'));
        heroRevealElements.forEach(el => el.classList.add('active'));
        activateHero();
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -5% 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    const updateNavbar = () => {
        // Navbar is now static dark as per user request
        // navbar.classList.toggle('scrolled', window.scrollY > 80);
    };

    const updateParallax = () => {
        const viewportHeight = window.innerHeight;

        parallaxElements.forEach(element => {
            const rect = element.parentElement.getBoundingClientRect();
            const speed = Number(element.dataset.parallaxSpeed || 0.16);
            const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
            const shiftY = progress * speed * -120;
            const scale = element.classList.contains('hero-bg') ? 1 + Math.max(0, 0.08 - Math.abs(progress) * 0.03) : 1.05;

            element.style.transform = `translate3d(0, ${shiftY}px, 0) scale(${scale})`;
        });
    };

    let ticking = false;
    const onScroll = () => {
        if (ticking) {
            return;
        }

        window.requestAnimationFrame(() => {
            updateNavbar();
            updateParallax();
            ticking = false;
        });

        ticking = true;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateParallax);

    // --- THEME SWITCHING LOGIC ---
    const themeButtons = document.querySelectorAll('.theme-btn');

    const themeColors = {
        'morning': 'radial-gradient(circle at center, #ffffff 0%, #e9eff5 100%)',
        'evening': 'radial-gradient(circle at center, #2c1810 0%, #160d09 100%)',
        'night': 'radial-gradient(circle at center, #0a0e14 0%, #020406 100%)'
    };

    const setTheme = (theme) => {
        if (body.getAttribute('data-theme') === theme) return;
        
        body.setAttribute('data-theme', theme);
        
        // Update active button
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.setTheme === theme);
        });

        // Update image sources
        const themeImages = {
            'theme-villa-ext': `assets/themes/villa_ext_${theme}.png`,
            'theme-villa-int': `assets/themes/villa_int_${theme}.png`,
            'theme-lake-pano-img': theme === 'morning' ? 'assets/morning-view.jpg' : `assets/themes/lake_${theme}.png`,
            'theme-pool': `assets/themes/pool_${theme}.png`,
            'theme-mist-phil': `assets/themes/mist_phil_${theme}.png`
        };

        Object.entries(themeImages).forEach(([className, src]) => {
            const imgs = document.querySelectorAll(`.${className}`);
            imgs.forEach(img => {
                img.src = src;
            });
        });
        
        // Store preference
        localStorage.setItem('preferred-theme', theme);
    };

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.setTheme);
        });
    });

    // Check for stored preference
    const storedTheme = localStorage.getItem('preferred-theme') || 'evening';
    setTheme(storedTheme);

    activateHero();
    updateNavbar();
    updateParallax();

    // --- MOBILE MENU ---
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close menu on link click
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle?.classList.remove('active');
                navLinks?.classList.remove('active');
            });
        });
    }

    // --- FORM HANDLING ---
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactForm.style.display = 'none';
            formSuccess.style.display = 'flex';
        });
    }
});
