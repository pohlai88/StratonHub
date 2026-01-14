/**
 * Basic CRUD Demo (Legacy/Reference)
 * 
 * This file demonstrates the basic Drizzle + Neon setup as per standard guides.
 * This is kept for reference and comparison with our advanced implementation.
 * 
 * For production use, see:
 * - lib/db/repositories/ - Repository pattern
 * - lib/db/example.ts - Advanced examples
 * - lib/db/example-repository.ts - Repository examples
 * 
 * This example shows:
 * - Simple direct queries
 * - Basic error handling
 * - CRUD operations
 * 
 * Run with: npx tsx examples/basic-crud-demo.ts
 */

import "dotenv/config"
import { eq } from "drizzle-orm"
import { db } from "../lib/db"
import { users } from "../lib/db/schema"

async function main() {
  try {
    console.log("🔵 Basic CRUD Demo - Legacy Pattern\n")

    // CREATE: Insert a new user
    console.log("1️⃣ CREATE: Inserting new user...")
    const [newUser] = await db
      .insert(users)
      .values({
        email: `demo-${Date.now()}@example.com`,
        name: "Demo User",
      })
      .returning()

    if (!newUser) {
      throw new Error("Failed to create user")
    }

    console.log("✅ CREATE: New user created:", {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    })

    // READ: Select the user
    console.log("\n2️⃣ READ: Fetching user...")
    const [foundUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, newUser.id))
      .limit(1)

    if (!foundUser) {
      throw new Error("User not found")
    }

    console.log("✅ READ: Found user:", {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      createdAt: foundUser.createdAt,
    })

    // UPDATE: Change the user's name
    console.log("\n3️⃣ UPDATE: Updating user...")
    const [updatedUser] = await db
      .update(users)
      .set({ name: "Updated Demo User", updatedAt: new Date() })
      .where(eq(users.id, newUser.id))
      .returning()

    if (!updatedUser) {
      throw new Error("Failed to update user")
    }

    console.log("✅ UPDATE: User updated:", {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      updatedAt: updatedUser.updatedAt,
    })

    // DELETE: Soft delete the user (using our schema's deletedAt)
    console.log("\n4️⃣ DELETE: Soft deleting user...")
    const [deletedUser] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, newUser.id))
      .returning()

    if (!deletedUser) {
      throw new Error("Failed to delete user")
    }

    console.log("✅ DELETE: User soft deleted:", {
      id: deletedUser.id,
      deletedAt: deletedUser.deletedAt,
    })

    // Verify soft delete (should not find the user)
    console.log("\n5️⃣ VERIFY: Checking if user is still accessible...")
    const [stillExists] = await db
      .select()
      .from(users)
      .where(eq(users.id, newUser.id))
      .limit(1)

    // Note: This will still find the user because we're doing a direct query
    // In advanced implementation, repositories filter soft-deleted records
    if (stillExists && stillExists.deletedAt) {
      console.log("⚠️  User exists but is soft-deleted (as expected)")
      console.log("   In advanced implementation, repositories filter these automatically")
    }

    console.log("\n✨ Basic CRUD operations completed successfully!")
    console.log("\n📚 Note: This is the basic pattern.")
    console.log("   For production use, see lib/db/repositories/ for advanced patterns.")

  } catch (error) {
    console.error("\n❌ Error performing CRUD operations:", error)
    if (error instanceof Error) {
      console.error("   Message:", error.message)
    }
    process.exit(1)
  }
}

// Run the demo
main()
