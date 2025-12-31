// ============================================
// Theme Toggle
// ============================================

(function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
})();

// ============================================
// Mobile Navigation
// ============================================

(function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            });
        });
    }
})();

// ============================================
// Smooth Scrolling
// ============================================

(function initSmoothScroll() {
    // Add smooth scrolling CSS
    const style = document.createElement('style');
    style.textContent = `
        html {
            scroll-behavior: smooth;
        }
        @media (prefers-reduced-motion: reduce) {
            html {
                scroll-behavior: auto;
            }
        }
    `;
    document.head.appendChild(style);
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#!') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const header = document.querySelector('.header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                    
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
})();

// ============================================
// Scroll Reveal Animation
// ============================================

(function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
        return;
    }
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ============================================
// Active Section Highlighting
// ============================================

(function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    function updateActiveSection() {
        const scrollPosition = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    if (!prefersReducedMotion) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveSection();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    updateActiveSection();
})();

// ============================================
// Back to Top Button
// ============================================

(function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    function toggleButton() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', toggleButton);
    toggleButton();
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();

// ============================================
// Parallax Effect (Subtle)
// ============================================

(function initParallax() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                if (scrolled < window.innerHeight) {
                    heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
})();

// ============================================
// Portfolio Filter
// ============================================

(function initPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const workCards = document.querySelectorAll('.work-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            
            // Filter cards with animation
            workCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                const shouldShow = filter === 'all' || categories.includes(filter);
                
                if (shouldShow) {
                    card.classList.remove('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });
})();

// ============================================
// Testimonials Slider
// ============================================

(function initTestimonialsSlider() {
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    const slides = document.querySelectorAll('.testimonial-slide');
    const dotsContainer = document.getElementById('testimonialsDots');
    
    if (!track || !slides.length) return;
    
    let currentIndex = 0;
    
    // Get container width for calculations
    const sliderContainer = track.parentElement;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'testimonial-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.testimonial-dot');
    
    function updateSlider() {
        // Each slide is 100% of container width, so move by currentIndex * 100% of container
        const containerWidth = sliderContainer.offsetWidth;
        const translateX = -(currentIndex * containerWidth);
        track.style.transform = `translateX(${translateX}px)`;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Recalculate on window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateSlider, 100);
    });
    
    // Initialize first slide
    updateSlider();
    
    function goToSlide(index) {
        currentIndex = index;
        if (currentIndex < 0) currentIndex = slides.length - 1;
        if (currentIndex >= slides.length) currentIndex = 0;
        updateSlider();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Auto-play (optional, can be disabled)
    // setInterval(nextSlide, 5000);
})();

// ============================================
// Pricing Calculator
// ============================================

(function initPricingCalculator() {
    const platformSelect = document.getElementById('calcPlatform');
    const pagesInput = document.getElementById('calcPages');
    const urgencySelect = document.getElementById('calcUrgency');
    const integrationsSelect = document.getElementById('calcIntegrations');
    const maintenanceCheckbox = document.getElementById('calcMaintenance');
    const recommendationEl = document.getElementById('calcRecommendation');
    const breakdownEl = document.getElementById('calcBreakdown');
    
    if (!pagesInput || !urgencySelect || !integrationsSelect) return;
    
    function calculatePrice() {
        const platform = platformSelect.value;
        const pages = parseInt(pagesInput.value) || 5;
        const urgency = urgencySelect.value;
        const integrations = integrationsSelect.value;
        const includeMaintenance = maintenanceCheckbox.checked;
        
        // Base pricing logic for small businesses
        let basePrice = 0;
        let plan = 'Essential';
        
        // HTML sites (1-3 pages)
        if (platform === 'html' && pages <= 3) {
            basePrice = 2000;
            plan = 'Essential';
        }
        // WordPress/Shopify (up to 8 pages)
        else if ((platform === 'wordpress' || platform === 'shopify') && pages <= 8) {
            basePrice = 5000;
            plan = 'Professional';
            // Adjust for Shopify (slightly more)
            if (platform === 'shopify') {
                basePrice += 500;
            }
        }
        // Larger sites (up to 15 pages)
        else if (pages <= 15) {
            basePrice = 8000;
            plan = 'Complete';
            if (platform === 'shopify') {
                basePrice += 1000;
            }
        }
        // Very large sites (15+ pages)
        else {
            basePrice = 8000 + ((pages - 15) * 300);
            plan = 'Complete';
            if (platform === 'shopify') {
                basePrice += 1000;
            }
        }
        
        // Adjust for urgency
        let urgencyMultiplier = 1;
        if (urgency === 'rush') urgencyMultiplier = 1.25;
        else if (urgency === 'flexible') urgencyMultiplier = 0.95;
        
        // Adjust for integrations
        if (integrations === 'basic') {
            basePrice += 300;
        } else if (integrations === 'advanced') {
            basePrice += 1000;
            if (plan === 'Essential') plan = 'Professional';
        }
        
        // Calculate final price before discount
        const priceBeforeDiscount = Math.round(basePrice * urgencyMultiplier);
        const minPriceBeforeDiscount = Math.round(priceBeforeDiscount * 0.8);
        const maxPriceBeforeDiscount = Math.round(priceBeforeDiscount * 1.2);
        
        // Apply maintenance discount (15% discount)
        let finalMinPrice = minPriceBeforeDiscount;
        let finalMaxPrice = maxPriceBeforeDiscount;
        let discountAmount = 0;
        
        if (includeMaintenance) {
            discountAmount = Math.round(priceBeforeDiscount * 0.15);
            finalMinPrice = Math.round(minPriceBeforeDiscount * 0.85);
            finalMaxPrice = Math.round(maxPriceBeforeDiscount * 0.85);
        }
        
        // Update recommendation
        recommendationEl.innerHTML = `Recommended: <strong>${plan}</strong>`;
        
        // Update pricing breakdown
        if (includeMaintenance && discountAmount > 0) {
            breakdownEl.innerHTML = `
                <p class="calculator-original-price">Original: $${minPriceBeforeDiscount.toLocaleString()} - $${maxPriceBeforeDiscount.toLocaleString()}</p>
                <p class="calculator-discount">Discount: -$${discountAmount.toLocaleString()}</p>
                <p class="calculator-range">Estimated range: $${finalMinPrice.toLocaleString()} - $${finalMaxPrice.toLocaleString()}</p>
            `;
        } else {
            breakdownEl.innerHTML = `
                <p class="calculator-range">Estimated range: $${finalMinPrice.toLocaleString()} - $${finalMaxPrice.toLocaleString()}</p>
            `;
        }
    }
    
    platformSelect.addEventListener('change', calculatePrice);
    pagesInput.addEventListener('input', calculatePrice);
    urgencySelect.addEventListener('change', calculatePrice);
    integrationsSelect.addEventListener('change', calculatePrice);
    maintenanceCheckbox.addEventListener('change', calculatePrice);
    
    calculatePrice();
})();

// ============================================
// Site Health Demo
// ============================================

(function initSiteHealthDemo() {
    const metrics = document.querySelectorAll('.health-metric-fill');
    const values = document.querySelectorAll('.health-metric-value');
    
    if (!metrics.length) return;
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 0 : 2000;
    
    function animateMetric(metric, valueEl) {
        const target = parseFloat(metric.getAttribute('data-target'));
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = target * easeOut;
            
            metric.style.width = `${currentValue}%`;
            
            if (target >= 100) {
                valueEl.textContent = Math.round(currentValue);
            } else {
                valueEl.textContent = currentValue.toFixed(1);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                metric.style.width = `${target}%`;
                if (target >= 100) {
                    valueEl.textContent = Math.round(target);
                } else {
                    valueEl.textContent = target.toFixed(1);
                }
            }
        }
        
        if (prefersReducedMotion) {
            metric.style.width = `${target}%`;
            if (target >= 100) {
                valueEl.textContent = Math.round(target);
            } else {
                valueEl.textContent = target.toFixed(1);
            }
        } else {
            update();
        }
    }
    
    // Trigger animation when section is visible
    const healthSection = document.querySelector('.health-demo');
    if (healthSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    metrics.forEach((metric, index) => {
                        setTimeout(() => {
                            animateMetric(metric, values[index]);
                        }, index * 200);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(healthSection);
    }
})();

// ============================================
// FAQ Accordion
// ============================================

(function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.closest('.faq-item');
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other items
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.setAttribute('aria-expanded', 'false');
                    q.closest('.faq-item').classList.remove('active');
                }
            });
            
            // Toggle current item
            question.setAttribute('aria-expanded', !isExpanded);
            faqItem.classList.toggle('active', !isExpanded);
        });
    });
})();

