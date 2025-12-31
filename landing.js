// ============================================
// Landing Page JavaScript
// ============================================

// Form Validation
(function initLeadForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;
    
    const nameInput = document.getElementById('leadName');
    const emailInput = document.getElementById('leadEmail');
    const businessInput = document.getElementById('leadBusiness');
    const needsInput = document.getElementById('leadNeeds');
    
    const nameError = document.getElementById('leadNameError');
    const emailError = document.getElementById('leadEmailError');
    const businessError = document.getElementById('leadBusinessError');
    const needsError = document.getElementById('leadNeedsError');
    
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
    
    function validateNeeds() {
        const value = needsInput.value.trim();
        if (!value) {
            needsError.textContent = 'Please tell us what you need';
            needsInput.classList.add('error');
            return false;
        }
        if (value.length < 10) {
            needsError.textContent = 'Please provide more details (at least 10 characters)';
            needsInput.classList.add('error');
            return false;
        }
        needsError.textContent = '';
        needsInput.classList.remove('error');
        return true;
    }
    
    // Remove error on input
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
    
    needsInput.addEventListener('input', () => {
        if (needsInput.classList.contains('error')) {
            needsInput.classList.remove('error');
            needsError.textContent = '';
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isNeedsValid = validateNeeds();
        
        if (isNameValid && isEmailValid && isNeedsValid) {
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
                const subject = encodeURIComponent('New Website Inquiry');
                const body = encodeURIComponent(
                    `Name: ${nameInput.value.trim()}\n` +
                    `Email: ${emailInput.value.trim()}\n` +
                    `Business: ${businessInput.value.trim() || 'N/A'}\n\n` +
                    `What they need:\n${needsInput.value.trim()}`
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
            else if (!isNeedsValid) needsInput.focus();
        }
    });
})();

// FAQ Accordion
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

// Sticky CTA
(function initStickyCTA() {
    const stickyCTA = document.getElementById('stickyCTA');
    if (!stickyCTA) return;
    
    // Only show on mobile after scrolling past hero
    function toggleStickyCTA() {
        if (window.innerWidth > 768) {
            stickyCTA.classList.remove('visible');
            return;
        }
        
        const hero = document.getElementById('hero');
        if (!hero) return;
        
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        const scrollPosition = window.scrollY + window.innerHeight;
        
        if (scrollPosition > heroBottom) {
            stickyCTA.classList.add('visible');
        } else {
            stickyCTA.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', toggleStickyCTA);
    window.addEventListener('resize', toggleStickyCTA);
    toggleStickyCTA();
})();

// Smooth scroll for anchor links
(function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const header = document.querySelector('.landing-header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            }
        });
    });
})();

