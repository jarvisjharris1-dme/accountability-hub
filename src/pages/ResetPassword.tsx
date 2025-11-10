import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Mail, Lock, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();
  
  const isUpdateMode = searchParams.get('type') === 'recovery';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (success && isUpdateMode && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && isUpdateMode && countdown === 0) {
      navigate('/login');
    }
  }, [success, isUpdateMode, countdown, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setSuccess(true);
      setResendCooldown(60);
      toast({ 
        title: 'Email sent successfully!', 
        description: 'Check your inbox for password reset instructions.',
        duration: 5000
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send reset email. Please try again.';
      setError(errorMsg);
      toast({ 
        title: 'Error sending email', 
        description: errorMsg, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      await resetPassword(email);
      setResendCooldown(60);
      toast({ 
        title: 'Email resent!', 
        description: 'Check your inbox again.',
        duration: 3000
      });
    } catch (err: any) {
      toast({ 
        title: 'Error', 
        description: 'Failed to resend email', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }
    
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setCountdown(5);
      toast({ 
        title: 'Password updated!', 
        description: 'Your password has been successfully changed.',
        duration: 5000
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update password. Please try again.';
      setError(errorMsg);
      toast({ 
        title: 'Error updating password', 
        description: errorMsg, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (success && isUpdateMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Password Updated Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your password has been changed. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Redirecting to login in <span className="font-bold text-indigo-600">{countdown}</span> seconds...
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              className="mt-4 w-full"
            >
              Go to Login Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-6">
          <div className="flex justify-center">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/6906b08a650ee0590aaf4bb4_1762183406403_6827ce42.png" 
              alt="Accountable" 
              className="h-40 w-auto"
            />
          </div>
          
          <div className="text-center">
            <CardTitle className="text-2xl">
              {isUpdateMode ? 'Set New Password' : 'Reset Password'}
            </CardTitle>
            <CardDescription className="mt-2">
              {isUpdateMode 
                ? 'Choose a strong password to secure your account' 
                : 'Enter your email and we\'ll send you a reset link'}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={isUpdateMode ? handleUpdatePassword : handleRequestReset}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && !isUpdateMode && (
              <Alert className="bg-green-50 border-green-200">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Email sent!</strong> Check your inbox for reset instructions.
                  <div className="mt-2 text-sm">
                    Didn't receive it? 
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={resendCooldown > 0 || loading}
                      className="ml-1 text-green-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {!isUpdateMode ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10"
                    placeholder="you@example.com"
                    required 
                    disabled={success || loading} 
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="pl-10"
                      placeholder="Enter new password"
                      required 
                      minLength={8}
                      disabled={loading}
                    />
                  </div>
                  <PasswordStrengthIndicator password={password} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="pl-10"
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || (success && !isUpdateMode)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading 
                ? 'Processing...' 
                : isUpdateMode 
                  ? 'Update Password' 
                  : success 
                    ? 'Email Sent' 
                    : 'Send Reset Link'}
            </Button>
            <Link 
              to="/login" 
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline text-center font-medium"
            >
              Back to login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}