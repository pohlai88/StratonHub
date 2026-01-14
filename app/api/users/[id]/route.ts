import { NextRequest, NextResponse } from "next/server"
import { usersRepository } from "@/db/repositories"
import { NotFoundError, ValidationError } from "@/db/errors"
import { UserUpdateRequest } from "@/schema/users"

/**
 * GET /api/users/[id]
 * Get user by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const user = await usersRepository.findByIdOrThrow(id)

        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        console.error("Error fetching user:", error)
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/users/[id]
 * Update user
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Validate input
        const validated = UserUpdateRequest.parse(body)

        const user = await usersRepository.update(id, validated)

        return NextResponse.json(user)
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

        console.error("Error updating user:", error)
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/users/[id]
 * Soft delete user
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const user = await usersRepository.delete(id)

        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof NotFoundError) {
            return NextResponse.json({ error: error.message }, { status: 404 })
        }

        console.error("Error deleting user:", error)
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        )
    }
}
