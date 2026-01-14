/**
 * Neon Utility Scripts
 * 
 * Helper functions for working with Neon via MCP or CLI
 */

import { readFileSync } from "fs"
import { join } from "path"

/**
 * Get project ID from environment or config
 */
export function getProjectId(): string | null {
  return process.env.NEON_PROJECT_ID || null
}

/**
 * Get database name from environment or config
 */
export function getDatabaseName(): string {
  return process.env.NEON_DATABASE_NAME || "neondb"
}

/**
 * Read migration SQL from file
 */
export function readMigrationFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8")
  } catch (error) {
    throw new Error(`Failed to read migration file: ${filePath}`)
  }
}

/**
 * Get latest migration file path
 */
export function getLatestMigrationPath(): string | null {
  const drizzleDir = join(process.cwd(), "drizzle")
  
  try {
    const { readdirSync, statSync } = require("fs")
    const files = readdirSync(drizzleDir)
      .filter((f: string) => f.endsWith(".sql"))
      .map((f: string) => ({
        name: f,
        path: join(drizzleDir, f),
        mtime: statSync(join(drizzleDir, f)).mtime,
      }))
      .sort((a: any, b: any) => b.mtime.getTime() - a.mtime.getTime())

    return files.length > 0 ? files[0].path : null
  } catch (error) {
    return null
  }
}

/**
 * Format migration SQL for display
 */
export function formatMigrationSQL(sql: string): string {
  const lines = sql.split("\n")
  const formatted = lines
    .map((line, i) => {
      const trimmed = line.trim()
      if (!trimmed) return ""
      if (trimmed.startsWith("--")) return `  ${line}`
      return `  ${line}`
    })
    .filter((line) => line)
    .join("\n")
  
  return formatted
}

/**
 * Validate migration SQL
 */
export function validateMigrationSQL(sql: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!sql || sql.trim().length === 0) {
    errors.push("Migration SQL is empty")
  }
  
  // Check for dangerous operations (optional - can be extended)
  const dangerousPatterns = [
    /DROP\s+DATABASE/i,
    /DROP\s+SCHEMA/i,
    /TRUNCATE/i,
  ]
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      errors.push(`Potentially dangerous operation detected: ${pattern}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
