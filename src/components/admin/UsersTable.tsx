'use client';

import { ChevronRight, MoreHorizontal, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { deleteUser } from '@/actions/admin/users/delete-user.actions';
import { updateUserRole } from '@/actions/admin/users/update-user-role.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { PaginatedUsers, User } from '@/types';

interface UsersTableProps {
  initialData: PaginatedUsers;
  currentCursor?: string;
  currentSearch?: string;
}

export function UsersTable({ initialData, currentSearch }: UsersTableProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch ?? '');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function applySearch(): void {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function clearSearch(): void {
    setSearch('');
    startTransition(() => {
      router.push(pathname);
    });
  }

  function goToNext(): void {
    if (!initialData.nextCursor) return;

    const params = new URLSearchParams();
    params.set('cursor', initialData.nextCursor);
    if (search.trim()) params.set('search', search.trim());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  async function handleRoleToggle(user: User): Promise<void> {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const result = await updateUserRole(user.id, { role: newRole });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(`Role updated to ${newRole}`);
    startTransition(() => router.refresh());
  }

  async function handleDelete(): Promise<void> {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      const result = await deleteUser(deleteTarget.id);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('User deleted');
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={applySearch} disabled={isPending}>
            Search
          </Button>
          {currentSearch && (
            <Button variant="ghost" onClick={clearSearch} disabled={isPending}>
              Clear
            </Button>
          )}
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {initialData.items.length === 0 ?
                <tr>
                  <td colSpan={6} className="text-muted-foreground px-4 py-10 text-center">
                    No users found
                  </td>
                </tr>
              : initialData.items.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onRoleToggle={() => void handleRoleToggle(user)}
                    onDelete={() => setDeleteTarget(user)}
                  />
                ))
              }
            </tbody>
          </table>
        </div>

        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            Showing {initialData.items.length} of {initialData.total}
          </span>
          {initialData.nextCursor && (
            <Button variant="outline" size="sm" onClick={goToNext} disabled={isPending}>
              Next page
              <ChevronRight className="ml-1 size-4" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">{deleteTarget?.name}</span>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface UserRowProps {
  user: User;
  onRoleToggle: () => void;
  onDelete: () => void;
}

function UserRow({ user, onRoleToggle, onDelete }: UserRowProps): React.JSX.Element {
  const joined = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(user.createdAt));

  return (
    <tr className="hover:bg-muted/30 border-b transition-colors last:border-0">
      <td className="px-4 py-3 font-medium">{user.name}</td>
      <td className="text-muted-foreground px-4 py-3">{user.email}</td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            user.isActive ?
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-destructive/10 text-destructive'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="text-muted-foreground px-4 py-3">{joined}</td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRoleToggle}>
              Set as {user.role === 'ADMIN' ? 'User' : 'Admin'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
