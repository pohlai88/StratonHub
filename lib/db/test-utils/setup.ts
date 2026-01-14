/**
 * Test Setup
 * 
 * Global test configuration and utilities.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from "vitest"

/**
 * Test database connection
 * Uses a test database or branch for isolation
 */
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL

if (!TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL or DATABASE_URL must be set for tests")
}

/**
 * Global test setup
 */
beforeAll(async () => {
  // Setup test database connection
  // You can create a test branch here using Neon MCP if needed
})

afterAll(async () => {
  // Cleanup test database
})

beforeEach(async () => {
  // Setup before each test
})

afterEach(async () => {
  // Cleanup after each test
})
