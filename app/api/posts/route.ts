import { NextRequest, NextResponse } from "next/server"
import { postsRepository } from "@/db/repositories"
import { ConflictError, ValidationError } from "@/db/errors"
import { PostCreateRequest } from "@/schema/posts"

/**
 * GET /api/posts
 * List published posts with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      )
    }

    const offset = (page - 1) * pageSize
    const results = await postsRepository.findPublished(pageSize, offset)

    // Transform to API response format
    const posts = results.map((r) => ({
      ...r.post,
      author: r.author,
    }))

    return NextResponse.json({
      posts,
      pagination: {
        page,
        pageSize,
        // Note: Count would require separate query for total
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using curated schema
    const validated = PostCreateRequest.parse(body)

    const post = await postsRepository.create(validated)

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 409 }
      )
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      )
    }

    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}
