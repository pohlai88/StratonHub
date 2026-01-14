import "server-only"
import { db } from "../index"
import { ConnectionError } from "../errors"

/**
 * Health check for database connection
 */
export async function checkConnectionHealth(): Promise<{
  healthy: boolean
  latency?: number
  error?: string
}> {
  const startTime = Date.now()

  try {
    // Simple query to check connection
    await db.execute({ sql: "SELECT 1", args: [] })
    const latency = Date.now() - startTime

    return {
      healthy: true,
      latency,
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Verify database connection is available
 * Throws ConnectionError if connection fails
 */
export async function verifyConnection(): Promise<void> {
  const health = await checkConnectionHealth()

  if (!health.healthy) {
    throw new ConnectionError(
      `Database connection check failed: ${health.error || "Unknown error"}`
    )
  }
}

/**
 * Get connection pool stats (if available)
 */
export function getConnectionStats(): {
  total?: number
  idle?: number
  waiting?: number
} {
  // Note: Pool stats depend on the pool implementation
  // This is a placeholder - implement based on your pool type
  return {
    // Add pool stats if available
  }
}
