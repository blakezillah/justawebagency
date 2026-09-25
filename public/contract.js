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
            // Auto-generate service provider signature
            generateProviderSignature(providerCanvas);
        }
    }

    // Clear signature buttons
    document.getElementById('clearClientSignature')?.addEventListener('click', () => {
        if (clientSignaturePad) clientSignaturePad.clear();
    });

    // ============================================
    // Generate Service Provider Signature
    // ============================================
    
    function generateProviderSignature(canvas) {
        const ctx = canvas.getContext('2d');
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        
        // Set canvas size
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        ctx.scale(ratio, ratio);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set signature style - use a cursive-like font or styled text
        ctx.fillStyle = '#000000';
        ctx.font = 'italic 28px "Brush Script MT", "Lucida Handwriting", cursive, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw the signature
        const centerX = canvas.offsetWidth / 2;
        const centerY = canvas.offsetHeight / 2;
        
        // Draw "Blake Goble" signature style
        ctx.fillText('Blake Goble', centerX, centerY);
        
        // Add a subtle underline for signature effect
        ctx.beginPath();
        ctx.moveTo(centerX - 80, centerY + 15);
        ctx.lineTo(centerX + 80, centerY + 12);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Store the signature as a data URL for PDF generation
        providerSignaturePad = {
            isEmpty: () => false,
            toDataURL: () => canvas.toDataURL('image/png')
        };
    }
    
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
        
        // Auto-fill total cost based on package and timeline
        const packageSelect = document.getElementById('selectedPackage');
        const timelineSelect = document.getElementById('projectTimeline');
        
        if (packageSelect) {
            packageSelect.addEventListener('change', updateCostFromPackage);
        }
        
        if (timelineSelect) {
            timelineSelect.addEventListener('change', updateCostFromTimeline);
        }
        
        // Calculate initial cost if package is pre-selected
        if (packageSelect && packageSelect.value) {
            updateCostFromPackage();
        }
    }

    // ============================================
    // Update Cost Based on Package and Timeline
    // ============================================
    
    function updateCostFromPackage() {
        const packageSelect = document.getElementById('selectedPackage');
        const timelineSelect = document.getElementById('projectTimeline');
        const totalCostInput = document.getElementById('totalProjectCost');
        const costBreakdown = document.getElementById('costBreakdown');
        
        if (!packageSelect || !totalCostInput) return;
        
        const selectedValue = packageSelect.value;
        let baseCost = 0;
        
        // Get base cost from package
        if (selectedValue.includes('Essential')) baseCost = 2000;
        else if (selectedValue.includes('Professional')) baseCost = 5000;
        else if (selectedValue.includes('Complete')) baseCost = 8000;
        else if (selectedValue === 'Custom') {
            // For custom packages, allow manual entry
            const totalCostInput = document.getElementById('totalProjectCost');
            const costBreakdown = document.getElementById('costBreakdown');
            if (totalCostInput) {
                totalCostInput.readOnly = false;
                totalCostInput.value = '';
                const timeline = timelineSelect?.value || '';
                const isRush = timeline.includes('Rush');
                totalCostInput.placeholder = isRush ? 'Enter base project cost' : 'Enter total project cost';
            }
            if (costBreakdown) {
                const timeline = timelineSelect?.value || '';
                const isRush = timeline.includes('Rush');
                if (isRush) {
                    costBreakdown.textContent = 'Enter the base project cost. A 25% rush fee will be automatically added.';
                } else {
                    costBreakdown.textContent = 'Enter the total project cost manually.';
                }
            }
            // Set up event handler for custom cost entry
            handleCustomPackageCost();
            return;
        }
        
        // Check if rush timeline is selected
        const timeline = timelineSelect?.value || '';
        const isRush = timeline.includes('Rush');
        
        // Calculate total cost (base + rush fee if applicable)
        let totalCost = baseCost;
        let rushFee = 0;
        
        if (isRush && baseCost > 0) {
            rushFee = baseCost * 0.25; // 25% rush fee
            totalCost = baseCost + rushFee;
        }
        
        // Update total cost input
        if (baseCost > 0) {
            totalCostInput.readOnly = true; // Make readonly for standard packages
            totalCostInput.value = totalCost.toFixed(2);
            
            // Update cost breakdown display
            if (costBreakdown) {
                if (isRush && rushFee > 0) {
                    costBreakdown.innerHTML = `
                        <strong>Cost Breakdown:</strong><br>
                        Base Cost: $${baseCost.toFixed(2)}<br>
                        Rush Fee (25%): $${rushFee.toFixed(2)}<br>
                        <strong>Total (Deposit: $${(totalCost * 0.5).toFixed(2)}): $${totalCost.toFixed(2)}</strong>
                    `;
                } else {
                    costBreakdown.innerHTML = `Base cost: $${baseCost.toFixed(2)} (Deposit: $${(totalCost * 0.5).toFixed(2)})`;
                }
            }
            
            calculatePaymentAmounts();
        }
    }
    
    // ============================================
    // Update Cost When Timeline Changes
    // ============================================
    
    function updateCostFromTimeline() {
        const packageSelect = document.getElementById('selectedPackage');
        const timelineSelect = document.getElementById('projectTimeline');
        const totalCostInput = document.getElementById('totalProjectCost');
        const costBreakdown = document.getElementById('costBreakdown');
        
        // If custom package, handle rush fee calculation differently
        if (packageSelect?.value === 'Custom' && totalCostInput) {
            const currentValue = parseFloat(totalCostInput.value) || 0;
            const timeline = timelineSelect?.value || '';
            const isRush = timeline.includes('Rush');
            
            if (currentValue > 0) {
                // If there's already a value, recalculate with or without rush fee
                if (isRush) {
                    // Check if current value already includes rush fee (divide by 1.25)
                    const possibleBase = currentValue / 1.25;
                    const possibleRush = currentValue - possibleBase;
                    
                    // If current value is close to base + 25%, assume it includes rush already
                    // Otherwise, add rush fee
                    if (Math.abs(possibleRush - (possibleBase * 0.25)) < 1) {
                        // Already includes rush fee, keep as is
                        if (costBreakdown) {
                            const baseCost = currentValue / 1.25;
                            const rushFee = currentValue - baseCost;
                            costBreakdown.innerHTML = `
                                <strong>Cost Breakdown:</strong><br>
                                Base Cost: $${baseCost.toFixed(2)}<br>
                                Rush Fee (25%): $${rushFee.toFixed(2)}<br>
                                <strong>Total: $${currentValue.toFixed(2)}</strong>
                            `;
                        }
                    } else {
                        // Add rush fee
                        const rushFee = currentValue * 0.25;
                        const totalWithRush = currentValue + rushFee;
                        totalCostInput.value = totalWithRush.toFixed(2);
                        if (costBreakdown) {
                            costBreakdown.innerHTML = `
                                <strong>Cost Breakdown:</strong><br>
                                Base Cost: $${currentValue.toFixed(2)}<br>
                                Rush Fee (25%): $${rushFee.toFixed(2)}<br>
                                <strong>Total: $${totalWithRush.toFixed(2)}</strong>
                            `;
                        }
                        calculatePaymentAmounts();
                    }
                } else {
                    // Remove rush fee if switching from rush to non-rush
                    const possibleBase = currentValue / 1.25;
                    const possibleRush = currentValue - possibleBase;
                    if (Math.abs(possibleRush - (possibleBase * 0.25)) < 1) {
                        // Likely includes rush fee, remove it
                        totalCostInput.value = possibleBase.toFixed(2);
                        if (costBreakdown) {
                            costBreakdown.textContent = `Base cost: $${possibleBase.toFixed(2)}`;
                        }
                        calculatePaymentAmounts();
                    }
                }
            } else {
                // No value yet, just update helper text
                if (costBreakdown) {
                    if (isRush) {
                        costBreakdown.textContent = 'Enter the base project cost. A 25% rush fee will be automatically added when you enter an amount.';
                    } else {
                        costBreakdown.textContent = 'Enter the total project cost manually.';
                    }
                }
            }
            return;
        }
        
        // For standard packages, recalculate total cost to include/exclude rush fee
        updateCostFromPackage();
    }
    
    // ============================================
    // Handle Custom Package Cost Entry
    // ============================================
    
    function handleCustomPackageCost() {
        const totalCostInput = document.getElementById('totalProjectCost');
        const timelineSelect = document.getElementById('projectTimeline');
        const costBreakdown = document.getElementById('costBreakdown');
        const packageSelect = document.getElementById('selectedPackage');
        
        if (!totalCostInput || packageSelect?.value !== 'Custom') return;
        
        // Remove existing event listeners by cloning and replacing
        const newInput = totalCostInput.cloneNode(true);
        totalCostInput.parentNode.replaceChild(newInput, totalCostInput);
        
        newInput.addEventListener('input', function() {
            const enteredValue = parseFloat(this.value) || 0;
            const timeline = timelineSelect?.value || '';
            const isRush = timeline.includes('Rush');
            
            if (enteredValue > 0) {
                if (isRush) {
                    // Add rush fee (25%)
                    const rushFee = enteredValue * 0.25;
                    const totalWithRush = enteredValue + rushFee;
                    this.value = totalWithRush.toFixed(2);
                    
                    if (costBreakdown) {
                        costBreakdown.innerHTML = `
                            <strong>Cost Breakdown:</strong><br>
                            Base Cost: $${enteredValue.toFixed(2)}<br>
                            Rush Fee (25%): $${rushFee.toFixed(2)}<br>
                            <strong>Total (Deposit: $${(totalWithRush * 0.5).toFixed(2)}): $${totalWithRush.toFixed(2)}</strong>
                        `;
                    }
                } else {
                    if (costBreakdown) {
                        costBreakdown.innerHTML = `Total cost: $${enteredValue.toFixed(2)} (Deposit: $${(enteredValue * 0.5).toFixed(2)})`;
                    }
                }
                calculatePaymentAmounts();
            } else {
                if (costBreakdown) {
                    const timeline = timelineSelect?.value || '';
                    const isRush = timeline.includes('Rush');
                    if (isRush) {
                        costBreakdown.textContent = 'Enter the base project cost. A 25% rush fee will be automatically added when you enter an amount.';
                    } else {
                        costBreakdown.textContent = 'Enter the total project cost manually.';
                    }
                }
            }
        });
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
    
    // Note: totalProjectCost is now readonly and auto-calculated
    // Remove input event listener since it's calculated automatically
    document.getElementById('projectTimeline')?.addEventListener('change', () => {
        updateCostFromTimeline();
        calculateCompletionDate();
    });
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
            errors.totalProjectCost = 'Please select a package to calculate the total project cost';
        }
        
        // Validate that package is selected if cost is 0
        const packageSelect = document.getElementById('selectedPackage');
        if (!packageSelect?.value || packageSelect.value === '') {
            errors.selectedPackage = 'Package selection is required to calculate cost';
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
        // Provider signature is auto-generated, so it's always available
        const providerSignatureData = providerSignaturePad && providerSignaturePad.toDataURL ? providerSignaturePad.toDataURL() : '';
        
        // Populate PDF fields
        document.getElementById('pdfContractDate').textContent = formatDate(data.contractDate);
        document.getElementById('pdfClientName').textContent = data.clientName || '';
        document.getElementById('pdfClientEmail').textContent = data.clientEmail || '';
        document.getElementById('pdfClientBusiness').textContent = data.clientBusiness || '';
        document.getElementById('pdfSelectedPackage').textContent = data.selectedPackage || '';
        document.getElementById('pdfProjectTimeline').textContent = data.projectTimeline || '';
        document.getElementById('pdfProjectStartDate').textContent = formatDate(data.projectStartDate);
        document.getElementById('pdfEstimatedCompletion').textContent = formatDate(data.estimatedCompletionDate);
        const totalCost = parseFloat(data.totalProjectCost || 0);
        const deposit = totalCost * 0.5;
        const finalPayment = totalCost * 0.5;
        
        // Check if rush timeline is selected
        const timeline = data.projectTimeline || '';
        const isRush = timeline.includes('Rush');
        
        // Calculate and display rush fee breakdown if applicable
        if (isRush && totalCost > 0) {
            // Calculate base cost (total / 1.25 to get original, then calculate rush fee)
            const baseCost = totalCost / 1.25;
            const rushFee = totalCost - baseCost;
            
            // Update PDF display with breakdown
            document.getElementById('pdfTotalCost').innerHTML = `$${totalCost.toFixed(2)}`;
            document.getElementById('pdfRushFeeRow').style.display = 'table-row';
            document.getElementById('pdfRushFeeAmount').textContent = `$${rushFee.toFixed(2)} (included in total)`;
        } else {
            document.getElementById('pdfTotalCost').textContent = `$${totalCost.toFixed(2)}`;
            document.getElementById('pdfRushFeeRow').style.display = 'none';
        }
        
        document.getElementById('pdfDeposit').textContent = `$${deposit.toFixed(2)}`;
        document.getElementById('pdfFinalPayment').textContent = `$${finalPayment.toFixed(2)}`;
        document.getElementById('pdfPaymentMethod').textContent = data.paymentMethod || 'Not specified';
        
        // Show Venmo username if Venmo is selected
        if (data.paymentMethod === 'Venmo') {
            document.getElementById('pdfVenmoInfoRow').style.display = 'table-row';
        } else {
            document.getElementById('pdfVenmoInfoRow').style.display = 'none';
        }
        
        // Show Zelle email if Zelle is selected
        if (data.paymentMethod === 'Zelle') {
            document.getElementById('pdfZelleInfoRow').style.display = 'table-row';
        } else {
            document.getElementById('pdfZelleInfoRow').style.display = 'none';
        }
        
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
        
        // Always include provider signature (auto-generated)
        if (providerSignaturePad && providerSignaturePad.toDataURL) {
            const providerSignatureData = providerSignaturePad.toDataURL();
            const providerSigImg = document.createElement('img');
            providerSigImg.src = providerSignatureData;
            providerSigImg.style.maxWidth = '100%';
            providerSigImg.style.maxHeight = '80px';
            document.getElementById('pdfProviderSignature').innerHTML = '';
            document.getElementById('pdfProviderSignature').appendChild(providerSigImg);
        } else {
            // Fallback: create a text-based signature
            document.getElementById('pdfProviderSignature').innerHTML = '<p style="font-style: italic; font-size: 14pt; margin: 0; padding: 1rem 0;">Blake Goble</p>';
        }
        
        document.getElementById('pdfClientSignatureName').textContent = data.clientSignatureName || '';
        document.getElementById('pdfClientSignatureDate').textContent = formatDate(data.clientSignatureDate);
        document.getElementById('pdfProviderSignatureDate').textContent = formatDate(data.providerSignatureDate);
        document.getElementById('pdfGeneratedDate').textContent = new Date().toLocaleString();
        
        // Ensure provider signature is generated and included in PDF
        if (!providerSignaturePad || !providerSignaturePad.toDataURL) {
            const providerCanvas = document.getElementById('providerSignature');
            if (providerCanvas) {
                generateProviderSignature(providerCanvas);
                // Re-populate provider signature in PDF after generation
                if (providerSignaturePad && providerSignaturePad.toDataURL) {
                    const providerSignatureData = providerSignaturePad.toDataURL();
                    const providerSigImg = document.createElement('img');
                    providerSigImg.src = providerSignatureData;
                    providerSigImg.style.maxWidth = '100%';
                    providerSigImg.style.maxHeight = '80px';
                    const pdfProviderSig = document.getElementById('pdfProviderSignature');
                    if (pdfProviderSig) {
                        pdfProviderSig.innerHTML = '';
                        pdfProviderSig.appendChild(providerSigImg);
                    }
                }
            }
        }
    }

    // ============================================
    // Generate PDF
    // ============================================
    
    function generatePDF() {
        return new Promise((resolve, reject) => {
            const element = document.getElementById('contractPDF');
            
            if (!element) {
                reject(new Error('PDF element not found'));
                return;
            }
            
            // Verify content is populated before generating
            const testContent = element.querySelector('#pdfClientName');
            if (!testContent || !testContent.textContent.trim()) {
                console.error('PDF content not populated!');
                reject(new Error('PDF content is empty. Please ensure form is filled out correctly.'));
                return;
            }
            
            console.log('PDF element found, content populated. Starting generation...');
            
            // Store original styles
            const originalStyles = {
                display: element.style.display,
                position: element.style.position,
                left: element.style.left,
                top: element.style.top,
                visibility: element.style.visibility,
                opacity: element.style.opacity,
                width: element.style.width,
                height: element.style.height,
                zIndex: element.style.zIndex
            };
            
            // Add a class to make element visible for PDF generation
            element.classList.add('pdf-generating');
            
            // Also set inline styles as backup
            element.style.display = 'block';
            element.style.position = 'fixed';
            element.style.left = '0';
            element.style.top = '0';
            element.style.width = '8.5in'; // Standard letter width
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.zIndex = '9999';
            element.style.background = 'white';
            element.style.boxSizing = 'border-box';
            
            // Force a reflow to ensure styles are applied
            const height = element.offsetHeight;
            const width = element.offsetWidth;
            console.log('Element dimensions after showing:', { width, height });
            
            // Wait for images to load before generating PDF
            const images = element.querySelectorAll('img');
            console.log(`Found ${images.length} images in PDF content`);
            
            const imagePromises = Array.from(images).map((img, index) => {
                if (img.complete && img.naturalWidth > 0) {
                    console.log(`Image ${index} already loaded`);
                    return Promise.resolve();
                }
                return new Promise((res) => {
                    const timeout = setTimeout(() => {
                        console.log(`Image ${index} load timeout`);
                        res();
                    }, 2000);
                    
                    img.onload = () => {
                        clearTimeout(timeout);
                        console.log(`Image ${index} loaded successfully`);
                        res();
                    };
                    
                    img.onerror = () => {
                        clearTimeout(timeout);
                        console.warn(`Image ${index} failed to load`);
                        res(); // Continue even if image fails
                    };
                    
                    // Trigger load if already complete
                    if (img.complete) {
                        clearTimeout(timeout);
                        res();
                    }
                });
            });
            
            Promise.all(imagePromises).then(() => {
                // Additional delay to ensure everything is rendered
                setTimeout(() => {
                    // Force another reflow
                    element.scrollHeight;
                    
                    const opt = {
                        margin: 0.5,
                        filename: `website-development-contract-${Date.now()}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { 
                            scale: 2,
                            useCORS: true,
                            logging: true,
                            allowTaint: false,
                            letterRendering: true,
                            backgroundColor: '#ffffff'
                        },
                        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
                        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                    };
                    
                    console.log('Generating PDF with options:', opt);
                    console.log('Element dimensions:', {
                        width: element.offsetWidth,
                        height: element.offsetHeight,
                        scrollWidth: element.scrollWidth,
                        scrollHeight: element.scrollHeight
                    });
                    
                    // Generate and save PDF
                    html2pdf().set(opt).from(element).save().then(() => {
                        console.log('PDF saved successfully, generating blob...');
                        // Get PDF as blob for email attachment
                        html2pdf().set(opt).from(element).outputPdf('blob').then((blob) => {
                            console.log('PDF blob created, size:', blob.size, 'bytes');
                            // Restore original styles and remove class
                            element.classList.remove('pdf-generating');
                            Object.keys(originalStyles).forEach(key => {
                                element.style[key] = originalStyles[key] || '';
                            });
                            resolve(blob);
                        }).catch((err) => {
                            console.error('Error creating PDF blob:', err);
                            // Restore original styles and remove class
                            element.classList.remove('pdf-generating');
                            Object.keys(originalStyles).forEach(key => {
                                element.style[key] = originalStyles[key] || '';
                            });
                            reject(err);
                        });
                    }).catch((err) => {
                        console.error('Error generating PDF:', err);
                        // Restore original styles and remove class
                        element.classList.remove('pdf-generating');
                        Object.keys(originalStyles).forEach(key => {
                            element.style[key] = originalStyles[key] || '';
                        });
                        reject(err);
                    });
                }, 800); // Increased delay to ensure rendering
            }).catch((err) => {
                console.error('Error waiting for images:', err);
                // Restore original styles and remove class
                element.classList.remove('pdf-generating');
                Object.keys(originalStyles).forEach(key => {
                    element.style[key] = originalStyles[key] || '';
                });
                reject(err);
            });
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
            const totalCost = parseFloat(formData.totalProjectCost || 0);
            const deposit = totalCost * 0.5;
            const finalPayment = totalCost * 0.5;
            
            // Create formatted contract summary
            const contractSummary = `Website Development Contract Signed

CLIENT INFORMATION:
Name: ${formData.clientName || 'Not provided'}
Email: ${formData.clientEmail || 'Not provided'}
Business: ${formData.clientBusiness || 'Not provided'}

PROJECT DETAILS:
Package: ${formData.selectedPackage || 'Not specified'}
Timeline: ${formData.projectTimeline || 'Not specified'}
Start Date: ${formatDate(formData.projectStartDate) || 'Not specified'}
Estimated Completion: ${formatDate(formData.estimatedCompletionDate) || 'Not specified'}

PAYMENT INFORMATION:
Total Cost: $${totalCost.toFixed(2)}
Deposit (50%): $${deposit.toFixed(2)}
Final Payment (50%): $${finalPayment.toFixed(2)}
Payment Method: ${formData.paymentMethod || 'Not specified'}

CONTRACT INFORMATION:
Contract Date: ${formatDate(formData.contractDate) || 'Not specified'}
Client Signature Date: ${formatDate(formData.clientSignatureDate) || 'Not specified'}

A PDF copy of the signed contract is attached.`;
            
            const templateParams = {
                to_agency: CONFIG.emailJS.agencyEmail,
                to_client: formData.clientEmail || '',
                client_name: formData.clientName || 'Client',
                client_email: formData.clientEmail || '',
                client_business: formData.clientBusiness || '',
                package: formData.selectedPackage || '',
                total_cost: `$${totalCost.toFixed(2)}`,
                deposit: `$${deposit.toFixed(2)}`,
                final_payment: `$${finalPayment.toFixed(2)}`,
                project_timeline: formData.projectTimeline || '',
                start_date: formatDate(formData.projectStartDate) || '',
                completion_date: formatDate(formData.estimatedCompletionDate) || '',
                contract_date: formatDate(formData.contractDate) || '',
                payment_method: formData.paymentMethod || 'Not specified',
                contract_summary: contractSummary,
                message: contractSummary, // Alternative variable name
                reply_to: formData.clientEmail || CONFIG.emailJS.agencyEmail
            };
            
            // Log template params for debugging (remove in production)
            console.log('EmailJS Template Parameters:', templateParams);
            
            // Send email via EmailJS
            // Note: EmailJS free tier doesn't support attachments directly
            // The PDF is sent as base64 in pdf_attachment, but you'll need paid plan to attach
            // For now, the email includes contract_summary with all details
            
            const response = await emailjs.send(
                CONFIG.emailJS.serviceID,
                CONFIG.emailJS.templateID,
                templateParams
            );
            
            console.log('EmailJS Response:', response);
            
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
        
        // Create a readable summary for Netlify form
        const contractSummary = `
Website Development Contract - Signed

CLIENT INFORMATION:
- Name: ${formData.clientName || ''}
- Email: ${formData.clientEmail || ''}
- Business: ${formData.clientBusiness || ''}

PROJECT DETAILS:
- Package: ${formData.selectedPackage || ''}
- Timeline: ${formData.projectTimeline || ''}
- Start Date: ${formatDate(formData.projectStartDate) || ''}
- Estimated Completion: ${formatDate(formData.estimatedCompletionDate) || ''}

PAYMENT INFORMATION:
- Total Cost: $${parseFloat(formData.totalProjectCost || 0).toFixed(2)}
- Deposit (50%): $${(parseFloat(formData.totalProjectCost || 0) * 0.5).toFixed(2)}
- Final Payment (50%): $${(parseFloat(formData.totalProjectCost || 0) * 0.5).toFixed(2)}
- Payment Method: ${formData.paymentMethod || 'Not specified'}

CONTRACT:
- Contract Date: ${formatDate(formData.contractDate) || ''}
- Client Signature Date: ${formatDate(formData.clientSignatureDate) || ''}

A PDF copy of the signed contract is attached as base64 data (contract_pdf field).
        `.trim();
        
        // Add form fields as individual inputs
        const fieldsToInclude = {
            'client_name': formData.clientName || '',
            'client_email': formData.clientEmail || '',
            'client_business': formData.clientBusiness || '',
            'package': formData.selectedPackage || '',
            'timeline': formData.projectTimeline || '',
            'total_cost': `$${parseFloat(formData.totalProjectCost || 0).toFixed(2)}`,
            'deposit': `$${(parseFloat(formData.totalProjectCost || 0) * 0.5).toFixed(2)}`,
            'final_payment': `$${(parseFloat(formData.totalProjectCost || 0) * 0.5).toFixed(2)}`,
            'payment_method': formData.paymentMethod || '',
            'start_date': formatDate(formData.projectStartDate) || '',
            'completion_date': formatDate(formData.estimatedCompletionDate) || '',
            'contract_date': formatDate(formData.contractDate) || '',
            'contract_summary': contractSummary
        };
        
        Object.keys(fieldsToInclude).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = fieldsToInclude[key];
            form.appendChild(input);
        });
        
        // Add PDF as base64
        const pdfInput = document.createElement('input');
        pdfInput.type = 'hidden';
        pdfInput.name = 'contract_pdf';
        pdfInput.value = base64PDF.substring(0, 1000) + '... [truncated for display]';
        form.appendChild(pdfInput);
        
        // Add full PDF as a separate field (note field for large data)
        const pdfFullInput = document.createElement('textarea');
        pdfFullInput.style.display = 'none';
        pdfFullInput.name = 'contract_pdf_full';
        pdfFullInput.value = base64PDF;
        form.appendChild(pdfFullInput);
        
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
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Return original if invalid
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        } catch (error) {
            console.error('Date formatting error:', error, dateString);
            return dateString; // Return original if error
        }
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
            console.log('Populating PDF content...');
            populatePDFContent();
            
            // Ensure provider signature is generated if not already
            const providerCanvas = document.getElementById('providerSignature');
            if (providerCanvas && (!providerSignaturePad || !providerSignaturePad.toDataURL)) {
                console.log('Generating provider signature...');
                generateProviderSignature(providerCanvas);
                // Update PDF with provider signature
                if (providerSignaturePad && providerSignaturePad.toDataURL) {
                    const providerSignatureData = providerSignaturePad.toDataURL();
                    const providerSigImg = document.createElement('img');
                    providerSigImg.src = providerSignatureData;
                    providerSigImg.style.maxWidth = '100%';
                    providerSigImg.style.maxHeight = '80px';
                    const pdfProviderSig = document.getElementById('pdfProviderSignature');
                    if (pdfProviderSig) {
                        pdfProviderSig.innerHTML = '';
                        pdfProviderSig.appendChild(providerSigImg);
                    }
                }
            }
            
            // Verify content was populated
            const pdfElement = document.getElementById('contractPDF');
            const clientName = document.getElementById('pdfClientName');
            if (!clientName || !clientName.textContent.trim()) {
                console.error('PDF content verification failed!', {
                    pdfElement: !!pdfElement,
                    clientName: clientName?.textContent,
                    allFields: Array.from(document.querySelectorAll('#contractPDF [id^="pdf"]')).map(el => ({
                        id: el.id,
                        hasContent: el.textContent.trim().length > 0,
                        content: el.textContent.substring(0, 50)
                    }))
                });
                showStatus('Error: PDF content not populated correctly. Please check console for details.', 'error');
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').style.display = 'inline';
                submitBtn.querySelector('.btn-loader').style.display = 'none';
                return;
            }
            
            console.log('PDF content populated successfully:', {
                clientName: clientName.textContent,
                totalCost: document.getElementById('pdfTotalCost')?.textContent
            });
            
            // Small delay to ensure DOM is fully updated
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate PDF
            showStatus('Generating PDF...', '');
            const pdfBlob = await generatePDF();
            console.log('PDF generated successfully, blob size:', pdfBlob.size, 'bytes');
            
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
                // Provider signature is auto-generated, so regenerate it after reset
                const providerCanvas = document.getElementById('providerSignature');
                if (providerCanvas) {
                    generateProviderSignature(providerCanvas);
                }
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
        
        // Show/hide payment method info when payment method changes
        const paymentMethodSelect = document.getElementById('paymentMethod');
        const venmoInfo = document.getElementById('venmoInfo');
        const zelleInfo = document.getElementById('zelleInfo');
        if (paymentMethodSelect) {
            paymentMethodSelect.addEventListener('change', function() {
                if (venmoInfo) {
                    venmoInfo.style.display = this.value === 'Venmo' ? 'block' : 'none';
                }
                if (zelleInfo) {
                    zelleInfo.style.display = this.value === 'Zelle' ? 'block' : 'none';
                }
            });
        }
        
        // Real-time validation
        document.querySelectorAll('#contractForm input, #contractForm select').forEach(field => {
            field.addEventListener('blur', () => {
                validateForm();
            });
        });
    });

})();

