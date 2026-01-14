# Neon Auth SMTP Configuration Status (via MCP)

**Date:** Current Session  
**Project:** AI-BOS (silent-pine-17937740)  
**Database:** neondb  
**Status:** ✅ Auth Provisioned | ⚠️ SMTP Using "Shared" (Needs Custom SMTP)

---

## ✅ Neon Auth Status (via MCP)

### Provisioned Successfully

**Auth URL:**
```
https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
```

**Schema Verified:**
- ✅ `neon_auth` schema exists
- ✅ All auth tables created (user, session, account, verification, etc.)

---

## 📧 SMTP Configuration Status (via MCP Query)

### Current Configuration

**Query Result from `neon_auth.project_config`:**
```json
{
  "email_provider": {
    "type": "shared"
  },
  "email_and_password": {
    "enabled": true,
    "emailVerificationMethod": "otp",
    "requireEmailVerification": false
  }
}
```

### ⚠️ Issue Identified

**Problem:** SMTP is set to `"type": "shared"` which is the default shared email service.

**Why 500 Errors Occur:**
- The "shared" email provider has limitations
- It may not be fully configured or may have rate limits
- Custom SMTP is required for production use

**Solution:** Change to custom SMTP configuration

---

## 🔧 How to Check SMTP Status via MCP

### Query Current Configuration

```typescript
mcp_Neon_run_sql({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  sql: "SELECT email_provider FROM neon_auth.project_config LIMIT 1;"
})
```

### Expected Result After SMTP Configuration

```json
{
  "email_provider": {
    "type": "custom",
    "host": "smtp.example.com",
    "port": 587,
    "from": "noreply@yourcompany.com",
    "fromName": "Your Company"
    // Note: Password/credentials are not stored in DB for security
  }
}
```

---

## ⚠️ SMTP Configuration Limitation

**Important:** While Neon MCP can:
- ✅ Provision Neon Auth
- ✅ Query configuration status
- ✅ Check if SMTP is configured

**Neon MCP cannot:**
- ❌ Configure SMTP credentials (security reasons)
- ❌ Update email_provider settings

**SMTP must be configured via:**
- Neon Console UI (recommended)
- Neon API (if available)

---

## 📝 Steps to Configure SMTP

### Step 1: Access Neon Console
1. Go to https://console.neon.tech
2. Select project: **AI-BOS** (silent-pine-17937740)
3. Navigate to **Database** → **Auth** → **Configuration**

### Step 2: Configure Custom SMTP
1. In **Email server** section, switch from "Shared" to **"Custom SMTP server"**
2. Enter SMTP credentials:
   - Host (e.g., `smtp-relay.brevo.com`)
   - Port (usually `587`)
   - Username
   - Password/API Key
   - Sender Email
   - Sender Name

### Step 3: Verify Configuration
After configuring, verify via MCP:
```typescript
mcp_Neon_run_sql({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  sql: "SELECT email_provider->>'type' as provider_type FROM neon_auth.project_config LIMIT 1;"
})
```

Should return: `"custom"` instead of `"shared"`

---

## 🔍 MCP Commands Summary

### Check Auth Status
```typescript
// Check if neon_auth schema exists
mcp_Neon_run_sql({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  sql: "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'neon_auth';"
})
```

### Check SMTP Configuration
```typescript
// Get email provider type
mcp_Neon_run_sql({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  sql: "SELECT email_provider FROM neon_auth.project_config LIMIT 1;"
})
```

### Get All Auth Tables
```typescript
mcp_Neon_get_database_tables({
  projectId: "silent-pine-17937740",
  databaseName: "neondb"
})
```

### Provision Neon Auth
```typescript
mcp_Neon_provision_neon_auth({
  projectId: "silent-pine-17937740",
  databaseName: "neondb"
})
```

---

## ✅ Action Items

1. ✅ **Neon Auth Provisioned** - Done via MCP
2. ⚠️ **Update Environment Variable** - Set to new auth URL:
   ```env
   NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
   ```
3. ⚠️ **Configure Custom SMTP** - Must be done in Neon Console
4. 🧪 **Verify SMTP** - Check via MCP query after configuration
5. 🧪 **Test Email OTP** - Should work after SMTP is configured

---

## 📚 Related Files

- `README_NEON_AUTH.md` - Complete setup guide
- `.plan/NEON_AUTH_SMTP_SETUP.md` - SMTP configuration guide
- `scripts/check-neon-auth-mcp.ts` - MCP status checker
- `scripts/check-neon-auth-config.ts` - Environment checker

---

**Status:** ✅ **Auth Provisioned** | ⚠️ **SMTP Needs Custom Configuration**
