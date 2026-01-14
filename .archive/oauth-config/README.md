# OAuth Configuration Archive

**Date:** 2026-01-14  
**Status:** OAuth providers disabled in Neon Auth database

---

## Archived Configuration

### Google OAuth
- Provider: `google`
- Type: Shared (Neon's shared provider)
- Client ID: Not required (shared provider)
- Status: **DISABLED**

### GitHub OAuth
- Provider: `github`
- Type: Custom
- Client ID: `Ov23lizviCIntRW1pBJx`
- Client Secret: `6ce182db895f6d5990a9413256185a11788d42f9` ⚠️ **REGENERATE IF RE-ENABLING**
- Status: **DISABLED**

---

## Database Configuration (Before Removal)

```json
{
  "social_providers": [
    {
      "id": "google",
      "isShared": true
    },
    {
      "id": "github",
      "clientId": "Ov23lizviCIntRW1pBJx",
      "isShared": false,
      "clientSecret": "6ce182db895f6d5990a9413256185a11788d42f9"
    }
  ]
}
```

---

## Re-enabling Instructions

See `.plan/OAUTH_REMOVAL_ARCHIVE.md` for detailed re-enabling instructions.

---

**Note:** This archive is for reference only. OAuth credentials should be regenerated if re-enabling in the future.
