import { AccountView } from '@neondatabase/neon-js/auth/react/ui';

interface AccountPageProps {
  params: Promise<{ pathname: string }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { pathname } = await params;

  return <AccountView pathname={pathname} />;
}
