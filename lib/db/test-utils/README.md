# Testing Utilities

This directory contains utilities and helpers for testing database operations.

## Files

- **`setup.ts`** - Global test configuration and setup hooks
- **`helpers.ts`** - Test helper functions (create, clean, assert)
- **`fixtures.ts`** - Reusable test data fixtures

## Usage

### Test Helpers

```typescript
import { createTestUser, createTestPost, cleanTestDatabase } from "@/db/test-utils/helpers"

// Create test data
const user = await createTestUser()
const post = await createTestPost(user.id)

// Clean up
await cleanTestDatabase()
```

### Test Fixtures

```typescript
import { userFixtures, postFixtures, generateTestUser } from "@/db/test-utils/fixtures"

// Use predefined fixtures
const user = await createTestUser(userFixtures.valid)

// Generate unique test data
const uniqueUser = generateTestUser("prefix")
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test users.repository.test.ts
```

## Test Database

Tests use the `TEST_DATABASE_URL` environment variable if set, otherwise fall back to `DATABASE_URL`.

For isolated testing, consider:
1. Using a Neon test branch
2. Using a separate test database
3. Cleaning data between tests (already implemented)

## Best Practices

1. **Always clean up** - Tests clean the database before and after
2. **Use fixtures** - Consistent test data
3. **Test isolation** - Each test should be independent
4. **Use helpers** - Don't duplicate test setup code
