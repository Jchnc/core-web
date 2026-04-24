import { verifySession } from '@/lib/dal/session.dal';

export async function getAccessToken(): Promise<string | null> {
  const session = await verifySession();
  return session?.accessToken ?? null;
}
