/**
 * Example: Using the Repository Pattern
 * 
 * This file demonstrates how to use the repository pattern
 * instead of direct database queries.
 */

import "server-only"
import { usersRepository } from "./repositories"
import { NotFoundError, ConflictError } from "./errors"

/**
 * Example: Create user using repository
 */
export async function createUserExample(data: unknown) {
  try {
    return await usersRepository.create(data)
  } catch (error) {
    if (error instanceof ConflictError) {
      // Handle email conflict
      throw new Error("Email already in use")
    }
    throw error
  }
}

/**
 * Example: Get user with error handling
 */
export async function getUserExample(id: string) {
  try {
    return await usersRepository.findByIdOrThrow(id)
  } catch (error) {
    if (error instanceof NotFoundError) {
      // Handle not found
      return null
    }
    throw error
  }
}

/**
 * Example: Update user
 */
export async function updateUserExample(id: string, data: unknown) {
  try {
    return await usersRepository.update(id, data)
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new Error("User not found")
    }
    throw error
  }
}

/**
 * Example: List users with pagination
 */
export async function listUsersExample(page: number = 1, pageSize: number = 10) {
  const offset = (page - 1) * pageSize
  const users = await usersRepository.findAll(pageSize, offset)
  const total = await usersRepository.count()

  return {
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}
