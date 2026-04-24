import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppBreadcrumbs } from '@/components/layout/AppBreadcrumbs';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
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
      <SidebarProvider>
        <AppSidebar user={session.user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="my-auto mr-2 h-4 self-stretch" />
            <AppBreadcrumbs />
          </header>
          <main className="container mx-auto flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
