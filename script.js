document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const navbar = document.getElementById('navbar');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealElements = [...document.querySelectorAll('.fade-in-premium, .reveal-left, .reveal-right')];
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
        return;
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
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
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

    activateHero();
    updateNavbar();
    updateParallax();
});