// ============================================
// Contact Form Validation
// ============================================

(function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const websiteInput = document.getElementById('website');
    const messageInput = document.getElementById('message');
    
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const websiteError = document.getElementById('websiteError');
    const messageError = document.getElementById('messageError');
    
    function validateName() {
        const value = nameInput.value.trim();
        if (!value) {
            nameError.textContent = 'Name is required';
            nameInput.classList.add('error');
            return false;
        }
        if (value.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters';
            nameInput.classList.add('error');
            return false;
        }
        nameError.textContent = '';
        nameInput.classList.remove('error');
        return true;
    }
    
    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            emailError.textContent = 'Email is required';
            emailInput.classList.add('error');
            return false;
        }
        if (!emailRegex.test(value)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.classList.add('error');
            return false;
        }
        emailError.textContent = '';
        emailInput.classList.remove('error');
        return true;
    }
    
    function validateWebsite() {
        const value = websiteInput.value.trim();
        if (value) {
            try {
                new URL(value);
                websiteError.textContent = '';
                websiteInput.classList.remove('error');
                return true;
            } catch {
                websiteError.textContent = 'Please enter a valid URL';
                websiteInput.classList.add('error');
                return false;
            }
        }
        websiteError.textContent = '';
        websiteInput.classList.remove('error');
        return true;
    }
    
    function validateMessage() {
        const value = messageInput.value.trim();
        if (!value) {
            messageError.textContent = 'Message is required';
            messageInput.classList.add('error');
            return false;
        }
        if (value.length < 10) {
            messageError.textContent = 'Message must be at least 10 characters';
            messageInput.classList.add('error');
            return false;
        }
        messageError.textContent = '';
        messageInput.classList.remove('error');
        return true;
    }
    
    // Remove error class on input
    nameInput.addEventListener('input', () => {
        if (nameInput.classList.contains('error')) {
            nameInput.classList.remove('error');
            nameError.textContent = '';
        }
    });
    
    emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('error')) {
            emailInput.classList.remove('error');
            emailError.textContent = '';
        }
    });
    
    websiteInput.addEventListener('input', () => {
        if (websiteInput.classList.contains('error')) {
            websiteInput.classList.remove('error');
            websiteError.textContent = '';
        }
    });
    
    messageInput.addEventListener('input', () => {
        if (messageInput.classList.contains('error')) {
            messageInput.classList.remove('error');
            messageError.textContent = '';
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isWebsiteValid = validateWebsite();
        const isMessageValid = validateMessage();
        
        if (isNameValid && isEmailValid && isWebsiteValid && isMessageValid) {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Submit to Netlify
            const formData = new FormData(form);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                submitBtn.textContent = 'Message sent!';
                form.reset();
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            })
            .catch((error) => {
                console.error('Form submission error:', error);
                submitBtn.textContent = 'Error sending message';
                
                // Fallback to mailto
                const subject = encodeURIComponent('New Contact Form Submission');
                const body = encodeURIComponent(
                    `Name: ${nameInput.value.trim()}\n` +
                    `Email: ${emailInput.value.trim()}\n` +
                    `Website: ${websiteInput.value.trim() || 'N/A'}\n` +
                    `Budget: ${document.getElementById('budget').value || 'Not specified'}\n` +
                    `Timeline: ${document.getElementById('timeline').value || 'Not specified'}\n\n` +
                    `Message:\n${messageInput.value.trim()}`
                );
                window.location.href = `mailto:hello@justaweb.agency?subject=${subject}&body=${body}`;
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            });
        } else {
            // Focus first invalid field
            if (!isNameValid) nameInput.focus();
            else if (!isEmailValid) emailInput.focus();
            else if (!isWebsiteValid) websiteInput.focus();
            else if (!isMessageValid) messageInput.focus();
        }
    });
})();

