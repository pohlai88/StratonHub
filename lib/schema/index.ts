import "server-only"

/**
 * Curated Schema Layer (Layer 3: Business Contracts)
 * 
 * This package contains curated business/API contracts.
 * These schemas extend the db-contract layer with business rules,
 * validation, and API-specific requirements.
 * 
 * Pattern: Extend db-contract schemas with additional validation rules.
 */

// Export curated schemas
export * from "./users"
export * from "./posts"

// Add more exports as domains are added:
// export * from "./common"
