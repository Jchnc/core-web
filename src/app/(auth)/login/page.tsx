import { LoginForm } from '@/components/auth/LoginForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const { error } = await searchParams;

  return (
    <>
      {error === 'oauth_failed' && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Sign in with Google failed. Please try again.</AlertDescription>
        </Alert>
      )}
      <LoginForm />
    </>
  );
}
