'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { login } from '@/actions/auth/login.actions';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { loginSchema, type LoginSchema } from '@/lib/validations/auth.schemas';
import { useAuthStore } from '@/store/auth.store';
import { GoogleButton } from './GoogleButton';
import { TwoFactorDialog } from './TwoFactorDialog';

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginSchema): Promise<void> {
    setIsLoading(true);

    try {
      const result = await login(values);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data && 'requires_2fa' in result.data) {
        setTwoFactorToken(result.data.two_factor_token);
        return;
      }

      if (result.data && 'access_token' in result.data) {
        hydrate(result.data.user, result.data.access_token);
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleTwoFactorSuccess(accessToken: string, user: Parameters<typeof hydrate>[0]): void {
    hydrate(user, accessToken);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your account</p>
      </div>

      <form id="login-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="login-password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  {...field}
                  id="login-password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldGroup>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-2">Or</span>
        </div>
      </div>

      <GoogleButton />

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="hover:text-foreground font-medium">
          Create one
        </Link>
      </p>

      <TwoFactorDialog
        token={twoFactorToken}
        onClose={() => setTwoFactorToken(null)}
        onSuccess={handleTwoFactorSuccess}
      />
    </div>
  );
}
