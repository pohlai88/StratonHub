import { NextRequest, NextResponse } from "next/server"
import { postsRepository } from "@/db/repositories"
import { NotFoundError } from "@/db/errors"
import { usersRepository } from "@/db/repositories"

/**
 * GET /api/users/[id]/posts
 * Get all posts by a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify user exists
    const user = await usersRepository.findById(id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

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
    const posts = await postsRepository.findByUserId(id, pageSize, offset)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        pageSize,
      },
    })
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 }
    )
  }
}
