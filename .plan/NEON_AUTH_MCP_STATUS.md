# Neon Auth MCP Status Check

**Date:** Current Session  
**Project:** AI-BOS (silent-pine-17937740)  
**Database:** neondb

---

## ✅ Neon Auth Provisioning Status

### Provisioned Successfully

Neon Auth has been provisioned using Neon MCP:

**Auth URL:**
```
https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
```

**JWKS URL (for JWT verification):**
```
https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth/.well-known/jwks.json
```

---

## ⚠️ Important: Update Environment Variable

**Current Error URL:**
- `ep-hidden-mountain-a1ckcj1m.neonauth...` (old/invalid)

**New Provisioned URL:**
- `ep-white-boat-a189xlni.neonauth...` (new/active)

**Action Required:**
Update your `.env` file:
```env
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
```

---

## 📧 SMTP Configuration Status

**Status:** ⚠️ **SMTP Not Configured** (must be done in Neon Console)

Neon MCP can provision Neon Auth, but SMTP configuration must be done via Neon Console.

### Check SMTP Status via MCP

You can check if SMTP is configured by querying the database:

```typescript
mcp_Neon_run_sql({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  sql: "SELECT * FROM neon_auth.config WHERE key LIKE '%smtp%' OR key LIKE '%email%';"
})
```

### Configure SMTP

**Must be done in Neon Console:**
1. Go to https://console.neon.tech
2. Select project: **AI-BOS** (silent-pine-17937740)
3. Navigate to **Database** → **Auth** → **Configuration**
4. Switch to **Custom SMTP server**
5. Enter SMTP credentials
6. Test with "Send test email"

---

## 🔍 MCP Tools Available

### Check Auth Status
```typescript
// Check if neon_auth schema exists
mcp_Neon_run_sql({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  sql: "SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'neon_auth';"
})

// List tables in neon_auth schema
mcp_Neon_get_database_tables({
  projectId: "silent-pine-17937740",
  databaseName: "neondb"
})
```

### Provision Neon Auth
```typescript
mcp_Neon_provision_neon_auth({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  branchId: "br-broad-rice-a1sg9usv" // optional, main branch
})
```

### Get Connection String
```typescript
mcp_Neon_get_connection_string({
  projectId: "silent-pine-17937740",
  databaseName: "neondb",
  branchId: "br-broad-rice-a1sg9usv" // optional
})
```

---

## 📝 Next Steps

1. ✅ **Neon Auth Provisioned** - Done via MCP
2. ⚠️ **Update Environment Variable** - Set `NEXT_PUBLIC_NEON_AUTH_URL` to new URL
3. ⚠️ **Configure SMTP** - Must be done in Neon Console
4. 🧪 **Test Auth** - Try sending OTP after SMTP is configured

---

## 🧪 Verification Commands

**Check via script:**
```bash
pnpm run check:auth        # Check environment variables and test endpoint
pnpm run check:auth-mcp    # Get MCP instructions for checking status
```

**Check via MCP directly:**
- Use the MCP tools listed above
- Query `neon_auth` schema for configuration
- Test auth endpoint after updating environment variable

---

**Status:** ✅ **Provisioned** | ⚠️ **SMTP Configuration Required**
