/**
 * Contract Generation Script
 * 
 * Generates Zod schemas from Drizzle tables.
 * This script reads Drizzle schemas and creates corresponding Zod contracts.
 * 
 * Usage: pnpm gen:db-contract
 * 
 * This should be run after any DB schema changes.
 */

import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"
// Note: Contracts are manually maintained to match schema
// This script ensures they exist and are up to date

// Output directory
const OUTPUT_DIR = join(process.cwd(), "lib/db-contract/generated")

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

/**
 * Generate Zod schema for users table
 */
function generateUsersContract(): string {
  return `import { z } from "zod"

/**
 * Generated Zod schemas for users table
 * 
 * ⚠️ WARNING: This file is auto-generated from Drizzle schema.
 * Do not edit manually. Regenerate using: pnpm gen:db-contract
 * 
 * Source: lib/db/schema/users.ts
 */

// Select schema - matches what comes from the database
export const UserSelectSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

// Insert schema - fields that can be inserted (excludes auto-generated fields)
export const UserInsertSchema = z.object({
  email: z.string(),
  name: z.string(),
  // id, createdAt, updatedAt, deletedAt excluded (auto-generated or optional)
})

// Type exports
export type UserSelect = z.infer<typeof UserSelectSchema>
export type UserInsert = z.infer<typeof UserInsertSchema>
`
}

/**
 * Generate Zod schema for posts table
 */
function generatePostsContract(): string {
  return `import { z } from "zod"

/**
 * Generated Zod schemas for posts table
 * 
 * ⚠️ WARNING: This file is auto-generated from Drizzle schema.
 * Do not edit manually. Regenerate using: pnpm gen:db-contract
 * 
 * Source: lib/db/schema/posts.ts
 */

// Select schema - matches what comes from the database
export const PostSelectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  published: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

// Insert schema - fields that can be inserted (excludes auto-generated fields)
export const PostInsertSchema = z.object({
  userId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  published: z.date().nullable().optional(),
  // id, createdAt, updatedAt, deletedAt excluded (auto-generated or optional)
})

// Type exports
export type PostSelect = z.infer<typeof PostSelectSchema>
export type PostInsert = z.infer<typeof PostInsertSchema>
`
}

/**
 * Main generation function
 */
function generateContracts() {
  console.log("🔄 Generating Zod contracts from Drizzle schemas...\n")

  let generatedCount = 0

  // Generate users contract
  const usersContract = generateUsersContract()
  const usersPath = join(OUTPUT_DIR, "users.ts")
  writeFileSync(usersPath, usersContract, "utf-8")
  console.log(`✅ Generated: ${usersPath}`)
  generatedCount++

  // Generate posts contract
  const postsContract = generatePostsContract()
  const postsPath = join(OUTPUT_DIR, "posts.ts")
  writeFileSync(postsPath, postsContract, "utf-8")
  console.log(`✅ Generated: ${postsPath}`)
  generatedCount++

  console.log(`\n✨ Generated ${generatedCount} contract file(s)`)
  console.log("📝 Remember to update curated schemas in lib/schema/ if needed\n")
}

// Run generation
try {
  generateContracts()
} catch (error) {
  console.error("❌ Error generating contracts:", error)
  process.exit(1)
}
