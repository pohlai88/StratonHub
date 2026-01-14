# Neon Auth Setup & Troubleshooting

## Overview

This project uses Neon Auth for authentication with **Email/Password authentication only**. OAuth providers (Google, GitHub) have been disabled for stability.

**Current Authentication Methods:**
- ✅ Email/Password with OTP verification
- ✅ Password Reset via email
- ❌ OAuth providers (disabled)

If you're seeing 500 errors from Neon Auth endpoints, it likely means Neon Auth needs to be provisioned for your database.

## Error: 500 from Neon Auth Endpoints

If you see errors like:
```
Failed to load resource: the server responded with a status of 500
ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth/get-session
```

This indicates Neon Auth is not properly provisioned or configured.

## Solution: Provision Neon Auth

### Option 1: Using Neon MCP (Recommended)

If you have Neon MCP configured, you can provision Neon Auth programmatically:

```typescript
// Use the Neon MCP tool
mcp_Neon_provision_neon_auth({
  projectId: "your-project-id",
  databaseName: "neondb", // or your database name
  branchId: "optional-branch-id" // optional, defaults to main branch
})
```

This will:
1. Create the `neon_auth` schema in your database
2. Set up secure Auth APIs for your branch
3. Deploy an auth service in the same region as your Neon compute
4. Return the Auth URL that you need to set as `NEXT_PUBLIC_NEON_AUTH_URL`

### Option 2: Using Neon Console

1. Go to your Neon project dashboard: https://console.neon.tech
2. Select your project
3. Navigate to **Database** → **Auth**
4. Click **"Provision Neon Auth"**
5. Copy the Auth URL provided
6. Set it as your `NEXT_PUBLIC_NEON_AUTH_URL` environment variable

### Option 3: Manual Setup

1. Ensure you have a Neon project with a database
2. Get your project ID from the Neon console
3. The Auth URL format is:
   ```
   https://[project-id].neonauth.[region].aws.neon.tech/[database]/auth
   ```
4. Example:
   ```
   https://ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
   ```

## SMTP Configuration (Required for Email OTP)

**Important:** Neon Auth requires SMTP configuration to send email OTP codes. Without SMTP, you'll get 500 errors when trying to send verification emails.

### Configure SMTP in Neon Console

1. Go to your Neon project dashboard: https://console.neon.tech
2. Select your project
3. Navigate to **Database** → **Auth** → **Configuration**
4. In the **Email server** section:
   - Switch from "Shared" to **"Custom SMTP server"**
   - Enter your SMTP credentials:

**Required SMTP Settings:**
- **Host:** Your SMTP server (e.g., `smtp.gmail.com`, `smtp-relay.brevo.com`, `smtp.sendgrid.net`)
- **Port:** Usually `587` (TLS) or `465` (SSL)
- **Username:** Your SMTP username or API key
- **Password:** Your SMTP password or API key
- **Sender Email:** The "from" address (e.g., `noreply@yourcompany.com`)
- **Sender Name:** Display name (e.g., `Your Company`)

### Popular SMTP Providers

**Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`
- Username: Your Gmail address
- Password: App-specific password (not your regular password)

**Brevo (formerly Sendinblue):**
- Host: `smtp-relay.brevo.com`
- Port: `587`
- Username: Your SMTP key
- Password: Your SMTP key

**SendGrid:**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: Your SendGrid API key

**Resend:**
- Host: `smtp.resend.com`
- Port: `587`
- Username: `resend`
- Password: Your Resend API key

### Test SMTP Configuration

After configuring SMTP:
1. Click **"Send test email"** in the Neon Console
2. Verify you receive the test email
3. If successful, try sending an OTP from your app

## Environment Variables

After provisioning and configuring SMTP, ensure you have:

```env
NEXT_PUBLIC_NEON_AUTH_URL=https://[your-project-id].neonauth.[region].aws.neon.tech/[database]/auth
DATABASE_URL=postgresql://[connection-string]
```

## Verification

After provisioning:

1. Check that the Auth URL is accessible (should return 200, not 500)
2. Try accessing the auth page: `/auth/sign-in`
3. Check browser console for any remaining errors

## Common Issues

### Issue: 500 Errors Persist After Provisioning

**Solution:**
- **Most Common:** Configure SMTP settings in Neon Console (Database → Auth → Configuration)
- Wait a few minutes for the service to fully provision
- Verify the `NEXT_PUBLIC_NEON_AUTH_URL` matches exactly what Neon provided
- Check that your database is accessible (test `DATABASE_URL`)
- Ensure you're using the correct branch ID if using branches
- Test SMTP configuration using "Send test email" in Neon Console

### Issue: 500 Error on Email OTP Send

**This is almost always an SMTP configuration issue.**

**Solution:**
1. Go to Neon Console → Database → Auth → Configuration
2. Verify SMTP is configured (not using "Shared" server)
3. Test SMTP with "Send test email"
4. Check SMTP credentials are correct
5. Ensure SMTP server allows connections from Neon's IPs
6. Verify sender email is authorized in your SMTP provider

### Issue: Decryption Errors

If you see errors like:
```
Failed to decrypt data: Input string must contain hex characters in even length
```

**Cause:** This happens when session cookies are corrupted or invalid. This can occur if:
- Cookies were set with a different encryption key
- Cookies were manually modified or corrupted
- The authentication session expired improperly

**Solution:**
1. **Automatic Fix (Recommended):** The app should automatically detect and clear corrupted cookies. If you see this error, wait a moment for the automatic cleanup.

2. **Manual Fix:**
   - Click the "Clear Session & Reload" button if available in the error UI
   - Or manually clear browser cookies for your domain:
     - Open browser DevTools (F12)
     - Go to Application/Storage tab → Cookies
     - Delete all cookies for your domain
     - Reload the page

3. **Prevention:** Ensure you're using a consistent `AUTH_SECRET` (if configured) and don't manually modify session cookies.

### Issue: Auth URL Not Found

**Solution:**
- Verify the URL format is correct
- Ensure the project ID, region, and database name match your Neon setup
- Check that Neon Auth is actually provisioned (should see it in Neon Console)

## Testing

To test if Neon Auth is working:

1. Navigate to `/auth/sign-in`
2. Try sending a verification email
3. Check browser network tab - should see 200 responses, not 500

## Support

If issues persist:
1. Check Neon Status: https://status.neon.tech
2. Review Neon Auth Documentation: https://neon.tech/docs/auth
3. Check Neon Console for any service alerts
