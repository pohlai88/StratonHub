import { z } from "zod"

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
