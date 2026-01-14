import { AuthView } from '@neondatabase/neon-js/auth/react/ui';

interface AuthPageProps {
  params: Promise<{ pathname: string }>;
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { pathname } = await params;

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <AuthView pathname={pathname} />
      </div>
    </div>
  );
}
