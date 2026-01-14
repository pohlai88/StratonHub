import "server-only"

/**
 * Query logging configuration
 */
export interface QueryLogOptions {
  enabled?: boolean
  logSlowQueries?: boolean
  slowQueryThresholdMs?: number
  logErrors?: boolean
}

const DEFAULT_OPTIONS: Required<QueryLogOptions> = {
  enabled: process.env.NODE_ENV === "development",
  logSlowQueries: true,
  slowQueryThresholdMs: 100,
  logErrors: true,
}

let logOptions: Required<QueryLogOptions> = { ...DEFAULT_OPTIONS }

/**
 * Configure query logging
 */
export function configureQueryLogging(options: QueryLogOptions): void {
  logOptions = { ...logOptions, ...options }
}

/**
 * Log a query execution
 */
export function logQuery(
  query: string,
  duration: number,
  error?: unknown
): void {
  if (!logOptions.enabled) return

  const timestamp = new Date().toISOString()
  const durationStr = `${duration}ms`

  if (error) {
    if (logOptions.logErrors) {
      console.error(`[DB ERROR] ${timestamp} ${durationStr}`, {
        query: query.substring(0, 200), // Truncate long queries
        error: error instanceof Error ? error.message : String(error),
      })
    }
    return
  }

  // Log slow queries
  if (logOptions.logSlowQueries && duration > logOptions.slowQueryThresholdMs) {
    console.warn(`[DB SLOW] ${timestamp} ${durationStr}`, {
      query: query.substring(0, 200),
      threshold: `${logOptions.slowQueryThresholdMs}ms`,
    })
    return
  }

  // Log all queries in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[DB QUERY] ${timestamp} ${durationStr}`, {
      query: query.substring(0, 200),
    })
  }
}

/**
 * Create a query logger wrapper
 */
export function withQueryLogging<T>(
  fn: () => Promise<T>,
  queryDescription: string
): Promise<T> {
  const startTime = Date.now()

  return fn()
    .then((result) => {
      const duration = Date.now() - startTime
      logQuery(queryDescription, duration)
      return result
    })
    .catch((error) => {
      const duration = Date.now() - startTime
      logQuery(queryDescription, duration, error)
      throw error
    })
}

/**
 * Log transaction execution
 */
export function logTransaction(
  operation: string,
  duration: number,
  success: boolean,
  error?: unknown
): void {
  if (!logOptions.enabled) return

  const timestamp = new Date().toISOString()
  const status = success ? "SUCCESS" : "FAILED"
  const durationStr = `${duration}ms`

  if (success) {
    console.log(`[DB TX ${status}] ${timestamp} ${durationStr}`, { operation })
  } else {
    if (logOptions.logErrors) {
      console.error(`[DB TX ${status}] ${timestamp} ${durationStr}`, {
        operation,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
}
