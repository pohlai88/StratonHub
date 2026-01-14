# Developer Handoff: Drizzle + NeonDB Elite Strategy with AXIS Architecture

**Date:** Current Session  
**Project:** StratonHub  
**Status:** Planning Complete - Ready for Implementation  
**Next Phase:** Phase 1 - Foundation Setup

---

## 📋 Executive Summary

This handoff document captures the complete analysis and implementation plan for achieving **elite database performance** using **Drizzle ORM** and **NeonDB**, integrated with the **AXIS Architecture** principles (DB-First Doctrine + Contract-First Strategy).

### Key Decisions Made

1. **DB-First Doctrine:** Drizzle schema is the source of truth; Zod contracts are derived from it
2. **Three-Layer Contract Pattern:** DB → DB-Contract → Curated Schema
3. **Clear Boundaries:** Dependency direction rules prevent contamination
4. **Server-Only Enforcement:** Prevents client-side DB leaks
5. **Elite Performance:** Connection pooling, query optimization, monitoring

---

## 🏗️ Architecture Overview

### Canonical Truth Chain (Non-Negotiable)

```
1. Drizzle Schema (lib/db/schema/) ← SOURCE OF TRUTH
   ↓
2. Migrations (drizzle-kit generate)
   ↓
3. Neon Database (materialized reality)
   ↓
4. DB Contracts (lib/db-contract/) ← Generated Zod from Drizzle
   ↓
5. Curated Schemas (lib/schema/) ← Business rules + API contracts
   ↓
6. Adapters (app/api/, routes) ← Runtime composition
```

**Critical Rule:** Zod must NEVER drive DB shape. Drizzle is the authority.

### Three-Layer Contract Pattern

#### Layer 1: `lib/db/` - Drizzle Truth
- **Owns:** Drizzle tables, migrations, connection
- **Must NOT import:** Zod, Next.js, observability
- **Purpose:** Pure persistence blueprint
- **Files:**
  - `lib/db/index.ts` - Connection setup
  - `lib/db/schema.ts` - Table definitions
  - `lib/db/schema/*.ts` - Individual table schemas

#### Layer 2: `lib/db-contract/` - Generated Baseline
- **Owns:** Generated Zod schemas from Drizzle
- **May import:** `lib/db`, Zod
- **Purpose:** Type-safe baseline contracts
- **Generation:** Build-time via `pnpm gen:db-contract`
- **Files:**
  - `lib/db-contract/index.ts` - Public API (with `server-only`)
  - `lib/db-contract/generated/*.ts` - Auto-generated Zod schemas

#### Layer 3: `lib/schema/` - Curated Business Contracts
- **Owns:** Curated business/API contracts
- **May import:** `lib/db-contract`, Zod
- **Purpose:** Business rules, validation, API contracts
- **Pattern:** Extend db-contract with additional rules
- **Files:**
  - `lib/schema/index.ts` - Public API (with `server-only`)
  - `lib/schema/*.ts` - Curated schemas per domain

---

## 📊 Current State Analysis

### What's Already in Place

✅ **Basic Setup:**
- Drizzle ORM v0.45.1 installed
- Neon serverless driver v1.0.2 installed
- Basic connection in `lib/db/index.ts`
- Example schema in `lib/db/schema.ts` (users table)
- Drizzle-kit configured in `drizzle.config.ts`
- Migration scripts in `package.json`

### What's Missing (Gaps Identified)

❌ **Connection Management:**
- No connection pooling configuration
- Using basic `neon()` without pool
- No connection health checks
- No timeout configuration

❌ **Architecture:**
- No three-layer contract pattern
- No `lib/db-contract/` directory
- No `lib/schema/` directory
- No contract generation script
- No `server-only` enforcement

❌ **Schema:**
- Missing indexes on foreign keys
- No explicit indexes defined
- Basic schema without relations
- No soft delete pattern
- No UUID usage (using serial)

