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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
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
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
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
    const pagesInput = document.getElementById('calcPages');
    const urgencySelect = document.getElementById('calcUrgency');
    const integrationsSelect = document.getElementById('calcIntegrations');
    const recommendationEl = document.getElementById('calcRecommendation');
    const rangeEl = document.getElementById('calcRange');
    
    if (!pagesInput || !urgencySelect || !integrationsSelect) return;
    
    function calculatePrice() {
        const pages = parseInt(pagesInput.value) || 5;
        const urgency = urgencySelect.value;
        const integrations = integrationsSelect.value;
        
        // Base pricing logic
        let basePrice = 0;
        let plan = 'Starter';
        
        if (pages <= 5 && integrations === 'none') {
            basePrice = 5000;
            plan = 'Starter';
        } else if (pages <= 15 || integrations === 'basic') {
            basePrice = 12000;
            plan = 'Growth';
        } else {
            basePrice = 25000;
            plan = 'Premium';
        }
        
        // Adjust for urgency
        let urgencyMultiplier = 1;
        if (urgency === 'rush') urgencyMultiplier = 1.3;
        else if (urgency === 'flexible') urgencyMultiplier = 0.9;
        
        // Adjust for integrations
        if (integrations === 'advanced') {
            basePrice += 5000;
            if (plan === 'Starter') plan = 'Growth';
        }
        
        // Adjust for pages
        if (pages > 15 && plan !== 'Premium') {
            plan = 'Premium';
            basePrice = 25000;
        }
        
        const finalPrice = Math.round(basePrice * urgencyMultiplier);
        const minPrice = Math.round(finalPrice * 0.8);
        const maxPrice = Math.round(finalPrice * 1.2);
        
        recommendationEl.innerHTML = `Recommended: <strong>${plan}</strong>`;
        rangeEl.textContent = `Estimated range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`;
    }
    
    pagesInput.addEventListener('input', calculatePrice);
    urgencySelect.addEventListener('change', calculatePrice);
    integrationsSelect.addEventListener('change', calculatePrice);
    
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
            return false;
        }
        if (value.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters';
            return false;
        }
        nameError.textContent = '';
        return true;
    }
    
    function validateEmail() {
        const value = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
            emailError.textContent = 'Email is required';
            return false;
        }
        if (!emailRegex.test(value)) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        emailError.textContent = '';
        return true;
    }
    
    function validateWebsite() {
        const value = websiteInput.value.trim();
        if (value) {
            try {
                new URL(value);
                websiteError.textContent = '';
                return true;
            } catch {
                websiteError.textContent = 'Please enter a valid URL';
                return false;
            }
        }
        websiteError.textContent = '';
        return true;
    }
    
    function validateMessage() {
        const value = messageInput.value.trim();
        if (!value) {
            messageError.textContent = 'Message is required';
            return false;
        }
        if (value.length < 10) {
            messageError.textContent = 'Message must be at least 10 characters';
            return false;
        }
        messageError.textContent = '';
        return true;
    }
    
    nameInput.addEventListener('blur', validateName);
    emailInput.addEventListener('blur', validateEmail);
    websiteInput.addEventListener('blur', validateWebsite);
    messageInput.addEventListener('blur', validateMessage);
    
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
                return false;
            }
            nameError.textContent = '';
            return true;
        }
        
        function validateLeadEmail() {
            const value = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                emailError.textContent = 'Email is required';
                return false;
            }
            if (!emailRegex.test(value)) {
                emailError.textContent = 'Please enter a valid email address';
                return false;
            }
            emailError.textContent = '';
            return true;
        }
        
        function validateLeadWebsite() {
            const value = websiteInput.value.trim();
            if (!value) {
                websiteError.textContent = 'Website URL is required';
                return false;
            }
            try {
                new URL(value);
                websiteError.textContent = '';
                return true;
            } catch {
                websiteError.textContent = 'Please enter a valid URL';
                return false;
            }
        }
        
        nameInput.addEventListener('blur', validateLeadName);
        emailInput.addEventListener('blur', validateLeadEmail);
        websiteInput.addEventListener('blur', validateLeadWebsite);
        
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

