# justaweb.agency

A premium one-page marketing website for justaweb.agency, a web design agency specializing in simple, fast, and powerful websites. Built with vanilla HTML, CSS, and JavaScript—no frameworks, no build tools, no external dependencies.

## ⚠️ Important: Intake Form Privacy

The `intake.html`, `intake.css`, and `intake.js` files are **private internal tools** and should **NOT** be publicly accessible. 

**To protect the intake form:**
1. **Host behind authentication** - Use server-side authentication (not just the passcode gate)
2. **Don't index** - The form includes `noindex` meta tags, but ensure your server blocks search engines
3. **Use environment variables** - For production, move sensitive values (passcode, email, endpoint) to environment variables
4. **Consider obfuscation** - For additional protection, minify/obfuscate the JavaScript before deployment

The passcode gate is a basic UX feature for convenience, **not real security**. Always use proper server-side authentication for production.

**Netlify form notification:** The intake form submits to Netlify Forms. In the Netlify dashboard, go to **Site settings → Forms → Form notifications** and add an **Email notification** for the form `website-intake` so submissions (including the full Cursor prompt in the `intake_full_details` field) are sent to **blake@justaweb.agency**.

## 🚀 Features

### Core Functionality
- **One-page layout** with smooth scroll navigation and anchored sections
- **Sticky header** with active section highlighting
- **Fully responsive design** optimized for all devices
- **Accessible** with semantic HTML, keyboard navigation, and ARIA labels
- **Performance optimized** with no heavy assets or external dependencies

### Interactive Features
- **Theme toggle** (light/dark mode) with localStorage persistence
- **Command palette** (Ctrl/Cmd + K) for quick navigation and actions
- **Pricing calculator** that recommends plans based on project requirements
- **Portfolio filter** with animated transitions (All, Brand, Web, SEO)
- **Testimonials slider** with accessible controls
- **Site health demo** widget with animated progress bars
- **Contact forms** with client-side validation and Netlify integration
- **Lead magnet modal** for free homepage teardown offers
- **FAQ accordion** with smooth expand/collapse animations

### Design Features
- **Smooth animations** with scroll reveal effects
- **Subtle parallax** effects (respects reduced motion preferences)
- **Background effects** including gradient mesh and noise overlay
- **Microinteractions** on buttons and interactive elements
- **Back to top button** that appears on scroll
- **System fonts only** with carefully crafted typography scale

## 📁 File Structure

```
justawebagency/
├── index.html          # Main HTML file with all sections
├── styles.css          # Complete CSS with theme system and responsive design
├── script.js           # All JavaScript functionality
└── README.md           # This file
```

## 🛠️ Technologies

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, flexbox, grid, animations
- **Vanilla JavaScript** - No frameworks or libraries
- **Netlify Forms** - Form submission handling

## 🚦 Getting Started

### Local Development

1. **Clone or download** this repository

2. **Open the project** in your preferred code editor

3. **Open `index.html`** in your web browser
   - Simply double-click the file, or
   - Use a local server (recommended):
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

4. **Navigate to** `http://localhost:8000` in your browser

### No Build Process Required

This project requires **zero setup**. Just open `index.html` and it works!

## 📝 Sections

The site includes the following sections:

1. **Hero** - Main headline with CTAs
2. **Proof/Outcomes** - Key results and differentiators
3. **Services** - Six service offerings
4. **Work** - Portfolio with filterable case studies
5. **Process** - Five-step workflow
6. **Site Health Demo** - Interactive metrics widget
7. **Pricing** - Three tiers with calculator
8. **Testimonials** - Client testimonials slider
9. **Lead Magnet** - Free homepage teardown offer
10. **FAQ** - Frequently asked questions
11. **Contact** - Contact form with validation
12. **Footer** - Site map and links

## 🎨 Customization

### Colors & Theme

The site uses CSS custom properties for easy theming. Edit the variables in `styles.css`:

```css
:root {
    --color-accent: #6366f1;        /* Primary brand color */
    --color-accent-hover: #4f46e5;  /* Hover state */
    --color-bg: #ffffff;            /* Background */
    --color-text: #1a1a1a;          /* Text color */
    /* ... more variables */
}
```

### Content

- **Copy**: Edit text directly in `index.html`
- **Services**: Update the services grid in the Services section
- **Portfolio**: Modify work cards in the Work section
- **Pricing**: Adjust pricing tiers and calculator logic in `index.html` and `script.js`

### Forms

The site includes two forms configured for Netlify:

1. **Contact Form** (`name="contact"`)
2. **Lead Magnet Form** (`name="teardown"`)

Both forms include:
- Client-side validation
- Netlify honeypot spam protection
- Error handling with user-friendly messages

## 🌐 Deployment

### Netlify (Recommended)

1. **Push your code** to a Git repository (GitHub, GitLab, etc.)

2. **Connect to Netlify**:
   - Go to [Netlify](https://www.netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `/` (root)

3. **Form Handling**:
   - Netlify will automatically detect forms
   - View submissions in the Netlify dashboard under "Forms"
   - Configure email notifications in site settings

4. **Deploy!** Your site will be live with working forms

### Other Hosting Options

This site can be deployed to any static hosting service:
- **Vercel**
- **GitHub Pages**
- **Cloudflare Pages**
- **AWS S3 + CloudFront**
- Any web server

**Note**: If not using Netlify, you'll need to update form submission handling in `script.js` to use your preferred method (API endpoint, email service, etc.).

## ♿ Accessibility

This site follows accessibility best practices:

- **Semantic HTML** with proper heading hierarchy
- **ARIA labels** and roles where needed
- **Keyboard navigation** support throughout
- **Focus states** for all interactive elements
- **Reduced motion** support (respects `prefers-reduced-motion`)
- **Color contrast** meets WCAG AA standards
- **Form labels** properly associated with inputs

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Uses modern CSS features (custom properties, grid, flexbox) but includes fallbacks where needed.

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 481px - 768px
- **Desktop**: > 768px

The design is mobile-first and adapts smoothly across all screen sizes.

## 🔧 Key Features Explained

### Command Palette

Press `Ctrl+K` (or `Cmd+K` on Mac) to open the command palette. Features:
- Navigate to any section
- Toggle theme
- Copy email address
- Open lead magnet modal

### Pricing Calculator

The calculator recommends a plan based on:
- Number of pages
- Timeline (rush/standard/flexible)
- Required integrations

Updates in real-time as inputs change.

### Theme System

- Light/dark mode toggle
- Preference saved to localStorage
- Respects system preference on first visit
- Smooth transitions between themes

## 📄 License

This project is proprietary and created for justaweb.agency.

## 🤝 Support

For questions or issues related to this site, contact:
- Email: hello@justaweb.agency
- Website: justaweb.agency

## 📝 Notes

- All images are replaced with CSS gradients for performance
- No external fonts are loaded (uses system fonts)
- All animations respect user motion preferences
- Forms use Netlify for submission handling
- Site is optimized for fast loading and performance

---

**Built with ❤️ for justaweb.agency**

