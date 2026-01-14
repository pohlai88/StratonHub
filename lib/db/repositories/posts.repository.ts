import "server-only"
import { db } from "../index"
import { posts, users } from "../schema"
import { eq, and, isNull, isNotNull, desc } from "drizzle-orm"
import { PostCreateRequest, PostUpdateRequest } from "@/schema/posts"
import {
    NotFoundError,
    ConflictError,
    QueryError,
    DatabaseError,
} from "../errors"
import { retryTransaction } from "../utils/retry"
import { withQueryLogging } from "../utils/logging"

/**
 * Posts Repository
 * 
 * Implements repository pattern for post operations with relations support.
 */

export class PostsRepository {
    /**
     * Create a new post
     */
    async create(data: unknown): Promise<typeof posts.$inferSelect> {
        try {
            const validated = PostCreateRequest.parse(data)

            return await retryTransaction(async () => {
                return await withQueryLogging(async () => {
                    const [newPost] = await db
                        .insert(posts)
                        .values(validated)
                        .returning()

                    if (!newPost) {
                        throw new QueryError("Failed to create post")
                    }

                    return newPost
                }, "INSERT posts")
            })
        } catch (error) {
            if (error instanceof Error && error.message.includes("unique")) {
                throw new ConflictError("Post with this slug already exists", "slug")
            }

            if (error instanceof DatabaseError) {
                throw error
            }

            throw new QueryError("Failed to create post", undefined, error)
        }
    }

    /**
     * Find post by ID
     */
    async findById(id: string): Promise<typeof posts.$inferSelect | null> {
        try {
            return await withQueryLogging(async () => {
                const [post] = await db
                    .select()
                    .from(posts)
                    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
                    .limit(1)

                return post || null
            }, `SELECT posts WHERE id = ${id}`)
        } catch (error) {
            throw new QueryError("Failed to find post by ID", undefined, error)
        }
    }

    /**
     * Find post by ID with author (using relation)
     */
    async findByIdWithAuthor(id: string) {
        try {
            return await withQueryLogging(async () => {
                const [post] = await db
                    .select({
                        post: posts,
                        author: {
                            id: users.id,
                            name: users.name,
                            email: users.email,
                        },
                    })
                    .from(posts)
                    .innerJoin(users, eq(posts.userId, users.id))
                    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
                    .limit(1)

                return post || null
            }, `SELECT posts WITH author WHERE id = ${id}`)
        } catch (error) {
            throw new QueryError("Failed to find post with author", undefined, error)
        }
    }

    /**
     * Find post by slug
     */
    async findBySlug(slug: string): Promise<typeof posts.$inferSelect | null> {
        try {
            return await withQueryLogging(async () => {
                const [post] = await db
                    .select()
                    .from(posts)
                    .where(and(eq(posts.slug, slug), isNull(posts.deletedAt)))
                    .limit(1)

                return post || null
            }, `SELECT posts WHERE slug = ${slug}`)
        } catch (error) {
            throw new QueryError("Failed to find post by slug", undefined, error)
        }
    }

    /**
     * Find posts by user ID (with pagination)
     */
    async findByUserId(
        userId: string,
        limit?: number,
        offset?: number
    ): Promise<typeof posts.$inferSelect[]> {
        try {
            return await withQueryLogging(async () => {
                let query = db
                    .select()
                    .from(posts)
                    .where(and(eq(posts.userId, userId), isNull(posts.deletedAt)))
                    .orderBy(desc(posts.createdAt))

                if (limit) {
                    query = query.limit(limit) as typeof query
                }

                if (offset) {
                    query = query.offset(offset) as typeof query
                }

                return await query
            }, `SELECT posts WHERE userId = ${userId}`)
        } catch (error) {
            throw new QueryError("Failed to find posts by user", undefined, error)
        }
    }

    /**
     * Find all published posts (with author)
     */
    async findPublished(limit?: number, offset?: number) {
        try {
            return await withQueryLogging(async () => {
                let query = db
                    .select({
                        post: posts,
                        author: {
                            id: users.id,
                            name: users.name,
                            email: users.email,
                        },
                    })
                    .from(posts)
                    .innerJoin(users, eq(posts.userId, users.id))
                    .where(
                        and(
                            isNull(posts.deletedAt),
                            isNull(users.deletedAt),
                            isNotNull(posts.published) // Published posts only
                        )
                    )
                    .orderBy(desc(posts.published))

                if (limit) {
                    query = query.limit(limit) as typeof query
                }

                if (offset) {
                    query = query.offset(offset) as typeof query
                }

                return await query
            }, "SELECT published posts WITH authors")
        } catch (error) {
            throw new QueryError("Failed to find published posts", undefined, error)
        }
    }

    /**
     * Update post
     */
    async update(
        id: string,
        data: unknown
    ): Promise<typeof posts.$inferSelect> {
        try {
            const validated = PostUpdateRequest.parse(data)

            return await retryTransaction(async () => {
                return await withQueryLogging(async () => {
                    const [updatedPost] = await db
                        .update(posts)
                        .set({ ...validated, updatedAt: new Date() })
                        .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
                        .returning()

                    if (!updatedPost) {
                        throw new NotFoundError("Post", id)
                    }

                    return updatedPost
                }, `UPDATE posts WHERE id = ${id}`)
            })
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }

            throw new QueryError("Failed to update post", undefined, error)
        }
    }

    /**
     * Soft delete post
     */
    async delete(id: string): Promise<typeof posts.$inferSelect> {
        try {
            return await retryTransaction(async () => {
                return await withQueryLogging(async () => {
                    const [deletedPost] = await db
                        .update(posts)
                        .set({ deletedAt: new Date() })
                        .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
                        .returning()

                    if (!deletedPost) {
                        throw new NotFoundError("Post", id)
                    }

                    return deletedPost
                }, `DELETE posts WHERE id = ${id}`)
            })
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }

            throw new QueryError("Failed to delete post", undefined, error)
        }
    }

    /**
     * Publish post
     */
    async publish(id: string): Promise<typeof posts.$inferSelect> {
        try {
            return await retryTransaction(async () => {
                return await withQueryLogging(async () => {
                    const [publishedPost] = await db
                        .update(posts)
                        .set({ published: new Date(), updatedAt: new Date() })
                        .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
                        .returning()

                    if (!publishedPost) {
                        throw new NotFoundError("Post", id)
                    }

                    return publishedPost
                }, `PUBLISH post WHERE id = ${id}`)
            })
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }

            throw new QueryError("Failed to publish post", undefined, error)
        }
    }
}

// Export singleton instance
export const postsRepository = new PostsRepository()
