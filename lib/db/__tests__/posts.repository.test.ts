/**
 * Posts Repository Tests
 * 
 * Tests for the PostsRepository including relation queries.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { postsRepository } from "../repositories/posts.repository"
import { usersRepository } from "../repositories/users.repository"
import { NotFoundError, ConflictError } from "../errors"
import { cleanTestDatabase, createTestUser, createTestPost } from "../test-utils/helpers"
import { generateTestUser, generateTestPost } from "../test-utils/fixtures"

describe("PostsRepository", () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>

  beforeAll(async () => {
    await cleanTestDatabase()
  })

  afterAll(async () => {
    await cleanTestDatabase()
  })

  beforeEach(async () => {
    await cleanTestDatabase()
    testUser = await createTestUser()
  })

  describe("create", () => {
    it("should create a post with valid data", async () => {
      const postData = {
        ...generateTestPost(),
        userId: testUser.id,
      }

      const post = await postsRepository.create(postData)

      expect(post).toBeDefined()
      expect(post.id).toBeDefined()
      expect(post.userId).toBe(testUser.id)
      expect(post.title).toBe(postData.title)
      expect(post.content).toBe(postData.content)
      expect(post.slug).toBe(postData.slug)
      expect(post.createdAt).toBeInstanceOf(Date)
    })

    it("should throw ConflictError for duplicate slug", async () => {
      const postData = {
        ...generateTestPost("duplicate"),
        userId: testUser.id,
      }

      await postsRepository.create(postData)
      await expect(postsRepository.create(postData)).rejects.toThrow(ConflictError)
    })
  })

  describe("findById", () => {
    it("should find post by ID", async () => {
      const testPost = await createTestPost(testUser.id)
      const found = await postsRepository.findById(testPost.id)

      expect(found).toBeDefined()
      expect(found?.id).toBe(testPost.id)
    })

    it("should return null for non-existent post", async () => {
      const found = await postsRepository.findById("00000000-0000-0000-0000-000000000000")
      expect(found).toBeNull()
    })
  })

  describe("findByIdWithAuthor", () => {
    it("should find post with author using JOIN", async () => {
      const testPost = await createTestPost(testUser.id)
      const result = await postsRepository.findByIdWithAuthor(testPost.id)

      expect(result).toBeDefined()
      expect(result?.post.id).toBe(testPost.id)
      expect(result?.author.id).toBe(testUser.id)
      expect(result?.author.name).toBe(testUser.name)
      expect(result?.author.email).toBe(testUser.email)
    })

    it("should return null for non-existent post", async () => {
      const result = await postsRepository.findByIdWithAuthor(
        "00000000-0000-0000-0000-000000000000"
      )
      expect(result).toBeNull()
    })
  })

  describe("findByUserId", () => {
    it("should find all posts by user", async () => {
      const user2 = await createTestUser({ email: "user2@test.com" })

      await createTestPost(testUser.id, { slug: "post1" })
      await createTestPost(testUser.id, { slug: "post2" })
      await createTestPost(user2.id, { slug: "post3" })

      const userPosts = await postsRepository.findByUserId(testUser.id)
      expect(userPosts.length).toBe(2)
      expect(userPosts.every((p) => p.userId === testUser.id)).toBe(true)
    })

    it("should support pagination", async () => {
      await createTestPost(testUser.id, { slug: "post1" })
      await createTestPost(testUser.id, { slug: "post2" })
      await createTestPost(testUser.id, { slug: "post3" })

      const page1 = await postsRepository.findByUserId(testUser.id, 2, 0)
      expect(page1.length).toBe(2)

      const page2 = await postsRepository.findByUserId(testUser.id, 2, 2)
      expect(page2.length).toBe(1)
    })
  })

  describe("findPublished", () => {
    it("should find only published posts with authors", async () => {
      const user2 = await createTestUser({ email: "user2@test.com" })

      const post1 = await createTestPost(testUser.id, { slug: "post1" })
      const post2 = await createTestPost(testUser.id, { slug: "post2" })
      const post3 = await createTestPost(user2.id, { slug: "post3" })

      // Publish some posts
      await postsRepository.publish(post1.id)
      await postsRepository.publish(post3.id)
      // post2 remains unpublished

      const published = await postsRepository.findPublished()

      expect(published.length).toBe(2)
      expect(published.some((p) => p.post.id === post1.id)).toBe(true)
      expect(published.some((p) => p.post.id === post3.id)).toBe(true)
      expect(published.some((p) => p.post.id === post2.id)).toBe(false)

      // Verify authors are included
      expect(published[0].author).toBeDefined()
      expect(published[0].author.id).toBeDefined()
    })
  })

  describe("update", () => {
    it("should update post", async () => {
      const testPost = await createTestPost(testUser.id)
      const updated = await postsRepository.update(testPost.id, {
        title: "Updated Title",
      })

      expect(updated.title).toBe("Updated Title")
      expect(updated.updatedAt.getTime()).toBeGreaterThan(testPost.updatedAt.getTime())
    })

    it("should throw NotFoundError for non-existent post", async () => {
      await expect(
        postsRepository.update("00000000-0000-0000-0000-000000000000", {
          title: "Test",
        })
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("publish", () => {
    it("should publish a post", async () => {
      const testPost = await createTestPost(testUser.id)
      expect(testPost.published).toBeNull()

      const published = await postsRepository.publish(testPost.id)
      expect(published.published).toBeInstanceOf(Date)
    })

    it("should throw NotFoundError for non-existent post", async () => {
      await expect(
        postsRepository.publish("00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("delete", () => {
    it("should soft delete post", async () => {
      const testPost = await createTestPost(testUser.id)
      const deleted = await postsRepository.delete(testPost.id)

      expect(deleted.deletedAt).toBeInstanceOf(Date)

      const found = await postsRepository.findById(testPost.id)
      expect(found).toBeNull()
    })
  })
})
