// ============================================
// Configuration Constants
// ============================================

const PASCODE = 'justaweb2024'; // Change this to your desired passcode
const EMAIL_ADDRESS = 'hello@justaweb.agency'; // Your email address
const ENDPOINT_URL = ''; // Set this to your endpoint URL, or leave empty to disable
const STORAGE_KEY = 'intake_form_data';
const UNLOCK_KEY = 'intake_unlocked';
const UNLOCK_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// ============================================
// State Management
// ============================================

let currentStep = 1;
const totalSteps = 6;
let formData = {};

// ============================================
// Access Gate
// ============================================

(function initAccessGate() {
    const accessGate = document.getElementById('accessGate');
    const formContainer = document.getElementById('formContainer');
    const gateForm = document.getElementById('gateForm');
    const gatePasscode = document.getElementById('gatePasscode');
    const gateError = document.getElementById('gateError');
    const lockBtn = document.getElementById('lockBtn');

    // Check if already unlocked
    function checkUnlockStatus() {
        const unlockData = localStorage.getItem(UNLOCK_KEY);
        if (unlockData) {
            const { timestamp } = JSON.parse(unlockData);
            const now = Date.now();
            if (now - timestamp < UNLOCK_DURATION) {
                // Still valid
                accessGate.style.display = 'none';
                formContainer.style.display = 'block';
                loadFormData();
                initFormHandlers();
                initExportHandlers();
                showStep(1);
                return true;
            } else {
                // Expired
                localStorage.removeItem(UNLOCK_KEY);
            }
        }
        return false;
    }

    // Lock function
    function lock() {
        localStorage.removeItem(UNLOCK_KEY);
        accessGate.style.display = 'flex';
        formContainer.style.display = 'none';
        gatePasscode.value = '';
        gatePasscode.focus();
    }

    // Validate passcode
    gateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = gatePasscode.value.trim();

        if (entered === PASCODE) {
            // Store unlock with timestamp
            localStorage.setItem(UNLOCK_KEY, JSON.stringify({
                timestamp: Date.now()
            }));
            accessGate.style.display = 'none';
            formContainer.style.display = 'block';
            loadFormData();
            initFormHandlers();
            initExportHandlers();
            showStep(1);
        } else {
            gateError.textContent = 'Incorrect passcode. Please try again.';
            gatePasscode.value = '';
            gatePasscode.focus();
        }
    });

    lockBtn.addEventListener('click', lock);

    // Check on load
    checkUnlockStatus();
})();

// ============================================
// Form Data Management
// ============================================

function loadFormData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            formData = JSON.parse(saved);
            populateForm();
        } catch (e) {
            console.error('Error loading form data:', e);
            formData = {};
        }
    } else {
        formData = {};
    }
}

function saveFormData() {
    formData.updated_at = new Date().toISOString();
    if (!formData.created_at) {
        formData.created_at = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

function populateForm() {
    // Populate all form fields from formData
    Object.keys(formData).forEach(key => {
        const element = document.querySelector(`[name="${key}"]`);
        if (!element) return;

        if (element.type === 'checkbox' || element.type === 'radio') {
            if (Array.isArray(formData[key])) {
                formData[key].forEach(value => {
                    const el = document.querySelector(`[name="${key}"][value="${value}"]`);
                    if (el) el.checked = true;
                });
            } else if (formData[key] === element.value) {
                element.checked = true;
            }
        } else {
            element.value = formData[key] || '';
        }
    });

    // Trigger change events to show/hide conditional fields
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.value) {
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
}

// ============================================
// Step Navigation
// ============================================

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
    });

    // Show current step
    const stepEl = document.getElementById(`step${step}`);
    if (stepEl) {
        stepEl.classList.add('active');
    }

    // Update progress
    const progress = (step / totalSteps) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `Step ${step} of ${totalSteps}`;

    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    prevBtn.style.display = step > 1 ? 'inline-flex' : 'none';
    nextBtn.style.display = step < totalSteps ? 'inline-flex' : 'none';
    submitBtn.style.display = step === totalSteps ? 'inline-flex' : 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            if (currentStep === totalSteps) {
                generateReview();
            }
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// ============================================
// Validation
// ============================================

