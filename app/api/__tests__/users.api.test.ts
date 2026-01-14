/**
 * Users API Route Tests
 * 
 * Integration tests for user API endpoints.
 * 
 * Note: These tests require a running Next.js server or can be adapted
 * for unit testing with mocked requests.
 */

import { describe, it, expect } from "vitest"
import { NextRequest } from "next/server"
import { GET, POST } from "../users/route"
import { GET as GET_USER, PATCH, DELETE } from "../users/[id]/route"
import { usersRepository } from "@/db/repositories"
import { cleanTestDatabase, createTestUser, generateTestUser } from "@/db/test-utils/helpers"

describe("Users API Routes", () => {
  beforeEach(async () => {
    await cleanTestDatabase()
  })

  describe("GET /api/users", () => {
    it("should return paginated users", async () => {
      // Create test users
      await createTestUser({ email: "user1@test.com" })
      await createTestUser({ email: "user2@test.com" })

      const request = new NextRequest("http://localhost:3000/api/users?page=1&pageSize=10")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.users).toBeDefined()
      expect(Array.isArray(data.users)).toBe(true)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.pageSize).toBe(10)
    })

    it("should handle invalid pagination parameters", async () => {
      const request = new NextRequest("http://localhost:3000/api/users?page=-1&pageSize=200")
      const response = await GET(request)

      expect(response.status).toBe(400)
    })
  })

  describe("POST /api/users", () => {
    it("should create a user", async () => {
      const userData = generateTestUser()
      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.id).toBeDefined()
      expect(data.email).toBe(userData.email)
      expect(data.name).toBe(userData.name)
    })

    it("should return 409 for duplicate email", async () => {
      const userData = generateTestUser("duplicate")
      await usersRepository.create(userData)

      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(userData),
      })

      const response = await POST(request)
      expect(response.status).toBe(409)
    })

    it("should return 400 for invalid data", async () => {
      const invalidData = { email: "invalid", name: "Test" }
      const request = new NextRequest("http://localhost:3000/api/users", {
        method: "POST",
        body: JSON.stringify(invalidData),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe("GET /api/users/[id]", () => {
    it("should return user by ID", async () => {
      const testUser = await createTestUser()
      const request = new NextRequest(`http://localhost:3000/api/users/${testUser.id}`)

      const response = await GET_USER(request, { params: Promise.resolve({ id: testUser.id }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(testUser.id)
      expect(data.email).toBe(testUser.email)
    })

    it("should return 404 for non-existent user", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/users/00000000-0000-0000-0000-000000000000"
      )

      const response = await GET_USER(request, {
        params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000000" }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe("PATCH /api/users/[id]", () => {
    it("should update user", async () => {
      const testUser = await createTestUser()
      const updateData = { name: "Updated Name" }

      const request = new NextRequest(`http://localhost:3000/api/users/${testUser.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      })

      const response = await PATCH(request, {
        params: Promise.resolve({ id: testUser.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe("Updated Name")
    })
  })

  describe("DELETE /api/users/[id]", () => {
    it("should soft delete user", async () => {
      const testUser = await createTestUser()
      const request = new NextRequest(`http://localhost:3000/api/users/${testUser.id}`, {
        method: "DELETE",
      })

      const response = await DELETE(request, {
        params: Promise.resolve({ id: testUser.id }),
      })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.deletedAt).toBeDefined()

      // Verify user is not found after delete
      const found = await usersRepository.findById(testUser.id)
      expect(found).toBeNull()
    })
  })
})
