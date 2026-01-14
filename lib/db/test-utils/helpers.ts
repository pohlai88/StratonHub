import "server-only"
import { db } from "../index"
import { users, posts } from "../schema"
import { eq } from "drizzle-orm"

/**
 * Test Helpers
 * 
 * Utilities for testing database operations.
 */

/**
 * Clean test database
 * Removes all test data (use with caution!)
 */
export async function cleanTestDatabase() {
  // Delete in reverse order of dependencies
  await db.delete(posts)
  await db.delete(users)
}

/**
 * Create a test user
 */
export async function createTestUser(overrides?: Partial<typeof users.$inferInsert>) {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    name: "Test User",
    ...overrides,
  }

  const [user] = await db.insert(users).values(testUser).returning()
  return user
}

/**
 * Create a test post
 */
export async function createTestPost(
  userId: string,
  overrides?: Partial<typeof posts.$inferInsert>
) {
  const testPost = {
    userId,
    title: "Test Post",
    content: "Test content",
    slug: `test-post-${Date.now()}`,
    ...overrides,
  }

  const [post] = await db.insert(posts).values(testPost).returning()
  return post
}

/**
 * Get user by email (for testing)
 */
export async function getTestUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  return user || null
}

/**
 * Get post by slug (for testing)
 */
export async function getTestPostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1)
  return post || null
}

/**
 * Assert user exists
 */
export async function assertUserExists(email: string) {
  const user = await getTestUserByEmail(email)
  if (!user) {
    throw new Error(`User with email ${email} not found`)
  }
  return user
}

/**
 * Assert post exists
 */
export async function assertPostExists(slug: string) {
  const post = await getTestPostBySlug(slug)
  if (!post) {
    throw new Error(`Post with slug ${slug} not found`)
  }
  return post
}
