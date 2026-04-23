import { verifySession } from '@/lib/dal/session.dal';
import { redirect } from 'next/navigation';

export default async function RootPage(): Promise<never> {
  const session = await verifySession();
  redirect(session ? '/dashboard' : '/login');
}
