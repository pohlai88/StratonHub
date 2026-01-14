"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { clearAuthCookies } from "@/src/lib/auth"
import { analyzeAuthError, getProvisioningInstructions } from "@/lib/auth-error-handler"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const errorInfo = analyzeAuthError(error)
  const isAuthError = ['decryption', 'api', 'network'].includes(errorInfo.type)
  const isApiError = errorInfo.type === 'api'

  const handleClearAuth = () => {
    clearAuthCookies()
  }

  return (
    <section className="flex min-h-[99vh] flex-col items-start gap-3 px-2 py-8">
      <div>
        <h2 className="text-5xl font-bold">Oops!</h2>
        <p className="text-muted-foreground">Something went wrong!</p>
        {isAuthError && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {errorInfo.message}
            </p>
            {isApiError && (
              <details className="mt-4 text-xs text-muted-foreground">
                <summary className="cursor-pointer font-semibold">
                  How to fix: Provision Neon Auth
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded bg-muted p-3">
                  {getProvisioningInstructions()}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        {errorInfo.recoverable && (
          <Button onClick={handleClearAuth} variant="outline">
            {errorInfo.action === 'clearCookies' ? 'Clear Session & Reload' : 'Retry'}
          </Button>
        )}
      </div>
    </section>
  )
}