function validateCurrentStep() {
    const stepEl = document.getElementById(`step${currentStep}`);
    const requiredFields = stepEl.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        const errorEl = document.getElementById(`${field.name}Error`) || field.parentElement.querySelector('.form-error');
        
        // Remove error class
        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';

        // Validate field
        if (field.type === 'checkbox' || field.type === 'radio') {
            const group = stepEl.querySelectorAll(`[name="${field.name}"]`);
            const checked = Array.from(group).some(f => f.checked);
            if (!checked) {
                isValid = false;
                field.classList.add('error');
                if (errorEl) errorEl.textContent = 'This field is required';
            }
        } else if (field.type === 'checkbox' && field.name.includes('[]')) {
            // Handle checkbox groups
            const group = stepEl.querySelectorAll(`[name="${field.name}"]`);
            const checked = Array.from(group).some(f => f.checked);
            if (!checked && field.required) {
                isValid = false;
                if (errorEl) errorEl.textContent = 'Please select at least one option';
            }
        } else {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                if (errorEl) errorEl.textContent = 'This field is required';
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                isValid = false;
                field.classList.add('error');
                if (errorEl) errorEl.textContent = 'Please enter a valid email address';
            } else if (field.type === 'url' && field.value && !isValidUrl(field.value)) {
                isValid = false;
                field.classList.add('error');
                if (errorEl) errorEl.textContent = 'Please enter a valid URL';
            }
        }
    });

    // Special validation for checkbox groups (brandPersonality, sections)
    const brandPersonalityGroup = stepEl.querySelector('[name="brandPersonality"]');
    if (brandPersonalityGroup && currentStep === 4) {
        const checked = stepEl.querySelectorAll('[name="brandPersonality"]:checked');
        if (checked.length === 0) {
            isValid = false;
            const errorEl = document.getElementById('brandPersonalityError');
            if (errorEl) errorEl.textContent = 'Please select at least one option';
        }
    }
    
    const sectionsGroup = stepEl.querySelector('[name="sections"]');
    if (sectionsGroup && currentStep === 4) {
        const checked = stepEl.querySelectorAll('[name="sections"]:checked');
        if (checked.length === 0) {
            isValid = false;
            const errorEl = document.getElementById('sectionsError');
            if (errorEl) errorEl.textContent = 'Please select at least one section';
        }
    }

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// ============================================
// Form Field Handlers
// ============================================

function initFormHandlers() {
    // Auto-save on input
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('input', () => {
            saveFieldData(field);
            saveFormData();
        });

        field.addEventListener('change', () => {
            saveFieldData(field);
            saveFormData();
            handleConditionalFields(field);
        });
    });

    // Navigation buttons
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('prevBtn').addEventListener('click', prevStep);

    // Form submission - go to review step
    document.getElementById('intakeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (currentStep === totalSteps) {
            // Already on review step, just regenerate
            generateReview();
        } else if (validateCurrentStep()) {
            currentStep = totalSteps;
            showStep(currentStep);
            generateReview();
        }
    });
}

function saveFieldData(field) {
    if (field.type === 'checkbox') {
        const name = field.name;
        if (!formData[name]) formData[name] = [];
        if (field.checked) {
            if (!formData[name].includes(field.value)) {
                formData[name].push(field.value);
            }
        } else {
            formData[name] = formData[name].filter(v => v !== field.value);
        }
    } else if (field.type === 'radio') {
        if (field.checked) {
            formData[field.name] = field.value;
        }
    } else {
        formData[field.name] = field.value;
    }
}

