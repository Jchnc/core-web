import { RegisterForm } from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create account',
};

export default function RegisterPage(): React.JSX.Element {
  return <RegisterForm />;
}
