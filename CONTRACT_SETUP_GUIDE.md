# Contract Signing Page Setup Guide

This guide walks you through setting up the contract signing page so clients can sign contracts digitally, generate PDFs, and have them emailed to both parties.

## 📋 What's Included

- **contract.html** - The contract signing form
- **contract.css** - Styling for the contract page
- **contract.js** - JavaScript for form handling, signatures, PDF generation, and email

## 🚀 Quick Setup

### Option 1: Using EmailJS (Recommended - Easy Setup)

1. **Sign up for EmailJS**
   - Go to https://www.emailjs.com
   - Create a free account (free tier allows 200 emails/month)
   - Navigate to Email Services

2. **Add an Email Service**
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions
   - Note your **Service ID**

3. **Create an Email Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Use this template structure:

**Subject:** Website Development Contract - {{client_name}}

**Body:**
```
Dear {{client_name}},

Thank you for signing the website development contract!

Contract Details:
- Client: {{client_name}} ({{client_email}})
- Business: {{client_business}}
- Package: {{package}}
- Total Cost: {{total_cost}}
- Deposit (50%): {{deposit}}
- Final Payment (50%): {{final_payment}}
- Timeline: {{project_timeline}}
- Start Date: {{start_date}}

A PDF copy of your signed contract is attached.

The deposit of {{deposit}} is due upon contract signing.
The final payment of {{final_payment}} is due prior to launch.

Next Steps:
1. We'll process your deposit and send a payment confirmation
2. We'll schedule the project kickoff meeting (Stage 1: Discover)
3. We'll begin work according to the timeline

If you have any questions, please contact us at hello@justaweb.agency

Best regards,
justaweb.agency
```

   - Save the template and note your **Template ID**

4. **Get Your Public Key**
   - Go to "Account" → "General"
   - Copy your **Public Key**

5. **Update contract.js**
   - Open `contract.js`
   - Find the `CONFIG` object at the top (around line 12)
   - Update these values:
     ```javascript
     const CONFIG = {
         useEmailJS: true,
         emailJS: {
             serviceID: 'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
             templateID: 'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
             publicKey: 'YOUR_PUBLIC_KEY', // Replace with your EmailJS public key
             agencyEmail: 'hello@justaweb.agency' // Your agency email
         }
     };
     ```

6. **EmailJS Attachment Limitation**
   - **Important:** EmailJS free tier doesn't support attachments directly
   - You have two options:
     
     **Option A:** Upgrade to EmailJS paid plan ($15/month) for attachment support
     
     **Option B:** Use EmailJS to send notification emails, and store PDFs in Netlify Forms (see Option 2)

### Option 2: Using Netlify Functions (For PDF Attachments)

If you need to send PDFs as email attachments and don't want to pay for EmailJS, set up Netlify Functions:

1. **Create Netlify Function**
   - Create a folder: `netlify/functions/`
   - Create file: `netlify/functions/send-contract-email.js`

2. **Install Dependencies**
   - Create `package.json` in root:
     ```json
     {
       "name": "justawebagency",
       "version": "1.0.0",
       "dependencies": {
         "@sendgrid/mail": "^7.7.0"
       }
     }
     ```

3. **Set Up SendGrid (or use another email service)**
   - Sign up at https://sendgrid.com (free tier: 100 emails/day)
   - Get your API key
   - Add to Netlify environment variables: `SENDGRID_API_KEY`

4. **Create the Function**
   ```javascript
   const sgMail = require('@sendgrid/mail');
   
   exports.handler = async (event, context) => {
     if (event.httpMethod !== 'POST') {
       return { statusCode: 405, body: 'Method Not Allowed' };
     }
     
     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
     
     const data = JSON.parse(event.body);
     
     const msg = {
       to: [data.clientEmail, data.agencyEmail],
       from: 'hello@justaweb.agency',
       subject: `Website Development Contract - ${data.clientName}`,
       text: `Contract details attached.`,
       attachments: [
         {
           content: data.pdfBase64,
           filename: 'contract.pdf',
           type: 'application/pdf',
           disposition: 'attachment'
         }
       ]
     };
     
     try {
       await sgMail.send(msg);
       return {
         statusCode: 200,
         body: JSON.stringify({ message: 'Email sent successfully' })
       };
     } catch (error) {
       return {
         statusCode: 500,
         body: JSON.stringify({ error: error.message })
       };
     }
   };
   ```

