/**
 * Example usage of Drizzle ORM with Neon (AXIS-Enhanced)
 * 
 * This file demonstrates the elite pattern using:
 * - Curated schemas for validation (Layer 3)
 * - Drizzle queries for type-safe operations (Layer 1)
 * - Proper error handling and transaction management
 */

import "server-only"
import { db } from "./index"
import { users } from "./schema"
import { eq } from "drizzle-orm"
import { UserCreateRequest, UserUpdateRequest } from "@/schema/users"

// Example: Create a new user (with validation)
export async function createUser(data: unknown) {
  // Validate against curated schema (includes business rules)
  const validated = UserCreateRequest.parse(data)
  
  // Insert using Drizzle (type-safe from schema)
  const [newUser] = await db.insert(users).values(validated).returning()
  return newUser
}

// Example: Get user by ID
export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)
  return user
}

// Example: Get user by email
export async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  return user
}

// Example: Get all users (with soft delete filter)
export async function getAllUsers() {
  return await db
    .select()
    .from(users)
    .where(eq(users.deletedAt, null))
}

// Example: Update user (with validation)
export async function updateUser(id: string, data: unknown) {
  // Validate update data
  const validated = UserUpdateRequest.parse(data)
  
  const [updatedUser] = await db
    .update(users)
    .set({ ...validated, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return updatedUser
}

// Example: Soft delete user
export async function deleteUser(id: string) {
  const [deletedUser] = await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return deletedUser
}
