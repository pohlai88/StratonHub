import "server-only"
import { db } from "../index"
import { users } from "../schema"
import { eq, and, isNull, count } from "drizzle-orm"
import { UserCreateRequest, UserUpdateRequest } from "@/schema/users"
import {
  NotFoundError,
  ConflictError,
  QueryError,
  DatabaseError,
} from "../errors"
import { retryTransaction } from "../utils/retry"
import { withQueryLogging } from "../utils/logging"

/**
 * Users Repository
 * 
 * Implements repository pattern for user operations with:
 * - Type-safe queries using Drizzle
 * - Validation using curated schemas
 * - Error handling with custom error types
 * - Retry logic for transient errors
 * - Query logging
 */

export class UsersRepository {
  /**
   * Create a new user
   */
  async create(data: unknown): Promise<typeof users.$inferSelect> {
    try {
      // Validate input
      const validated = UserCreateRequest.parse(data)

      return await retryTransaction(async () => {
        return await withQueryLogging(async () => {
          const [newUser] = await db
            .insert(users)
            .values(validated)
            .returning()

          if (!newUser) {
            throw new QueryError("Failed to create user")
          }

          return newUser
        }, "INSERT users")
      })
    } catch (error) {
      // Handle unique constraint violations
      if (error instanceof Error && error.message.includes("unique")) {
        throw new ConflictError("User with this email already exists", "email")
      }

      // Re-throw database errors
      if (error instanceof DatabaseError) {
        throw error
      }

      // Wrap unknown errors
      throw new QueryError("Failed to create user", undefined, error)
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<typeof users.$inferSelect | null> {
    try {
      return await withQueryLogging(async () => {
        const [user] = await db
          .select()
          .from(users)
          .where(and(eq(users.id, id), isNull(users.deletedAt)))
          .limit(1)

        return user || null
      }, `SELECT users WHERE id = ${id}`)
    } catch (error) {
      throw new QueryError("Failed to find user by ID", undefined, error)
    }
  }

  /**
   * Find user by ID or throw if not found
   */
  async findByIdOrThrow(id: string): Promise<typeof users.$inferSelect> {
    const user = await this.findById(id)

    if (!user) {
      throw new NotFoundError("User", id)
    }

    return user
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<typeof users.$inferSelect | null> {
    try {
      return await withQueryLogging(async () => {
        const [user] = await db
          .select()
          .from(users)
          .where(and(eq(users.email, email), isNull(users.deletedAt)))
          .limit(1)

        return user || null
      }, `SELECT users WHERE email = ${email}`)
    } catch (error) {
      throw new QueryError("Failed to find user by email", undefined, error)
    }
  }

  /**
   * Find user by email or throw if not found
   */
  async findByEmailOrThrow(email: string): Promise<typeof users.$inferSelect> {
    const user = await this.findByEmail(email)

    if (!user) {
      throw new NotFoundError("User", email)
    }

    return user
  }

  /**
   * Find all users (excluding soft-deleted)
   */
  async findAll(limit?: number, offset?: number): Promise<typeof users.$inferSelect[]> {
    try {
      return await withQueryLogging(async () => {
        let query = db
          .select()
          .from(users)
          .where(isNull(users.deletedAt))

        if (limit) {
          query = query.limit(limit) as typeof query
        }

        if (offset) {
          query = query.offset(offset) as typeof query
        }

        return await query
      }, "SELECT users (all)")
    } catch (error) {
      throw new QueryError("Failed to find users", undefined, error)
    }
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: unknown
  ): Promise<typeof users.$inferSelect> {
    try {
      // Validate input
      const validated = UserUpdateRequest.parse(data)

      return await retryTransaction(async () => {
        return await withQueryLogging(async () => {
          const [updatedUser] = await db
            .update(users)
            .set({ ...validated, updatedAt: new Date() })
            .where(and(eq(users.id, id), isNull(users.deletedAt)))
            .returning()

          if (!updatedUser) {
            throw new NotFoundError("User", id)
          }

          return updatedUser
        }, `UPDATE users WHERE id = ${id}`)
      })
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      throw new QueryError("Failed to update user", undefined, error)
    }
  }

  /**
   * Soft delete user
   */
  async delete(id: string): Promise<typeof users.$inferSelect> {
    try {
      return await retryTransaction(async () => {
        return await withQueryLogging(async () => {
          const [deletedUser] = await db
            .update(users)
            .set({ deletedAt: new Date() })
            .where(and(eq(users.id, id), isNull(users.deletedAt)))
            .returning()

          if (!deletedUser) {
            throw new NotFoundError("User", id)
          }

          return deletedUser
        }, `DELETE users WHERE id = ${id}`)
      })
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      throw new QueryError("Failed to delete user", undefined, error)
    }
  }

  /**
   * Check if user exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const user = await this.findById(id)
      return user !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Count users (excluding soft-deleted)
   */
  async count(): Promise<number> {
    try {
      return await withQueryLogging(async () => {
        const result = await db
          .select({ count: count() })
          .from(users)
          .where(isNull(users.deletedAt))

        return Number(result[0]?.count || 0)
      }, "COUNT users")
    } catch (error) {
      throw new QueryError("Failed to count users", undefined, error)
    }
  }
}

// Export singleton instance
export const usersRepository = new UsersRepository()