5. **Update contract.js**
   - Set `useEmailJS: false`
   - Update the `sendEmailWithPDF` function to call the Netlify function instead

## 📧 Setting Up Netlify Forms (Backup)

Even if using EmailJS, set up Netlify Forms as a backup:

1. **Add hidden form to contract.html**
   The form is already configured in `contract.js` to submit to Netlify.

2. **Configure Netlify Email Notifications**
   - Go to your Netlify site dashboard
   - Navigate to Settings → Forms → Form notifications
   - Add email notification for form name: `contract`
   - Netlify will email you when a contract is submitted

3. **Access Form Submissions**
   - Go to your Netlify dashboard
   - Click "Forms" → "contract"
   - View all submitted contracts
   - Download the PDF from the form data (it's stored as base64)

## 🔒 Security Considerations

1. **No Indexing**
   - The contract page includes `noindex` meta tags
   - Add to robots.txt: `Disallow: /contract.html`

2. **Form Validation**
   - All required fields are validated client-side
   - Consider adding server-side validation via Netlify Functions

3. **Email Security**
   - Don't expose EmailJS public key (it's safe to include in client-side code, but keep your private keys secret)
   - Use environment variables for sensitive keys in Netlify Functions

## ✅ Testing the Setup

1. **Test Form Submission**
   - Fill out the contract form
   - Sign with your mouse/finger
   - Submit the form
   - Check that PDF downloads automatically
   - Verify email is sent (check spam folder)

2. **Test Email Delivery**
   - Send a test contract to yourself first
   - Verify the email arrives with correct formatting
   - Check that all variables are populated correctly

3. **Test PDF Generation**
   - Open the generated PDF
   - Verify all information is correct
   - Check that signatures appear properly
   - Ensure formatting looks professional

## 🐛 Troubleshooting

### PDF not generating
- Check browser console for errors
- Ensure html2pdf.js library is loaded
- Try a different browser

### Email not sending
- Check EmailJS dashboard for error logs
- Verify Service ID, Template ID, and Public Key are correct
- Check email spam folder
- Test with EmailJS test email feature

### Signatures not appearing in PDF
- Ensure signatures are drawn before submission
- Check canvas element is properly sized
- Verify signature pad is initialized

### Netlify form not submitting
- Check that form has `name="contract"` attribute
- Verify Netlify site is connected
- Check Netlify Functions logs if using functions

## 📝 Customization

### Update Contract Terms
- Edit `contract.html` to match your contract terms
- Update payment percentages if different from 50/50
- Modify sections as needed

### Styling
- Edit `contract.css` to match your brand colors
- Update fonts, spacing, etc. to match your site

### Email Template
- Customize the email template in EmailJS
- Add more variables if needed
- Update the email content in the Netlify Function if using that option

## 🎯 Next Steps After Setup

1. **Test everything thoroughly**
2. **Send test contract to yourself**
3. **Update contract.js with your EmailJS credentials**
4. **Add contract.html link to your website** (e.g., in client portal or onboarding email)
5. **Create a simple landing page or add link in your client communication**

## 📞 Support

If you need help:
- EmailJS Documentation: https://www.emailjs.com/docs/
- Netlify Functions: https://docs.netlify.com/functions/overview/
- html2pdf.js: https://github.com/eKoopmans/html2pdf.js

---

**Ready to use!** Once configured, clients can sign contracts digitally and receive PDF copies automatically.

