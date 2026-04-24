'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfile } from '@/actions/authenticated/users/user.actions';
import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
});

type ProfileSchema = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const storeUser = useAuthStore((s) => s.user);

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: storeUser?.name ?? user.name },
  });

  async function onSubmit(values: ProfileSchema): Promise<void> {
    setIsLoading(true);

    try {
      const result = await updateProfile(user.id, values);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Profile updated');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input {...form.register('name')} disabled={isLoading} placeholder="Your name" />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
