import { NextRequest, NextResponse } from "next/server"
import { postsRepository } from "@/db/repositories"
import { NotFoundError } from "@/db/errors"

/**
 * POST /api/posts/[id]/publish
 * Publish a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const post = await postsRepository.publish(id)

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    console.error("Error publishing post:", error)
    return NextResponse.json(
      { error: "Failed to publish post" },
      { status: 500 }
    )
  }
}
