'use client';

import { logout } from '@/actions/auth/logout.actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';
import { ChevronsUpDown, LogOut, User as UserIcon } from 'lucide-react';
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
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        side="top"
        sideOffset={4}
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
                  {user.role}
                </span>
              </div>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              <div className="mt-1 flex items-center gap-1 text-[11px]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    user.isEmailVerified ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className={user.isEmailVerified ? 'text-green-500' : 'text-red-500'}>
                  {user.isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
            </div>
          </div>
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
