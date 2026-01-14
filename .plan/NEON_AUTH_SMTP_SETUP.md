# Neon Auth SMTP Configuration Guide

**Date:** Current Session  
**Issue:** 500 errors from Neon Auth endpoints  
**Root Cause:** SMTP not configured for email OTP

---

## 🔍 Problem Identified

The 500 errors you're seeing:
```
Failed to load resource: the server responded with a status of 500
ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth/get-session
ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth/email-otp/send-verification-otp
```

**Root Cause:** Neon Auth requires SMTP configuration to send email OTP codes. Without SMTP, the service returns 500 errors.

---

## ✅ Solution: Configure SMTP in Neon Console

### Step 1: Access Neon Console

1. Go to https://console.neon.tech
2. Select your project: **silent-pine-17937740** (from FINAL_STATUS.md)
3. Navigate to **Database** → **Auth** → **Configuration**

### Step 2: Configure Custom SMTP

1. In the **Email server** section, switch from "Shared" to **"Custom SMTP server"**
2. Enter your SMTP credentials:

**Required Fields:**
- **Host:** Your SMTP server address
- **Port:** Usually `587` (TLS) or `465` (SSL)
- **Username:** Your SMTP username or API key
- **Password:** Your SMTP password or API key
- **Sender Email:** The "from" address (e.g., `noreply@yourcompany.com`)
- **Sender Name:** Display name (e.g., `Your Company`)

### Step 3: Test Configuration

1. Click **"Send test email"** in the Neon Console
2. Verify you receive the test email
3. If successful, SMTP is configured correctly

---

## 📧 Popular SMTP Providers

### Gmail
- **Host:** `smtp.gmail.com`
- **Port:** `587`
- **Username:** Your Gmail address
- **Password:** App-specific password (not your regular password)
- **Note:** Requires 2FA and app-specific password

### Brevo (formerly Sendinblue)
- **Host:** `smtp-relay.brevo.com`
- **Port:** `587`
- **Username:** Your SMTP key
- **Password:** Your SMTP key
- **Free Tier:** 300 emails/day

### SendGrid
- **Host:** `smtp.sendgrid.net`
- **Port:** `587`
- **Username:** `apikey`
- **Password:** Your SendGrid API key
- **Free Tier:** 100 emails/day

### Resend
- **Host:** `smtp.resend.com`
- **Port:** `587`
- **Username:** `resend`
- **Password:** Your Resend API key
- **Free Tier:** 3,000 emails/month

### AWS SES
- **Host:** `email-smtp.[region].amazonaws.com`
- **Port:** `587`
- **Username:** Your AWS access key
- **Password:** Your AWS secret key
- **Note:** Requires AWS account setup

---

## 🧪 Verification Steps

After configuring SMTP:

1. **Test in Neon Console:**
   - Use "Send test email" feature
   - Verify email is received

2. **Test in Application:**
   - Navigate to `/auth/email-otp`
   - Enter an email address
   - Click "Send code"
   - Should see 200 response (not 500)
   - Check email inbox for OTP code

3. **Check Browser Console:**
   - Should not see 500 errors
   - Network tab should show 200 responses

---

## 🔧 Troubleshooting

### Issue: Still Getting 500 Errors After SMTP Configuration

**Possible Causes:**
1. SMTP credentials are incorrect
2. SMTP server is blocking Neon's IPs
3. Sender email is not verified/authorized
4. Port/firewall restrictions

**Solutions:**
- Double-check all SMTP credentials
- Verify sender email is authorized in your SMTP provider
- Test SMTP connection from Neon Console
- Check SMTP provider logs for connection attempts
- Ensure SMTP server allows connections from Neon's region (ap-southeast-1)

### Issue: Test Email Works But App Still Fails

**Possible Causes:**
1. Environment variable not updated
2. Wrong database/branch selected
3. Neon Auth not fully provisioned

**Solutions:**
- Verify `NEXT_PUBLIC_NEON_AUTH_URL` is correct
- Check you're using the correct database/branch
- Wait a few minutes for changes to propagate
- Clear browser cache and cookies

---

## 📝 Quick Reference

**Project Details:**
- Project ID: `silent-pine-17937740`
- Database: `neondb`
- Branch: `br-broad-rice-a1sg9usv` (main)
- Region: `ap-southeast-1`
- Auth URL: `https://ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth`

**Check Configuration:**
```bash
pnpm run check:auth
```

**Documentation:**
- Full guide: `README_NEON_AUTH.md`
- Neon Auth docs: https://neon.tech/docs/auth
- Email configuration: https://neon.tech/docs/neon-auth/email-configuration

---

## ✅ Success Criteria

You'll know SMTP is configured correctly when:
- ✅ Test email is received from Neon Console
- ✅ No 500 errors in browser console
- ✅ OTP codes can be sent from the app
- ✅ Emails are received with OTP codes

---

**Status:** ⚠️ **SMTP Configuration Required**  
**Next Step:** Configure SMTP in Neon Console
