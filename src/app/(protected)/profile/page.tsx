import type { Metadata } from 'next';
import { requireSession } from '@/lib/dal/session.dal';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Profile',
};

export default async function ProfilePage() {
  const session = await requireSession();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">Manage your account information</p>
      </div>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Account</h2>
          <p className="text-muted-foreground text-xs">Email address cannot be changed</p>
        </div>

        <div className="bg-card rounded-lg border p-5">
          <p className="text-muted-foreground text-xs">Email</p>
          <p className="mt-0.5 text-sm font-medium">{session.user.email}</p>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Personal information</h2>
          <p className="text-muted-foreground text-xs">Update your name</p>
        </div>

        <ProfileForm user={session.user} />
      </section>
    </div>
  );
}