function handleConditionalFields(field) {
    // Show/hide page count based on pages selection
    if (field.name === 'pages') {
        const pageCountGroup = document.getElementById('pageCountGroup');
        if (field.value === 'multi') {
            pageCountGroup.style.display = 'block';
        } else {
            pageCountGroup.style.display = 'none';
        }
    }

    // Show/hide primary goal other
    if (field.name === 'primaryGoal') {
        const otherGroup = document.getElementById('primaryGoalOtherGroup');
        if (field.value === 'other') {
            otherGroup.style.display = 'block';
        } else {
            otherGroup.style.display = 'none';
        }
    }

    // Show/hide brand personality other
    if (field.name === 'brandPersonality') {
        const otherGroup = document.getElementById('brandPersonalityOtherGroup');
        const otherCheckbox = document.querySelector('[name="brandPersonality"][value="other"]');
        if (otherCheckbox && otherCheckbox.checked) {
            otherGroup.style.display = 'block';
        } else {
            otherGroup.style.display = 'none';
        }
    }

    // Show/hide typography vibe other
    if (field.name === 'typographyVibe') {
        const otherGroup = document.getElementById('typographyVibeOtherGroup');
        if (field.value === 'other') {
            otherGroup.style.display = 'block';
        } else {
            otherGroup.style.display = 'none';
        }
    }

    // Show/hide sections other
    if (field.id === 'sectionsOther') {
        const otherGroup = document.getElementById('sectionsOtherGroup');
        if (field.checked) {
            otherGroup.style.display = 'block';
        } else {
            otherGroup.style.display = 'none';
        }
    }

    // Show/hide integrations other
    if (field.id === 'integrationsOther') {
        const otherGroup = document.getElementById('integrationsOtherGroup');
        if (field.checked) {
            otherGroup.style.display = 'block';
        } else {
            otherGroup.style.display = 'none';
        }
    }

    // Show/hide platform-specific fields
    const platform = document.querySelector('[name="platform"]:checked');
    if (platform) {
        const wpFields = document.getElementById('wordpressFields');
        const shopifyFields = document.getElementById('shopifyFields');
        
        if (platform.value === 'wordpress') {
            wpFields.style.display = 'block';
            shopifyFields.style.display = 'none';
        } else if (platform.value === 'shopify') {
            shopifyFields.style.display = 'block';
            wpFields.style.display = 'none';
        } else {
            wpFields.style.display = 'none';
            shopifyFields.style.display = 'none';
        }
    }
}

// ============================================
// Review Summary Generation
// ============================================

