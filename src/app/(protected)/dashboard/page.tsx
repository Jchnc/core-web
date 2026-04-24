import { requireSession } from '@/lib/dal/session.dal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <>
      <div className="mb-4 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {session.user.name}</p>
      </div>
    </>
  );
}