❌ **Validation:**
- No Zod integration
- No input validation layer
- No type-safe contracts

❌ **Error Handling:**
- Basic error handling only
- No retry logic
- No transaction error handling

❌ **Monitoring:**
- No query logging
- No performance monitoring
- No connection metrics

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Current → Basic Elite + AXIS)

**Priority: HIGH** | **Estimated Time: 4-6 hours**

#### 1.1 Establish DB-First Structure
- [ ] Create `lib/db-contract/` directory
- [ ] Create `lib/schema/` directory
- [ ] Add `server-only` imports to DB packages
- [ ] Set up directory structure:
  ```
  lib/
  ├── db/
  │   ├── index.ts (add server-only)
  │   ├── schema.ts
  │   └── schema/
  │       └── users.ts (split from schema.ts)
  ├── db-contract/
  │   ├── index.ts (server-only)
  │   └── generated/ (auto-generated)
  └── schema/
      ├── index.ts (server-only)
      └── users.ts (curated)
  ```

#### 1.2 Connection & Infrastructure
- [ ] Upgrade `lib/db/index.ts` to use connection pooling:
  ```typescript
  import { Pool } from '@neondatabase/serverless'
  import { drizzle } from 'drizzle-orm/neon-serverless'
  import "server-only"
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 20, // Adjust for your needs
  })
  export const db = drizzle(pool, { schema })
  ```
- [ ] Add connection health check utility
- [ ] Configure connection timeouts
- [ ] Add environment variable validation

#### 1.3 Contract Generation Setup
- [ ] Create `scripts/gen-db-contract.ts`:
  - Read Drizzle schemas
  - Generate Zod schemas
  - Write to `lib/db-contract/generated/`
- [ ] Add script to `package.json`:
  ```json
  "gen:db-contract": "ts-node scripts/gen-db-contract.ts"
  ```
- [ ] Test generation on existing users table

#### 1.4 Schema Improvements
- [ ] Convert `users.id` from `serial` to `uuid`:
  ```typescript
  id: uuid("id").defaultRandom().primaryKey()
  ```
- [ ] Add indexes:
  ```typescript
  }, (table) => ({
    emailIdx: index("email_idx").on(table.email),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  }))
  ```
- [ ] Add soft delete pattern (optional):
  ```typescript
  deletedAt: timestamp("deleted_at"),
  ```

#### 1.5 Validation Layer
- [ ] Generate initial db-contract for users table
- [ ] Create curated schema in `lib/schema/users.ts`:
  ```typescript
  import { z } from "zod"
  import { UserInsertSchema } from "@/db-contract/generated/users"
  
  export const UserCreateRequest = UserInsertSchema.extend({
    email: z.string().email().min(5).max(255),
    name: z.string().min(1).max(255),
  })
  ```
- [ ] Update `lib/db/example.ts` to use curated schemas

### Phase 2: Optimization (Basic → Advanced Elite)

**Priority: MEDIUM** | **Estimated Time: 6-8 hours**

- [ ] Implement repository pattern
- [ ] Add transaction retry logic
- [ ] Set up monitoring and alerting
- [ ] Optimize queries with relations
- [ ] Implement caching strategy
- [ ] Add ESLint rules for dependency direction
- [ ] Lock public APIs with `package.json#exports`

### Phase 3: Advanced (Advanced → Elite)

**Priority: LOW** | **Estimated Time: 8-10 hours**

- [ ] Use Neon branching for migration testing
- [ ] Implement read replicas if needed
- [ ] Advanced query optimization
- [ ] Comprehensive testing strategy
- [ ] Performance benchmarking

---

## 🔧 Technical Implementation Details

### Connection Pooling Strategy

**Current (Basic):**
```typescript
const sql = neon(process.env.DATABASE_URL)
export const db = drizzle(sql, { schema })
```

**Elite (Recommended):**
```typescript
import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import "server-only"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

export const db = drizzle(pool, { schema })
```