// ============================================
// Copy Email Functionality
// ============================================

(function initCopyEmail() {
    const emailLink = document.getElementById('contactEmail');
    const copyBtn = emailLink?.querySelector('.contact-copy');
    
    if (!copyBtn) return;
    
    copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const email = 'hello@justaweb.agency';
        navigator.clipboard.writeText(email).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = 'var(--color-success)';
            copyBtn.style.color = 'white';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = email;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        });
    });
})();

// ============================================
// Lead Magnet Modal
// ============================================

(function initLeadMagnet() {
    const modal = document.getElementById('leadMagnetModal');
    const openBtn = document.getElementById('leadMagnetBtn');
    const closeBtn = document.getElementById('leadMagnetClose');
    const form = document.getElementById('leadMagnetForm');
    
    if (!modal || !openBtn) return;
    
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.getElementById('leadName').focus();
    }
    
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    if (modal.querySelector('.modal-overlay')) {
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    }
    
    // Form validation
    if (form) {
        const nameInput = document.getElementById('leadName');
        const emailInput = document.getElementById('leadEmail');
        const websiteInput = document.getElementById('leadWebsite');
        
        const nameError = document.getElementById('leadNameError');
        const emailError = document.getElementById('leadEmailError');
        const websiteError = document.getElementById('leadWebsiteError');
        
        function validateLeadName() {
            const value = nameInput.value.trim();
            if (!value) {
                nameError.textContent = 'Name is required';
                nameInput.classList.add('error');
                return false;
            }
            nameError.textContent = '';
            nameInput.classList.remove('error');
            return true;
        }
        
        function validateLeadEmail() {
            const value = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                emailError.textContent = 'Email is required';
                emailInput.classList.add('error');
                return false;
            }
            if (!emailRegex.test(value)) {
                emailError.textContent = 'Please enter a valid email address';
                emailInput.classList.add('error');
                return false;
            }
            emailError.textContent = '';
            emailInput.classList.remove('error');
            return true;
        }
        
        function validateLeadWebsite() {
            const value = websiteInput.value.trim();
            if (!value) {
                websiteError.textContent = 'Website URL is required';
                websiteInput.classList.add('error');
                return false;
            }
            try {
                new URL(value);
                websiteError.textContent = '';
                websiteInput.classList.remove('error');
                return true;
            } catch {
                websiteError.textContent = 'Please enter a valid URL';
                websiteInput.classList.add('error');
                return false;
            }
        }
        
        // Remove error class on input
        nameInput.addEventListener('input', () => {
            if (nameInput.classList.contains('error')) {
                nameInput.classList.remove('error');
                nameError.textContent = '';
            }
        });
        
        emailInput.addEventListener('input', () => {
            if (emailInput.classList.contains('error')) {
                emailInput.classList.remove('error');
                emailError.textContent = '';
            }
        });
        
        websiteInput.addEventListener('input', () => {
            if (websiteInput.classList.contains('error')) {
                websiteInput.classList.remove('error');
                websiteError.textContent = '';
            }
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const isNameValid = validateLeadName();
            const isEmailValid = validateLeadEmail();
            const isWebsiteValid = validateLeadWebsite();
            
            if (isNameValid && isEmailValid && isWebsiteValid) {
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Submitting...';
                submitBtn.disabled = true;
                
                // Submit to Netlify
                const formData = new FormData(form);
                
                fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                })
                .then(() => {
                    submitBtn.textContent = 'Submitted!';
                    form.reset();
                    closeModal();
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                })
                .catch((error) => {
                    console.error('Form submission error:', error);
                    submitBtn.textContent = 'Error submitting';
                    
                    // Fallback to mailto
                    const subject = encodeURIComponent('Free Homepage Teardown Request');
                    const body = encodeURIComponent(
                        `Name: ${nameInput.value.trim()}\n` +
                        `Email: ${emailInput.value.trim()}\n` +
                        `Website: ${websiteInput.value.trim()}`
                    );
                    window.location.href = `mailto:hello@justaweb.agency?subject=${subject}&body=${body}`;
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                });
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
})();