function generateReview() {
    const summary = document.getElementById('reviewSummary');
    const data = getCompleteFormData();

    let html = '';

    // Step 1: Basics
    html += '<div class="review-section"><h3>Basics</h3>';
    html += `<div class="review-item"><strong>Business Name:</strong> ${data.businessName || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Domain:</strong> ${data.domain || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Contact:</strong> ${data.contactName || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Email:</strong> ${data.email || 'Not provided'}</div>`;
    if (data.phone) html += `<div class="review-item"><strong>Phone:</strong> ${data.phone}</div>`;
    if (data.city || data.state) {
        html += `<div class="review-item"><strong>Location:</strong> ${[data.city, data.state].filter(Boolean).join(', ') || 'Not provided'}</div>`;
    }
    html += `<div class="review-item"><strong>Description:</strong> ${data.businessDescription || 'Not provided'}</div>`;
    html += '</div>';

    // Step 2: Platform and Scope
    html += '<div class="review-section"><h3>Platform and Scope</h3>';
    html += `<div class="review-item"><strong>Platform:</strong> ${data.platform ? data.platform.toUpperCase() : 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Pages:</strong> ${data.pages === 'one' ? 'One page' : data.pages === 'multi' ? `Multi page (${data.pageCount || 'N/A'} pages)` : 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Deadline:</strong> ${formatDeadline(data.deadline) || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Budget:</strong> ${formatBudget(data.budget) || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Maintenance:</strong> ${data.maintenance ? 'Yes (discount applied)' : 'No'}</div>`;
    html += '</div>';

    // Step 3: Goals and Audience
    html += '<div class="review-section"><h3>Goals and Audience</h3>';
    html += `<div class="review-item"><strong>Primary Goal:</strong> ${formatGoal(data.primaryGoal, data.primaryGoalOther) || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Target Audience:</strong> ${data.targetAudience || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Top Actions:</strong> ${data.topActions || 'Not provided'}</div>`;
    const competitors = [data.competitor1, data.competitor2, data.competitor3].filter(Boolean);
    if (competitors.length > 0) {
        html += `<div class="review-item"><strong>Competitors:</strong> ${competitors.join(', ')}</div>`;
    }
    if (data.competitorLikes) {
        html += `<div class="review-item"><strong>Competitor Likes:</strong> ${data.competitorLikes}</div>`;
    }
    html += '</div>';

    // Step 4: Branding and Content
    html += '<div class="review-section"><h3>Branding and Content</h3>';
    const personality = Array.isArray(data.brandPersonality) ? data.brandPersonality.join(', ') : (data.brandPersonality || 'Not provided');
    html += `<div class="review-item"><strong>Brand Personality:</strong> ${personality}${data.brandPersonalityOther ? ` (${data.brandPersonalityOther})` : ''}</div>`;
    if (data.colorPreferences) html += `<div class="review-item"><strong>Colors:</strong> ${data.colorPreferences}</div>`;
    html += `<div class="review-item"><strong>Typography:</strong> ${data.typographyVibe || 'Not provided'}${data.typographyVibeOther ? ` (${data.typographyVibeOther})` : ''}</div>`;
    html += `<div class="review-item"><strong>Has Logo:</strong> ${data.hasLogo || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Has Brand Assets:</strong> ${data.hasBrandAssets || 'Not provided'}</div>`;
    html += `<div class="review-item"><strong>Content Status:</strong> ${formatContentStatus(data.contentStatus) || 'Not provided'}</div>`;
    const sections = Array.isArray(data.sections) ? data.sections.join(', ') : (data.sections || 'Not provided');
    html += `<div class="review-item"><strong>Sections:</strong> ${sections}${data.sectionsOtherText ? ` (${data.sectionsOtherText})` : ''}</div>`;
    if (data.requiredCTAs) html += `<div class="review-item"><strong>CTAs:</strong> ${data.requiredCTAs}</div>`;
    html += '</div>';

    // Step 5: Features and Integrations
    html += '<div class="review-section"><h3>Features and Integrations</h3>';
    const features = Array.isArray(data.features) ? data.features.join(', ') : 'None selected';
    html += `<div class="review-item"><strong>Features:</strong> ${features}</div>`;
    
    if (data.platform === 'wordpress') {
        if (data.wpBlog) html += `<div class="review-item"><strong>WordPress Blog:</strong> Yes</div>`;
        if (data.wpFormsPlugin) html += `<div class="review-item"><strong>Forms Plugin:</strong> ${data.wpFormsPlugin}</div>`;
        if (data.wpHosting) html += `<div class="review-item"><strong>Hosting:</strong> ${data.wpHosting}</div>`;
    }
    
    if (data.platform === 'shopify') {
        if (data.shopifyProducts) html += `<div class="review-item"><strong>Products:</strong> ${data.shopifyProducts}</div>`;
        if (data.shopifyCollections) html += `<div class="review-item"><strong>Collections:</strong> ${data.shopifyCollections}</div>`;
        if (data.shopifyApps) html += `<div class="review-item"><strong>Apps:</strong> ${data.shopifyApps}</div>`;
    }
    
    const integrations = Array.isArray(data.integrations) ? data.integrations.join(', ') : 'None';
    html += `<div class="review-item"><strong>Integrations:</strong> ${integrations}${data.integrationsOtherText ? ` (${data.integrationsOtherText})` : ''}</div>`;
    const legal = Array.isArray(data.legalNeeds) ? data.legalNeeds.join(', ') : 'None';
    html += `<div class="review-item"><strong>Legal Needs:</strong> ${legal}</div>`;
    html += '</div>';

    summary.innerHTML = html;
}

