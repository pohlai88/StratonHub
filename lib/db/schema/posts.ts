import { pgTable, uuid, varchar, text, timestamp, index } from "drizzle-orm/pg-core"
import { users } from "./users"

/**
 * Posts table - Drizzle schema (Layer 1: DB Truth)
 * Demonstrates relations and foreign keys.
 */
export const posts = pgTable(
    "posts",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: uuid("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 255 }).notNull(),
        content: text("content").notNull(),
        slug: varchar("slug", { length: 255 }).notNull().unique(),
        published: timestamp("published_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
        deletedAt: timestamp("deleted_at"), // Soft delete support
    },
    (table) => ({
        userIdIdx: index("user_id_idx").on(table.userId),
        slugIdx: index("slug_idx").on(table.slug),
        createdAtIdx: index("posts_created_at_idx").on(table.createdAt),
        publishedIdx: index("published_at_idx").on(table.published),
    })
)

// Type inference helpers
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
