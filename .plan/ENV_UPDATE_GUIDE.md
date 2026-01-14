# Environment Variables Update Guide

**Date:** Current Session  
**File:** `.env` (lines 21-24)

---

## 📋 Required Updates for `.env` Lines 21-24

Based on the Neon Auth provisioning we just completed, here's what should be in your `.env` file:

### Current Status
- ✅ Neon Auth has been provisioned
- ✅ New Auth URL: `https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth`
- ⚠️ Old URL (causing errors): `ep-hidden-mountain-a1ckcj1m.neonauth...`

### Recommended `.env` Configuration (Lines 21-24)

```env
# Neon Auth URL (Updated - use new provisioned URL)
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth

# Neon Project ID (for scripts and MCP)
NEON_PROJECT_ID=silent-pine-17937740

# Neon Database Name (for scripts and MCP)
NEON_DATABASE_NAME=neondb
```

### Alternative Format (if you prefer comments)

```env
# Neon Auth Configuration
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
NEON_PROJECT_ID=silent-pine-17937740
NEON_DATABASE_NAME=neondb
```

---

## 🔍 How to Update

### Option 1: Manual Update
1. Open your `.env` file
2. Find lines 21-24 (or wherever `NEXT_PUBLIC_NEON_AUTH_URL` is)
3. Replace the old URL with the new one:
   ```env
   NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
   ```

### Option 2: Check Current Value
Run this to see what's currently set:
```bash
pnpm run check:auth
```

---

## ✅ Verification

After updating, verify the configuration:

```bash
# Check environment variables
pnpm run check:auth

# Check via MCP
pnpm run check:auth-mcp
```

### Expected Results
- ✅ `NEXT_PUBLIC_NEON_AUTH_URL` should show the new URL
- ✅ Auth endpoint should return 200 or 401 (not 500)
- ✅ No more "Failed to load resource" errors

---

## 📝 Complete `.env` Template

Here's a complete template for your `.env` file:

```env
# Database
DATABASE_URL=postgresql://[your-connection-string]

# Neon Auth (Lines 21-24)
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-white-boat-a189xlni.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
NEON_PROJECT_ID=silent-pine-17937740
NEON_DATABASE_NAME=neondb

# Optional: Neon API Key (for MCP)
NEON_API_KEY=your-api-key-here
```

---

## ⚠️ Important Notes

1. **Don't commit `.env` to git** - It's already in `.gitignore`
2. **Restart dev server** after updating environment variables
3. **The new URL is different** from the old one causing errors
4. **SMTP still needs configuration** in Neon Console (separate from env vars)

---

## 🔗 Related Documentation

- `README_NEON_AUTH.md` - Complete Neon Auth setup guide
- `.plan/NEON_AUTH_MCP_STATUS.md` - MCP provisioning results
- `.plan/NEON_AUTH_SMTP_STATUS.md` - SMTP configuration status

---

**Status:** ⚠️ **Update Required** - Replace old auth URL with new provisioned URL
