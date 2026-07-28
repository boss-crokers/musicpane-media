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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Provide initial class to elements
    const elementsToAnimate = document.querySelectorAll('.hero-title, .hero-subtitle, .project-card, .about-split, .service-card, .contact-cta');

    elementsToAnimate.forEach(el => {
        el.classList.add('fade-up-element');
        observer.observe(el);
    });

    // Pull quote arrives a word at a time rather than as one block
    const quote = document.querySelector('.quote-text');

    if (quote) {
        if (prefersReducedMotion.matches) {
            quote.classList.add('fade-up-element');
        } else {
            const words = quote.textContent.trim().split(/\s+/);
            quote.textContent = '';

            words.forEach((word, i) => {
                const span = document.createElement('span');
                span.className = 'quote-word';
                span.style.setProperty('--word-index', i);
                span.textContent = word;
                quote.appendChild(span);
                // Real space between words so the quote still wraps naturally
                if (i < words.length - 1) quote.appendChild(document.createTextNode(' '));
            });

            quote.classList.add('quote-split');
        }

        observer.observe(quote);
    }

    // Scroll-spy: mark the nav link for whichever section owns the viewport middle
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length) {
        const setActive = (id) => {
            navLinks.forEach(link => {
                link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
            });
        };

        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

        sections.forEach(section => spy.observe(section));
    }

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
    const magneticItems = document.querySelectorAll('.magnetic-nav');


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

    // Fluid Chain Scroll Indicator
    // The chain is anchored to the viewport, so its links never move. Scrolling
    // down reveals more of it; scrolling back up un-reveals what you passed.
    const chainRail = document.querySelector('.chain-rail');
    const chainFill = document.querySelector('.chain-rail-fill');

    if (chainRail && chainFill) {
        const scroller = document.scrollingElement || document.documentElement;
        const reduceMotionRail = window.matchMedia('(prefers-reduced-motion: reduce)');

        let maxScroll = 1;
        let target = 0;   // 0..1 actual scroll progress
        let current = 0;  // 0..1 eased progress that is painted
        let rafId = null;

        // Sway: a hanging chain should lag behind the scroll and settle after it,
        // so scroll velocity kicks a damped spring rather than setting an angle.
        let sway = 0;
        let swayVelocity = 0;
        let lastPainted = 0;

        const measure = () => {
            maxScroll = Math.max(1, scroller.scrollHeight - window.innerHeight);
        };

        const readProgress = () => {
            target = Math.min(1, Math.max(0, scroller.scrollTop / maxScroll));
        };

        const paint = () => {
            // Ease toward the real position so the reveal feels fluid rather than stepped
            current += (target - current) * 0.18;
            if (Math.abs(target - current) < 0.0002) current = target;

            chainFill.style.setProperty('--chain-hidden', ((1 - current) * 100).toFixed(3) + '%');

            let swaySettled = true;

            if (!reduceMotionRail.matches) {
                const delta = current - lastPainted; // progress moved this frame
                lastPainted = current;

                // Kept deliberately tiny: the skew pivots at the top, so even a
                // fraction of a degree shifts the far end of the chain several px.
                // MAX_SWAY * tan() over one viewport must stay inside the rail's slack.
                const MAX_SWAY = 0.35;

                swayVelocity += delta * 3;            // scroll kicks the chain sideways
                swayVelocity += -sway * 0.1;          // spring pulling it back to plumb
                swayVelocity *= 0.82;                 // damping
                swayVelocity = Math.max(-0.18, Math.min(0.18, swayVelocity));
                sway = Math.max(-MAX_SWAY, Math.min(MAX_SWAY, sway + swayVelocity));

                chainFill.style.setProperty('--chain-sway', sway.toFixed(3) + 'deg');
                chainFill.style.setProperty('--chain-drift', (sway * -4).toFixed(2) + 'px');

                swaySettled = Math.abs(sway) < 0.002 && Math.abs(swayVelocity) < 0.002;
                if (swaySettled) {
                    sway = 0;
                    swayVelocity = 0;
                    chainFill.style.setProperty('--chain-sway', '0deg');
                    chainFill.style.setProperty('--chain-drift', '0px');
                }
            }

            if (current === target && swaySettled) {
                rafId = null;
            } else {
                rafId = requestAnimationFrame(paint);
            }
        };

        const schedule = () => {
            if (rafId === null) rafId = requestAnimationFrame(paint);
        };

        const onScroll = () => {
            readProgress();
            schedule();
        };

        // Grab the chain to scroll, the way you would drag a scrollbar thumb
        let dragging = false;

        const scrollToPointer = (clientY) => {
            const rect = chainRail.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
            scroller.scrollTop = ratio * maxScroll;
        };

        chainRail.addEventListener('pointerdown', (e) => {
            dragging = true;
            chainRail.classList.add('is-dragging');
            chainRail.setPointerCapture(e.pointerId);
            scrollToPointer(e.clientY);
            e.preventDefault();
        });

        chainRail.addEventListener('pointermove', (e) => {
            if (dragging) scrollToPointer(e.clientY);
        });

        const endDrag = (e) => {
            if (!dragging) return;
            dragging = false;
            chainRail.classList.remove('is-dragging');
            if (e && chainRail.hasPointerCapture(e.pointerId)) {
                chainRail.releasePointerCapture(e.pointerId);
            }
        };

        chainRail.addEventListener('pointerup', endDrag);
        chainRail.addEventListener('pointercancel', endDrag);

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => {
            measure();
            onScroll();
        });

        if ('ResizeObserver' in window) {
            new ResizeObserver(() => {
                measure();
                onScroll();
            }).observe(document.body);
        }

        measure();
        readProgress();
        current = target;
        lastPainted = target;
        chainFill.style.setProperty('--chain-hidden', ((1 - current) * 100).toFixed(3) + '%');
    }

    // Hero Wordmark: starts conjoined in the center, separates on load
    const wordmark = document.getElementById('hero-wordmark');

    if (wordmark) {
        const chars = Array.from(wordmark.querySelectorAll('.wm-char'));
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const separate = () => {
            if (reduceMotion) {
                wordmark.classList.remove('wm-preload');
                return;
            }

            // Measure the resting layout, then collapse every character onto the
            // horizontal center of the wordmark and let it spring back out.
            const bounds = wordmark.getBoundingClientRect();
            const centerX = bounds.left + bounds.width / 2;
            const middle = (chars.length - 1) / 2;

            const offsets = chars.map((char) => {
                const r = char.getBoundingClientRect();
                return centerX - (r.left + r.width / 2);
            });

            wordmark.classList.remove('wm-preload');

            chars.forEach((char, i) => {
                const dx = offsets[i];
                const distanceFromCenter = Math.abs(i - middle);

                char.animate(
                    [
                        {
                            offset: 0,
                            transform: `translateX(${dx.toFixed(2)}px) scaleY(0.94)`,
                            filter: 'blur(3px)',
                            opacity: 0.55,
                            easing: 'cubic-bezier(0.45, 0, 0.7, 0.9)'
                        },
                        {
                            // Brief hold while still conjoined, then it lets go
                            offset: 0.16,
                            transform: `translateX(${(dx * 0.9).toFixed(2)}px) scaleY(0.95)`,
                            filter: 'blur(2.5px)',
                            opacity: 0.72,
                            easing: 'cubic-bezier(0.22, 0.9, 0.3, 1)'
                        },
                        {
                            // Slight overshoot past the resting position
                            offset: 0.72,
                            transform: `translateX(${(dx * -0.05).toFixed(2)}px) scaleY(1.01)`,
                            filter: 'blur(0px)',
                            opacity: 1,
                            easing: 'cubic-bezier(0.33, 0, 0.68, 1)'
                        },
                        {
                            offset: 1,
                            transform: 'translateX(0px) scaleY(1)',
                            filter: 'blur(0px)',
                            opacity: 1
                        }
                    ],
                    {
                        duration: 1500 + distanceFromCenter * 140,
                        delay: 240 + distanceFromCenter * 70,
                        fill: 'backwards'
                    }
                );
            });
        };

        // Wait for the serif webfont so the measured offsets match the final glyphs
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(separate);
        } else {
            separate();
        }
    }

    // Avatar Coin Flip
    const heroCoin = document.getElementById('hero-coin');
    if (heroCoin) {
        let hasInteracted = false;

        heroCoin.addEventListener('click', () => {
            hasInteracted = true;
            heroCoin.classList.remove('hinting');
            const flipped = heroCoin.classList.toggle('flipped');
            heroCoin.setAttribute('aria-pressed', String(flipped));
        });

        // Nothing else signals that the monogram is interactive, so nudge it once
        // after the separation animation has settled.
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setTimeout(() => {
                if (hasInteracted) return;
                heroCoin.classList.add('hinting');
                heroCoin.addEventListener(
                    'animationend',
                    () => heroCoin.classList.remove('hinting'),
                    { once: true }
                );
            }, 3000);
        }
    }

    // Fluid Dark / Light Mode Switcher
    // The initial theme is resolved by the inline script in <head> so there is no
    // flash of the wrong theme; this only owns the toggle from here on.
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootEl = document.documentElement;

    if (themeToggleBtn) {
        const applyTheme = (dark) => {
            if (dark) {
                rootEl.setAttribute('data-theme', 'dark');
            } else {
                rootEl.removeAttribute('data-theme');
            }
            try {
                localStorage.setItem('theme', dark ? 'dark' : 'light');
            } catch (e) {
                /* storage blocked: the theme still applies for this session */
            }
        };

        themeToggleBtn.addEventListener('click', () => {
            const goingDark = rootEl.getAttribute('data-theme') !== 'dark';
            const canSweep = typeof document.startViewTransition === 'function'
                && !prefersReducedMotion.matches;

            if (!canSweep) {
                applyTheme(goingDark);
                return;
            }

            // Sweep outward from the button, sized to reach the farthest corner
            const rect = themeToggleBtn.getBoundingClientRect();
            const originX = rect.left + rect.width / 2;
            const originY = rect.top + rect.height / 2;
            const radius = Math.hypot(
                Math.max(originX, window.innerWidth - originX),
                Math.max(originY, window.innerHeight - originY)
            );

            rootEl.style.setProperty('--sweep-x', originX + 'px');
            rootEl.style.setProperty('--sweep-y', originY + 'px');
            rootEl.style.setProperty('--sweep-r', radius + 'px');
            rootEl.classList.add('theme-sweeping');

            const transition = document.startViewTransition(() => applyTheme(goingDark));
            transition.finished.finally(() => rootEl.classList.remove('theme-sweeping'));
        });
    }

    // Category Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const workSubsections = document.querySelectorAll('.work-subsection');

    // Label the filters from what is actually in the DOM, so the counts can never
    // drift out of sync with the work on the page.
    filterButtons.forEach(btn => {
        const label = btn.getAttribute('data-label');
        if (!label) return;

        const filterValue = btn.getAttribute('data-filter');
        const count = filterValue === 'all'
            ? document.querySelectorAll('.project-card[data-type]').length
            : document.querySelectorAll(`.project-card[data-type="${filterValue}"]`).length;

        btn.textContent = `${label} (${count})`;
    });

    // Matches the 0.4s transition on .work-subsection, and is cancelled on rapid
    // clicks so a section can't be hidden mid-fade by a stale timer.
    const HIDE_DELAY = 400;
    const hideTimers = new WeakMap();

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const filterValue = btn.getAttribute('data-filter');

            workSubsections.forEach(sec => {
                const category = sec.getAttribute('data-category');
                const shouldShow = filterValue === 'all' || filterValue === category;

                clearTimeout(hideTimers.get(sec));

                if (shouldShow) {
                    sec.style.display = 'block';
                    requestAnimationFrame(() => {
                        sec.style.opacity = '1';
                        sec.style.transform = 'translateY(0)';
                    });
                } else {
                    sec.style.opacity = '0';
                    sec.style.transform = 'translateY(10px)';
                    hideTimers.set(sec, setTimeout(() => {
                        sec.style.display = 'none';
                    }, HIDE_DELAY));
                }
            });
        });
    });
});

