'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { disableTwoFactor } from '@/actions/auth/disable-two-factor.actions';
import { enableTwoFactor } from '@/actions/auth/enable-two-factor.actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';

interface TwoFactorToggleProps {
  enabled: boolean;
}

export function TwoFactorToggle({ enabled }: TwoFactorToggleProps): React.JSX.Element {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleToggleClick(): void {
    setPassword('');
    setDialogOpen(true);
  }

  async function handleConfirm(): Promise<void> {
    if (!password.trim()) return;

    setIsLoading(true);

    try {
      const action = isEnabled ? disableTwoFactor : enableTwoFactor;
      const result = await action(password);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setIsEnabled(!isEnabled);
      setDialogOpen(false);
      toast.success(
        isEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="bg-card flex items-center justify-between rounded-lg border p-5">
        <div>
          <p className="text-sm font-medium">Two-Factor Authentication</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {isEnabled ?
              'A verification code will be sent to your email on new devices.'
            : 'Add an extra layer of security to your account.'}
          </p>
        </div>
        <Button
          variant={isEnabled ? 'destructive' : 'default'}
          size="sm"
          onClick={handleToggleClick}
        >
          {isEnabled ? 'Disable' : 'Enable'}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication</DialogTitle>
            <DialogDescription>Enter your password to confirm this action.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="2fa-confirm-password">Password</Label>
              <PasswordInput
                id="2fa-confirm-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isEnabled ? 'destructive' : 'default'}
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? 'Confirming…' : 'Confirm'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
