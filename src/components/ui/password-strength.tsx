import { Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = '' }: PasswordStrengthProps): React.JSX.Element {
  const reqs = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    {
      label: 'Uppercase & lowercase letters',
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: 'At least one number', met: /[0-9]/.test(password) },
    { label: 'At least one special character', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  const strength = reqs.filter((req) => req.met).length;

  const getStrengthColor = (score: number) => {
    if (score === 0) return 'bg-muted';
    if (score === 1) return 'bg-destructive';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return 'Enter a password';
    if (score === 1) return 'Weak password';
    if (score === 2) return 'Fair password';
    if (score === 3) return 'Good password';
    return 'Strong password';
  };

  return (
    <div className="mt-3 space-y-3">
      <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              'h-full flex-1 transition-colors duration-300',
              index <= strength ? getStrengthColor(strength) : 'bg-muted',
            )}
          />
        ))}
      </div>
      <div className="text-muted-foreground flex justify-between text-xs font-medium">
        <span>{getStrengthText(strength)}</span>
      </div>
      <ul className="space-y-1.5">
        {reqs.map((req, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            {req.met ?
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            : <X className="text-muted-foreground/50 h-3.5 w-3.5" />}
            <span
              className={
                req.met ?
                  'text-foreground transition-colors'
                : 'text-muted-foreground/70 transition-colors'
              }
            >
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
