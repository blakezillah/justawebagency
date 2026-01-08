# Contract Signing Page - Quick Start

## ✅ What's Been Created

1. **contract.html** - Contract signing form page (non-indexed)
2. **contract.css** - Styling for the contract page
3. **contract.js** - JavaScript for form handling, signatures, PDF generation, and email
4. **CONTRACT_SETUP_GUIDE.md** - Detailed setup instructions
5. **robots.txt** - Updated to block contract page from search engines

## 🚀 Quick Setup (5 Minutes)

### Step 1: Set Up EmailJS (Recommended)

1. Go to https://www.emailjs.com and create a free account
2. Add an email service (Gmail, Outlook, etc.)
3. Create an email template (see CONTRACT_SETUP_GUIDE.md for template)
4. Get your Service ID, Template ID, and Public Key
5. Open `contract.js` and update the CONFIG object (lines 12-24):
   ```javascript
   const CONFIG = {
       useEmailJS: true,
       emailJS: {
           serviceID: 'your_service_id',
           templateID: 'your_template_id',
           publicKey: 'your_public_key',
           agencyEmail: 'hello@justaweb.agency'
       }
   };
   ```

### Step 2: Test It

1. Open `contract.html` in your browser
2. Fill out the form
3. Sign with your mouse/finger
4. Submit the form
5. Check that:
   - PDF downloads automatically
   - Email is sent to client and you (check spam folder)

## 📧 Payment Flow

**As configured in the contract:**
- **50% deposit** - Due when contract is signed (you'll invoice after receiving signed contract)
- **50% final payment** - Due prior to launch (before transferring final files)

The contract automatically calculates these amounts based on the total project cost.

## 🔗 How to Use

1. **Send link to clients:**
   - Option A: Direct link: `https://justaweb.agency/contract.html?package=Professional%20-%20$5,000`
   - Option B: Add link in your client onboarding email
   - Option C: Create a simple landing page that links to the contract

2. **Client fills out form:**
   - All required fields are marked with *
   - Package selection auto-fills cost (or client can enter custom amount)
   - Timeline selection auto-calculates completion date

3. **Client signs digitally:**
   - Uses mouse (desktop) or finger (mobile)
   - Can clear and re-sign if needed

4. **Client submits:**
   - PDF is generated automatically
   - PDF downloads to client's computer
   - Email sent to both client and you (if EmailJS configured)
   - Form data also saved to Netlify Forms as backup

5. **You receive:**
   - Email with contract details (if EmailJS set up)
   - Netlify form submission (check Netlify dashboard)
   - Can request PDF from client if needed

## ⚙️ Customization

### Update Default Values
- Edit `contract.js` → `setDefaultValues()` function
- Change default dates, package options, etc.

### Change Payment Split
- Edit `contract.js` → `calculatePaymentAmounts()` function
- Change `0.5` to your desired split (e.g., `0.33` for 33/33/33)

### Update Email Template
- Log into EmailJS dashboard
- Edit your email template
- Add/remove variables as needed

### Customize Styling
- Edit `contract.css` to match your brand
- Update colors, fonts, spacing, etc.

## 🔒 Security

- ✅ Contract page is non-indexed (noindex meta tags + robots.txt)
- ✅ All validation happens client-side
- ✅ Form submissions stored in Netlify (secure)
- ✅ Emails sent via secure EmailJS service

## 📝 Important Notes

1. **EmailJS Free Tier:**
   - 200 emails/month
   - No attachment support (PDF sent as download link in email)
   - Upgrade to paid ($15/month) for attachments

2. **Netlify Forms Backup:**
   - Form data always saved to Netlify Forms
   - PDF stored as base64 in form submission
   - Can download PDF from Netlify dashboard

3. **Browser Compatibility:**
   - Works on all modern browsers
   - Signature pad works on desktop and mobile
   - PDF generation works on Chrome, Firefox, Safari, Edge

## 🐛 Troubleshooting

**PDF not generating?**
- Check browser console for errors
- Try different browser
- Ensure html2pdf.js library loads (check network tab)

**Email not sending?**
- Verify EmailJS credentials in contract.js
- Check EmailJS dashboard for error logs
- Check spam folder
- Test EmailJS template separately

**Signatures not working?**
- Clear browser cache
- Try different browser
- Check canvas element loads properly

## 📚 Full Documentation

See **CONTRACT_SETUP_GUIDE.md** for:
- Detailed EmailJS setup
- Netlify Functions alternative
- Email template examples
- Advanced customization

## ✨ Features

- ✅ Digital signature capture (mouse/finger)
- ✅ Automatic PDF generation
- ✅ Email to both parties
- ✅ Netlify Forms backup
- ✅ Auto-calculates payment amounts
- ✅ Auto-calculates completion date
- ✅ Form validation
- ✅ Mobile responsive
- ✅ Non-indexed (private)

---

**Ready to use!** Just configure EmailJS and you're good to go! 🎉

