import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface VerifyEmailLocationState {
  email?: string;
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resendVerificationEmail } = useAuth();
  const email = (location.state as VerifyEmailLocationState | null)?.email;
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email) {
      navigate('/signup');
      return;
    }

    setResending(true);
    setMessage('');
    setError('');

    try {
      await resendVerificationEmail(email);
      setMessage(`A new verification email was sent to ${email}.`);
    } catch (err: any) {
      setError(err.message || 'Unable to resend the verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            {email
              ? `We sent a verification link to ${email}.`
              : 'We sent a verification link to confirm your account.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {message && (
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">Next Steps:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Check your inbox and spam folder.</li>
              <li>2. Open the Accountable verification email.</li>
              <li>3. Click the verification link.</li>
              <li>4. Return to Accountable and sign in.</li>
            </ol>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button onClick={() => navigate('/login')} className="w-full">
            Go to Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            onClick={handleResend}
            className="w-full"
            variant="outline"
            disabled={resending}
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : email ? (
              'Resend verification email'
            ) : (
              'Return to signup'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
