import { redirectIfAuthenticated } from '@/lib/dal/session.dal';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({
  children,
}: AuthLayoutProps): Promise<React.JSX.Element> {
  await redirectIfAuthenticated();

  return (
    <main className="bg-muted/40 flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
