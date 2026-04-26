import type { Metadata } from 'next';
import { Suspense } from 'react';

import { TwoFactorVerifyForm } from '@/components/auth/TwoFactorVerifyForm';

export const metadata: Metadata = {
  title: 'Verify Identity',
};

export default function TwoFactorVerifyPage(): React.JSX.Element {
  return (
    <main className="bg-muted/40 flex min-h-svh items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Suspense>
          <TwoFactorVerifyForm />
        </Suspense>
      </div>
    </main>
  );
}
