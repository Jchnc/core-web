'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { verifyTwoFactor } from '@/actions/auth/verify-two-factor.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/auth.store';

export function TwoFactorVerifyForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrate = useAuthStore((s) => s.hydrate);

  const token = searchParams.get('two_factor_token');
  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    } else {
      inputRef.current?.focus();
    }
  }, [token, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || code.length !== 6) return;

      setIsLoading(true);

      try {
        const result = await verifyTwoFactor({
          two_factor_token: token,
          code,
          trust_device: trustDevice,
        });

        if (result.error) {
          toast.error(result.error);
          setCode('');
          inputRef.current?.focus();
          return;
        }

        if (result.data) {
          hydrate(result.data.user, result.data.access_token);
          router.push('/dashboard');
          router.refresh();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [token, code, trustDevice, hydrate, router],
  );

  if (!token) return <></>;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to your email to complete sign in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="2fa-verify-code">Verification Code</Label>
            <Input
              ref={inputRef}
              id="2fa-verify-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoComplete="one-time-code"
              disabled={isLoading}
              className="text-center font-mono text-lg tracking-[0.5em]"
            />
          </div>

          <label
            htmlFor="2fa-verify-trust"
            className="flex cursor-pointer items-center gap-2 text-sm select-none"
          >
            <input
              id="2fa-verify-trust"
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="accent-primary size-4 rounded"
            />
            Trust this device for 30 days
          </label>

          <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
            {isLoading ? 'Verifying…' : 'Verify & Sign In'}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Didn&apos;t receive a code? Sign in again to request a new one.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
