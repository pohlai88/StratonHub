/**
 * Neon Auth Error Handler
 * 
 * Handles common Neon Auth errors and provides recovery mechanisms
 */

export interface AuthErrorInfo {
  type: 'decryption' | 'api' | 'network' | 'unknown';
  message: string;
  recoverable: boolean;
  action?: string;
}

/**
 * Analyze an error and determine its type and recovery options
 */
export function analyzeAuthError(error: Error | string): AuthErrorInfo {
  const message = typeof error === 'string' ? error : error.message;
  const lowerMessage = message.toLowerCase();

  // Decryption errors
  if (
    lowerMessage.includes('decrypt') ||
    lowerMessage.includes('hex characters') ||
    lowerMessage.includes('hex length') ||
    lowerMessage.includes('even length') ||
    lowerMessage.includes('failed to decrypt')
  ) {
    return {
      type: 'decryption',
      message: 'Session data is corrupted. Clearing cookies should fix this.',
      recoverable: true,
      action: 'clearCookies',
    };
  }

  // API 500 errors
  if (
    lowerMessage.includes('500') ||
    lowerMessage.includes('internal server error') ||
    lowerMessage.includes('neonauth')
  ) {
    return {
      type: 'api',
      message: 'Neon Auth service is experiencing issues. This may require Neon Auth to be provisioned.',
      recoverable: false,
      action: 'checkProvisioning',
    };
  }

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection')
  ) {
    return {
      type: 'network',
      message: 'Unable to connect to Neon Auth service. Check your internet connection.',
      recoverable: true,
      action: 'retry',
    };
  }

  return {
    type: 'unknown',
    message: 'An unexpected authentication error occurred.',
    recoverable: false,
  };
}

/**
 * Check if Neon Auth needs to be provisioned
 * 
 * To provision Neon Auth:
 * 1. Use Neon MCP: mcp_Neon_provision_neon_auth()
 * 2. Or use Neon Console: Database → Auth → Provision
 * 3. Ensure NEXT_PUBLIC_NEON_AUTH_URL points to the correct endpoint
 */
export function getProvisioningInstructions(): string {
  return `
To provision Neon Auth:

1. **Using Neon MCP (Recommended):**
   - Call: mcp_Neon_provision_neon_auth()
   - Provide your project ID and database name
   - The tool will set up Neon Auth and return the auth URL

2. **Using Neon Console:**
   - Go to your Neon project dashboard
   - Navigate to Database → Auth
   - Click "Provision Neon Auth"
   - Copy the Auth URL to NEXT_PUBLIC_NEON_AUTH_URL

3. **Verify Environment Variable:**
   - Ensure NEXT_PUBLIC_NEON_AUTH_URL is set correctly
   - Format: https://[project-id].neonauth.[region].aws.neon.tech/[database]/auth
   - Example: https://ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
  `;
}
