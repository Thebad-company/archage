document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // --- CUSTOM CURSOR ---
    const dot = document.querySelector('.custom-cursor-dot');
    const outline = document.querySelector('.custom-cursor-outline');

    if (dot && outline) {
        window.addEventListener('mousemove', (e) => {
            const { clientX: x, clientY: y } = e;

            dot.style.opacity = '1';
            outline.style.opacity = '1';

            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;

            // Premium smooth follow for outline
            outline.animate({
                left: `${x}px`,
                top: `${y}px`
            }, { duration: 600, fill: 'forwards' });
        });

        const handleHover = () => outline.classList.add('hovered');
        const handleUnhover = () => outline.classList.remove('hovered');

        document.querySelectorAll('a, button, .theme-btn, .slider-dot, .nav-cta').forEach(el => {
            el.addEventListener('mouseenter', handleHover);
            el.addEventListener('mouseleave', handleUnhover);
        });

        window.addEventListener('mouseout', () => {
            dot.style.opacity = '0';
            outline.style.opacity = '0';
        });
    }
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
    const storedTheme = localStorage.getItem('preferred-theme') || 'morning';
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

    // --- LIVE OPEN-METEO AQI (FREE, NO API KEY) ---
    const calcAQI = (Cp) => {
        if (Cp < 0) return 0;
        if (Cp <= 12.0) return Math.round((50 - 0) / (12.0 - 0) * (Cp - 0) + 0);
        if (Cp <= 35.4) return Math.round((100 - 51) / (35.4 - 12.1) * (Cp - 12.1) + 51);
        if (Cp <= 55.4) return Math.round((150 - 101) / (55.4 - 35.5) * (Cp - 35.5) + 101);
        if (Cp <= 150.4) return Math.round((200 - 151) / (150.4 - 55.5) * (Cp - 55.5) + 151);
        if (Cp <= 250.4) return Math.round((300 - 201) / (250.4 - 150.5) * (Cp - 150.5) + 201);
        if (Cp <= 350.4) return Math.round((400 - 301) / (350.4 - 250.5) * (Cp - 250.5) + 301);
        if (Cp <= 500.4) return Math.round((500 - 401) / (500.4 - 350.5) * (Cp - 350.5) + 401);
        return 500;
    };

    const getAQIStatus = (aqi) => {
        if (aqi <= 60) return "Pure & Pristine";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy (Sensitive)";
        if (aqi <= 200) return "Unhealthy";
        if (aqi <= 300) return "Very Poor";
        return "Hazardous";
    };

    const fetchCityAQI = async (lat, lon, valueId, statusId, isCity) => {
        const valEl = document.getElementById(valueId);
        const statusEl = document.getElementById(statusId);

        if (!valEl || !statusEl) return;

        try {
            const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`);

            if (!res.ok) {
                throw new Error(`API returned status ${res.status}`);
            }

            const data = await res.json();

            if (!data.current || data.current.pm2_5 === undefined) {
                throw new Error('Invalid data format received');
            }

            const pm25 = data.current.pm2_5;
            const aqi = calcAQI(pm25);
            applyAQI(valEl, statusEl, aqi);

        } catch (err) {
            console.warn(`AQI Fetch Error for ${valueId} (${err.message}). Falling back to simulation.`);

            // Fallback to realistic simulation if API fails
            let fallbackAqi = 12; // Default Tehri
            if (isCity === 'delhi') fallbackAqi = Math.floor(Math.random() * (380 - 220) + 220);
            else if (isCity === 'gurugram') fallbackAqi = Math.floor(Math.random() * (450 - 300) + 300);
            else if (isCity === 'noida') fallbackAqi = Math.floor(Math.random() * (420 - 280) + 280);
            else if (isCity === 'bangalore') fallbackAqi = Math.floor(Math.random() * (160 - 90) + 90);

            applyAQI(valEl, statusEl, fallbackAqi);
        }
    };

    const applyAQI = (valEl, statusEl, aqi) => {
        valEl.style.opacity = 0;
        setTimeout(() => {
            valEl.innerText = aqi;
            statusEl.innerText = getAQIStatus(aqi);
            valEl.style.transition = 'opacity 1s ease';
            valEl.style.opacity = 1;

            if (aqi <= 60) valEl.style.color = '#4ade80';
            else if (aqi <= 100) valEl.style.color = '#facc15';
            else if (aqi <= 150) valEl.style.color = '#fb923c';
            else if (aqi <= 200) valEl.style.color = '#f87171';
            else valEl.style.color = '#b91c1c';
        }, 300);
    };

    const updateAQI = () => {
        fetchCityAQI(30.3844, 78.4800, 'aqi-tehri-value', 'aqi-tehri-status', 'tehri'); // Tehri
        fetchCityAQI(28.6139, 77.2090, 'aqi-delhi-value', 'aqi-delhi-status', 'delhi'); // Delhi
        fetchCityAQI(28.4595, 77.0266, 'aqi-gurugram-value', 'aqi-gurugram-status', 'gurugram'); // Gurugram
        fetchCityAQI(28.5355, 77.3910, 'aqi-noida-value', 'aqi-noida-status', 'noida'); // Noida, UP
        fetchCityAQI(12.9716, 77.5946, 'aqi-bangalore-value', 'aqi-bangalore-status', 'bangalore'); // Bangalore
    };

    const aqiSection = document.getElementById('aqi-comparison');
    if (aqiSection) {
        const aqiObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateAQI();
                aqiObserver.disconnect();
            }
        });
        aqiObserver.observe(aqiSection);
    }

    // --- THEME SHIFT POPUP ---
    const themePopup = document.getElementById('theme-popup');
    const popupClose = document.getElementById('theme-popup-close');
    const popupTitle = document.getElementById('theme-popup-title');

    if (themePopup && popupClose) {
        setTimeout(() => {
            if (!localStorage.getItem('theme-popup-seen')) {
                const currentTheme = body.getAttribute('data-theme') || 'morning';
                popupTitle.innerText = `Viewing in ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Mode`;
                themePopup.classList.add('show');
            }
        }, 3500); // Show popup after 3.5 seconds

        popupClose.addEventListener('click', () => {
            themePopup.classList.remove('show');
            localStorage.setItem('theme-popup-seen', 'true');
        });

        document.querySelectorAll('.theme-popup-actions button').forEach(btn => {
            btn.addEventListener('click', () => {
                setTheme(btn.dataset.popupTheme);
                themePopup.classList.remove('show');
                localStorage.setItem('theme-popup-seen', 'true');
            });
        });
    }
});
