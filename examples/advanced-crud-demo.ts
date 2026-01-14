/**
 * Advanced CRUD Demo (Production Pattern)
 * 
 * This file demonstrates the advanced Drizzle + Neon setup with:
 * - Repository pattern
 * - Error handling
 * - Validation
 * - Retry logic
 * - Query logging
 * 
 * This is the recommended approach for production applications.
 * 
 * Run with: npx tsx examples/advanced-crud-demo.ts
 */

import "dotenv/config"
import { usersRepository } from "../lib/db/repositories"
import { NotFoundError, ConflictError } from "../lib/db/errors"

async function main() {
  try {
    console.log("🟢 Advanced CRUD Demo - Production Pattern\n")

    // CREATE: Insert a new user (with validation and error handling)
    console.log("1️⃣ CREATE: Creating user with repository...")
    const user = await usersRepository.create({
      email: `advanced-${Date.now()}@example.com`,
      name: "Advanced Demo User",
    })

    console.log("✅ CREATE: User created:", {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })

    // Demonstrate validation error handling
    try {
      console.log("\n2️⃣ VALIDATION: Testing duplicate email...")
      await usersRepository.create({
        email: user.email, // Same email - should fail
        name: "Duplicate User",
      })
    } catch (error) {
      if (error instanceof ConflictError) {
        console.log("✅ VALIDATION: Duplicate email correctly rejected")
        console.log("   Error:", error.message)
      } else {
        throw error
      }
    }

    // READ: Get user by ID (with error handling)
    console.log("\n3️⃣ READ: Fetching user by ID...")
    const foundUser = await usersRepository.findByIdOrThrow(user.id)

    console.log("✅ READ: User found:", {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
    })

    // Demonstrate not found error
    try {
      console.log("\n4️⃣ ERROR HANDLING: Testing not found...")
      await usersRepository.findByIdOrThrow("00000000-0000-0000-0000-000000000000")
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.log("✅ ERROR HANDLING: NotFoundError correctly thrown")
        console.log("   Error:", error.message)
      } else {
        throw error
      }
    }

    // UPDATE: Update user (with validation)
    console.log("\n5️⃣ UPDATE: Updating user...")
    const updatedUser = await usersRepository.update(user.id, {
      name: "Updated Advanced User",
    })

    console.log("✅ UPDATE: User updated:", {
      id: updatedUser.id,
      name: updatedUser.name,
      updatedAt: updatedUser.updatedAt,
    })

    // DELETE: Soft delete user
    console.log("\n6️⃣ DELETE: Soft deleting user...")
    const deletedUser = await usersRepository.delete(user.id)

    console.log("✅ DELETE: User soft deleted:", {
      id: deletedUser.id,
      deletedAt: deletedUser.deletedAt,
    })

    // Verify soft delete (repository filters soft-deleted records)
    console.log("\n7️⃣ VERIFY: Checking if user is accessible...")
    const stillExists = await usersRepository.findById(user.id)

    if (!stillExists) {
      console.log("✅ VERIFY: User correctly filtered (soft-deleted)")
      console.log("   Repository automatically filters soft-deleted records")
    } else {
      console.log("⚠️  User still accessible (unexpected)")
    }

    // Additional operations
    console.log("\n8️⃣ ADVANCED: Testing additional operations...")

    // Count users (excluding soft-deleted)
    const count = await usersRepository.count()
    console.log("✅ COUNT: Total active users:", count)

    // Find by email
    const byEmail = await usersRepository.findByEmail(deletedUser.email)
    if (!byEmail) {
      console.log("✅ FIND BY EMAIL: Correctly filtered soft-deleted user")
    }

    console.log("\n✨ Advanced CRUD operations completed successfully!")
    console.log("\n📚 Benefits of advanced pattern:")
    console.log("   ✅ Automatic validation")
    console.log("   ✅ Proper error handling")
    console.log("   ✅ Soft delete filtering")
    console.log("   ✅ Query logging (in development)")
    console.log("   ✅ Automatic retry (transient errors)")
    console.log("   ✅ Type-safe throughout")
    console.log("   ✅ Testable (mockable repositories)")

  } catch (error) {
    console.error("\n❌ Error performing CRUD operations:", error)
    if (error instanceof Error) {
      console.error("   Message:", error.message)
      if (error.stack) {
        console.error("   Stack:", error.stack.split("\n")[1])
      }
    }
    process.exit(1)
  }
}

// Run the demo
main()
