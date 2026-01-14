'use client';

import { createAuthClient } from '@neondatabase/neon-js/auth';

if (!process.env.NEXT_PUBLIC_NEON_AUTH_URL) {
  throw new Error('NEXT_PUBLIC_NEON_AUTH_URL environment variable is not set');
}

// Remove trailing slash if present
const authUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL.replace(/\/$/, '');

// Create auth client with error handling
let authClient: ReturnType<typeof createAuthClient>;

try {
  authClient = createAuthClient(authUrl);
} catch (error) {
  // If initialization fails, clear any corrupted cookies and retry
  if (typeof window !== 'undefined') {
    // Clear all auth-related cookies
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      // Clear cookies that might be auth-related
      if (name.includes('auth') || name.includes('session') || name.includes('token')) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });
    
    // Retry creating the client
    authClient = createAuthClient(authUrl);
  } else {
    throw error;
  }
}

export { authClient };

/**
 * Utility function to clear corrupted auth cookies
 * Call this if you encounter decryption errors
 */
export function clearAuthCookies() {
  if (typeof window === 'undefined') return;
  
  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    // Clear cookies that might be auth-related
    if (name.includes('auth') || name.includes('session') || name.includes('token') || name.includes('neon')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    }
  });
  
  // Reload the page to reinitialize auth
  window.location.reload();
}
