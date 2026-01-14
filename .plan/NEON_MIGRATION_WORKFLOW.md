# Neon Migration Workflow with MCP

**Status:** Ready for Use  
**Last Updated:** Current Session

---

## Overview

This workflow uses **Neon MCP tools** for safe database migrations with branching support. This approach provides:

- ✅ Zero-risk migration testing on temporary branches
- ✅ Automatic branch creation and cleanup
- ✅ Safe rollback capabilities
- ✅ Integration with Drizzle migrations

---

## Migration Workflow

### Step 1: Generate Migration

```bash
# Generate migration from Drizzle schema changes
pnpm db:generate
```

This creates a migration file in `drizzle/` directory.

### Step 2: Prepare Migration on Neon Branch

Use Neon MCP to prepare the migration on a temporary branch:

```typescript
// Via MCP tool
mcp_Neon_prepare_database_migration({
  projectId: "your-project-id",
  databaseName: "neondb", // or your database name
  migrationSql: "<migration-sql-from-file>",
})
```

**What this does:**
- Creates a temporary branch from your main branch
- Applies the migration SQL to the temporary branch
- Returns:
  - `migrationId` - Unique ID for this migration
  - `temporaryBranchId` - ID of the temporary branch
  - `parentBranchId` - ID of the parent branch
  - Migration result status

### Step 3: Test Migration

Test the migration on the temporary branch:

```bash
# Get connection string for temporary branch
# Use Neon MCP: mcp_Neon_get_connection_string({
#   projectId: "your-project-id",
#   branchId: "<temporary-branch-id>",
# })

# Test your application against the temporary branch
# Run tests, verify schema changes, etc.
```

### Step 4: Complete Migration (Apply to Main)

If testing is successful, complete the migration:

```typescript
// Via MCP tool
mcp_Neon_complete_database_migration({
  migrationId: "<from-step-2>",
  projectId: "your-project-id",
  databaseName: "neondb",
  migrationSql: "<same-migration-sql>",
  temporaryBranchId: "<from-step-2>",
  parentBranchId: "<main-branch-id>",
  applyChanges: true, // Set to true to apply, false to just cleanup
})
```

**What this does:**
- Applies the migration to the parent branch (main)
- Deletes the temporary branch
- Returns confirmation

---

## Helper Scripts

### Script 1: `migrate-neon.ts`

Manual workflow helper - shows you what to do:

```bash
pnpm migrate:neon --project-id <id> --auto
pnpm migrate:neon --project-id <id> --sql-file drizzle/0000_initial.sql
```

### Script 2: `migrate-neon-mcp.ts`

Automated workflow template (requires MCP integration):

```bash
pnpm migrate:neon-mcp --project-id <id> --auto
pnpm migrate:neon-mcp --project-id <id> --auto --apply
```

---

## Using MCP Tools Directly

### List Projects

```typescript
mcp_Neon_list_projects({
  limit: 10,
  search: "project-name", // optional
})
```

### Get Project Details

```typescript
mcp_Neon_describe_project({
  projectId: "your-project-id",
})
```

### Get Connection String

```typescript
mcp_Neon_get_connection_string({
  projectId: "your-project-id",
  branchId: "branch-id", // optional, uses default if not provided
  databaseName: "neondb", // optional
})
```

### Run SQL (for testing)

```typescript
mcp_Neon_run_sql({
  projectId: "your-project-id",
  branchId: "temporary-branch-id",
  sql: "SELECT * FROM users LIMIT 1;",
})
```

---

## Complete Example Workflow

### 1. Make Schema Changes

```typescript
// lib/db/schema/users.ts
export const users = pgTable("users", {
  // ... your changes
})
```

### 2. Generate Migration

```bash
pnpm db:generate
# Creates: drizzle/0000_tranquil_sugar_man.sql
```

### 3. Read Migration SQL

```bash
cat drizzle/0000_tranquil_sugar_man.sql
```

### 4. Prepare Migration (MCP)

```typescript
const result = await mcp_Neon_prepare_database_migration({
  projectId: process.env.NEON_PROJECT_ID!,
  databaseName: "neondb",
  migrationSql: readFileSync("drizzle/0000_tranquil_sugar_man.sql", "utf-8"),
})

console.log("Migration ID:", result.migrationId)
console.log("Temporary Branch ID:", result.temporaryBranchId)
```

### 5. Test on Temporary Branch

```typescript
// Get connection string for temporary branch
const connString = await mcp_Neon_get_connection_string({
  projectId: process.env.NEON_PROJECT_ID!,
  branchId: result.temporaryBranchId,
})

// Test your application with this connection string
// Run your tests, verify changes, etc.
```

### 6. Complete Migration (if tests pass)

```typescript
await mcp_Neon_complete_database_migration({
  migrationId: result.migrationId,
  projectId: process.env.NEON_PROJECT_ID!,
  databaseName: "neondb",
  migrationSql: readFileSync("drizzle/0000_tranquil_sugar_man.sql", "utf-8"),
  temporaryBranchId: result.temporaryBranchId,
  parentBranchId: result.parentBranchId,
  applyChanges: true,
})
```

### 7. Regenerate Contracts

```bash
pnpm gen:db-contract
```

---

## Environment Variables

Add to your `.env` file:

```env
NEON_PROJECT_ID=your-project-id
NEON_DATABASE_NAME=neondb
DATABASE_URL=postgresql://... # Your main branch connection string
```

---

## Safety Features

### ✅ Zero-Risk Testing
- Migrations are tested on isolated branches
- Main branch is never affected until you explicitly apply

### ✅ Automatic Cleanup
- Temporary branches are automatically deleted after completion
- No orphaned branches left behind

### ✅ Rollback Capability
- If migration fails, temporary branch is simply deleted
- Main branch remains unchanged

### ✅ Validation
- Migration SQL is validated before application
- Connection strings are verified

---

## Troubleshooting

### Migration Fails on Temporary Branch

**Solution:** The temporary branch will be automatically cleaned up. Fix your migration SQL and try again.

### Can't Find Project ID

**Solution:** 
```bash
# Use MCP to list projects
mcp_Neon_list_projects()
```

### Connection String Issues

**Solution:** Always use the connection string from `mcp_Neon_get_connection_string()` for the specific branch you're testing.

---

## Best Practices

1. **Always test on a branch first** - Never apply migrations directly to main
2. **Review migration SQL** - Check the generated SQL before applying
3. **Test thoroughly** - Run your application tests against the temporary branch
4. **Regenerate contracts** - Always run `pnpm gen:db-contract` after migration
5. **Use environment variables** - Store project ID and database name in `.env`
6. **Version control migrations** - Commit migration files to git
7. **Document breaking changes** - Note any breaking changes in migration comments

---

## Integration with Existing Workflow

This workflow integrates seamlessly with:

- ✅ Drizzle schema definitions
- ✅ Drizzle migration generation (`pnpm db:generate`)
- ✅ Contract generation (`pnpm gen:db-contract`)
- ✅ Existing database connection setup

**The only change:** Instead of `pnpm db:migrate`, use Neon MCP tools for safer, branch-based migrations.

---

**Last Updated:** Current Session  
**Status:** Ready for Production Use
