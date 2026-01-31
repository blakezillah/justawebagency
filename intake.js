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
const EMAIL_ADDRESS = 'blake@justaweb.agency'; // Intake submissions are emailed here
const STORAGE_KEY = 'intake_form_data';
const UNLOCK_KEY = 'intake_unlocked';
const UNLOCK_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// ============================================
// State Management
// ============================================

let currentStep = 1;
const totalSteps = 7;
let formData = {};

// Counters for dynamic blocks (must be declared before initAccessGate runs)
let competitorCount = 0;
let serviceCount = 0;
let teamCount = 0;
let testimonialCount = 0;
let faqCount = 0;

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
        // Skip dynamic arrays (handled separately)
        if (['competitors', 'services', 'team', 'testimonials', 'faq'].includes(key)) return;
        
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

    // Populate services, team, testimonials, faq
    if (formData.services && Array.isArray(formData.services)) {
        formData.services.forEach(s => addServiceField(s.title, s.description));
    }
    if (formData.team && Array.isArray(formData.team)) {
        formData.team.forEach(t => addTeamField(t.name, t.title, t.bio));
    }
    if (formData.testimonials && Array.isArray(formData.testimonials)) {
        formData.testimonials.forEach(t => addTestimonialField(t.quote, t.author, t.titleCompany));
    }
    if (formData.faq && Array.isArray(formData.faq)) {
        formData.faq.forEach(f => addFaqField(f.question, f.answer));
    }

    // Trigger change events to show/hide conditional fields (for radios, only the checked one)
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.value && !el.name.startsWith('competitor') && (el.type !== 'radio' || el.checked)) {
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
        if (currentStep === 3) {
            saveCompetitorData();
            saveFormData();
        }
        if (currentStep === 5) {
            saveServiceData();
            saveTeamData();
            saveTestimonialData();
            saveFaqData();
            saveFormData();
        }

        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            
            if (currentStep === 3) {
                initCompetitorFields();
            }
            if (currentStep === 5) {
                initContentBlockFields();
            }
            if (currentStep === totalSteps) {
                saveServiceData();
                saveTeamData();
                saveTestimonialData();
                saveFaqData();
                saveFormData();
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
    if (!stepEl) return false;

    const requiredFields = stepEl.querySelectorAll('[required]');
    let isValid = true;
    const validatedGroups = new Set();

    requiredFields.forEach(field => {
        // Skip required fields inside a hidden container (e.g. domain when "no domain")
        const hiddenParent = field.closest('[style*="display: none"]');
        if (hiddenParent) return;

        const errorEl = document.getElementById(`${field.name}Error`) || (field.closest('.form-group') && field.closest('.form-group').querySelector('.form-error'));

        // Validate each radio/checkbox group only once (avoid clearing error on second element)
        if (field.type === 'radio' || (field.type === 'checkbox' && field.name && !field.name.includes('[]'))) {
            if (validatedGroups.has(field.name)) return;
            validatedGroups.add(field.name);
        }

        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';

        if (field.type === 'checkbox' || field.type === 'radio') {
            const group = stepEl.querySelectorAll(`[name="${field.name}"]`);
            const checked = Array.from(group).some(f => f.checked);
            if (!checked) {
                isValid = false;
                group.forEach(f => f.classList.add('error'));
                if (errorEl) errorEl.textContent = 'This field is required';
            }
        } else if (field.type === 'checkbox' && field.name.includes('[]')) {
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

    // Scroll to first item that failed validation so the user sees what to fix
    if (!isValid) {
        const firstErrorField = stepEl.querySelector('.error');
        const firstErrorEl = stepEl.querySelector('.form-error');
        const hasErrorText = firstErrorEl && firstErrorEl.textContent.trim();
        const scrollTarget = (firstErrorField && firstErrorField.closest('.form-group')) || (hasErrorText ? firstErrorEl.closest('.form-group') : null);
        if (scrollTarget) {
            scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
// Content Blocks (Services, Team, Testimonials, FAQ)
// ============================================

const MAX_SERVICES = 10;
const MAX_TEAM = 8;
const MAX_TESTIMONIALS = 8;
const MAX_FAQ = 12;

function initContentBlockFields() {
    initServiceFields();
    initTeamFields();
    initTestimonialFields();
    initFaqFields();
}

// Services
function initServiceFields() {
    const container = document.getElementById('servicesContainer');
    const addBtn = document.getElementById('addServiceBtn');
    if (!container || !addBtn) return;
    serviceCount = container.querySelectorAll('.service-item').length;
    if (serviceCount === 0 && formData.services && formData.services.length > 0) {
        formData.services.forEach(s => addServiceField(s.title, s.description));
    }
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    document.getElementById('addServiceBtn').addEventListener('click', () => {
        if (serviceCount < MAX_SERVICES) addServiceField();
        else alert(`Maximum ${MAX_SERVICES} services allowed.`);
    });
}

function addServiceField(title = '', description = '') {
    serviceCount++;
    const container = document.getElementById('servicesContainer');
    const id = serviceCount;
    const item = document.createElement('div');
    item.className = 'service-item';
    item.dataset.index = id;
    item.innerHTML = `
        <div class="service-item-header">
            <span class="competitor-item-number">Service ${id}</span>
            <button type="button" class="repeatable-remove-btn" data-remove="service" data-index="${id}">Remove</button>
        </div>
        <div class="form-group">
            <label>Title</label>
            <input type="text" name="service_${id}_title" placeholder="e.g., Web Design" value="${(title || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-group">
            <label>Short description</label>
            <textarea name="service_${id}_description" rows="2" placeholder="Brief description">${(description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
    `;
    container.appendChild(item);
    item.querySelector('.repeatable-remove-btn').addEventListener('click', () => removeService(id));
    item.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => { saveServiceData(); saveFormData(); });
    });
}

function removeService(index) {
    const item = document.querySelector(`.service-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        serviceCount--;
        saveServiceData();
        saveFormData();
        renumberServices();
    }
}

function renumberServices() {
    document.querySelectorAll('.service-item').forEach((item, idx) => {
        const newId = idx + 1;
        item.dataset.index = newId;
        const numEl = item.querySelector('.competitor-item-number');
        if (numEl) numEl.textContent = `Service ${newId}`;
        const titleInput = item.querySelector('input[type="text"]');
        const descInput = item.querySelector('textarea');
        if (titleInput) { titleInput.name = `service_${newId}_title`; }
        if (descInput) { descInput.name = `service_${newId}_description`; }
        const btn = item.querySelector('.repeatable-remove-btn');
        if (btn) { btn.dataset.index = newId; }
    });
    serviceCount = document.querySelectorAll('.service-item').length;
}

function saveServiceData() {
    const services = [];
    document.querySelectorAll('.service-item').forEach(item => {
        const titleInput = item.querySelector('input[type="text"]');
        const descInput = item.querySelector('textarea');
        const title = titleInput ? titleInput.value.trim() : '';
        const description = descInput ? descInput.value.trim() : '';
        if (title || description) services.push({ title, description });
    });
    formData.services = services;
}

// Team
function initTeamFields() {
    const container = document.getElementById('teamContainer');
    const addBtn = document.getElementById('addTeamBtn');
    if (!container || !addBtn) return;
    teamCount = container.querySelectorAll('.team-item').length;
    if (teamCount === 0 && formData.team && formData.team.length > 0) {
        formData.team.forEach(t => addTeamField(t.name, t.title, t.bio));
    }
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    document.getElementById('addTeamBtn').addEventListener('click', () => {
        if (teamCount < MAX_TEAM) addTeamField();
        else alert(`Maximum ${MAX_TEAM} team members allowed.`);
    });
}

function addTeamField(name = '', title = '', bio = '') {
    teamCount++;
    const container = document.getElementById('teamContainer');
    const id = teamCount;
    const item = document.createElement('div');
    item.className = 'team-item';
    item.dataset.index = id;
    item.innerHTML = `
        <div class="team-item-header">
            <span class="competitor-item-number">Team ${id}</span>
            <button type="button" class="repeatable-remove-btn" data-remove="team" data-index="${id}">Remove</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Name</label>
                <input type="text" name="team_${id}_name" placeholder="Full name" value="${(name || '').replace(/"/g, '&quot;')}">
            </div>
            <div class="form-group">
                <label>Title / role</label>
                <input type="text" name="team_${id}_title" placeholder="e.g., CEO" value="${(title || '').replace(/"/g, '&quot;')}">
            </div>
        </div>
        <div class="form-group">
            <label>Short bio</label>
            <textarea name="team_${id}_bio" rows="2" placeholder="Brief bio">${(bio || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
    `;
    container.appendChild(item);
    item.querySelector('.repeatable-remove-btn').addEventListener('click', () => removeTeam(id));
    item.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => { saveTeamData(); saveFormData(); });
    });
}

function removeTeam(index) {
    const item = document.querySelector(`.team-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        teamCount--;
        saveTeamData();
        saveFormData();
        renumberTeam();
    }
}

function renumberTeam() {
    document.querySelectorAll('.team-item').forEach((item, idx) => {
        const newId = idx + 1;
        item.dataset.index = newId;
        const numEl = item.querySelector('.competitor-item-number');
        if (numEl) numEl.textContent = `Team ${newId}`;
        const nameInput = item.querySelector('input[name*="_name"]');
        const titleInput = item.querySelector('input[name*="_title"]');
        const bioInput = item.querySelector('textarea');
        if (nameInput) nameInput.name = `team_${newId}_name`;
        if (titleInput) titleInput.name = `team_${newId}_title`;
        if (bioInput) bioInput.name = `team_${newId}_bio`;
    });
    teamCount = document.querySelectorAll('.team-item').length;
}

function saveTeamData() {
    const team = [];
    document.querySelectorAll('.team-item').forEach(item => {
        const nameInput = item.querySelector('input[name*="_name"]');
        const titleInput = item.querySelector('input[name*="_title"]');
        const bioInput = item.querySelector('textarea');
        const name = nameInput ? nameInput.value.trim() : '';
        const title = titleInput ? titleInput.value.trim() : '';
        const bio = bioInput ? bioInput.value.trim() : '';
        if (name || title || bio) team.push({ name, title, bio });
    });
    formData.team = team;
}

// Testimonials
function initTestimonialFields() {
    const container = document.getElementById('testimonialsContainer');
    const addBtn = document.getElementById('addTestimonialBtn');
    if (!container || !addBtn) return;
    testimonialCount = container.querySelectorAll('.testimonial-item').length;
    if (testimonialCount === 0 && formData.testimonials && formData.testimonials.length > 0) {
        formData.testimonials.forEach(t => addTestimonialField(t.quote, t.author, t.titleCompany));
    }
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    document.getElementById('addTestimonialBtn').addEventListener('click', () => {
        if (testimonialCount < MAX_TESTIMONIALS) addTestimonialField();
        else alert(`Maximum ${MAX_TESTIMONIALS} testimonials allowed.`);
    });
}

function addTestimonialField(quote = '', author = '', titleCompany = '') {
    testimonialCount++;
    const container = document.getElementById('testimonialsContainer');
    const id = testimonialCount;
    const item = document.createElement('div');
    item.className = 'testimonial-item';
    item.dataset.index = id;
    item.innerHTML = `
        <div class="testimonial-item-header">
            <span class="competitor-item-number">Testimonial ${id}</span>
            <button type="button" class="repeatable-remove-btn" data-remove="testimonial" data-index="${id}">Remove</button>
        </div>
        <div class="form-group">
            <label>Quote</label>
            <textarea name="testimonial_${id}_quote" rows="2" placeholder="Customer quote">${(quote || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Author name</label>
                <input type="text" name="testimonial_${id}_author" placeholder="Name" value="${(author || '').replace(/"/g, '&quot;')}">
            </div>
            <div class="form-group">
                <label>Title / company</label>
                <input type="text" name="testimonial_${id}_titleCompany" placeholder="e.g., CEO, Acme Inc." value="${(titleCompany || '').replace(/"/g, '&quot;')}">
            </div>
        </div>
    `;
    container.appendChild(item);
    item.querySelector('.repeatable-remove-btn').addEventListener('click', () => removeTestimonial(id));
    item.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => { saveTestimonialData(); saveFormData(); });
    });
}