function formatDeadline(value) {
    const map = {
        'flexible': 'Flexible',
        '2weeks': '2 weeks',
        '1month': '1 month',
        'asap': 'ASAP'
    };
    return map[value] || value;
}

function formatBudget(value) {
    const map = {
        '5k-10k': '$5,000 - $10,000',
        '10k-20k': '$10,000 - $20,000',
        '20k+': '$20,000+'
    };
    return map[value] || value;
}

function formatGoal(value, other) {
    if (value === 'other' && other) return other;
    const map = {
        'leads': 'Leads',
        'bookings': 'Bookings',
        'ecommerce': 'E-commerce',
        'credibility': 'Credibility',
        'other': 'Other'
    };
    return map[value] || value;
}

function formatContentStatus(value) {
    const map = {
        'ready': 'Ready',
        'partial': 'Partial',
        'needHelp': 'Need help writing'
    };
    return map[value] || value;
}

// ============================================
// Complete Form Data
// ============================================

function getCompleteFormData() {
    const data = { ...formData };
    
    // Add computed fields
    data.platform = data.platform || null;
    data.maintenance_included = data.maintenance === 'on' || data.maintenance === true;
    data.build_discount_applied = data.maintenance_included;
    data.selected_features = Array.isArray(data.features) ? data.features : (data.features ? [data.features] : []);
    
    // Ensure arrays are arrays
    if (!Array.isArray(data.brandPersonality)) {
        data.brandPersonality = data.brandPersonality ? [data.brandPersonality] : [];
    }
    if (!Array.isArray(data.sections)) {
        data.sections = data.sections ? [data.sections] : [];
    }
    if (!Array.isArray(data.features)) {
        data.features = data.features ? [data.features] : [];
    }
    if (!Array.isArray(data.integrations)) {
        data.integrations = data.integrations ? [data.integrations] : [];
    }
    if (!Array.isArray(data.legalNeeds)) {
        data.legalNeeds = data.legalNeeds ? [data.legalNeeds] : [];
    }
    
    return data;
}

// ============================================
// Cursor Prompt Generation
// ============================================

