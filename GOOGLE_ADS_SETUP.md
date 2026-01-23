# Google Ads Conversion Tracking Setup

## What's Been Added

I've added Google Ads conversion tracking using the "Click" event snippet (for measuring conversions before they happen, such as on a lead form's "submit" button). The tracking code will fire when any form is successfully submitted:

- Main contact form (`contactForm`)
- Lead magnet form (`leadMagnetForm`) 
- Contact modal form (`contactModalForm`)

The implementation uses the `ads_conversion_submit_lead_form` event with a helper function that ensures the conversion is tracked before any navigation or form processing completes.

## Next Steps

### 1. Create a Conversion Action in Google Ads

1. Log in to your Google Ads account
2. Go to **Tools & Settings** → **Conversions**
3. Click the **+** button to create a new conversion action
4. Select **Website** as the source
5. Choose **Submit lead form** as the category
6. Name it something like "Form Submission" or "Contact Form"
7. Set the value (optional) - you can use a fixed value or leave it dynamic
8. Click **Create and continue**

### 2. Get Your Conversion ID and Label

After creating the conversion action, Google Ads will provide you with:
- **Conversion ID**: Looks like `AW-1234567890` (starts with AW-)
- **Conversion Label**: A string like `AbC-D_efG-hI1`

### 3. Update the Code

Replace the placeholders in `index.html`:

#### In `index.html` (around lines 22-27 and 42-43):
- Replace `AW-XXXXXXXXX` with your actual Conversion ID (appears in the script src URL and config)
- Replace `AW-XXXXXXXXX/YYYYYYYYYY` in the `gtagSendConversionEvent` function with your Conversion ID and Label
- Format: `AW-1234567890/AbC-D_efG-hI1`
- Example: `'send_to': 'AW-1234567890/AbC-D_efG-hI1'`

### 4. Test the Conversion

1. Submit a test form on your website
2. Wait a few minutes
3. Go to Google Ads → **Tools & Settings** → **Conversions**
4. Click on your conversion action
5. Check the **Recent conversions** section to verify it's tracking

## How It Works

When a form is successfully submitted:
1. The form data is sent to Netlify via fetch()
2. Upon successful submission, the `gtagSendConversionEvent()` function is called
3. This triggers the `ads_conversion_submit_lead_form` event with a 2-second timeout
4. The conversion is recorded in your Google Ads account

The implementation uses the Google Ads "Click" event snippet format, which is specifically designed for measuring conversions on form submit buttons. It includes:
- Event callback handling
- 2-second timeout to ensure the event is sent
- Proper conversion parameters (send_to, value, currency)

This will work with both Google Ads and Google Analytics 4 (since you already have GA4 set up).

## Troubleshooting

- **Not seeing conversions?** Make sure you've replaced both the Conversion ID and Label in all locations
- **Testing in incognito?** Google Ads may not show test conversions immediately - wait a few hours
- **Using an ad blocker?** Disable it when testing, as it may block the conversion tracking script
