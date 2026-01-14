/**
 * Users Repository Tests
 * 
 * Tests for the UsersRepository using Vitest.
 * 
 * Run with: pnpm test
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { usersRepository } from "../repositories/users.repository"
import { NotFoundError, ConflictError } from "../errors"
import { cleanTestDatabase, createTestUser, generateTestUser } from "../test-utils/helpers"

describe("UsersRepository", () => {
  beforeAll(async () => {
    // Setup: ensure clean state
    await cleanTestDatabase()
  })

  afterAll(async () => {
    // Cleanup: remove test data
    await cleanTestDatabase()
  })

  beforeEach(async () => {
    // Clean before each test for isolation
    await cleanTestDatabase()
  })

  describe("create", () => {
    it("should create a user with valid data", async () => {
      const userData = generateTestUser()
      const user = await usersRepository.create(userData)

      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
      expect(user.deletedAt).toBeNull()
    })

    it("should throw ConflictError for duplicate email", async () => {
      const userData = generateTestUser()
      await usersRepository.create(userData)

      await expect(usersRepository.create(userData)).rejects.toThrow(ConflictError)
    })

    it("should validate email format", async () => {
      const invalidData = {
        email: "invalid-email",
        name: "Test User",
      }

      await expect(usersRepository.create(invalidData)).rejects.toThrow()
    })
  })

  describe("findById", () => {
    it("should find user by ID", async () => {
      const testUser = await createTestUser()
      const found = await usersRepository.findById(testUser.id)

      expect(found).toBeDefined()
      expect(found?.id).toBe(testUser.id)
      expect(found?.email).toBe(testUser.email)
    })

    it("should return null for non-existent user", async () => {
      const found = await usersRepository.findById("00000000-0000-0000-0000-000000000000")
      expect(found).toBeNull()
    })

    it("should not return soft-deleted users", async () => {
      const testUser = await createTestUser()
      await usersRepository.delete(testUser.id)

      const found = await usersRepository.findById(testUser.id)
      expect(found).toBeNull()
    })
  })

  describe("findByIdOrThrow", () => {
    it("should return user if found", async () => {
      const testUser = await createTestUser()
      const found = await usersRepository.findByIdOrThrow(testUser.id)

      expect(found.id).toBe(testUser.id)
    })

    it("should throw NotFoundError if not found", async () => {
      await expect(
        usersRepository.findByIdOrThrow("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      const testUser = await createTestUser()
      const found = await usersRepository.findByEmail(testUser.email)

      expect(found).toBeDefined()
      expect(found?.email).toBe(testUser.email)
    })

    it("should return null for non-existent email", async () => {
      const found = await usersRepository.findByEmail("nonexistent@example.com")
      expect(found).toBeNull()
    })
  })

  describe("update", () => {
    it("should update user", async () => {
      const testUser = await createTestUser()
      const updated = await usersRepository.update(testUser.id, {
        name: "Updated Name",
      })

      expect(updated.name).toBe("Updated Name")
      expect(updated.updatedAt.getTime()).toBeGreaterThan(testUser.updatedAt.getTime())
    })

    it("should throw NotFoundError for non-existent user", async () => {
      await expect(
        usersRepository.update("00000000-0000-0000-0000-000000000000", {
          name: "Test",
        })
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("delete", () => {
    it("should soft delete user", async () => {
      const testUser = await createTestUser()
      const deleted = await usersRepository.delete(testUser.id)

      expect(deleted.deletedAt).toBeInstanceOf(Date)

      // Verify user is not found after soft delete
      const found = await usersRepository.findById(testUser.id)
      expect(found).toBeNull()
    })

    it("should throw NotFoundError for non-existent user", async () => {
      await expect(
        usersRepository.delete("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("findAll", () => {
    it("should return all users with pagination", async () => {
      // Create multiple users
      await createTestUser({ email: "user1@test.com" })
      await createTestUser({ email: "user2@test.com" })
      await createTestUser({ email: "user3@test.com" })

      const users = await usersRepository.findAll(2, 0)
      expect(users.length).toBe(2)

      const usersPage2 = await usersRepository.findAll(2, 2)
      expect(usersPage2.length).toBe(1)
    })

    it("should exclude soft-deleted users", async () => {
      const user1 = await createTestUser({ email: "user1@test.com" })
      await createTestUser({ email: "user2@test.com" })
      await usersRepository.delete(user1.id)

      const users = await usersRepository.findAll()
      expect(users.length).toBe(1)
      expect(users[0].email).toBe("user2@test.com")
    })
  })

  describe("count", () => {
    it("should count all non-deleted users", async () => {
      await cleanTestDatabase()

      await createTestUser({ email: "user1@test.com" })
      await createTestUser({ email: "user2@test.com" })

      const count = await usersRepository.count()
      expect(count).toBe(2)

      const user = await usersRepository.findByEmail("user1@test.com")
      if (user) {
        await usersRepository.delete(user.id)
      }

      const countAfterDelete = await usersRepository.count()
      expect(countAfterDelete).toBe(1)
    })
  })
})
