import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot password',
};

export default function ForgotPasswordPage(): React.JSX.Element {
  return <ForgotPasswordForm />;
}
