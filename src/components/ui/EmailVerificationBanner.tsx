import React, { useState } from 'react';
import { AlertCircle, Mail, X } from 'lucide-react';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  email, 
  onDismiss 
}) => {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      toast({
        title: 'Verification email sent!',
        description: 'Please check your inbox and spam folder.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend verification email',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-amber-800 font-medium mb-1">
            Please verify your email address
          </p>
          <p className="text-xs text-amber-700">
            We sent a verification link to <strong>{email}</strong>. 
            Check your inbox and spam folder.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResendVerification}
            disabled={isResending}
            className="whitespace-nowrap"
          >
            <Mail className="h-3 w-3 mr-1" />
            {isResending ? 'Sending...' : 'Resend'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
