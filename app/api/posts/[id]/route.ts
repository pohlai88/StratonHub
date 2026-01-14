import { NextRequest, NextResponse } from "next/server"
import { postsRepository } from "@/db/repositories"
import { NotFoundError, ValidationError } from "@/db/errors"
import { PostUpdateRequest } from "@/schema/posts"

/**
 * GET /api/posts/[id]
 * Get post by ID with author
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await postsRepository.findByIdWithAuthor(id)

    if (!result) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...result.post,
      author: result.author,
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/posts/[id]
 * Update post
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validated = PostUpdateRequest.parse(body)

    const post = await postsRepository.update(id, validated)

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      )
    }

    console.error("Error updating post:", error)
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/posts/[id]
 * Soft delete post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await postsRepository.delete(id)

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
