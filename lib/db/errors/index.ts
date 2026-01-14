import "server-only"

/**
 * Database Error Types
 * 
 * Custom error classes for database operations with proper error handling.
 */

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, "CONNECTION_ERROR", cause)
    this.name = "ConnectionError"
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string, public readonly query?: string, cause?: unknown) {
    super(message, "QUERY_ERROR", cause)
    this.name = "QueryError"
  }
}

export class TransactionError extends DatabaseError {
  constructor(message: string, cause?: unknown) {
    super(message, "TRANSACTION_ERROR", cause)
    this.name = "TransactionError"
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, public readonly field?: string, cause?: unknown) {
    super(message, "VALIDATION_ERROR", cause)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class ConflictError extends DatabaseError {
  constructor(message: string, public readonly field?: string) {
    super(message, "CONFLICT_ERROR")
    this.name = "ConflictError"
  }
}

/**
 * Check if error is a database error
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError
}

/**
 * Check if error is a transient error (can be retried)
 */
export function isTransientError(error: unknown): boolean {
  if (!isDatabaseError(error)) return false

  // Connection errors are typically transient
  if (error instanceof ConnectionError) return true

  // PostgreSQL error codes that indicate transient errors
  if (error.code) {
    const transientCodes = [
      "08000", // connection_exception
      "08003", // connection_does_not_exist
      "08006", // connection_failure
      "08001", // sqlclient_unable_to_establish_sqlconnection
      "08004", // sqlserver_rejected_establishment_of_sqlconnection
      "40001", // serialization_failure
      "40P01", // deadlock_detected
    ]
    return transientCodes.includes(error.code)
  }

  return false
}
