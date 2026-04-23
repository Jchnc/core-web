'use client';

import { logout } from '@/actions/auth.actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  user: User;
}

export function UserMenu({ user }: UserMenuProps): React.JSX.Element {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  async function handleLogout(): Promise<void> {
    clear();
    await logout();
    router.push('/login');
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none">
          <Avatar className="size-8 cursor-pointer">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm leading-none font-medium">{user.name}</p>
          <p className="text-muted-foreground mt-1 text-xs">{user.email}</p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/profile">
            <UserIcon className="mr-2 size-4" />
            Profile
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => void handleLogout()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
