import { AuthProvider } from '@/components/auth/AuthProvider';
import { Header } from '@/components/layout/Header';
import { requireSession } from '@/lib/dal/session.dal';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps): Promise<React.JSX.Element> {
  const session = await requireSession();

  return (
    <AuthProvider user={session.user} accessToken={session.accessToken}>
      <div className="flex min-h-svh flex-col">
        <Header user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </AuthProvider>
  );
}
