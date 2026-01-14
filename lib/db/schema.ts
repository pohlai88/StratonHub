/**
 * Schema exports - Drizzle Truth Layer
 * 
 * This file re-exports all table schemas from the schema/ directory.
 * Each table should be defined in its own file under schema/ for better organization.
 */

// Export tables
export * from "./schema/users"
export * from "./schema/posts"

// Export relations
export * from "./schema/relations"
