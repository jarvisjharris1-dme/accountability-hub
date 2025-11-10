import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resend'>('verifying');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type === 'email') {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
          });

          if (error) throw error;

          if (data.user) {
            setStatus('success');
            setMessage('Your email has been verified successfully!');
            setTimeout(() => navigate('/'), 2000);
          }
        } catch (error: any) {
          setStatus('error');
          setMessage(error.message || 'Verification failed. The link may have expired.');
        }
      } else {
        setStatus('resend');
        setMessage('No verification token found. Please enter your email to resend.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResend = async () => {
    if (!email) {
      toast({ title: 'Error', description: 'Please enter your email', variant: 'destructive' });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      toast({ title: 'Success!', description: 'Verification email sent. Check your inbox.' });
      setStatus('verifying');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {status === 'verifying' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
            {status === 'resend' && <Mail className="h-6 w-6 text-blue-600" />}
            {status === 'verifying' ? 'Verifying Email...' : 
             status === 'success' ? 'Email Verified!' : 
             status === 'error' ? 'Verification Failed' : 'Resend Verification'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <Button onClick={() => navigate('/')} className="w-full">Continue to Dashboard</Button>
          )}
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={() => navigate('/login')} className="w-full">Back to Login</Button>
              <Button onClick={() => setStatus('resend')} variant="outline" className="w-full">
                Resend Verification Email
              </Button>
            </div>
          )}
          {status === 'resend' && (
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
              <Button onClick={handleResend} disabled={isResending} className="w-full">
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
