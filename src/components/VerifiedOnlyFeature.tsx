import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface VerifiedOnlyFeatureProps {
  children: React.ReactNode;
  featureName?: string;
}

export const VerifiedOnlyFeature: React.FC<VerifiedOnlyFeatureProps> = ({ 
  children, 
  featureName = 'this feature' 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = React.useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
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

  if (!user?.email_confirmed_at) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="flex flex-col gap-3">
          <div>
            <p className="text-sm text-amber-800 font-medium mb-1">
              Email verification required
            </p>
            <p className="text-xs text-amber-700">
              Please verify your email address to access {featureName}.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResendVerification}
            disabled={isResending}
            className="w-fit"
          >
            <Mail className="h-3 w-3 mr-2" />
            {isResending ? 'Sending...' : 'Resend Verification Email'}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
