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
import { 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Lock, 
  Loader2, 
  Eye, 
  EyeOff,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();
  
  // 🔥 IMPROVED: Check both access_token AND type for better reliability
  const accessToken = searchParams.get('access_token');
  const type = searchParams.get('type');
  const isUpdateMode = type === 'recovery' && accessToken !== null;
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // 🔥 NEW: Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 🔥 NEW: Real-time password validation
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    match: false
  });

  // 🔥 NEW: Log mode for debugging
  useEffect(() => {
    if (isUpdateMode) {
      console.log('✅ Password reset mode - showing update form');
    } else {
      console.log('📧 Email request mode - showing email form');
    }
  }, [isUpdateMode]);

  // Success countdown timer
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

  // 🔥 NEW: Real-time password validation
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      match: password === confirmPassword && password.length > 0
    });
  }, [password, confirmPassword]);

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
    
    // 🔥 IMPROVED: Better validation with specific messages
    if (!passwordValidation.length) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!passwordValidation.uppercase) {
      setError('Password must contain at least one uppercase letter');
      return;
    }
    
    if (!passwordValidation.lowercase) {
      setError('Password must contain at least one lowercase letter');
      return;
    }
    
    if (!passwordValidation.number) {
      setError('Password must contain at least one number');
      return;
    }
    
    if (!passwordValidation.match) {
      setError('Passwords do not match');
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

  // Success screen - enhanced design
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
              <div className="rounded-full bg-green-100 p-4 shadow-lg">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Password Updated Successfully!</CardTitle>
            <CardDescription className="text-base mt-2">
              Your password has been changed. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-700">
                Redirecting to login in <span className="font-bold text-indigo-600 text-xl">{countdown}</span> seconds...
              </p>
            </div>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              size="lg"
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
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/accountablelogo2_updated.jpg" 
              alt="Accountable Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          
          <div className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isUpdateMode ? 'Set New Password' : 'Reset Password'}
            </CardTitle>
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
              <Alert variant="destructive" className="animate-in slide-in-from-top">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Success Alert for Email */}
            {success && !isUpdateMode && (
              <Alert className="bg-green-50 border-green-200 animate-in slide-in-from-top">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Email sent successfully!</strong>
                  <p className="mt-2 text-sm">
                    Check your inbox at <strong>{email}</strong> for reset instructions.
                  </p>
                  <div className="mt-3 text-sm">
                    Didn't receive it? 
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={resendCooldown > 0 || loading}
                      className="ml-1 text-green-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Click to resend'}
                    </button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Email Input */}
            {!isUpdateMode ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="pl-10 h-11"
                    placeholder="your.email@example.com"
                    required 
                    disabled={success || loading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you a secure link to reset your password
                </p>
              </div>
            ) : (
              <>
                {/* 🔥 NEW: Password Input with Visibility Toggle */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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
                      autoFocus
                    />
                    {/* 🔥 Eye Icon Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <PasswordStrengthIndicator password={password} />
                  
                  {/* 🔥 NEW: Real-time Password Requirements */}
                  {password && (
                    <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                      <div className="space-y-1.5">
                        <RequirementItem 
                          met={passwordValidation.length} 
                          text="At least 8 characters" 
                        />
                        <RequirementItem 
                          met={passwordValidation.uppercase} 
                          text="One uppercase letter (A-Z)" 
                        />
                        <RequirementItem 
                          met={passwordValidation.lowercase} 
                          text="One lowercase letter (a-z)" 
                        />
                        <RequirementItem 
                          met={passwordValidation.number} 
                          text="One number (0-9)" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 🔥 NEW: Confirm Password with Visibility Toggle */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="pl-10 pr-10 h-11"
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                    />
                    {/* 🔥 Eye Icon Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* 🔥 NEW: Password Match Indicator */}
                  {confirmPassword && (
                    <div className={`flex items-center gap-2 text-xs mt-2 ${
                      passwordValidation.match ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {passwordValidation.match ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-medium">Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold"
              disabled={loading || (success && !isUpdateMode)}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {loading 
                ? 'Processing...' 
                : isUpdateMode 
                  ? 'Update Password' 
                  : success 
                    ? 'Email Sent ✓' 
                    : 'Send Reset Link'}
            </Button>

            {/* Back to Login */}
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-medium w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

// 🔥 NEW: Helper component for password requirements
function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors ${
      met ? 'text-green-600' : 'text-gray-500'
    }`}>
      {met ? (
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
      )}
      <span className={met ? 'font-medium' : ''}>{text}</span>
    </div>
  );
}
