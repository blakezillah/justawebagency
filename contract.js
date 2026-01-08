// Contract Signing Page JavaScript
// Handles form validation, signature pads, PDF generation, and email sending

(function() {
    'use strict';

    // ============================================
    // Configuration - UPDATE THESE VALUES
    // ============================================
    
    // EmailJS Configuration (Sign up at https://www.emailjs.com)
    // If not using EmailJS, set useEmailJS to false and configure Netlify Functions instead
    const CONFIG = {
        useEmailJS: true, // Set to false if using Netlify Functions
        emailJS: {
            serviceID: 'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
            templateID: 'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
            publicKey: 'YOUR_PUBLIC_KEY', // Replace with your EmailJS public key
            agencyEmail: 'hello@justaweb.agency' // Your agency email
        }
    };

    // ============================================
    // Initialize Signature Pads
    // ============================================
    
    let clientSignaturePad = null;
    let providerSignaturePad = null;
    
    function initSignaturePads() {
        const clientCanvas = document.getElementById('clientSignature');
        const providerCanvas = document.getElementById('providerSignature');
        
        if (clientCanvas) {
            clientSignaturePad = new SignaturePad(clientCanvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)',
                minWidth: 1,
                maxWidth: 3,
            });
            
            // Adjust canvas size for high DPI displays
            function resizeCanvas(canvas, signaturePad) {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext('2d').scale(ratio, ratio);
                signaturePad.clear();
            }
            
            resizeCanvas(clientCanvas, clientSignaturePad);
            window.addEventListener('resize', () => resizeCanvas(clientCanvas, clientSignaturePad));
        }
        
        if (providerCanvas) {
            providerSignaturePad = new SignaturePad(providerCanvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)',
                minWidth: 1,
                maxWidth: 3,
            });
            
            function resizeCanvas(canvas, signaturePad) {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext('2d').scale(ratio, ratio);
                signaturePad.clear();
            }
            
            resizeCanvas(providerCanvas, providerSignaturePad);
            window.addEventListener('resize', () => resizeCanvas(providerCanvas, providerSignaturePad));
        }
    }

    // Clear signature buttons
    document.getElementById('clearClientSignature')?.addEventListener('click', () => {
        if (clientSignaturePad) clientSignaturePad.clear();
    });
    
    document.getElementById('clearProviderSignature')?.addEventListener('click', () => {
        if (providerSignaturePad) providerSignaturePad.clear();
    });

    // ============================================
    // Initialize EmailJS (if using)
    // ============================================
    
    function initEmailJS() {
        if (CONFIG.useEmailJS && typeof emailjs !== 'undefined') {
            emailjs.init(CONFIG.emailJS.publicKey);
        }
    }

    // ============================================
    // Set Default Values
    // ============================================
    
    function setDefaultValues() {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        
        const contractDateInput = document.getElementById('contractDate');
        const clientSignatureDateInput = document.getElementById('clientSignatureDate');
        const providerSignatureDateInput = document.getElementById('providerSignatureDate');
        
        if (contractDateInput) contractDateInput.value = dateString;
        if (clientSignatureDateInput) clientSignatureDateInput.value = dateString;
        if (providerSignatureDateInput) providerSignatureDateInput.value = dateString;
        
        // Auto-select package based on URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const packageParam = urlParams.get('package');
        if (packageParam) {
            const packageSelect = document.getElementById('selectedPackage');
            if (packageSelect) {
                packageSelect.value = packageParam;
                packageSelect.dispatchEvent(new Event('change'));
            }
        }
        
        // Auto-fill total cost based on package
        const packageSelect = document.getElementById('selectedPackage');
        if (packageSelect) {
            packageSelect.addEventListener('change', updateCostFromPackage);
        }
    }

    // ============================================
    // Update Cost Based on Package
    // ============================================
    
    function updateCostFromPackage() {
        const packageSelect = document.getElementById('selectedPackage');
        const totalCostInput = document.getElementById('totalProjectCost');
        
        if (!packageSelect || !totalCostInput) return;
        
        const selectedValue = packageSelect.value;
        let cost = 0;
        
        if (selectedValue.includes('Essential')) cost = 2000;
        else if (selectedValue.includes('Professional')) cost = 5000;
        else if (selectedValue.includes('Complete')) cost = 8000;
        
        if (cost > 0) {
            totalCostInput.value = cost;
            calculatePaymentAmounts();
        }
    }

    // ============================================
    // Calculate Payment Amounts
    // ============================================
    
    function calculatePaymentAmounts() {
        const totalCostInput = document.getElementById('totalProjectCost');
        const depositInput = document.getElementById('depositAmount');
        const finalInput = document.getElementById('finalAmount');
        
        if (!totalCostInput || !depositInput || !finalInput) return;
        
        const totalCost = parseFloat(totalCostInput.value) || 0;
        const deposit = totalCost * 0.5;
        const final = totalCost * 0.5;
        
        depositInput.value = `$${deposit.toFixed(2)}`;
        finalInput.value = `$${final.toFixed(2)}`;
    }

    // ============================================
    // Calculate Completion Date
    // ============================================
    
    function calculateCompletionDate() {
        const timelineSelect = document.getElementById('projectTimeline');
        const startDateInput = document.getElementById('projectStartDate');
        const completionDateInput = document.getElementById('estimatedCompletionDate');
        
        if (!timelineSelect || !startDateInput || !completionDateInput) return;
        
        const startDateValue = startDateInput.value;
        if (!startDateValue) return;
        
        const startDate = new Date(startDateValue);
        const timeline = timelineSelect.value;
        let weeks = 4; // Default to 4 weeks (standard)
        
        if (timeline.includes('Rush')) weeks = 2.5; // Average of 2-3 weeks
        else if (timeline.includes('Standard')) weeks = 5; // Average of 4-6 weeks
        else if (timeline.includes('Flexible')) weeks = 10; // 8+ weeks
        
        const completionDate = new Date(startDate);
        completionDate.setDate(completionDate.getDate() + (weeks * 7));
        
        completionDateInput.value = completionDate.toISOString().split('T')[0];
    }

    // ============================================
    // Show/Hide Custom Package Section
    // ============================================
    
    function handlePackageSelection() {
        const packageSelect = document.getElementById('selectedPackage');
        const customPackageGroup = document.getElementById('customPackageGroup');
        
        if (!packageSelect || !customPackageGroup) return;
        
        packageSelect.addEventListener('change', () => {
            if (packageSelect.value === 'Custom') {
                customPackageGroup.style.display = 'block';
            } else {
                customPackageGroup.style.display = 'none';
            }
            updateCostFromPackage();
            calculateCompletionDate();
        });
    }

    // ============================================
    // Event Listeners
    // ============================================
    
    document.getElementById('totalProjectCost')?.addEventListener('input', calculatePaymentAmounts);
    document.getElementById('projectTimeline')?.addEventListener('change', calculateCompletionDate);
    document.getElementById('projectStartDate')?.addEventListener('change', calculateCompletionDate);

    // ============================================
    // Form Validation
    // ============================================
    
    function validateForm() {
        const errors = {};
        
        // Required fields
        const requiredFields = {
            contractDate: 'Contract Date',
            clientName: 'Client Name',
            clientEmail: 'Client Email',
            clientBusiness: 'Client Business',
            selectedPackage: 'Selected Package',
            projectTimeline: 'Project Timeline',
            projectStartDate: 'Project Start Date',
            totalProjectCost: 'Total Project Cost',
            clientSignatureName: 'Client Signature Name',
            clientSignatureDate: 'Client Signature Date',
            termsAccepted: 'Terms Acceptance',
            signatureAccepted: 'Signature Acceptance'
        };
        
        // Validate required fields
        Object.keys(requiredFields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field) return;
            
            if (field.type === 'checkbox') {
                if (!field.checked) {
                    errors[fieldId] = `${requiredFields[fieldId]} is required`;
                }
            } else if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!field.value || !emailRegex.test(field.value)) {
                    errors[fieldId] = `Valid ${requiredFields[fieldId]} is required`;
                }
            } else if (field.tagName === 'SELECT') {
                if (!field.value) {
                    errors[fieldId] = `${requiredFields[fieldId]} is required`;
                }
            } else {
                if (!field.value.trim()) {
                    errors[fieldId] = `${requiredFields[fieldId]} is required`;
                }
            }
        });
        
        // Validate client signature
        if (!clientSignaturePad || clientSignaturePad.isEmpty()) {
            errors.clientSignature = 'Client signature is required';
        }
        
        // Validate total project cost
        const totalCost = parseFloat(document.getElementById('totalProjectCost')?.value || 0);
        if (totalCost <= 0) {
            errors.totalProjectCost = 'Total project cost must be greater than 0';
        }
        
        // Display errors
        Object.keys(errors).forEach(fieldId => {
            const errorElement = document.getElementById(`${fieldId}Error`);
            if (errorElement) {
                errorElement.textContent = errors[fieldId];
            }
        });
        
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => {
            const fieldId = el.id.replace('Error', '');
            if (!errors[fieldId]) {
                el.textContent = '';
            }
        });
        
        return Object.keys(errors).length === 0;
    }

    // ============================================
    // Populate PDF Content
    // ============================================
    
    function populatePDFContent() {
        const formData = new FormData(document.getElementById('contractForm'));
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Get signature images
        const clientSignatureData = clientSignaturePad ? clientSignaturePad.toDataURL() : '';
        const providerSignatureData = providerSignaturePad ? providerSignaturePad.toDataURL() : '';
        
        // Populate PDF fields
        document.getElementById('pdfContractDate').textContent = formatDate(data.contractDate);
        document.getElementById('pdfClientName').textContent = data.clientName || '';
        document.getElementById('pdfClientEmail').textContent = data.clientEmail || '';
        document.getElementById('pdfClientBusiness').textContent = data.clientBusiness || '';
        document.getElementById('pdfSelectedPackage').textContent = data.selectedPackage || '';
        document.getElementById('pdfProjectTimeline').textContent = data.projectTimeline || '';
        document.getElementById('pdfProjectStartDate').textContent = formatDate(data.projectStartDate);
        document.getElementById('pdfEstimatedCompletion').textContent = formatDate(data.estimatedCompletionDate);
        document.getElementById('pdfTotalCost').textContent = `$${parseFloat(data.totalProjectCost || 0).toFixed(2)}`;
        document.getElementById('pdfDeposit').textContent = `$${(parseFloat(data.totalProjectCost || 0) * 0.5).toFixed(2)}`;
        document.getElementById('pdfFinalPayment').textContent = `$${(parseFloat(data.totalProjectCost || 0) * 0.5).toFixed(2)}`;
        document.getElementById('pdfPaymentMethod').textContent = data.paymentMethod || 'Not specified';
        
        // Project description
        if (data.projectDescription || data.specialRequirements) {
            document.getElementById('pdfProjectDescriptionSection').style.display = 'block';
            document.getElementById('pdfProjectDescription').textContent = data.projectDescription || '';
            document.getElementById('pdfSpecialRequirements').textContent = data.specialRequirements || '';
        }
        
        // Signatures
        if (clientSignatureData) {
            const clientSigImg = document.createElement('img');
            clientSigImg.src = clientSignatureData;
            clientSigImg.style.maxWidth = '100%';
            clientSigImg.style.maxHeight = '80px';
            document.getElementById('pdfClientSignature').innerHTML = '';
            document.getElementById('pdfClientSignature').appendChild(clientSigImg);
        }
        
        if (providerSignatureData) {
            const providerSigImg = document.createElement('img');
            providerSigImg.src = providerSignatureData;
            providerSigImg.style.maxWidth = '100%';
            providerSigImg.style.maxHeight = '80px';
            document.getElementById('pdfProviderSignature').innerHTML = '';
            document.getElementById('pdfProviderSignature').appendChild(providerSigImg);
        }
        
        document.getElementById('pdfClientSignatureName').textContent = data.clientSignatureName || '';
        document.getElementById('pdfClientSignatureDate').textContent = formatDate(data.clientSignatureDate);
        document.getElementById('pdfProviderSignatureDate').textContent = formatDate(data.providerSignatureDate);
        document.getElementById('pdfGeneratedDate').textContent = new Date().toLocaleString();
    }

    // ============================================
    // Generate PDF
    // ============================================
    
    function generatePDF() {
        return new Promise((resolve, reject) => {
            const element = document.getElementById('contractPDF');
            
            // Wait for images to load before generating PDF
            const images = element.querySelectorAll('img');
            const imagePromises = Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((res) => {
                    img.onload = res;
                    img.onerror = res;
                    setTimeout(res, 5000); // Timeout after 5 seconds
                });
            });
            
            Promise.all(imagePromises).then(() => {
                const opt = {
                    margin: 0.5,
                    filename: `website-development-contract-${Date.now()}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true,
                        logging: false,
                        windowWidth: element.scrollWidth,
                        windowHeight: element.scrollHeight
                    },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                
                // Generate and save PDF
                html2pdf().set(opt).from(element).save().then(() => {
                    // Get PDF as blob for email attachment
                    html2pdf().set(opt).from(element).outputPdf('blob').then((blob) => {
                        resolve(blob);
                    }).catch(reject);
                }).catch(reject);
            }).catch(reject);
        });
    }

    // ============================================
    // Send Email with PDF
    // ============================================
    
    async function sendEmailWithPDF(pdfBlob, formData) {
        if (!CONFIG.useEmailJS) {
            // If not using EmailJS, you'll need to set up Netlify Functions
            console.log('EmailJS not configured. Set up Netlify Functions or configure EmailJS.');
            return false;
        }
        
        try {
            // Convert blob to base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    resolve(base64data);
                };
                reader.readAsDataURL(pdfBlob);
            });
            
            const base64PDF = await base64Promise;
            
            // Prepare email template parameters
            const templateParams = {
                to_agency: CONFIG.emailJS.agencyEmail,
                to_client: formData.clientEmail,
                client_name: formData.clientName,
                client_email: formData.clientEmail,
                client_business: formData.clientBusiness,
                package: formData.selectedPackage,
                total_cost: `$${parseFloat(formData.totalProjectCost || 0).toFixed(2)}`,
                deposit: `$${(parseFloat(formData.totalProjectCost || 0) * 0.5).toFixed(2)}`,
                final_payment: `$${(parseFloat(formData.totalProjectCost || 0) * 0.5).toFixed(2)}`,
                project_timeline: formData.projectTimeline,
                start_date: formatDate(formData.projectStartDate),
                contract_date: formatDate(formData.contractDate),
                pdf_attachment: base64PDF,
                pdf_filename: `website-development-contract-${Date.now()}.pdf`
            };
            
            // Send email via EmailJS
            // Note: EmailJS free tier doesn't support attachments directly
            // You'll need to use their paid plan or send a download link
            // For now, we'll send the email with contract details and download link
            
            await emailjs.send(
                CONFIG.emailJS.serviceID,
                CONFIG.emailJS.templateID,
                templateParams
            );
            
            return true;
        } catch (error) {
            console.error('Email sending error:', error);
            return false;
        }
    }

    // ============================================
    // Submit Form to Netlify
    // ============================================
    
    async function submitToNetlify(formData, pdfBlob) {
        // Convert PDF blob to base64 for Netlify form submission
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(pdfBlob);
        });
        
        const base64PDF = await base64Promise;
        
        // Create a hidden form for Netlify submission
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/';
        form.style.display = 'none';
        
        // Add all form fields
        Object.keys(formData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = formData[key];
            form.appendChild(input);
        });
        
        // Add PDF as base64
        const pdfInput = document.createElement('input');
        pdfInput.type = 'hidden';
        pdfInput.name = 'contract_pdf';
        pdfInput.value = base64PDF;
        form.appendChild(pdfInput);
        
        // Add form name
        const formNameInput = document.createElement('input');
        formNameInput.type = 'hidden';
        formNameInput.name = 'form-name';
        formNameInput.value = 'contract';
        form.appendChild(formNameInput);
        
        document.body.appendChild(form);
        
        // Submit (Netlify will handle it)
        try {
            await fetch('/', {
                method: 'POST',
                body: new FormData(form)
            });
            document.body.removeChild(form);
            return true;
        } catch (error) {
            console.error('Netlify submission error:', error);
            document.body.removeChild(form);
            return false;
        }
    }

    // ============================================
    // Format Date Helper
    // ============================================
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    // ============================================
    // Form Submission Handler
    // ============================================
    
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            showStatus('Please fill in all required fields correctly.', 'error');
            return;
        }
        
        // Disable submit button
        const submitBtn = document.getElementById('submitContract');
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loader').style.display = 'inline-block';
        
        try {
            // Get form data
            const formData = new FormData(document.getElementById('contractForm'));
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            // Populate PDF content
            populatePDFContent();
            
            // Generate PDF
            showStatus('Generating PDF...', '');
            const pdfBlob = await generatePDF();
            
            // Send email (if configured)
            if (CONFIG.useEmailJS) {
                showStatus('Sending emails...', '');
                await sendEmailWithPDF(pdfBlob, data);
            }
            
            // Submit to Netlify (as backup)
            showStatus('Submitting contract...', '');
            await submitToNetlify(data, pdfBlob);
            
            // Success
            showStatus('Contract submitted successfully! Check your email for a copy.', 'success');
            
            // Reset form after delay
            setTimeout(() => {
                document.getElementById('contractForm').reset();
                if (clientSignaturePad) clientSignaturePad.clear();
                if (providerSignaturePad) providerSignaturePad.clear();
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').style.display = 'inline';
                submitBtn.querySelector('.btn-loader').style.display = 'none';
            }, 5000);
            
        } catch (error) {
            console.error('Form submission error:', error);
            showStatus('An error occurred. Please try again or contact hello@justaweb.agency', 'error');
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loader').style.display = 'none';
        }
    }

    // ============================================
    // Show Status Message
    // ============================================
    
    function showStatus(message, type) {
        const statusDiv = document.getElementById('submitStatus');
        statusDiv.textContent = message;
        statusDiv.className = `submit-status ${type}`;
        statusDiv.style.display = 'block';
    }

    // ============================================
    // Initialize
    // ============================================
    
    document.addEventListener('DOMContentLoaded', () => {
        initSignaturePads();
        initEmailJS();
        setDefaultValues();
        handlePackageSelection();
        calculatePaymentAmounts();
        
        // Form submit handler
        document.getElementById('contractForm').addEventListener('submit', handleFormSubmit);
        
        // Real-time validation
        document.querySelectorAll('#contractForm input, #contractForm select').forEach(field => {
            field.addEventListener('blur', () => {
                validateForm();
            });
        });
    });

})();

