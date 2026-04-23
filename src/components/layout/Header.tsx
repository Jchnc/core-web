import { UserMenu } from '@/components/layout/UserMenu';
import type { User } from '@/types';
import Link from 'next/link';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps): React.JSX.Element {
  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Auth System
        </Link>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