function generateCursorPrompt() {
    const data = getCompleteFormData();
    
    let prompt = `You are an expert creative front end engineer and designer. Build a premium ${data.pages === 'one' ? 'one page' : 'multi-page'} marketing site for ${data.businessName || 'this business'}${data.domain ? ` (${data.domain})` : ''} using ${data.platform === 'html' ? 'ONLY vanilla HTML, CSS, and JavaScript (no frameworks, no build tools, no external libraries)' : data.platform === 'wordpress' ? 'WordPress with a custom theme' : 'Shopify with a custom theme'}.\n\n`;

    // Brand and vibe
    prompt += `Brand and vibe\n\n`;
    prompt += `\t•\tName: ${data.businessName || 'Business name'}\n`;
    prompt += `\t•\tPositioning: "${data.businessDescription || 'Business description'}"\n`;
    prompt += `\t•\tTone: ${Array.isArray(data.brandPersonality) ? data.brandPersonality.join(', ') : data.brandPersonality || 'professional'}, conversion-focused\n`;
    prompt += `\t•\tVisual style: ${data.typographyVibe || 'clean'}, modern, smooth motion, excellent typography\n`;
    if (data.colorPreferences) {
        prompt += `\t•\tColor: ${data.colorPreferences}\n`;
    }
    prompt += `\t•\tUse system fonts only, but craft a strong type scale and spacing system\n\n`;

    // Core requirements
    prompt += `Core requirements\n\n`;
    prompt += `\t1.\t${data.pages === 'one' ? 'One page layout' : `Multi-page layout (${data.pageCount || '5'} pages)`} with anchored sections${data.pages === 'one' ? ' and a sticky header' : ''}:\n\n`;
    
    const sections = Array.isArray(data.sections) ? data.sections : [];
    if (sections.includes('hero')) prompt += `\t\t•\tHero\n`;
    if (sections.includes('proof')) prompt += `\t\t•\tProof / Outcomes\n`;
    if (sections.includes('services')) prompt += `\t\t•\tServices\n`;
    if (sections.includes('work')) prompt += `\t\t•\tWork (case study style cards)\n`;
    if (sections.includes('process')) prompt += `\t\t•\tProcess\n`;
    if (sections.includes('pricing')) prompt += `\t\t•\tPricing${data.platform === 'shopify' ? ' (if applicable)' : ''}\n`;
    if (sections.includes('faq')) prompt += `\t\t•\tFAQ\n`;
    if (sections.includes('contact')) prompt += `\t\t•\tContact / CTA\n`;
    if (data.sectionsOtherText) prompt += `\t\t•\t${data.sectionsOtherText}\n`;

    prompt += `\t2.\tMust be fully responsive with great mobile UX\n`;
    prompt += `\t3.\tMust be accessible: semantic HTML, keyboard navigable, focus states, reduced motion support, sufficient contrast\n`;
    prompt += `\t4.\tMust be performant: fast load times, optimized assets, no bloat\n`;
    prompt += `\t5.\tAdd tasteful animations: scroll reveal, button hover microinteractions, section transitions\n\n`;

    // Features
    const features = Array.isArray(data.features) ? data.features : [];
    if (features.length > 0) {
        prompt += `\t6.\tInclude the following features:\n`;
        if (features.includes('themeToggle')) prompt += `\t\t•\tTheme toggle (light/dark) saved to localStorage\n`;
        if (features.includes('commandPalette')) prompt += `\t\t•\tCommand palette (Ctrl or Cmd + K)\n`;
        if (features.includes('pricingCalculator')) prompt += `\t\t•\tPricing calculator\n`;
        if (features.includes('portfolioFilter')) prompt += `\t\t•\tPortfolio filter with animated transitions\n`;
        if (features.includes('testimonialsSlider')) prompt += `\t\t•\tTestimonials slider (vanilla JS, accessible controls)\n`;
        if (features.includes('contactForm')) prompt += `\t\t•\tContact form with client side validation\n`;
        if (features.includes('leadMagnet')) prompt += `\t\t•\tLead magnet modal\n`;
        if (features.includes('siteHealth')) prompt += `\t\t•\tSite Health Demo widget\n`;
        prompt += `\n`;
    }

    // Goals and CTAs
    prompt += `Goals and CTAs\n\n`;
    prompt += `\t•\tPrimary goal: ${formatGoal(data.primaryGoal, data.primaryGoalOther) || 'Not specified'}\n`;
    prompt += `\t•\tTarget audience: ${data.targetAudience || 'Not specified'}\n`;
    if (data.topActions) {
        prompt += `\t•\tTop actions: ${data.topActions}\n`;
    }
    if (data.requiredCTAs) {
        prompt += `\t•\tRequired CTAs: ${data.requiredCTAs}\n`;
    }
    prompt += `\n`;

    // Platform specific
    if (data.platform === 'wordpress') {
        prompt += `WordPress Requirements\n\n`;
        if (data.wpBlog) prompt += `\t•\tInclude blog functionality\n`;
        if (data.wpFormsPlugin) prompt += `\t•\tForms plugin preference: ${data.wpFormsPlugin}\n`;
        if (data.wpHosting) prompt += `\t•\tHosting preference: ${data.wpHosting}\n`;
        prompt += `\n`;
    }

    if (data.platform === 'shopify') {
        prompt += `Shopify Requirements\n\n`;
        if (data.shopifyProducts) prompt += `\t•\tNumber of products: ${data.shopifyProducts}\n`;
        if (data.shopifyCollections) prompt += `\t•\tCollections complexity: ${data.shopifyCollections}\n`;
        if (data.shopifyApps) prompt += `\t•\tApps needed: ${data.shopifyApps}\n`;
        prompt += `\n`;
    }

    // Integrations
    const integrations = Array.isArray(data.integrations) ? data.integrations : [];
    if (integrations.length > 0) {
        prompt += `Integrations\n\n`;
        integrations.forEach(int => {
            prompt += `\t•\t${int.toUpperCase()}\n`;
        });
        if (data.integrationsOtherText) {
            prompt += `\t•\tOther: ${data.integrationsOtherText}\n`;
        }
        prompt += `\n`;
    }

    // Content
    if (data.contentStatus !== 'ready') {
        prompt += `Content Placeholders\n\n`;
        prompt += `\t•\tContent status: ${formatContentStatus(data.contentStatus)}\n`;
        prompt += `\t•\tUse placeholder content where needed, clearly marked for client review\n\n`;
    }

    // Legal
    const legal = Array.isArray(data.legalNeeds) ? data.legalNeeds : [];
    if (legal.length > 0) {
        prompt += `Legal Requirements\n\n`;
        if (legal.includes('privacy')) prompt += `\t•\tPrivacy Policy page\n`;
        if (legal.includes('terms')) prompt += `\t•\tTerms of Service page\n`;
        if (legal.includes('accessibility')) prompt += `\t•\tAccessibility statement\n`;
        prompt += `\n`;
    }

    // Competitors
    const competitors = [data.competitor1, data.competitor2, data.competitor3].filter(Boolean);
    if (competitors.length > 0) {
        prompt += `Competitor References\n\n`;
        competitors.forEach(comp => {
            prompt += `\t•\t${comp}\n`;
        });
        if (data.competitorLikes) {
            prompt += `\t•\tWhat client likes: ${data.competitorLikes}\n`;
        }
        prompt += `\n`;
    }

    // Important notes
    prompt += `Important Notes\n\n`;
    prompt += `\t•\tBuild fast and secure websites\n`;
    prompt += `\t•\tPlatform: ${data.platform ? data.platform.toUpperCase() : 'HTML'}\n`;
    prompt += `\t•\tNO SEO maintenance services (ok to include SEO foundations during build)\n`;
    if (data.maintenance_included) {
        prompt += `\t•\tMaintenance included - build discount applied\n`;
    }
    prompt += `\t•\tFocus on conversion optimization\n`;
    prompt += `\t•\tEnsure all code is clean, maintainable, and well-commented\n\n`;

    return prompt;
}

