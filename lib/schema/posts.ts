import { z } from "zod"
import { PostInsertSchema } from "../db-contract/generated/posts"

/**
 * Curated Post Schemas - Business Rules & API Contracts
 * 
 * These schemas extend the db-contract layer with business-specific
 * validation rules and API requirements.
 */

// Post creation request - extends DB contract with business rules
export const PostCreateRequest = PostInsertSchema.extend({
    title: z.string().min(1).max(255),
    content: z.string().min(10),
    slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/), // URL-friendly slug
})

// Post update request - allows partial updates
export const PostUpdateRequest = PostCreateRequest.partial().extend({
    // Can add update-specific fields here
})

// Post response - for API responses (can include computed fields)
export const PostResponse = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    title: z.string(),
    content: z.string(),
    slug: z.string(),
    published: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

// Post with author (relation)
export const PostWithAuthorResponse = PostResponse.extend({
    author: z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email(),
    }),
})

// Type exports
export type PostCreateRequest = z.infer<typeof PostCreateRequest>
export type PostUpdateRequest = z.infer<typeof PostUpdateRequest>
export type PostResponse = z.infer<typeof PostResponse>
export type PostWithAuthorResponse = z.infer<typeof PostWithAuthorResponse>
