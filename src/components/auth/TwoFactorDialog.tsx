'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { verifyTwoFactor } from '@/actions/auth/verify-two-factor.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TwoFactorDialogProps {
  token: string | null;
  onClose: () => void;
}

export function TwoFactorDialog({ token, onClose }: TwoFactorDialogProps): React.JSX.Element {
  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token) {
      setCode('');
      setTrustDevice(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [token]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!token || code.length !== 6) return;

      setIsLoading(true);

      try {
        await verifyTwoFactor({
          two_factor_token: token,
          code,
          trust_device: trustDevice,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
          throw error;
        }
        toast.error('Verification failed');
        setCode('');
        inputRef.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [token, code, trustDevice],
  );

  return (
    <Dialog open={!!token} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code sent to your email to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="2fa-code">Verification Code</Label>
            <Input
              ref={inputRef}
              id="2fa-code"
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
            htmlFor="2fa-trust-device"
            className="flex cursor-pointer items-center gap-2 text-sm select-none"
          >
            <input
              id="2fa-trust-device"
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="accent-primary size-4 rounded"
            />
            Trust this device for 30 days
          </label>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || code.length !== 6}>
              {isLoading ? 'Verifying…' : 'Verify'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
