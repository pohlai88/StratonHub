'use client';

import { useEffect, useState } from 'react';
import {
  RedirectToSignIn,
  SignedIn,
  UserButton,
} from '@neondatabase/neon-js/auth/react/ui';
import { Link } from 'lib/transition';

import { PageRoutes } from '@/lib/pageroutes';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give auth time to check session
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <section className="flex min-h-[86.5vh] flex-col items-center justify-center px-2 py-8 text-center">
        <div className="text-foreground">Loading...</div>
      </section>
    );
  }

  return (
    <>
      <SignedIn>
        <section className="flex min-h-[86.5vh] flex-col items-center justify-center px-2 py-8 text-center">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold sm:text-7xl">Welcome!</h1>
            <p className="mb-8 max-w-[600px] text-foreground sm:text-base">
              You&apos;re successfully authenticated.
            </p>
            <div className="flex justify-center">
              <UserButton />
            </div>
          </div>
          <div className="mb-4 text-4xl font-bold sm:text-7xl">Documents</div>
          <p className="mb-8 max-w-[600px] text-foreground sm:text-base">
            A simple open-source product documentation platform. That&apos;s simple
            to use and easy to customize.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href={`/docs${PageRoutes[0].href}`}
              className={buttonVariants({ className: 'px-6', size: 'lg' })}
            >
              Get Started
            </Link>
          </div>
        </section>
      </SignedIn>
      <RedirectToSignIn />
    </>
  );
}
