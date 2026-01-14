'use client';

import {
  RedirectToSignIn,
  SignedIn,
} from '@neondatabase/neon-js/auth/react/ui';

export function AuthProtected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <RedirectToSignIn />
    </>
  );
}
