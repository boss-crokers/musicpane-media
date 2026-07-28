document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Provide initial class to elements
    const elementsToAnimate = document.querySelectorAll('.hero-title, .hero-subtitle, .project-card, .about-split, .experience-item, .quote-text');
    
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-up-element');
        observer.observe(el);
    });

    // Custom Cursor Logic
    const ring = document.querySelector('.cursor-ring');
    const dot = document.querySelector('.cursor-dot');
    
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Dot follows instantly
        dot.style.left = mouseX + 'px';
        dot.style.top = mouseY + 'px';
    });

    // Smooth ring movement
    function animateCursor() {
        const easing = 0.15;
        ringX += (mouseX - ringX) * easing;
        ringY += (mouseY - ringY) * easing;
        
        ring.style.left = ringX + 'px';
        ring.style.top = ringY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover interactions
    const hoverTargets = document.querySelectorAll('a, button, .project-card');
    
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            ring.style.transform = 'translate(-50%, -50%) scale(2)';
            ring.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        target.addEventListener('mouseleave', () => {
            ring.style.transform = 'translate(-50%, -50%) scale(1)';
            ring.style.backgroundColor = 'transparent';
        });
    });

    // Magnetic Navigation Effect
    const magneticItems = document.querySelectorAll('.nav-links a, .nav-logo');
    
    magneticItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            item.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translate(0, 0)';
        });
    });

    // Avatar Coin Flip
    const heroCoin = document.getElementById('hero-coin');
    if (heroCoin) {
        heroCoin.addEventListener('click', () => {
            heroCoin.classList.toggle('flipped');
        });
    }

    // Fluid Dark / Light Mode Switcher
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootEl = document.documentElement;
    
    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        rootEl.setAttribute('data-theme', 'dark');
    } else {
        rootEl.removeAttribute('data-theme');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = rootEl.getAttribute('data-theme') === 'dark';
            if (isDark) {
                rootEl.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                rootEl.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Category Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const workSubsections = document.querySelectorAll('.work-subsection');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            workSubsections.forEach(sec => {
                const category = sec.getAttribute('data-category');
                if (filterValue === 'all' || filterValue === category) {
                    sec.style.display = 'block';
                    setTimeout(() => {
                        sec.style.opacity = '1';
                        sec.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    sec.style.opacity = '0';
                    sec.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        sec.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Quote Modal Interactive Controller
    const quoteModal = document.getElementById('quote-modal');
    const openQuoteBtn = document.getElementById('open-quote-modal');
    const heroQuoteBtn = document.getElementById('hero-quote-btn');
    const closeQuoteBtn = document.getElementById('close-quote-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const quoteForm = document.getElementById('quote-form');
    const modalBodyContent = document.getElementById('modal-body-content');
    const modalSuccessContent = document.getElementById('modal-success-content');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    function openModal() {
        if (quoteModal) {
            quoteModal.classList.add('active');
            quoteModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (quoteModal) {
            quoteModal.classList.remove('active');
            quoteModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (modalBodyContent && modalSuccessContent) {
                    modalBodyContent.style.display = 'block';
                    modalSuccessContent.style.display = 'none';
                    if (quoteForm) quoteForm.reset();
                }
            }, 400);
        }
    }

    if (openQuoteBtn) openQuoteBtn.addEventListener('click', openModal);
    if (heroQuoteBtn) heroQuoteBtn.addEventListener('click', openModal);
    if (closeQuoteBtn) closeQuoteBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quoteModal && quoteModal.classList.contains('active')) {
            closeModal();
        }
    });

    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (modalBodyContent && modalSuccessContent) {
                modalBodyContent.style.display = 'none';
                modalSuccessContent.style.display = 'block';
            }
        });
    }
});

