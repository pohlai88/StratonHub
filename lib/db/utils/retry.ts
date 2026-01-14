import "server-only"
import { isTransientError } from "../errors"

/**
 * Retry configuration
 */
export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: unknown) => void
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onRetry">> = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 1000,
  backoffMultiplier: 2,
}

/**
 * Calculate delay for retry attempt with exponential backoff
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, "onRetry">>): number {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1)
  return Math.min(delay, options.maxDelayMs)
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 * 
 * Only retries on transient errors (connection errors, deadlocks, etc.)
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if it's not a transient error
      if (!isTransientError(error)) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        break
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, config)
      if (options.onRetry) {
        options.onRetry(attempt, error)
      }
      await sleep(delay)
    }
  }

  throw lastError
}

/**
 * Retry a transaction with exponential backoff
 */
export async function retryTransaction<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    onRetry: (attempt, error) => {
      console.warn(`Transaction retry attempt ${attempt}:`, error)
      options.onRetry?.(attempt, error)
    },
  })
}
