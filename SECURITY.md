# Security & Privacy Guide for Intake Form

## ⚠️ Important: This Form Contains Private Business Logic

The intake form (`intake.html`, `intake.css`, `intake.js`) is an **internal tool** and should **NOT** be publicly accessible.

## Current Protection Measures

1. **Passcode Gate** - Basic UX feature (NOT real security)
2. **Noindex Meta Tags** - Prevents search engine indexing
3. **robots.txt** - Blocks search engine crawlers
4. **Code Warnings** - Comments in code warn about privacy

## ⚠️ Limitations of Current Setup

**The code is still viewable in the browser** because this is a static HTML/CSS/JS site. Anyone who knows the URL can:
- View the source code
- See the passcode in JavaScript
- Access form logic and structure

## ✅ Recommended Security Measures

### Option 1: Server-Side Authentication (RECOMMENDED)

**For Apache (.htaccess):**
```apache
# Password protect the intake form directory
AuthType Basic
AuthName "Restricted Access"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

**For Nginx:**
```nginx
location /intake.html {
    auth_basic "Restricted Access";
    auth_basic_user_file /path/to/.htpasswd;
}
```

**For Netlify:**
- Use Netlify Identity or
- Use Netlify's password protection feature in site settings

### Option 2: Move to Private Subdomain

Host the intake form on a private subdomain (e.g., `intake.justaweb.agency`) with:
- Server-side authentication
- IP whitelisting (optional)
- Separate hosting environment

### Option 3: Environment Variables

For production, move sensitive values to environment variables:
- `PASCODE` - Should be in server-side config
- `EMAIL_ADDRESS` - Should be in server-side config
- `ENDPOINT_URL` - Should be in server-side config

### Option 4: Obfuscation (Additional Layer)

While not real security, you can make the code harder to read:
- Minify JavaScript
- Obfuscate variable names
- Use a build tool to bundle/transform code

**Note:** Obfuscation does NOT prevent determined users from viewing code.

## 🔒 Best Practices

1. **Never commit sensitive data** to version control
2. **Use environment variables** for all secrets
3. **Implement server-side authentication** before going live
4. **Regularly rotate passcodes** if using passcode gate
5. **Monitor access logs** for unauthorized attempts
6. **Use HTTPS** to encrypt data in transit

## 📋 Deployment Checklist

Before deploying the intake form:

- [ ] Set up server-side authentication
- [ ] Move sensitive values to environment variables
- [ ] Configure robots.txt and noindex tags
- [ ] Test authentication works correctly
- [ ] Verify form submissions are secure
- [ ] Set up monitoring/alerts for access
- [ ] Document access credentials securely

## 🚨 If Form is Accidentally Made Public

If the intake form becomes publicly accessible:

1. **Immediately** restrict access via server config
2. **Change** the passcode
3. **Review** access logs for unauthorized access
4. **Rotate** any exposed credentials
5. **Consider** moving to a new URL/path

## 📞 Support

For security concerns or questions:
- Email: hello@justaweb.agency

---

**Remember:** The passcode gate is convenience, not security. Always use proper server-side authentication for production.