// ============================================
// Command Palette
// ============================================

(function initCommandPalette() {
    const palette = document.getElementById('commandPalette');
    const input = document.getElementById('commandInput');
    const results = document.getElementById('commandResults');
    
    if (!palette || !input || !results) return;
    
    const commands = [
        { id: 'hero', label: 'Go to Hero', icon: '🏠', action: () => scrollToSection('hero') },
        { id: 'work', label: 'Go to Work', icon: '💼', action: () => scrollToSection('work') },
        { id: 'services', label: 'Go to Services', icon: '⚙️', action: () => scrollToSection('services') },
        { id: 'process', label: 'Go to Process', icon: '🔄', action: () => scrollToSection('process') },
        { id: 'pricing', label: 'Go to Pricing', icon: '💰', action: () => scrollToSection('pricing') },
        { id: 'faq', label: 'Go to FAQ', icon: '❓', action: () => scrollToSection('faq') },
        { id: 'contact', label: 'Go to Contact', icon: '📧', action: () => scrollToSection('contact') },
        { id: 'theme', label: 'Toggle Theme', icon: '🌓', action: () => document.getElementById('themeToggle')?.click() },
        { id: 'email', label: 'Copy Email', icon: '📋', action: () => document.querySelector('.contact-copy')?.click() },
        { id: 'teardown', label: 'Free Teardown', icon: '🎁', action: () => document.getElementById('leadMagnetBtn')?.click() }
    ];
    
    let selectedIndex = 0;
    
    function scrollToSection(id) {
        const section = document.getElementById(id);
        if (section) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = section.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            closePalette();
        }
    }
    
    function openPalette() {
        palette.classList.add('active');
        palette.setAttribute('aria-hidden', 'false');
        input.value = '';
        input.focus();
        updateResults('');
        document.body.style.overflow = 'hidden';
    }
    
    function closePalette() {
        palette.classList.remove('active');
        palette.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        selectedIndex = 0;
    }
    
    function updateResults(query) {
        const queryLower = query.toLowerCase();
        const filtered = commands.filter(cmd => 
            cmd.label.toLowerCase().includes(queryLower) || 
            cmd.id.toLowerCase().includes(queryLower)
        );
        
        results.innerHTML = '';
        selectedIndex = 0;
        
        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'command-palette-item';
            noResults.textContent = 'No results found';
            results.appendChild(noResults);
            return;
        }
        
        filtered.forEach((cmd, index) => {
            const item = document.createElement('div');
            item.className = 'command-palette-item';
            if (index === 0) item.classList.add('selected');
            item.innerHTML = `
                <span class="command-palette-item-icon">${cmd.icon}</span>
                <span class="command-palette-item-text">${cmd.label}</span>
            `;
            item.addEventListener('click', () => {
                cmd.action();
            });
            results.appendChild(item);
        });
    }
    
    function selectItem(index) {
        const items = results.querySelectorAll('.command-palette-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
    }
    
    function executeSelected() {
        const items = results.querySelectorAll('.command-palette-item');
        const selected = items[selectedIndex];
        if (selected && selected.textContent !== 'No results found') {
            const queryLower = input.value.toLowerCase();
            const filtered = commands.filter(cmd => 
                cmd.label.toLowerCase().includes(queryLower) || 
                cmd.id.toLowerCase().includes(queryLower)
            );
            if (filtered[selectedIndex]) {
                filtered[selectedIndex].action();
            }
        }
    }
    
    input.addEventListener('input', (e) => {
        updateResults(e.target.value);
    });
    
    input.addEventListener('keydown', (e) => {
        const items = results.querySelectorAll('.command-palette-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            selectItem(selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            selectItem(selectedIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeSelected();
        } else if (e.key === 'Escape') {
            closePalette();
        }
    });
    
    if (palette.querySelector('.command-palette-overlay')) {
        palette.querySelector('.command-palette-overlay').addEventListener('click', closePalette);
    }
    
    // Open with Cmd/Ctrl + K
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (palette.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
        }
    });
})();