// ============================================
// Export Functions
// ============================================

function initExportHandlers() {
    document.getElementById('copyPromptBtn').addEventListener('click', () => {
        const prompt = generateCursorPrompt();
        copyToClipboard(prompt, 'Cursor Prompt copied to clipboard!');
    });

    document.getElementById('copyJsonBtn').addEventListener('click', () => {
        const data = getCompleteFormData();
        const json = JSON.stringify(data, null, 2);
        copyToClipboard(json, 'JSON copied to clipboard!');
    });

    document.getElementById('emailBtn').addEventListener('click', () => {
        emailFormData();
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        downloadFormData();
    });

    const postBtn = document.getElementById('postEndpointBtn');
    if (!ENDPOINT_URL) {
        postBtn.disabled = true;
        postBtn.title = 'Endpoint URL not configured. Set ENDPOINT_URL in intake.js';
        postBtn.style.opacity = '0.5';
        postBtn.style.cursor = 'not-allowed';
    } else {
        postBtn.addEventListener('click', () => {
            postToEndpoint();
        });
    }

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
        }
    });

    // Initialize modal handlers
    const modal = document.getElementById('emailModal');
    const closeModal = () => modal.classList.remove('active');
    
    document.getElementById('modalDownloadBtn').addEventListener('click', () => {
        downloadFormData();
        closeModal();
    });
    
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('modalClose').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