function removeTestimonial(index) {
    const item = document.querySelector(`.testimonial-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        testimonialCount--;
        saveTestimonialData();
        saveFormData();
        renumberTestimonials();
    }
}

function renumberTestimonials() {
    document.querySelectorAll('.testimonial-item').forEach((item, idx) => {
        const newId = idx + 1;
        item.dataset.index = newId;
        const numEl = item.querySelector('.competitor-item-number');
        if (numEl) numEl.textContent = `Testimonial ${newId}`;
        const quoteInput = item.querySelector('textarea');
        const authorInput = item.querySelector('input[name*="_author"]');
        const titleInput = item.querySelector('input[name*="_titleCompany"]');
        if (quoteInput) quoteInput.name = `testimonial_${newId}_quote`;
        if (authorInput) authorInput.name = `testimonial_${newId}_author`;
        if (titleInput) titleInput.name = `testimonial_${newId}_titleCompany`;
    });
    testimonialCount = document.querySelectorAll('.testimonial-item').length;
}

function saveTestimonialData() {
    const testimonials = [];
    document.querySelectorAll('.testimonial-item').forEach(item => {
        const quoteInput = item.querySelector('textarea');
        const authorInput = item.querySelector('input[name*="_author"]');
        const titleInput = item.querySelector('input[name*="_titleCompany"]');
        const quote = quoteInput ? quoteInput.value.trim() : '';
        const author = authorInput ? authorInput.value.trim() : '';
        const titleCompany = titleInput ? titleInput.value.trim() : '';
        if (quote || author || titleCompany) testimonials.push({ quote, author, titleCompany });
    });
    formData.testimonials = testimonials;
}

// FAQ
function initFaqFields() {
    const container = document.getElementById('faqContainer');
    const addBtn = document.getElementById('addFaqBtn');
    if (!container || !addBtn) return;
    faqCount = container.querySelectorAll('.faq-item').length;
    if (faqCount === 0 && formData.faq && formData.faq.length > 0) {
        formData.faq.forEach(f => addFaqField(f.question, f.answer));
    }
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    document.getElementById('addFaqBtn').addEventListener('click', () => {
        if (faqCount < MAX_FAQ) addFaqField();
        else alert(`Maximum ${MAX_FAQ} FAQ items allowed.`);
    });
}

function addFaqField(question = '', answer = '') {
    faqCount++;
    const container = document.getElementById('faqContainer');
    const id = faqCount;
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.dataset.index = id;
    item.innerHTML = `
        <div class="faq-item-header">
            <span class="competitor-item-number">FAQ ${id}</span>
            <button type="button" class="repeatable-remove-btn" data-remove="faq" data-index="${id}">Remove</button>
        </div>
        <div class="form-group">
            <label>Question</label>
            <input type="text" name="faq_${id}_question" placeholder="Question" value="${(question || '').replace(/"/g, '&quot;')}">
        </div>
        <div class="form-group">
            <label>Answer</label>
            <textarea name="faq_${id}_answer" rows="2" placeholder="Answer">${(answer || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
        </div>
    `;
    container.appendChild(item);
    item.querySelector('.repeatable-remove-btn').addEventListener('click', () => removeFaq(id));
    item.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => { saveFaqData(); saveFormData(); });
    });
}

function removeFaq(index) {
    const item = document.querySelector(`.faq-item[data-index="${index}"]`);
    if (item) {
        item.remove();
        faqCount--;
        saveFaqData();
        saveFormData();
        renumberFaq();
    }
}

function renumberFaq() {
    document.querySelectorAll('.faq-item').forEach((item, idx) => {
        const newId = idx + 1;
        item.dataset.index = newId;
        const numEl = item.querySelector('.competitor-item-number');
        if (numEl) numEl.textContent = `FAQ ${newId}`;
        const qInput = item.querySelector('input');
        const aInput = item.querySelector('textarea');
        if (qInput) qInput.name = `faq_${newId}_question`;
        if (aInput) aInput.name = `faq_${newId}_answer`;
    });
    faqCount = document.querySelectorAll('.faq-item').length;
}

function saveFaqData() {
    const faq = [];
    document.querySelectorAll('.faq-item').forEach(item => {
        const qInput = item.querySelector('input');
        const aInput = item.querySelector('textarea');
        const question = qInput ? qInput.value.trim() : '';
        const answer = aInput ? aInput.value.trim() : '';
        if (question || answer) faq.push({ question, answer });
    });
    formData.faq = faq;
}

// ============================================
// Form Field Handlers
// ============================================

function initFormHandlers() {
    // Initialize competitor fields
    initCompetitorFields();
    
    // Auto-save on input
    document.querySelectorAll('input, select, textarea').forEach(field => {
        // Skip dynamic block fields (handled by their own save functions)
        if (field.name && (field.name.startsWith('competitor') || field.name.startsWith('service_') || field.name.startsWith('team_') || field.name.startsWith('testimonial_') || field.name.startsWith('faq_'))) return;

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

    // Form submission: Enter key advances step when not on last step, otherwise submits
    const intakeForm = document.getElementById('intakeForm');
    if (intakeForm) {
        intakeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (currentStep < totalSteps) {
                nextStep();
            } else {
                submitRequest();
            }
        });
    }

    // Navigation buttons
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); nextStep(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prevStep(); });

    // Submit request button (on confirmation step)
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
    // Show/hide domain and hosting fields based on hasDomain
    if (field.name === 'hasDomain') {
        const domainFieldsGroup = document.getElementById('domainFieldsGroup');
        const hostingGroup = document.getElementById('hostingGroup');
        const currentHostingOtherGroup = document.getElementById('currentHostingOtherGroup');
        const noDomainNote = document.getElementById('noDomainNote');
        const domainInput = document.getElementById('domain');
        const currentHostingSelect = document.getElementById('currentHosting');
        const hasYes = field.value === 'yes' && field.checked;
        if (domainFieldsGroup) domainFieldsGroup.style.display = hasYes ? 'block' : 'none';
        if (hostingGroup) hostingGroup.style.display = hasYes ? 'block' : 'none';
        if (noDomainNote) noDomainNote.style.display = hasYes ? 'none' : 'block';
        if (domainInput) {
            domainInput.required = hasYes;
            if (!hasYes) domainInput.value = '';
        }
        if (currentHostingSelect) {
            currentHostingSelect.required = hasYes;
            if (!hasYes) currentHostingSelect.value = '';
        }
        if (currentHostingOtherGroup) currentHostingOtherGroup.style.display = 'none';
    }

    // Show/hide current hosting "other" text
    if (field.name === 'currentHosting') {
        const otherGroup = document.getElementById('currentHostingOtherGroup');
        if (field.value === 'other') {
            if (otherGroup) otherGroup.style.display = 'block';
        } else if (otherGroup) {
            otherGroup.style.display = 'none';
        }
    }

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

    // Show/hide logo URL when has logo
    if (field.name === 'hasLogo') {
        const logoUrlGroup = document.getElementById('logoUrlGroup');
        if (field.value === 'yes' && field.checked) {
            if (logoUrlGroup) logoUrlGroup.style.display = 'block';
        } else if (logoUrlGroup) {
            logoUrlGroup.style.display = 'none';
        }
    }

    // Show/hide asset link when has brand assets
    if (field.name === 'hasBrandAssets') {
        const assetLinkGroup = document.getElementById('assetLinkGroup');
        if (field.value === 'yes' && field.checked) {
            if (assetLinkGroup) assetLinkGroup.style.display = 'block';
        } else if (assetLinkGroup) {
            assetLinkGroup.style.display = 'none';
        }
    }

    // Show/hide tone of voice other
    if (field.name === 'toneOfVoice') {
        const otherGroup = document.getElementById('toneOfVoiceOtherGroup');
        if (field.value === 'other') {
            if (otherGroup) otherGroup.style.display = 'block';
        } else if (otherGroup) {
            otherGroup.style.display = 'none';
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
    const domainSummary = data.hasDomain === 'yes' && data.domain
        ? `${data.domain} (${data.currentHosting ? (data.currentHosting === 'other' && data.currentHostingOther ? data.currentHostingOther : formatHosting(data.currentHosting)) : 'host not specified'})`
        : (data.hasDomain === 'no' ? 'No domain yet (placeholder / register later)' : 'Not specified');
    html += `<div class="summary-item"><span class="summary-item-label">Domain</span><span class="summary-item-value">${domainSummary}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Pages</span><span class="summary-item-value">${data.pages === 'one' ? 'Single page' : data.pages === 'multi' ? `${data.pageCount || 'N/A'} pages` : 'Not provided'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Timeline</span><span class="summary-item-value">${formatDeadline(data.deadline) || 'Not provided'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Hosting & maintenance</span><span class="summary-item-value">${data.hosting_maintenance ? 'Yes ($250/year)' : 'No'}</span></div>`;
    html += `<div class="summary-item"><span class="summary-item-label">Primary Goal</span><span class="summary-item-value">${formatGoal(data.primaryGoal, data.primaryGoalOther) || 'Not provided'}</span></div>`;
    
    summaryCard.innerHTML = html;

    // Generate and show prompt preview
    const prompt = generateCursorPrompt();
    if (promptPreview) {
        promptPreview.value = prompt;
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

function formatHosting(value) {
    const map = {
        'godaddy': 'GoDaddy',
        'namecheap': 'Namecheap',
        'cloudflare': 'Cloudflare',
        'google': 'Google Domains / Squarespace',
        'wpengine': 'WP Engine',
        'kinsta': 'Kinsta',
        'netlify': 'Netlify',
        'vercel': 'Vercel',
        'other': 'Other'
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
    saveCompetitorData();
    saveServiceData();
    saveTeamData();
    saveTestimonialData();
    saveFaqData();

    const data = { ...formData };

    data.hosting_maintenance = data.hostingMaintenance === 'on' || data.hostingMaintenance === true;
    data.selected_features = Array.isArray(data.features) ? data.features : (data.features ? [data.features] : []);

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
    if (!Array.isArray(data.competitors)) {
        data.competitors = [];
    }
    if (!Array.isArray(data.services)) {
        data.services = [];
    }
    if (!Array.isArray(data.team)) {
        data.team = [];
    }
    if (!Array.isArray(data.testimonials)) {
        data.testimonials = [];
    }
    if (!Array.isArray(data.faq)) {
        data.faq = [];
    }

    return data;
}

// ============================================
// Cursor Prompt Generation
// ============================================

function formatTone(value, other) {
    if (value === 'other' && other) return other;
    const map = {
        professional: 'Professional',
        friendly: 'Friendly',
        casual: 'Casual',
        technical: 'Technical / Expert',
        luxury: 'Luxury / Premium',
        playful: 'Playful',
        other: 'Other'
    };
    return map[value] || value;
}

function generateCursorPrompt() {
    const data = getCompleteFormData();

    let prompt = `You are an expert creative front end engineer and designer. Build a premium ${data.pages === 'one' ? 'one page' : 'multi-page'} marketing site for ${data.businessName || 'this business'}${data.hasDomain === 'yes' && data.domain ? ` (${data.domain})` : ''} using ONLY vanilla HTML, CSS, and JavaScript (no frameworks, no build tools, no external libraries).\n\n`;

    // Business context
    prompt += `Business context\n\n`;
    prompt += `\t•\tName: ${data.businessName || 'Business name'}\n`;
    if (data.hasDomain === 'yes' && data.domain) {
        prompt += `\t•\tDomain: ${data.domain}\n`;
        if (data.currentHosting) {
            const hostingLabel = data.currentHosting === 'other' && data.currentHostingOther ? data.currentHostingOther : formatHosting(data.currentHosting);
            prompt += `\t•\tCurrently hosted at: ${hostingLabel}\n`;
        }
    } else {
        prompt += `\t•\tDomain: Client does not have a domain yet (use placeholder e.g. yourbusiness.com for build; they will register or point later)\n`;
    }
    if (data.industry) prompt += `\t•\tIndustry: ${data.industry}\n`;
    if (data.tagline) prompt += `\t•\tTagline: "${data.tagline}"\n`;
    prompt += `\t•\tPositioning: "${data.businessDescription || 'Business description'}"\n`;
    if (data.extendedDescription) {
        prompt += `\t•\tExtended description: ${data.extendedDescription}\n`;
    }
    if (data.fullAddress) prompt += `\t•\tAddress (footer/contact): ${data.fullAddress}\n`;
    if (data.socialLinkedIn || data.socialInstagram || data.socialTwitter || data.socialFacebook) {
        prompt += `\t•\tSocial links:`;
        if (data.socialLinkedIn) prompt += ` LinkedIn ${data.socialLinkedIn}`;
        if (data.socialInstagram) prompt += ` Instagram ${data.socialInstagram}`;
        if (data.socialTwitter) prompt += ` Twitter/X ${data.socialTwitter}`;
        if (data.socialFacebook) prompt += ` Facebook ${data.socialFacebook}`;
        prompt += `\n`;
    }
    prompt += `\n`;

    // Brand and vibe
    prompt += `Brand and vibe\n\n`;
    prompt += `\t•\tTone of voice: ${formatTone(data.toneOfVoice, data.toneOfVoiceOther) || 'professional'}, conversion-focused\n`;
    prompt += `\t•\tPersonality: ${Array.isArray(data.brandPersonality) ? data.brandPersonality.join(', ') : data.brandPersonality || 'professional'}\n`;
    prompt += `\t•\tVisual style: ${data.typographyVibe || 'clean'}, modern, smooth motion, excellent typography\n`;
    if (data.primaryColor || data.secondaryColor || data.colorPreferences) {
        prompt += `\t•\tColors:`;
        if (data.primaryColor) prompt += ` Primary ${data.primaryColor}`;
        if (data.secondaryColor) prompt += ` Secondary ${data.secondaryColor}`;
        if (data.colorPreferences) prompt += ` Notes: ${data.colorPreferences}`;
        prompt += `\n`;
    }
    if (data.fontPreference) {
        prompt += `\t•\tFonts: ${data.fontPreference}\n`;
    } else {
        prompt += `\t•\tUse system fonts only, but craft a strong type scale and spacing system\n`;
    }
    if (data.hasLogo === 'yes' && data.logoUrl) {
        prompt += `\t•\tLogo URL (use this asset): ${data.logoUrl}\n`;
    }
    if (data.hasBrandAssets === 'yes' && data.assetLink) {
        prompt += `\t•\tBrand assets / copy folder: ${data.assetLink}\n`;
    }
    if (data.imageStyle) {
        const imageStyleMap = { photography: 'Real photography', illustration: 'Illustration', mixed: 'Mixed (photos + graphics)', stock: 'Stock imagery OK', custom: 'Client-provided only', minimal: 'Minimal / few images' };
        prompt += `\t•\tImage style: ${imageStyleMap[data.imageStyle] || data.imageStyle}\n`;
    }
    prompt += `\n`;

    // Hero copy (if provided)
    if (data.heroHeadline || data.heroSubhead) {
        prompt += `Hero section copy\n\n`;
        if (data.heroHeadline) prompt += `\t•\tHeadline: "${data.heroHeadline}"\n`;
        if (data.heroSubhead) prompt += `\t•\tSubhead: ${data.heroSubhead}\n`;
        prompt += `\n`;
    }

    // Messaging and differentiators
    if (data.keyDifferentiators || data.painPoints) {
        prompt += `Messaging and differentiators\n\n`;
        if (data.keyDifferentiators) prompt += `\t•\tUSPs / differentiators: ${data.keyDifferentiators}\n`;
        if (data.painPoints) prompt += `\t•\tPain points to address: ${data.painPoints}\n`;
        prompt += `\n`;
    }

    // Core requirements
    prompt += `Core requirements\n\n`;
    prompt += `\t1.\t${data.pages === 'one' ? 'One page layout' : `Multi-page layout (${data.pageCount || '5'} pages)`} with anchored sections${data.pages === 'one' ? ' and a sticky header' : ''}:\n\n`;
    
    const sections = Array.isArray(data.sections) ? data.sections : [];
    if (sections.includes('hero')) prompt += `\t\t•\tHero\n`;
    if (sections.includes('proof')) prompt += `\t\t•\tProof / Outcomes\n`;
    if (sections.includes('services')) prompt += `\t\t•\tServices\n`;
    if (sections.includes('work')) prompt += `\t\t•\tWork (case study style cards)\n`;
    if (sections.includes('process')) prompt += `\t\t•\tProcess\n`;
    if (sections.includes('pricing')) prompt += `\t\t•\tPricing\n`;
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

    // Content copy (use this to flesh out the site)
    if (data.aboutCopy || data.keyMessaging) {
        prompt += `Content copy\n\n`;
        if (data.aboutCopy) prompt += `\t•\tAbout us: ${data.aboutCopy}\n`;
        if (data.keyMessaging) prompt += `\t•\tKey messaging (bullets):\n${(data.keyMessaging || '').split('\n').filter(Boolean).map(line => `\t\t•\t${line.trim()}`).join('\n')}\n`;
        prompt += `\n`;
    }

    // Services / offerings
    if (data.services && data.services.length > 0) {
        prompt += `Services / offerings (use these for Services section or pricing tiers)\n\n`;
        data.services.forEach(s => {
            prompt += `\t•\t${s.title || 'Service'}: ${s.description || '—'}\n`;
        });
        prompt += `\n`;
    }

    // Team
    if (data.team && data.team.length > 0) {
        prompt += `Team (use for Team or About section)\n\n`;
        data.team.forEach(t => {
            prompt += `\t•\t${t.name || 'Name'} — ${t.title || 'Title'}: ${t.bio || '—'}\n`;
        });
        prompt += `\n`;
    }

    // Testimonials
    if (data.testimonials && data.testimonials.length > 0) {
        prompt += `Testimonials (use for social proof section)\n\n`;
        data.testimonials.forEach(t => {
            prompt += `\t•\t"${t.quote || ''}" — ${t.author || 'Author'}, ${t.titleCompany || ''}\n`;
        });
        prompt += `\n`;
    }

    // FAQ
    if (data.faq && data.faq.length > 0) {
        prompt += `FAQ (use for FAQ section)\n\n`;
        data.faq.forEach(f => {
            prompt += `\t•\tQ: ${f.question || ''}\n\t\tA: ${f.answer || ''}\n`;
        });
        prompt += `\n`;
    }

    // SEO
    if (data.seoKeywords || data.metaDescription) {
        prompt += `SEO\n\n`;
        if (data.seoKeywords) prompt += `\t•\tFocus keywords: ${data.seoKeywords}\n`;
        if (data.metaDescription) prompt += `\t•\tMeta description: ${data.metaDescription}\n`;
        prompt += `\n`;
    }

    // Content status / placeholders
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
    prompt += `\t•\tBuild with vanilla HTML, CSS, and JavaScript only\n`;
    prompt += `\t•\tNO ongoing SEO maintenance (ok to include SEO foundations during build)\n`;
    if (data.hosting_maintenance) {
        prompt += `\t•\tClient wants hosting and maintenance ($250/year) — include in handoff notes\n`;
    }
    prompt += `\t•\tFocus on conversion optimization\n`;
    prompt += `\t•\tEnsure all code is clean, maintainable, and well-commented\n\n`;

    return prompt;
}

// ============================================
// Submit Request
// ============================================

function submitRequest() {
    if (!validateCurrentStep()) {
        return;
    }

    saveCompetitorData();
    saveFormData();

    const data = getCompleteFormData();
    sendEmailWithPrompt(data);
}

function sendEmailWithPrompt(data) {
    // Condensed body for email (fits in mailto) — full prompt is in the downloaded .txt file
    const condensedBody = generateCondensedEmailBody(data);
    const subject = encodeURIComponent(`Website Intake: ${data.businessName || 'New Client'}`);
    const body = encodeURIComponent(condensedBody);
    const mailtoLink = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;

    // Always download the full intake as .txt (prompt + metadata) so customer can attach it
    downloadFormData();

    if (mailtoLink.length > 2000) {
        showLongEmailModal(data);
        return;
    }

    try {
        window.location.href = mailtoLink;
        showSubmitStatus('Your request has been sent. We\'ll follow up with next steps shortly.', 'success');
        setTimeout(() => {
            const statusEl = document.getElementById('submitStatus');
            if (statusEl) {
                const retryBtn = document.createElement('button');
                retryBtn.className = 'btn btn-primary';
                retryBtn.textContent = 'Open email again';
                retryBtn.style.marginTop = 'var(--space-md)';
                retryBtn.addEventListener('click', () => {
                    window.location.href = mailtoLink;
                });
                statusEl.appendChild(retryBtn);
            }
        }, 1000);
    } catch (e) {
        showSubmitStatus('Your intake file was downloaded. Please email it to ' + EMAIL_ADDRESS + ' to complete your submission.', 'success');
    }
}

function generateCondensedEmailBody(data) {
    let body = `New website intake from: ${data.businessName || 'New Client'}\n\n`;
    body += `Contact: ${data.contactName || ''} — ${data.email || ''}\n`;
    if (data.phone) body += `Phone: ${data.phone}\n`;
    body += `Pages: ${data.pages === 'one' ? 'Single page' : data.pages === 'multi' ? (data.pageCount || 'N/A') + ' pages' : '—'}\n`;
    body += `Timeline: ${formatDeadline(data.deadline) || '—'}\n`;
    body += `Hosting & maintenance: ${data.hosting_maintenance ? 'Yes ($250/yr)' : 'No'}\n\n`;
    body += `Full details and Cursor prompt are in the attached intake.txt file.`;
    return body;
}

function generateShortSummaryEmail(data) {
    let summary = `Website Build Request: ${data.businessName || 'New Client'}\n\n`;
    summary += `Pages: ${data.pages === 'one' ? 'Single page' : data.pages === 'multi' ? `${data.pageCount || 'N/A'} pages` : 'Not specified'}\n`;
    summary += `Timeline: ${formatDeadline(data.deadline) || 'Not specified'}\n`;
    summary += `Hosting & maintenance: ${data.hosting_maintenance ? 'Yes ($250/yr)' : 'No'}\n`;
    summary += `Primary Goal: ${formatGoal(data.primaryGoal, data.primaryGoalOther) || 'Not specified'}\n\n`;
    summary += `The full Cursor Prompt is included in the attached intake.txt file.`;
    
    return summary;
}

function showLongEmailModal(data) {
    const modal = document.getElementById('emailModal');
    modal.classList.add('active');
    window._modalData = data;
    showSubmitStatus('Your intake file was downloaded. Please attach it to the email and send to complete your submission.', 'success');
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
        const modalCopySummaryBtn = document.getElementById('modalCopySummaryBtn');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const modalClose = document.getElementById('modalClose');
        
        if (modalDownloadBtn) {
            modalDownloadBtn.addEventListener('click', () => {
                downloadFormData();
                closeModal();
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
        const summaryCard = document.getElementById('summaryCard');
        if (summaryCard) summaryCard.innerHTML = '';
    }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Handlers are initialized in access gate or checkUnlockStatus
    // This ensures they're only set up when form is unlocked
});

