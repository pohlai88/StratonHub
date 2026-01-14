import { relations } from "drizzle-orm"
import { users } from "./users"
import { posts } from "./posts"

/**
 * Drizzle Relations
 * 
 * Defines relationships between tables for type-safe queries.
 * This enables eager loading and relation-based queries.
 */

// User relations
export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts), // One user has many posts
}))

// Post relations
export const postsRelations = relations(posts, ({ one }) => ({
    author: one(users, {
        fields: [posts.userId],
        references: [users.id],
    }), // One post belongs to one user
}))