// ============================================
// Focus Management for Accessibility
// ============================================

(function initFocusManagement() {
    // Add focus-visible polyfill behavior
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Improve focus styles
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-navigation *:focus {
            outline: 2px solid var(--color-accent);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
})();

// ============================================
// Contact Form Modal
// ============================================

(function initContactModal() {
    function init() {
        const contactModal = document.getElementById('contactModal');
        const openButtons = document.querySelectorAll('[data-open-contact]');
        
        if (!contactModal) {
            console.warn('Contact modal not found');
            return;
        }
        
        if (openButtons.length === 0) {
            console.warn('No contact buttons found');
            return;
        }
        
        const closeBtn = contactModal.querySelector('.modal-close');
        const overlay = contactModal.querySelector('.modal-overlay');
        
        // Open modal and pre-fill form
        function openContactModal(button) {
            if (!contactModal) {
                console.error('Contact modal element not found');
                return;
            }
            
            const tier = button.getAttribute('data-tier');
            const budget = button.getAttribute('data-budget');
            const source = button.getAttribute('data-source');
            
            // Reset form
            const form = document.getElementById('contactModalForm');
            if (form) {
                form.reset();
                
                // Clear errors
                const errorElements = form.querySelectorAll('.form-error');
                errorElements.forEach(el => el.textContent = '');
                const errorInputs = form.querySelectorAll('.error');
                errorInputs.forEach(el => el.classList.remove('error'));
                
                // Pre-fill based on button data
                if (budget) {
                    const budgetSelect = document.getElementById('modalBudget');
                    if (budgetSelect) {
                        budgetSelect.value = budget;
                    }
                }
                
                if (tier) {
                    const messageTextarea = document.getElementById('modalMessage');
                    if (messageTextarea) {
                        let message = `I'm interested in the ${tier} plan.`;
                        if (source === 'hero') {
                            message = `I'm interested in getting my first website. ${tier ? `I'm considering the ${tier} plan.` : ''}`;
                        } else if (source === 'health-demo') {
                            message = `I'd like to get a free site audit.`;
                        }
                        messageTextarea.value = message;
                    }
                }
            }
            
            // Show modal
            contactModal.classList.add('active');
            contactModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Store previously focused element for return focus
            const previousActiveElement = document.activeElement;
            contactModal.dataset.previousActiveElement = previousActiveElement ? previousActiveElement.id || '' : '';
            
            // Focus first input
            setTimeout(() => {
                const form = document.getElementById('contactModalForm');
                if (form) {
                    const firstInput = form.querySelector('input[type="text"], input[type="email"]');
                    if (firstInput) firstInput.focus();
                }
            }, 100);
            
            // Focus trap: trap focus within modal
            const focusableElements = contactModal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];
            
            // Handle Tab key to trap focus
            const handleTabKey = (e) => {
                if (e.key !== 'Tab') return;
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            };
            
            contactModal.addEventListener('keydown', handleTabKey);
            contactModal.dataset.tabHandler = 'true';
        }
        
        // Close modal
        function closeContactModal() {
            contactModal.classList.remove('active');
            contactModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            // Remove focus trap
            if (contactModal.dataset.tabHandler === 'true') {
                const handleTabKey = (e) => {
                    if (e.key === 'Tab') {
                        // Remove listener after handling
                        contactModal.removeEventListener('keydown', handleTabKey);
                    }
                };
                contactModal.removeEventListener('keydown', handleTabKey);
                delete contactModal.dataset.tabHandler;
            }
            
            // Return focus to previously focused element
            const previousId = contactModal.dataset.previousActiveElement;
            if (previousId) {
                const previousElement = document.getElementById(previousId) || 
                    document.querySelector(`[data-open-contact][data-source="${previousId}"]`);
                if (previousElement) {
                    previousElement.focus();
                }
            }
        }
        
        // Attach open handlers
        openButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Contact button clicked', button);
                openContactModal(button);
            });
        });
        
        console.log(`Contact modal initialized with ${openButtons.length} buttons`);
        
        // Attach close handlers
        if (closeBtn) {
            closeBtn.addEventListener('click', closeContactModal);
        }
        
        if (overlay) {
            overlay.addEventListener('click', closeContactModal);
        }
        
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && contactModal.classList.contains('active')) {
                closeContactModal();
            }
        });
    
        // Initialize modal form validation
        const modalForm = document.getElementById('contactModalForm');
        if (modalForm) {
            initModalFormValidation(modalForm);
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Modal form validation (reuses existing validation logic)
function initModalFormValidation(form) {
    const nameInput = document.getElementById('modalName');
    const emailInput = document.getElementById('modalEmail');
    const websiteInput = document.getElementById('modalWebsite');
    const messageInput = document.getElementById('modalMessage');
    
    const nameError = document.getElementById('modalNameError');
    const emailError = document.getElementById('modalEmailError');
    const websiteError = document.getElementById('modalWebsiteError');
    const messageError = document.getElementById('modalMessageError');
    
    function validateName() {
        const value = nameInput.value.trim();
        if (!value) {
            nameError.textContent = 'Name is required';
            nameInput.classList.add('error');
            return false;
        }
        if (value.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters';
            nameInput.classList.add('error');
            return false;
        }
        nameError.textContent = '';
        nameInput.classList.remove('error');
        return true;
    }
    
    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            emailError.textContent = 'Email is required';
            emailInput.classList.add('error');
            return false;
        }
        if (!emailRegex.test(value)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.classList.add('error');
            return false;
        }
        emailError.textContent = '';
        emailInput.classList.remove('error');
        return true;
    }
    
    function validateWebsite() {
        const value = websiteInput.value.trim();
        if (value) {
            try {
                new URL(value);
                websiteError.textContent = '';
                websiteInput.classList.remove('error');
                return true;
            } catch {
                websiteError.textContent = 'Please enter a valid URL';
                websiteInput.classList.add('error');
                return false;
            }
        }
        websiteError.textContent = '';
        websiteInput.classList.remove('error');
        return true;
    }
    
    function validateMessage() {
        const value = messageInput.value.trim();
        if (!value) {
            messageError.textContent = 'Message is required';
            messageInput.classList.add('error');
            return false;
        }
        if (value.length < 10) {
            messageError.textContent = 'Message must be at least 10 characters';
            messageInput.classList.add('error');
            return false;
        }
        messageError.textContent = '';
        messageInput.classList.remove('error');
        return true;
    }
    
    // Remove error class on input
    nameInput?.addEventListener('input', () => {
        if (nameInput.classList.contains('error')) {
            nameInput.classList.remove('error');
            nameError.textContent = '';
        }
    });
    
    emailInput?.addEventListener('input', () => {
        if (emailInput.classList.contains('error')) {
            emailInput.classList.remove('error');
            emailError.textContent = '';
        }
    });
    
    websiteInput?.addEventListener('input', () => {
        if (websiteInput.classList.contains('error')) {
            websiteInput.classList.remove('error');
            websiteError.textContent = '';
        }
    });
    
    messageInput?.addEventListener('input', () => {
        if (messageInput.classList.contains('error')) {
            messageInput.classList.remove('error');
            messageError.textContent = '';
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isWebsiteValid = validateWebsite();
        const isMessageValid = validateMessage();
        
        if (isNameValid && isEmailValid && isWebsiteValid && isMessageValid) {
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Submit to Netlify
            const formData = new FormData(form);
            
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                submitBtn.textContent = 'Message sent!';
                form.reset();
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    // Close modal after success
                    const contactModal = document.getElementById('contactModal');
                    if (contactModal) {
                        contactModal.classList.remove('active');
                        contactModal.setAttribute('aria-hidden', 'true');
                        document.body.style.overflow = '';
                    }
                }, 2000);
            })
            .catch((error) => {
                console.error('Form submission error:', error);
                submitBtn.textContent = 'Error sending message';
                
                // Fallback to mailto
                const subject = encodeURIComponent('New Contact Form Submission');
                const body = encodeURIComponent(
                    `Name: ${nameInput.value.trim()}\n` +
                    `Email: ${emailInput.value.trim()}\n` +
                    `Website: ${websiteInput.value.trim() || 'N/A'}\n` +
                    `Budget: ${document.getElementById('modalBudget').value || 'Not specified'}\n` +
                    `Timeline: ${document.getElementById('modalTimeline').value || 'Not specified'}\n\n` +
                    `Message:\n${messageInput.value.trim()}`
                );
                window.location.href = `mailto:hello@justaweb.agency?subject=${subject}&body=${body}`;
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            });
        } else {
            // Focus first invalid field
            if (!isNameValid) nameInput.focus();
            else if (!isEmailValid) emailInput.focus();
            else if (!isWebsiteValid) websiteInput.focus();
            else if (!isMessageValid) messageInput.focus();
        }
    });
}

