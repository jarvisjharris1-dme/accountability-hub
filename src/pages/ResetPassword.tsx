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
import { CheckCircle2, AlertCircle, Mail, Lock, Loader2, Eye, EyeOff, Shield } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();
  
  // 🔥 IMPROVED: Check for both query params and hash params
  const accessToken = searchParams.get('access_token') || searchParams.get('token');
  const type = searchParams.get('type');
  const isUpdateMode = (type === 'recovery' || type === 'reset') && accessToken;
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // 🔥 NEW: Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Log detection for debugging
  useEffect(() => {
    if (isUpdateMode) {
      console.log('✅ Password reset mode detected - showing password form');
      console.log('Token:', accessToken?.substring(0, 20) + '...');
      console.log('Type:', type);
    } else {
      console.log('📧 Request mode - showing email form');
    }
  }, [isUpdateMode, accessToken, type]);

  // Countdown timer for redirect after success
  useEffect(() => {
    if (success && isUpdateMode && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && isUpdateMode && countdown === 0) {
      navigate('/login');
    }
  }, [success, isUpdateMode, countdown, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle request password reset (send email)
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

  // Handle resend email
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

  // Handle update password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
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

  // 🔥 NEW: Password match indicator
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = password && confirmPassword && password !== confirmPassword;

  // Success screen (after password update)
  if (success && isUpdateMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/accountablelogo2_updated.jpg" 
                alt="Accountable Logo" 
                className="h-20 w-auto object-contain"
              />
            </div>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Password Updated Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your password has been changed. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Redirecting to login in <span className="font-bold text-indigo-600 text-xl">{countdown}</span> seconds...
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
              size="lg"
            >
              Go to Login Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-6">
          <div className="flex justify-center">
            <img 
              src="/accountablelogo2_updated.jpg" 
              alt="Accountable Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isUpdateMode ? (
                <Shield className="w-6 h-6 text-indigo-600" />
              ) : (
                <Mail className="w-6 h-6 text-indigo-600" />
              )}
              <CardTitle className="text-2xl font-bold">
                {isUpdateMode ? 'Set New Password' : 'Reset Password'}
              </CardTitle>
            </div>
            <CardDescription className="mt-2 text-base">
              {isUpdateMode 
                ? 'Choose a strong password to secure your account' 
                : 'Enter your email and we\'ll send you a reset link'}
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={isUpdateMode ? handleUpdatePassword : handleRequestReset}>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Success Alert (email sent) */}
            {success && !isUpdateMode && (
              <Alert className="bg-green-50 border-green-200">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Email sent!</strong> Check your inbox for reset instructions.
                  <div className="mt-3 text-sm space-y-2">
                    <p className="font-medium">Check your spam folder if you don't see it.</p>
                    <p>
                      Didn't receive it? 
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={resendCooldown > 0 || loading}
                        className="ml-1 text-green-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
                      </button>
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Email Input (Request Mode) */}
            {!isUpdateMode ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10 h-11"
                    placeholder="you@example.com"
                    required 
                    disabled={success || loading}
                    autoComplete="email"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  We'll send you a link to reset your password
                </p>
              </div>
            ) : (
              <>
                {/* New Password Input (Update Mode) */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="password" 
                      type={showPassword ? 'text' : 'password'}
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="pl-10 pr-10 h-11"
                      placeholder="Enter new password"
                      required 
                      minLength={8}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    {/* 🔥 NEW: Password visibility toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrengthIndicator password={password} />
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1">
                    <p className="font-semibold text-gray-700">Password requirements:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li className={password.length >= 8 ? 'text-green-600' : ''}>
                        • At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                        • One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                        • One lowercase letter
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                        • One number
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Confirm Password Input (Update Mode) */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="pl-10 pr-10 h-11"
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      // 🔥 BEST PRACTICE: Prevent paste on confirm password
                      onPaste={(e) => {
                        e.preventDefault();
                        toast({
                          title: 'Paste disabled',
                          description: 'Please type your password to confirm',
                          variant: 'default'
                        });
                      }}
                    />
                    {/* 🔥 NEW: Confirm password visibility toggle */}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* 🔥 NEW: Password match indicator */}
                  {confirmPassword && (
                    <div className={`flex items-center gap-2 text-sm ${
                      passwordsMatch ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {passwordsMatch ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Passwords match</span>
                        </>
                      ) : passwordsDontMatch ? (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span>Passwords don't match</span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full h-11 font-semibold" 
              disabled={loading || (success && !isUpdateMode) || (isUpdateMode && passwordsDontMatch)}
              size="lg"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading 
                ? 'Processing...' 
                : isUpdateMode 
                  ? 'Update Password' 
                  : success 
                    ? 'Email Sent ✓' 
                    : 'Send Reset Link'}
            </Button>
            
            <Link 
              to="/login" 
              className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline text-center font-medium w-full py-2"
            >
              ← Back to login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

