import "server-only"

/**
 * Test Fixtures
 * 
 * Reusable test data for consistent testing.
 */

export const userFixtures = {
  valid: {
    email: "test@example.com",
    name: "Test User",
  },
  valid2: {
    email: "test2@example.com",
    name: "Test User 2",
  },
  invalid: {
    email: "invalid-email", // Invalid email format
    name: "Test",
  },
  duplicate: {
    email: "duplicate@example.com",
    name: "Duplicate User",
  },
}

export const postFixtures = {
  valid: {
    title: "Test Post Title",
    content: "This is a test post content with enough characters.",
    slug: "test-post",
  },
  valid2: {
    title: "Another Test Post",
    content: "This is another test post with sufficient content length.",
    slug: "another-test-post",
  },
  invalid: {
    title: "", // Empty title
    content: "short", // Too short
    slug: "invalid slug", // Invalid slug format
  },
  published: {
    title: "Published Post",
    content: "This is a published post with enough content.",
    slug: "published-post",
    published: new Date(),
  },
}

/**
 * Generate unique test data
 */
export function generateTestUser(prefix = "test") {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return {
    email: `${prefix}-${timestamp}-${random}@example.com`,
    name: `${prefix} User ${timestamp}`,
  }
}

export function generateTestPost(prefix = "test") {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return {
    title: `${prefix} Post ${timestamp}`,
    content: `This is a ${prefix} post content. ${random}`,
    slug: `${prefix}-post-${timestamp}-${random}`,
  }
}
