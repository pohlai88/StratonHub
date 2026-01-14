import { NextRequest, NextResponse } from "next/server"
import { usersRepository } from "@/db/repositories"
import { NotFoundError, ConflictError, ValidationError } from "@/db/errors"
import { UserCreateRequest } from "@/schema/users"

/**
 * GET /api/users
 * List all users with pagination
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
        const users = await usersRepository.findAll(pageSize, offset)
        const total = await usersRepository.count()

        return NextResponse.json({
            users,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        })
    } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input using curated schema
        const validated = UserCreateRequest.parse(body)

        const user = await usersRepository.create(validated)

        return NextResponse.json(user, { status: 201 })
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

        console.error("Error creating user:", error)
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        )
    }
}
