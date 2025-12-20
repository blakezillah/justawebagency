// ============================================
// PRIVATE INTAKE FORM - NOT FOR PUBLIC ACCESS
// ============================================
// 
// WARNING: This code contains internal business logic.
// For production use:
// 1. Host behind server-side authentication (not just passcode gate)
// 2. Use environment variables for sensitive values
// 3. Consider obfuscation/minification for additional protection
// 4. Never commit sensitive data to version control
//
// The passcode gate is a basic UX feature, NOT real security.
// ============================================

// ============================================
// Configuration Constants
// ============================================

const PASCODE = 'intake'; // Change this to your desired passcode
const EMAIL_ADDRESS = 'hblake.goble@icloud.com'; // Your email address
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
        // Skip competitors (handled separately)
        if (key === 'competitors') return;
        
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

    // Populate competitors
    if (formData.competitors && Array.isArray(formData.competitors)) {
        formData.competitors.forEach(comp => {
            addCompetitorField(comp.url, comp.likes);
        });
    }

    // Trigger change events to show/hide conditional fields
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.value && !el.name.startsWith('competitor')) {
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
    const formNav = document.querySelector('.form-navigation');

    if (step === totalSteps) {
        // Hide navigation on final step (has its own submit button)
        if (formNav) formNav.style.display = 'none';
    } else {
        if (formNav) formNav.style.display = 'flex';
        prevBtn.style.display = step > 1 ? 'inline-flex' : 'none';
        nextBtn.style.display = 'inline-flex';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
    if (validateCurrentStep()) {
        // Save competitor data before moving
        if (currentStep === 3) {
            saveCompetitorData();
            saveFormData();
        }
        
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            
            // Re-initialize competitor fields when entering step 3
            if (currentStep === 3) {
                initCompetitorFields();
            }
            
            if (currentStep === totalSteps) {
                generateConfirmation();
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
// Competitor Management
// ============================================

let competitorCount = 0;
const MAX_COMPETITORS = 5;

function initCompetitorFields() {
    const container = document.getElementById('competitorsContainer');
    const addBtn = document.getElementById('addCompetitorBtn');
    
    if (!container || !addBtn) {
        return;
    }
    
    // Count existing competitors in DOM
    const existingItems = container.querySelectorAll('.competitor-item');
    competitorCount = existingItems.length;
    
    // If no existing competitors, load from saved data
    if (competitorCount === 0 && formData.competitors && Array.isArray(formData.competitors) && formData.competitors.length > 0) {
        formData.competitors.forEach((comp) => {
            addCompetitorField(comp.url, comp.likes);
        });
    }
    
    // Remove existing listener by cloning button
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    
    // Add event listener to new button
    const freshBtn = document.getElementById('addCompetitorBtn');
    freshBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (competitorCount < MAX_COMPETITORS) {
            addCompetitorField();
        } else {
            alert(`Maximum ${MAX_COMPETITORS} competitors allowed.`);
        }
        return false;
    });
}

function addCompetitorField(url = '', likes = '') {
    if (competitorCount >= MAX_COMPETITORS) return;
    
    competitorCount++;
    const container = document.getElementById('competitorsContainer');
    const index = competitorCount;
    
    const item = document.createElement('div');
    item.className = 'competitor-item';
    item.dataset.index = index;
    item.innerHTML = `
        <div class="competitor-item-header">
            <span class="competitor-item-number">Competitor ${index}</span>
            <button type="button" class="competitor-remove-btn" onclick="removeCompetitor(${index})">Remove</button>
        </div>
        <div class="form-group competitor-url-input">
            <label for="competitor${index}_url">URL</label>
            <input type="url" id="competitor${index}_url" name="competitor${index}_url" placeholder="https://example.com" value="${url}">
        </div>
        <div class="form-group">
            <label for="competitor${index}_likes">What you like about this site (optional)</label>
            <textarea id="competitor${index}_likes" name="competitor${index}_likes" rows="2" placeholder="Design elements, layout, features you find inspiring">${likes}</textarea>
        </div>
    `;
    
    container.appendChild(item);
    
    // Add event listeners
    const urlInput = item.querySelector(`#competitor${index}_url`);
    const likesInput = item.querySelector(`#competitor${index}_likes`);
    
    urlInput.addEventListener('input', () => {
        saveCompetitorData();
        saveFormData();
    });
    
    likesInput.addEventListener('input', () => {
        saveCompetitorData();
        saveFormData();
    });
}

function removeCompetitor(index) {
    const item = document.querySelector(`.competitor-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        competitorCount--;
        saveCompetitorData();
        saveFormData();
        renumberCompetitors();
    }
}

function renumberCompetitors() {
    const items = document.querySelectorAll('.competitor-item');
    items.forEach((item, idx) => {
        const newIndex = idx + 1;
        item.dataset.index = newIndex;
        const numberEl = item.querySelector('.competitor-item-number');
        if (numberEl) numberEl.textContent = `Competitor ${newIndex}`;
        
        const urlInput = item.querySelector('input[type="url"]');
        const likesInput = item.querySelector('textarea');
        if (urlInput) {
            urlInput.id = `competitor${newIndex}_url`;
            urlInput.name = `competitor${newIndex}_url`;
        }
        if (likesInput) {
            likesInput.id = `competitor${newIndex}_likes`;
            likesInput.name = `competitor${newIndex}_likes`;
        }
    });
}

function saveCompetitorData() {
    const competitors = [];
    const items = document.querySelectorAll('.competitor-item');
    
    items.forEach(item => {
        const urlInput = item.querySelector('input[type="url"]');
        const likesInput = item.querySelector('textarea');
        const url = urlInput ? urlInput.value.trim() : '';
        const likes = likesInput ? likesInput.value.trim() : '';
        
        if (url) {
            competitors.push({ url, likes });
        }
    });
    
    formData.competitors = competitors;
}

// Make removeCompetitor available globally
window.removeCompetitor = removeCompetitor;

// ============================================
// Form Field Handlers
// ============================================

function initFormHandlers() {
    // Initialize competitor fields
    initCompetitorFields();
    
    // Auto-save on input
    document.querySelectorAll('input, select, textarea').forEach(field => {
        // Skip competitor fields (handled separately)
        if (field.name && field.name.startsWith('competitor')) return;
        
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

    // Form submission - submit request
    document.getElementById('intakeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        submitRequest();
    });
    
    // Submit request button
    const submitBtn = document.getElementById('submitRequestBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            submitRequest();
        });
    }
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
// Confirmation Page Generation
// ============================================

function generateConfirmation() {
    const summaryCard = document.getElementById('summaryCard');
    const promptPreview = document.getElementById('promptPreview');
    const data = getCompleteFormData();

    // Generate summary card
    let html = '';
    html += `<div class="summary-item"><span class="summary-item-label">Business Name</span><span class="summary-item-value">${data.businessName || 'Not provided'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Platform</span><span class="summary-item-value">${data.platform ? data.platform.toUpperCase() : 'Not provided'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Pages</span><span class="summary-item-value">${data.pages === 'one' ? 'One page' : data.pages === 'multi' ? `${data.pageCount || 'N/A'} pages` : 'Not provided'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Timeline</span><span class="summary-item-value">${formatDeadline(data.deadline) || 'Not provided'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Budget</span><span class="summary-item-value">${formatBudget(data.budget) || 'Not provided'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Maintenance</span><span class="summary-item-value">${data.maintenance_included ? 'Yes (discount applied)' : 'No'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Primary Goal</span><span class="summary-item-value">${formatGoal(data.primaryGoal, data.primaryGoalOther) || 'Not provided'}</span></div>`;
    
    summaryCard.innerHTML = html;

    // Generate and show prompt preview
    const prompt = generateCursorPrompt();
    if (promptPreview) {
        promptPreview.value = prompt;
    }

    // Update endpoint option
    const endpointCheckbox = document.getElementById('useEndpoint');
    const endpointHelper = document.getElementById('endpointHelper');
    
    if (!ENDPOINT_URL) {
        if (endpointCheckbox) {
            endpointCheckbox.disabled = true;
            endpointCheckbox.checked = false;
        }
        if (endpointHelper) {
            endpointHelper.textContent = 'Not available right now';
        }
    } else {
        if (endpointHelper) {
            endpointHelper.textContent = 'Send via secure endpoint instead of email';
        }
    }
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
    // Save competitor data before getting complete data
    saveCompetitorData();
    
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
    
    // Ensure competitors is an array
    if (!Array.isArray(data.competitors)) {
        data.competitors = [];
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

    // Competitors (inspiration references only)
    if (data.competitors && Array.isArray(data.competitors) && data.competitors.length > 0) {
        prompt += `Competitor Inspiration References\n\n`;
        prompt += `\t•\tThese URLs are provided as inspiration references only, not to be copied or scraped.\n`;
        data.competitors.forEach(comp => {
            prompt += `\t•\t${comp.url}`;
            if (comp.likes) {
                prompt += ` - Client likes: ${comp.likes}`;
            }
            prompt += `\n`;
        });
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
// Submit Request
// ============================================

function submitRequest() {
    // Validate all steps
    if (!validateCurrentStep()) {
        return;
    }
    
    // Save competitor data
    saveCompetitorData();
    saveFormData();
    
    const data = getCompleteFormData();
    const useEndpoint = document.getElementById('useEndpoint')?.checked && ENDPOINT_URL;
    
    // If endpoint is enabled, try that first
    if (useEndpoint) {
        postToEndpoint(data);
        return;
    }
    
    // Otherwise, send email
    sendEmailWithPrompt(data);
}

function sendEmailWithPrompt(data) {
    const prompt = generateCursorPrompt();
    
    // Generate email body with prompt and metadata
    let emailBody = prompt;
    emailBody += `\n\n${'='.repeat(50)}\n`;
    emailBody += `METADATA\n`;
    emailBody += `${'='.repeat(50)}\n\n`;
    emailBody += `Platform: ${data.platform ? data.platform.toUpperCase() : 'Not specified'}\n`;
    emailBody += `Timeline: ${formatDeadline(data.deadline) || 'Not specified'}\n`;
    emailBody += `Budget: ${formatBudget(data.budget) || 'Not specified'}\n`;
    emailBody += `Maintenance: ${data.maintenance_included ? 'Yes (discount applied)' : 'No'}\n`;
    emailBody += `Contact Email: ${data.email || 'Not provided'}\n`;
    if (data.phone) {
        emailBody += `Phone: ${data.phone}\n`;
    }
    
    const subject = encodeURIComponent(`Website Intake: ${data.businessName || 'New Client'}`);
    const body = encodeURIComponent(emailBody);
    
    // Check mailto length limit (approximately 2000 characters for the full URL)
    const mailtoLink = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
    
    if (mailtoLink.length > 2000) {
        // Show modal for too long
        showLongEmailModal(data);
    } else {
        // Open email draft
        try {
            window.location.href = mailtoLink;
            showSubmitStatus('Email draft opened. Please press Send.', 'success');
            
            // Add retry button in case popup blocker
            setTimeout(() => {
                const statusEl = document.getElementById('submitStatus');
                if (statusEl) {
                    const retryBtn = document.createElement('button');
                    retryBtn.className = 'btn btn-primary';
                    retryBtn.textContent = 'Open email draft';
                    retryBtn.style.marginTop = 'var(--space-md)';
                    retryBtn.addEventListener('click', () => {
                        window.location.href = mailtoLink;
                    });
                    statusEl.appendChild(retryBtn);
                }
            }, 1000);
        } catch (e) {
            showSubmitStatus('Could not open email. Please use "Download .txt" and send manually.', 'error');
        }
    }
}

function generateShortSummaryEmail(data) {
    let summary = `Website Build Request: ${data.businessName || 'New Client'}\n\n`;
    summary += `Platform: ${data.platform ? data.platform.toUpperCase() : 'Not specified'}\n`;
    summary += `Pages: ${data.pages === 'one' ? 'One page' : data.pages === 'multi' ? `${data.pageCount || 'N/A'} pages` : 'Not specified'}\n`;
    summary += `Timeline: ${formatDeadline(data.deadline) || 'Not specified'}\n`;
    summary += `Budget: ${formatBudget(data.budget) || 'Not specified'}\n`;
    summary += `Maintenance: ${data.maintenance_included ? 'Yes (discount applied)' : 'No'}\n`;
    summary += `Primary Goal: ${formatGoal(data.primaryGoal, data.primaryGoalOther) || 'Not specified'}\n\n`;
    summary += `The full Cursor Prompt is included in the attached intake.txt file.`;
    
    return summary;
}

function showLongEmailModal(data) {
    const modal = document.getElementById('emailModal');
    modal.classList.add('active');
    
    // Store data for modal buttons
    window._modalData = data;
}

// ============================================
// Export Functions
// ============================================

function initExportHandlers() {
    // Advanced section buttons
    const copyPromptBtn = document.getElementById('copyPromptBtn');
    const copyJsonBtn = document.getElementById('copyJsonBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    if (copyPromptBtn) {
        copyPromptBtn.addEventListener('click', () => {
            const prompt = generateCursorPrompt();
            copyToClipboard(prompt, 'Cursor Prompt copied to clipboard!');
        });
    }

    if (copyJsonBtn) {
        copyJsonBtn.addEventListener('click', () => {
            const data = getCompleteFormData();
            const json = JSON.stringify(data, null, 2);
            copyToClipboard(json, 'JSON copied to clipboard!');
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadFormData();
        });
    }

    // Modal handlers
    const modal = document.getElementById('emailModal');
    if (modal) {
        const closeModal = () => modal.classList.remove('active');
        
        const modalDownloadBtn = document.getElementById('modalDownloadBtn');
        const modalCopyPromptBtn = document.getElementById('modalCopyPromptBtn');
        const modalCopySummaryBtn = document.getElementById('modalCopySummaryBtn');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const modalClose = document.getElementById('modalClose');
        
        if (modalDownloadBtn) {
            modalDownloadBtn.addEventListener('click', () => {
                downloadFormData();
                closeModal();
            });
        }
        
        if (modalCopyPromptBtn) {
            modalCopyPromptBtn.addEventListener('click', () => {
                const prompt = generateCursorPrompt();
                copyToClipboard(prompt, 'Cursor Prompt copied to clipboard!');
            });
        }
        
        if (modalCopySummaryBtn) {
            modalCopySummaryBtn.addEventListener('click', () => {
                const data = window._modalData || getCompleteFormData();
                const summary = generateShortSummaryEmail(data);
                copyToClipboard(summary, 'Short summary email copied to clipboard!');
            });
        }
        
        if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modal.querySelector('.modal-overlay')) {
            modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        }
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

function downloadFormData() {
    const data = getCompleteFormData();
    const prompt = generateCursorPrompt();
    const json = JSON.stringify(data, null, 2);
    
    const content = `WEBSITE BUILD INTAKE FORM\n${'='.repeat(50)}\n\nGenerated: ${new Date().toISOString()}\n\n\nCURSOR PROMPT:\n${'-'.repeat(50)}\n\n${prompt}\n\n\nJSON DATA:\n${'-'.repeat(50)}\n\n${json}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intake-${data.businessName ? data.businessName.replace(/\s+/g, '-').toLowerCase() : 'form'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('File downloaded successfully!', 'success');
}

function postToEndpoint(data) {
    if (!ENDPOINT_URL) {
        showSubmitStatus('Endpoint URL not configured.', 'error');
        return;
    }

    if (!data) {
        data = getCompleteFormData();
    }
    
    const prompt = generateCursorPrompt();
    const payload = {
        ...data,
        cursor_prompt: prompt,
        submitted_at: new Date().toISOString()
    };
    
    showSubmitStatus('Sending securely...', 'success');
    
    fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (response.ok) {
            showSubmitStatus('Successfully sent! We\'ll be in touch soon.', 'success');
        } else {
            showSubmitStatus('Error sending. Please try the email option instead.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showSubmitStatus('Error sending. Please try the email option instead.', 'error');
    });
}

function showStatus(message, type) {
    const statusEl = document.getElementById('exportStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `export-status ${type}`;
        
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'export-status';
        }, 5000);
    }
}

function showSubmitStatus(message, type) {
    const statusEl = document.getElementById('submitStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `submit-status ${type}`;
    }
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

