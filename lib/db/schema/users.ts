import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core"

/**
 * Users table - Drizzle schema (Layer 1: DB Truth)
 * This is the source of truth for the users table structure.
 * All contracts and validations derive from this schema.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Soft delete support
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
)

// Type inference helpers
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
