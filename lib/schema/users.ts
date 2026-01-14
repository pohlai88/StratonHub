import { z } from "zod"
import { UserInsertSchema } from "../db-contract/generated/users"

/**
 * Curated User Schemas - Business Rules & API Contracts
 * 
 * These schemas extend the db-contract layer with business-specific
 * validation rules and API requirements.
 */

// User creation request - extends DB contract with business rules
export const UserCreateRequest = UserInsertSchema.extend({
  email: z.string().email().min(5).max(255),
  name: z.string().min(1).max(255),
})

// User update request - allows partial updates
export const UserUpdateRequest = UserCreateRequest.partial().extend({
  // Can add update-specific fields here
})

// User response - for API responses (can include computed fields)
export const UserResponse = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Type exports
export type UserCreateRequest = z.infer<typeof UserCreateRequest>
export type UserUpdateRequest = z.infer<typeof UserUpdateRequest>
export type UserResponse = z.infer<typeof UserResponse>
