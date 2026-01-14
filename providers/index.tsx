'use client';

import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react';
import { ThemeProvider } from '@/providers/theme';
import { ViewTransitions } from '@/lib/transition';
import { authClient, clearAuthCookies } from '@/src/lib/auth';
import { useEffect, useState } from 'react';

export const Providers: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Global error handler for decryption errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      const message = error?.message || '';
      
      // Handle decryption errors
      if (
        message.includes('decrypt') ||
        message.includes('hex characters') ||
        message.includes('hex length') ||
        message.includes('even length') ||
        message.includes('Failed to decrypt')
      ) {
        console.warn('Detected decryption error, clearing auth cookies...');
        clearAuthCookies();
        return;
      }

      // Handle network/API errors from Neon Auth
      if (message.includes('neonauth') || message.includes('auth')) {
        if (message.includes('500') || message.includes('Failed to load')) {
          setAuthError('Neon Auth service is experiencing issues. Please verify Neon Auth is provisioned.');
          console.error('Neon Auth error detected:', error);
        }
      }
    };

    // Handle unhandled promise rejections (async errors)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || String(reason) || '';
      
      // Handle decryption errors in promises
      if (
        message.includes('decrypt') ||
        message.includes('hex characters') ||
        message.includes('hex length') ||
        message.includes('even length') ||
        message.includes('Failed to decrypt')
      ) {
        console.warn('Detected decryption error in promise, clearing auth cookies...');
        clearAuthCookies();
        return;
      }
    };

    // Monitor console errors and warnings for decryption errors
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Handle decryption errors logged to console.error
      if (
        message.includes('decrypt') ||
        message.includes('hex characters') ||
        message.includes('hex length') ||
        message.includes('even length') ||
        message.includes('Failed to decrypt')
      ) {
        console.warn('Detected decryption error in console.error, clearing auth cookies...');
        clearAuthCookies();
      }
      
      if (
        message.includes('neonauth') &&
        (message.includes('500') || message.includes('Failed to load resource'))
      ) {
        setAuthError('Neon Auth API is returning 500 errors. Please check Neon Auth provisioning.');
      }
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Handle decryption errors logged to console.warn
      if (
        message.includes('decrypt') ||
        message.includes('hex characters') ||
        message.includes('hex length') ||
        message.includes('even length') ||
        message.includes('Failed to decrypt')
      ) {
        console.warn('Detected decryption error in console.warn, clearing auth cookies...');
        clearAuthCookies();
      }
      
      originalConsoleWarn.apply(console, args);
    };
    
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      
      // Handle decryption errors logged to console.log
      if (
        message.includes('decrypt') ||
        message.includes('hex characters') ||
        message.includes('hex length') ||
        message.includes('even length') ||
        message.includes('Failed to decrypt')
      ) {
        console.warn('Detected decryption error in console.log, clearing auth cookies...');
        clearAuthCookies();
      }
      
      originalConsoleLog.apply(console, args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {authError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-4 text-center text-sm shadow-lg">
          <p className="font-semibold">⚠️ Authentication Service Issue</p>
          <p className="mt-1">{authError}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={() => {
                setAuthError(null);
                clearAuthCookies();
              }}
              className="rounded bg-black px-3 py-1 text-white hover:bg-gray-800"
            >
              Clear Session & Reload
            </button>
            <button
              onClick={() => setAuthError(null)}
              className="rounded border border-black px-3 py-1 hover:bg-yellow-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <NeonAuthUIProvider emailOTP authClient={authClient}>
        <ViewTransitions>{children}</ViewTransitions>
      </NeonAuthUIProvider>
    </ThemeProvider>
  );
};