// ============================================
// Case Study Modals
// ============================================

(function initCaseStudyModals() {
    // Wait for DOM to be ready
    function init() {
        const workCards = document.querySelectorAll('.work-card[data-modal]');
        const modals = document.querySelectorAll('.case-study-modal');
        
        if (workCards.length === 0 || modals.length === 0) {
            return; // Elements not found yet
        }
        
        // Open modal when work card is clicked
        workCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modalId = card.getAttribute('data-modal');
                const modal = document.getElementById(`modal-${modalId}`);
                if (modal) {
                    openModal(modal);
                } else {
                    console.warn(`Modal not found: modal-${modalId}`);
                }
            });
        });
        
        // Close modal handlers
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            const overlay = modal.querySelector('.modal-overlay');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeModal(modal));
            }
            
            if (overlay) {
                overlay.addEventListener('click', () => closeModal(modal));
            }
        });
        
        // Close on Escape key (single listener for all modals)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.case-study-modal.active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });
    }
    
    function openModal(modal) {
        // Store previously focused element
        const previousActiveElement = document.activeElement;
        modal.dataset.previousActiveElement = previousActiveElement ? previousActiveElement.id || '' : '';
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Add scroll indicator on open
        const modalBody = modal.querySelector('.case-study-modal-body');
        if (modalBody) {
            // Reset scroll state
            modalBody.classList.remove('scrolled');
            modalBody.scrollTop = 0;
            
            // Check if scrollable and show arrow
            setTimeout(() => {
                const isScrollable = modalBody.scrollHeight > modalBody.clientHeight;
                if (isScrollable) {
                    modalBody.classList.add('has-scroll-content');
                }
            }, 100);
            
            // Update on scroll - hide arrow when user scrolls
            modalBody.addEventListener('scroll', () => {
                modalBody.classList.add('scrolled');
            });
        }
        
        // Focus management - focus close button
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
        
        // Focus trap: trap focus within modal
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        // Handle Tab key to trap focus
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
        modal.dataset.tabHandler = 'true';
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Remove focus trap
        if (modal.dataset.tabHandler === 'true') {
            const handleTabKey = (e) => {
                if (e.key === 'Tab') {
                    modal.removeEventListener('keydown', handleTabKey);
                }
            };
            modal.removeEventListener('keydown', handleTabKey);
            delete modal.dataset.tabHandler;
        }
        
        // Return focus to previously focused element (work card)
        const previousId = modal.dataset.previousActiveElement;
        if (previousId) {
            const previousElement = document.getElementById(previousId) || 
                document.querySelector(`[data-modal="${previousId.replace('modal-', '')}"]`);
            if (previousElement) {
                previousElement.focus();
            }
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


// ============================================
// Logo Cursor Glow Effect
// ============================================

(function initLogoGlow() {
    function init() {
        const logos = document.querySelectorAll('.logo');
        
        logos.forEach(logo => {
            const glow = logo.querySelector('.logo-glow');
            if (!glow) return;
            
            logo.addEventListener('mousemove', (e) => {
                const rect = logo.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Position glow at cursor location
                glow.style.left = `${x}px`;
                glow.style.top = `${y}px`;
                glow.style.transform = 'translate(-50%, -50%)';
                glow.style.opacity = '0.6';
            });
            
            logo.addEventListener('mouseleave', () => {
                glow.style.opacity = '0';
            });
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
