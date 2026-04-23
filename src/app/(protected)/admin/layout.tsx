import { requireAdmin } from '@/lib/dal/session.dal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps): Promise<React.JSX.Element> {
  await requireAdmin();
  return <>{children}</>;
}
