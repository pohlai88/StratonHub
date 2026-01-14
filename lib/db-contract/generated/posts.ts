import { z } from "zod"

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
