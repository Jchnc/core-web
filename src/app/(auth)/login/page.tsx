import { LoginForm } from '@/components/auth/LoginForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
};

export default function LoginPage(): React.JSX.Element {
  return <LoginForm />;
}
