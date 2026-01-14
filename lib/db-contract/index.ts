import "server-only"

/**
 * DB Contract Layer (Layer 2: Generated Baseline)
 * 
 * This package contains Zod schemas generated from Drizzle tables.
 * These are baseline contracts derived from the DB schema.
 * 
 * Generated files are in the generated/ directory and should not be edited manually.
 * Regenerate after any DB schema changes using: pnpm gen:db-contract
 */

// Re-export generated contracts
export * from "./generated/users"
export * from "./generated/posts"