function emailFormData() {
    const data = getCompleteFormData();
    const prompt = generateCursorPrompt();
    const json = JSON.stringify(data, null, 2);
    
    const subject = encodeURIComponent(`Website Intake: ${data.businessName || 'New Client'}`);
    const body = encodeURIComponent(`CURSOR PROMPT:\n\n${prompt}\n\n\nJSON DATA:\n\n${json}`);
    
    // Check mailto length limit (approximately 2000 characters)
    const mailtoLink = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
    
    if (mailtoLink.length > 2000) {
        // Show modal
        document.getElementById('emailModal').classList.add('active');
    } else {
        window.location.href = mailtoLink;
    }
}

function copyToClipboard(text, successMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showStatus(successMessage, 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showStatus(successMessage, 'success');
    });
}

function emailFormData() {
    const data = getCompleteFormData();
    const prompt = generateCursorPrompt();
    const json = JSON.stringify(data, null, 2);
    
    const subject = encodeURIComponent(`Website Intake: ${data.businessName || 'New Client'}`);
    const body = encodeURIComponent(`CURSOR PROMPT:\n\n${prompt}\n\n\nJSON DATA:\n\n${json}`);
    
    // Check mailto length limit (approximately 2000 characters)
    const mailtoLink = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
    
    if (mailtoLink.length > 2000) {
        // Show modal
        const modal = document.getElementById('emailModal');
        modal.classList.add('active');
        
        // Use one-time handlers
        const closeModal = () => modal.classList.remove('active');
        
        const downloadAndClose = () => {
            downloadFormData();
            closeModal();
        };
        
        // Remove existing listeners and add new ones
        const downloadBtn = document.getElementById('modalDownloadBtn');
        const closeBtn = document.getElementById('modalCloseBtn');
        const closeX = document.getElementById('modalClose');
        
        downloadBtn.replaceWith(downloadBtn.cloneNode(true));
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        closeX.replaceWith(closeX.cloneNode(true));
        
        document.getElementById('modalDownloadBtn').addEventListener('click', downloadAndClose);
        document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
        document.getElementById('modalClose').addEventListener('click', closeModal);
        
        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    } else {
        window.location.href = mailtoLink;
    }
}

function downloadFormData() {
    const data = getCompleteFormData();
    const prompt = generateCursorPrompt();
    const json = JSON.stringify(data, null, 2);
    
    const content = `WEBSITE BUILD INTAKE FORM\n${'='.repeat(50)}\n\nGenerated: ${new Date().toISOString()}\n\n\nCURSOR PROMPT:\n${'-'.repeat(50)}\n\n${prompt}\n\n\nJSON DATA:\n${'-'.repeat(50)}\n\n${json}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-intake-${data.businessName ? data.businessName.replace(/\s+/g, '-').toLowerCase() : 'form'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('File downloaded successfully!', 'success');
}

function postToEndpoint() {
    if (!ENDPOINT_URL) {
        showStatus('Endpoint URL not configured. Please set ENDPOINT_URL in intake.js', 'error');
        return;
    }

    const data = getCompleteFormData();
    const json = JSON.stringify(data);
    
    showStatus('Sending...', 'success');
    
    fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: json
    })
    .then(response => {
        if (response.ok) {
            showStatus('Successfully posted to endpoint!', 'success');
        } else {
            showStatus('Error posting to endpoint. Please check the endpoint configuration.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showStatus('Error posting to endpoint. Please check your connection and endpoint configuration.', 'error');
    });
}

function showStatus(message, type) {
    const statusEl = document.getElementById('exportStatus');
    statusEl.textContent = message;
    statusEl.className = `export-status ${type}`;
    
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'export-status';
    }, 5000);
}

function resetForm() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        localStorage.removeItem(STORAGE_KEY);
        formData = {};
        document.getElementById('intakeForm').reset();
        currentStep = 1;
        showStep(1);
        document.getElementById('reviewSummary').innerHTML = '';
    }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Handlers are initialized in access gate or checkUnlockStatus
    // This ensures they're only set up when form is unlocked
});

