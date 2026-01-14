# Legacy Basic Pattern (Reference)

**Purpose:** This document preserves the basic Drizzle + Neon setup pattern as reference for comparison and educational purposes.

---

## Basic Setup Pattern (Standard Guide)

This is the **simple, beginner-friendly** pattern recommended in standard Drizzle + Neon guides. We've evolved beyond this to our advanced architecture, but this pattern remains valid for:

- Learning Drizzle/Neon
- Prototyping
- Small projects
- Quick demos

---

## File Structure (Basic)

```
project/
├── src/
│   ├── db.ts           # Database connection
│   ├── schema.ts       # Table definitions
│   └── index.ts        # CRUD example
├── drizzle.config.ts   # Drizzle configuration
├── .env                # Environment variables
└── package.json        # Dependencies
```

---

## Key Differences from Advanced

### 1. Database Connection

**Basic:**
```typescript
// src/db.ts
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

**Advanced (Our Implementation):**
```typescript
// lib/db/index.ts
import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"
import * as schema from "./schema"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

export const db = drizzle(pool, { schema })
```

**Upgrade Benefit:** Better performance, connection management

---

### 2. Schema Organization

**Basic:**
```typescript
// src/schema.ts - All tables in one file
export const demoUsers = pgTable('demo_users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Advanced (Our Implementation):**
```typescript
// lib/db/schema/users.ts - Organized by domain
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Soft delete
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
)
```

**Upgrade Benefits:**
- Better organization
- UUID primary keys (distributed systems)
- Proper indexing
- Soft delete support
- Timestamps (created/updated)

---

### 3. Database Operations

**Basic:**
```typescript
// Direct queries everywhere
const [user] = await db.insert(demoUsers).values(data).returning();
const users = await db.select().from(demoUsers);
const [updated] = await db.update(demoUsers).set(data).where(...).returning();
await db.delete(demoUsers).where(...);
```

**Advanced (Our Implementation):**
```typescript
// Repository pattern
const user = await usersRepository.create(data);
const users = await usersRepository.findAll();
const updated = await usersRepository.update(id, data);
await usersRepository.delete(id);
```

**Upgrade Benefits:**
- Encapsulation
- Consistency
- Error handling
- Validation
- Testability

---

### 4. Validation

**Basic:**
```typescript
// No validation - relies on database
await db.insert(demoUsers).values({
  email: "invalid-email", // Fails at database level
});
```

**Advanced (Our Implementation):**
```typescript
// Three-layer validation
const validated = UserCreateRequest.parse(data); // Validates with business rules
const user = await usersRepository.create(validated);
```

**Upgrade Benefits:**
- Input validation
- Better error messages
- Business rules enforced
- Type safety

---

### 5. Error Handling

**Basic:**
```typescript
try {
  await db.insert(demoUsers).values(data);
} catch (error) {
  console.error(error); // Generic handling
}
```

**Advanced (Our Implementation):**
```typescript
import { NotFoundError, ConflictError } from "@/db/errors"
try {
  await usersRepository.create(data);
} catch (error) {
  if (error instanceof ConflictError) {
    // Handle specifically
  }
}
```

**Upgrade Benefits:**
- Custom error types
- Type-safe error handling
- Better error messages
- Proper error propagation

---

## Example Scripts

### Basic Pattern Example
See: `examples/basic-crud-demo.ts`

This demonstrates the basic pattern with direct queries.

### Advanced Pattern Example
See: `examples/advanced-crud-demo.ts`

This demonstrates the advanced pattern with repositories.

---

## When to Use Each

### Use Basic Pattern When:
- ✅ Learning Drizzle/Neon
- ✅ Prototyping
- ✅ Small projects
- ✅ Personal projects
- ✅ Quick demos

### Use Advanced Pattern When:
- ✅ Production applications
- ✅ Team projects
- ✅ Scalable applications
- ✅ Enterprise applications
- ✅ Long-term maintenance

---

## Migration Guide

See: `.plan/DRIZZLE_NEON_EVOLUTION.md` for step-by-step migration guide from basic to advanced.

---

## Reference

- **Standard Guide:** Based on official Drizzle + Neon documentation
- **Our Implementation:** See `.plan/DEVELOPER_HANDOFF.md`
- **Evolution Guide:** See `.plan/DRIZZLE_NEON_EVOLUTION.md`

---

**Last Updated:** Current Session  
**Status:** Legacy Pattern Documented ✅
