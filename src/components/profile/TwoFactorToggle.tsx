'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { disableTwoFactor } from '@/actions/auth/disable-two-factor.actions';
import { enableTwoFactor } from '@/actions/auth/enable-two-factor.actions';
import { setPassword } from '@/actions/auth/set-password.actions';
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
import { PasswordStrength } from '@/components/ui/password-strength';

interface TwoFactorToggleProps {
  enabled: boolean;
  hasPassword: boolean;
}

type DialogMode = 'toggle-2fa' | 'set-password' | null;

export function TwoFactorToggle({ enabled, hasPassword }: TwoFactorToggleProps): React.JSX.Element {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [userHasPassword, setUserHasPassword] = useState(hasPassword);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [password, setPasswordValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleToggleClick(): void {
    setPasswordValue('');
    if (!userHasPassword) {
      setDialogMode('set-password');
    } else {
      setDialogMode('toggle-2fa');
    }
  }

  async function handleSetPassword(): Promise<void> {
    if (!password.trim()) return;

    setIsLoading(true);
    try {
      const result = await setPassword(password);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setUserHasPassword(true);
      setDialogMode(null);
      toast.success('Password set successfully. You can now manage 2FA.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggle2FA(): Promise<void> {
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
      setDialogMode(null);
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

      <Dialog
        open={dialogMode === 'set-password'}
        onOpenChange={(open) => !open && setDialogMode(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set a Password</DialogTitle>
            <DialogDescription>
              Your account was created with Google. Set a password to manage two-factor
              authentication.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSetPassword();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="set-password-input">New Password</Label>
              <PasswordInput
                id="set-password-input"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
              />
              <PasswordStrength password={password} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogMode(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !password.trim()}>
                {isLoading ? 'Setting password…' : 'Set Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogMode === 'toggle-2fa'}
        onOpenChange={(open) => !open && setDialogMode(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEnabled ? 'Disable' : 'Enable'} Two-Factor Authentication</DialogTitle>
            <DialogDescription>Enter your password to confirm this action.</DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleToggle2FA();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="2fa-confirm-password">Password</Label>
              <PasswordInput
                id="2fa-confirm-password"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogMode(null)}
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
