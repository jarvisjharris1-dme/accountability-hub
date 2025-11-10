import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const levels = [
      { label: 'Very Weak', color: 'bg-red-500' },
      { label: 'Weak', color: 'bg-orange-500' },
      { label: 'Fair', color: 'bg-yellow-500' },
      { label: 'Good', color: 'bg-blue-500' },
      { label: 'Strong', color: 'bg-green-500' }
    ];
    
    return { score: (score / 5) * 100, label: levels[score - 1]?.label || '', color: levels[score - 1]?.color || '' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <Progress value={strength.score} className="h-2" />
      <p className={`text-sm font-medium ${strength.color.replace('bg-', 'text-')}`}>
        {strength.label}
      </p>
    </div>
  );
}
