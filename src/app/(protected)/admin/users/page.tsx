import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/dal/session.dal';
import { getUsers } from '@/actions/admin/users/get-users.actions';
import { UsersTable } from '@/components/admin/UsersTable';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Users',
};

interface AdminUsersPageProps {
  searchParams: Promise<{
    cursor?: string;
    search?: string;
  }>;
}

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps): Promise<React.JSX.Element> {
  await requireAdmin();

  const { cursor, search } = await searchParams;

  const result = await getUsers({
    limit: PAGE_SIZE,
    cursor,
    search,
  });

  if (result.error ?? !result.data) {
    return (
      <div className="container mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{result.error ?? 'Failed to load users'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">{result.data.total} total users</p>
      </div>

      <UsersTable initialData={result.data} currentCursor={cursor} currentSearch={search} />
    </div>
  );
}
