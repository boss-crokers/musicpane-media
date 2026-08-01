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
    const elementsToAnimate = document.querySelectorAll('.hero-title, .hero-subtitle, .project-card, .about-split, .experience-item, .quote-text, .quote-author');
    
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
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootEl = document.documentElement;
    
    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isInitiallyDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    if (isInitiallyDark) {
        rootEl.setAttribute('data-theme', 'dark');
    } else {
        rootEl.removeAttribute('data-theme');
    }
    
    if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-pressed', String(isInitiallyDark));
        
        themeToggleBtn.addEventListener('click', () => {
            const isDark = rootEl.getAttribute('data-theme') === 'dark';
            if (isDark) {
                rootEl.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.setAttribute('aria-pressed', 'false');
            } else {
                rootEl.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.setAttribute('aria-pressed', 'true');
            }
        });
    }

    // Category Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const workSubsections = document.querySelectorAll('.work-subsection');

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
    const quoteForm = document.getElementById('quote-form');
    const modalBodyContent = document.getElementById('modal-body-content');
    const modalSuccessContent = document.getElementById('modal-success-content');
    const closeSuccessBtn = document.getElementById('close-success-btn');

    let previousActiveElement = null;

    function openModal() {
        if (quoteModal) {
            previousActiveElement = document.activeElement;
            quoteModal.showModal();
            quoteModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus the close button or first input inside the modal
            const closeBtn = quoteModal.querySelector('#close-quote-modal');
            if (closeBtn) {
                closeBtn.focus();
            }
        }
    }

    function closeModal() {
        if (quoteModal) {
            quoteModal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Restore focus
            if (previousActiveElement) {
                previousActiveElement.focus();
            }
            
            setTimeout(() => {
                quoteModal.close();
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
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);

    // Close when clicking on dialog backdrop natively
    if (quoteModal) {
        quoteModal.addEventListener('click', (e) => {
            if (e.target === quoteModal) {
                closeModal();
            }
        });
        
        // Handle native close event (e.g. if closed via Esc key by browser)
        quoteModal.addEventListener('cancel', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    if (quoteForm) {
        quoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = quoteForm.querySelector('.submit-quote-btn');
            const originalBtnHtml = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending...</span>';

            const formData = new FormData(quoteForm);
            
            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    if (modalBodyContent && modalSuccessContent) {
                        modalBodyContent.style.display = 'none';
                        modalSuccessContent.style.display = 'block';
                    }
                } else {
                    alert('Submission error: ' + (result.message || 'Please try again.'));
                }
            } catch (error) {
                console.error('Submission error:', error);
                alert('Network error. Please check your connection and try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        });
    }
});

