# AXIS Dev Handoff Note — Clear Boundaries + DB‑First Doctrine

**Context:** This note captures the canonical decisions and architecture rules discussed for the AXIS monorepo.

**Primary Goals:**

1. Enforce **clear boundaries** (top consumes bottom; bottom never consumes top)
2. Keep the repo **portable** (“what I can bring with me when I go away”)
3. Implement **DB‑First doctrine** (Drizzle is persistence truth)
4. Apply **Contract‑First strategy** (Zod everywhere) without breaking DB
5. Prevent **contamination** across packages/apps (exports lock + layering)

---

## 0) Canonical Laws (Non‑Negotiable)

### LAW A — Dependency Direction

**apps → packages → (nothing above)**

* `apps/*` may import from `packages/*`
* `packages/*` must **never** import from `apps/*`

**Reason:** Apps are runtime composition shells; packages are portable canon capabilities.

---

### LAW B — Next.js Runtime Boundary

Next.js App Router routing is defined only inside:

* `apps/<app-name>/app/**`

This folder contains:

* `layout.tsx`
* `page.tsx`
* `route.ts`
* segment folders

**Reason:** This keeps runtime surface explicit and prevents mixing “framework routing” into portable packages.

---

### LAW C — Root Config Minimalism

Project root contains only mandatory configs.
All optional configs live under `.config/`.

**Reason:** Cleaner repo, easier portability, less root clutter.

---

### LAW D — Public API Surface Lock

Each package has a **single public doorway**:

* `src/index.ts` (or `index.ts` if you choose no `src/`)

And package exports are locked using `package.json#exports`.

**Reason:** Prevents deep imports, prevents accidental coupling, allows internal refactor without breaking apps.

---

## 1) Monorepo Layout (Canonical)

> This layout matches Next.js v16 expectations and the AXIS boundary doctrine.

```txt
AXIS/
├─ apps/
│  ├─ dev-admin/
│  │  ├─ app/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ globals.css
│  │  │  ├─ code-inquires/
│  │  │  │  ├─ route.ts
│  │  │  │  └─ page.tsx
│  │  │  └─ function-registries/
│  │  │     ├─ route.ts
│  │  │     └─ page.tsx
│  │  ├─ components/
│  │  │  ├─ admin-app-shell.tsx
│  │  │  └─ admin-dashboard-shell.tsx
│  │  ├─ instrumentation.ts
│  │  ├─ middleware.ts
│  │  ├─ next.config.ts
│  │  ├─ tsconfig.json
│  │  └─ package.json
│  └─ (other apps...)
│
├─ packages/
│  ├─ db/                        # Drizzle truth (persistence blueprint)
│  ├─ db-contract/               # Zod generated from Drizzle (baseline contracts)
│  ├─ schema/                    # Curated business/API contracts (Zod everywhere)
│  ├─ domain/                    # Business rules/policies
│  ├─ observability/             # ports only
│  ├─ observability-node/        # adapters only
│  ├─ config/                    # ports only
│  ├─ config-node/               # adapters only
│  ├─ design-system/             # CSS + optional UI helpers
│  └─ templates/                 # scaffolds/generators (not runtime)
│
├─ scripts/
│  └─ gen-schema-exports.mjs
│
├─ .config/
│  ├─ eslint/
│  ├─ prettier/
│  └─ tooling/
│
├─ .env
├─ package.json
└─ tsconfig.base.json
```

---

## 2) Package Layering Model (Prevents Contamination)

### L0 — Foundation (pure)

Examples:

* `@axis/utils`
* `@axis/types`
* `@axis/schema` (if treated as pure contract library)

**Must not depend on:** Next, Node runtime, DB, telemetry.

---

### L1 — Core Domain (business logic)

Examples:

* `@axis/domain`

**Allowed deps:** L0 only.

---

### L2 — Platform (ports/adapters)

Examples:

* `@axis/observability` (ports)
* `@axis/observability-node` (adapter)
* `@axis/config` (ports)
* `@axis/config-node` (adapter)

**Rule:** ports never depend on adapters.

---

### L3 — Product Capabilities

Examples:

* `@axis/design-system`

**Rule:** must not import apps.

---

## 3) Server‑Only Policy (AXIS Default)

**Policy:** everything is server‑side unless explicitly required as client.

### Server‑only enforcement

In server‑only packages, add:

```ts
import "server-only";
```

Recommended in:

* `packages/schema/src/index.ts`
* `packages/db-contract/src/index.ts`
* `packages/config-node/src/index.ts`
* `packages/observability-node/src/index.ts`

**Outcome:** If someone imports these from a client component, it fails loudly.

---

## 4) DB‑First Doctrine (Canonical Truth Chain)

### DB‑First = Correct for AXIS

Reason: API is just an adapter. Truth must be materialized and portable.

### Canonical Truth Chain

1. **Drizzle schema** (persistence blueprint)
2. **Migrations** (change log)
3. **Actual DB** (materialized reality)
4. **Zod projections** (derived contracts)
5. **API contracts** (curated projections)
6. **Adapters** (REST/tRPC/GraphQL/Jobs/UI)

**Non‑negotiable:** Zod must never drive DB shape automatically.