### Schema Pattern (Elite)

```typescript
import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft delete
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### Contract Generation Script Template

```typescript
// scripts/gen-db-contract.ts
import * as schema from '../lib/db/schema'
import { z } from 'zod'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

// Generate Zod schemas from Drizzle tables
// This is a template - implement based on your schema structure

function generateContract(tableName: string, table: any) {
  // Implementation: Convert Drizzle schema to Zod
  // Use table.$inferSelect and table.$inferInsert
}

// Generate all contracts
// Write to lib/db-contract/generated/
```

### Validation Pattern (AXIS-Enhanced)

```typescript
// lib/schema/users.ts
import { z } from "zod"
import { UserInsertSchema } from "@/db-contract/generated/users"

export const UserCreateRequest = UserInsertSchema.extend({
  email: z.string().email().min(5).max(255),
  name: z.string().min(1).max(255),
})

export type UserCreateRequest = z.infer<typeof UserCreateRequest>

// Usage in API route:
import { UserCreateRequest } from "@/schema/users"
import { db } from "@/db"
import { users } from "@/db/schema"

export async function createUser(data: unknown) {
  const validated = UserCreateRequest.parse(data)
  const [newUser] = await db.insert(users).values(validated).returning()
  return newUser
}
```

---

## 🚨 Critical Rules & Prevention

### Never Do (Will Break DB)

❌ Runtime codegen  
❌ Auto-migrate on app boot  
❌ Let Zod generation dictate schema changes  
❌ Import apps from packages  
❌ Modify migration history manually  
❌ Skip migration steps  
❌ Use `SELECT *` in production  
❌ Concatenate user input in queries  

### Always Do

✅ Explicit migrations  
✅ Build-time generation (`pnpm gen:db-contract`)  
✅ Regenerate contracts after DB change  
✅ Test migrations on Neon branches  
✅ Use server-only imports for DB packages  
✅ Select specific columns  
✅ Use parameterized queries (Drizzle default)  
✅ Validate with Zod before DB operations  

---

## 📝 Migration Workflow (Safe + Repeatable)

### When Changing DB Shape (Using Neon MCP) ⭐

1. Edit Drizzle table in `lib/db/schema/`
2. Generate migration: `pnpm db:generate`
3. **Prepare migration on Neon branch** (using MCP):
   ```typescript
   mcp_Neon_prepare_database_migration({
     projectId: process.env.NEON_PROJECT_ID!,
     databaseName: "neondb",
     migrationSql: "<from-file>",
   })
   ```
4. **Test migration on temporary branch** (get connection string via MCP)
5. **Complete migration** (if tests pass):
   ```typescript
   mcp_Neon_complete_database_migration({
     migrationId: "<from-prepare>",
     // ... other params
     applyChanges: true,
   })
   ```
6. **Regenerate contracts:** `pnpm gen:db-contract`
7. Update curated schema if needed: `lib/schema/`
8. Update app adapters/routes

**See `.plan/NEON_MIGRATION_WORKFLOW.md` for complete workflow with examples.**

### When Adding API Endpoint

1. Pick curated schema from `lib/schema/`
2. Parse/validate input with Zod
3. Call domain logic / query layer
4. Return curated response shape

---

## 📚 Key Files Reference

### Current Files (To Modify)

- `lib/db/index.ts` - Add pooling, server-only
- `lib/db/schema.ts` - Split into schema/*.ts, add indexes
- `lib/db/example.ts` - Update to use curated schemas
- `drizzle.config.ts` - Already configured
- `package.json` - Add `gen:db-contract` script

### New Files (To Create)

**Layer 1 (DB):**
- `lib/db/schema/users.ts` - Split from schema.ts
- `lib/db/utils/connection.ts` - Connection utilities

**Layer 2 (DB Contract):**
- `lib/db-contract/index.ts` - Public API
- `lib/db-contract/generated/users.ts` - Generated (auto)

**Layer 3 (Schema):**
- `lib/schema/index.ts` - Public API
- `lib/schema/users.ts` - Curated contracts

**Scripts:**
- `scripts/gen-db-contract.ts` - Contract generator

---

## 🎯 Success Metrics

### Performance Targets

- Query p95 latency < 50ms
- Zero connection pool exhaustion
- 100% migration success rate
- Zero data integrity issues
- <1% error rate
- All queries use indexes
- Proper transaction boundaries

### AXIS Architecture Compliance

- ✅ All DB changes originate from Drizzle schema
- ✅ Zod contracts generated from Drizzle (never drive DB)
- ✅ Three-layer contract pattern implemented
- ✅ Zero package boundary violations
- ✅ Server-only boundaries enforced
- ✅ Public APIs locked via exports
- ✅ Contract regeneration automated after migrations
- ✅ Type safety at all layers (Drizzle + Zod)

---

## 🔍 Risk Mitigation Checklist

### Connection Management
- [ ] Connection pooling configured
- [ ] Pool size appropriate for workload
- [ ] Connection timeouts set
- [ ] Health checks implemented
- [ ] Monitoring in place

### Schema & Migrations
- [ ] All migrations tested on Neon branches
- [ ] Migration rollback procedures documented
- [ ] Contract regeneration automated
- [ ] Indexes on all foreign keys
- [ ] Soft delete pattern implemented (if needed)

### Validation & Type Safety
- [ ] Zod schemas generated from Drizzle
- [ ] Curated schemas extend db-contract
- [ ] All API endpoints validate input
- [ ] Type inference working at all layers

### Architecture Boundaries
- [ ] Server-only imports added
- [ ] Public APIs locked with exports
- [ ] Dependency direction enforced (ESLint)
- [ ] No deep imports allowed

---

## 📖 Additional Resources

### Documentation References

- **Drizzle ORM:** https://orm.drizzle.team/docs/overview
- **NeonDB:** https://neon.tech/docs
- **AXIS Architecture:** `.plan/drizzle-neon-zod.md`
- **Elite Strategy Plan:** `.plan/drizzle_neondb_elite_strategy_9dffee53.plan.md`

### Key Concepts

1. **DB-First Doctrine:** Drizzle schema is source of truth
2. **Contract-First Strategy:** Zod everywhere, but derived from DB
3. **Three-Layer Pattern:** DB → DB-Contract → Curated Schema
4. **Clear Boundaries:** Apps → Packages (one-way dependency)
5. **Server-Only:** Prevents client-side DB leaks

---

## 🚀 Quick Start Commands

```bash
# Generate migration after schema change
pnpm db:generate

# Run migration (test on branch first!)
pnpm db:migrate

# Generate Zod contracts from Drizzle
pnpm gen:db-contract

# Open Drizzle Studio
pnpm db:studio

# Development
pnpm dev

# Build
pnpm build
```

---

## ⚠️ Important Notes

1. **Always test migrations on Neon branches before production**
2. **Regenerate contracts after every DB change**
3. **Never modify migration history manually**
4. **Use server-only imports in DB packages**
5. **Validate all inputs with Zod before DB operations**
6. **Keep transactions short and use proper isolation levels**
7. **Monitor connection pool metrics**
8. **Use specific column selection, never SELECT ***

---

## 📞 Next Steps

1. **Start with Phase 1.1:** Set up directory structure
2. **Then Phase 1.2:** Upgrade connection pooling
3. **Then Phase 1.3:** Create contract generation script
4. **Then Phase 1.4:** Improve schema with indexes
5. **Then Phase 1.5:** Implement validation layer

**Remember:** Follow the AXIS architecture principles - DB is truth, contracts are projections, adapters are runtime composition.

---

**End of Developer Handoff**

*Last Updated: Current Session*  
*Status: Ready for Implementation*