---

## 5) Contract‑First Strategy (Zod Everywhere)

### Correct meaning of “Zod everywhere”

* Use Zod as the **contract language** across the system
* BUT keep the authority chain correct:

**Drizzle → Zod (DB contracts) → Zod (API contracts)**

### Why it’s safe

Zod is a projection/validation layer; Drizzle is persistence truth.

---

## 6) The Safe Drizzle + Zod Stencil Pattern

### Package responsibilities

#### `@axis/db`

**Owns:**

* Drizzle tables
* migrations

**Must not import:** Zod, Next, observability.

#### `@axis/db-contract`

**Owns:**

* generated Zod schemas derived from Drizzle
* baseline `insert/select` contracts

**May import:** `@axis/db`, Zod.

#### `@axis/schema`

**Owns:**

* curated business/API contracts
* composed from db-contract + extra rules

**May import:** `@axis/db-contract`, Zod.

---

## 7) Example — One Table, Three Contract Layers

### A) Drizzle table (truth)

```ts
// packages/db/src/schema/invoice.ts
import { pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core";

export const invoice = pgTable("invoice", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorId: uuid("vendor_id").notNull(),
  invoiceNo: text("invoice_no").notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### B) DB contract (generated baseline)

```ts
// packages/db-contract/src/generated/invoice.ts
import { z } from "zod";

export const InvoiceSelectSchema = z.object({
  id: z.string().uuid(),
  vendorId: z.string().uuid(),
  invoiceNo: z.string(),
  amount: z.string(), // numeric comes back as string in many drivers
  createdAt: z.date(),
});

export const InvoiceInsertSchema = z.object({
  vendorId: z.string().uuid(),
  invoiceNo: z.string(),
  amount: z.string(),
});
```

### C) API contract (curated)

```ts
// packages/schema/src/sales/invoice.ts
import { z } from "zod";
import { InvoiceInsertSchema } from "@axis/db-contract";

export const InvoiceCreateRequest = InvoiceInsertSchema.extend({
  invoiceNo: z.string().min(3).max(50),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export type InvoiceCreateRequest = z.infer<typeof InvoiceCreateRequest>;
```

**Key idea:**

* DB contract is the floor
* API contract is the law

---

## 8) “Plugins break DB” — Prevention Rules

### Never do:

* runtime codegen
* auto-migrate on app boot
* letting zod generation dictate schema changes

### Always do:

* explicit migrations
* build-time generation (`pnpm gen:db-contract`)
* regenerate contracts after DB change

---

## 9) Public API Locking via `src/index.ts` + `exports`

### Why `src/index.ts` exists

It is the **public doorway** of a package.

* `src/` = workshop
* `src/index.ts` = reception desk (public API)
* `dist/` = shipped output
* `exports` = locked door policy

### Example: schema package exports (subpath only)

```json
{
  "name": "@axis/schema",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./sales": {
      "types": "./dist/sales/index.d.ts",
      "default": "./dist/sales/index.js"
    },
    "./common": {
      "types": "./dist/common/index.d.ts",
      "default": "./dist/common/index.js"
    }
  }
}
```

**Result:** consumers cannot deep import internal files.

---

## 10) Adapter Philosophy (AXIS Core Principle)

**API is an adapter program.**

Because DB is truth, you can build adapters for:

* REST
* tRPC
* GraphQL
* CLI
* internal jobs
* UI server actions

Adapters may transform/shape contracts, but they must never change persistence truth.

---

## 11) Suggested Dev Workflow (Safe + Repeatable)

### When changing DB shape

1. edit Drizzle table in `@axis/db`
2. create migration
3. run migration
4. regenerate `@axis/db-contract`
5. update curated `@axis/schema` if needed
6. update app adapters/routes

### When adding a new API endpoint

1. pick curated schema from `@axis/schema`
2. parse/validate input
3. call domain logic / query layer
4. return curated response shape

---

## 12) Optional: Scaffold Manifest Pattern (keeps apps thin)

Apps declare which schemas they use:

```json
// apps/dev-admin/schema.manifest.json
{
  "use": [
    "sales",
    "common"
  ]
}
```

Then generate a local re-export:

* `apps/dev-admin/_generated/schema.ts`

So app imports only:

* `~/generated/schema`

---

## 13) Final Summary (What Was Decided)

### Clear boundaries

* Apps are runtime composition
* Packages are portable canon
* Bottom never consumes top

### Next correctness

* All routes/pages/layouts live under `apps/<app>/app/**`

### Clean package API

* `src/index.ts` defines public surface
* `package.json#exports` locks the surface

### DB‑First doctrine

* Drizzle tables + migrations are truth
* Zod derived contracts are projections
* API is an adapter program

### Contract‑first strategy

* Zod everywhere is valid
* But authority chain remains: Drizzle → Zod → API

---

## Implementation TODO (Next Actions)

1. Create packages:

   * `@axis/db`
   * `@axis/db-contract`
   * `@axis/schema`
2. Add `server-only` fences for server packages
3. Add exports maps to lock public API
4. Add a generator command for db-contract (build-time)
5. Add ESLint restricted imports to enforce boundaries

---

**End of AXIS Dev Handoff Note**
