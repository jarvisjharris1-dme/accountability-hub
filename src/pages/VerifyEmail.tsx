import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email!</CardTitle>
          <CardDescription>
            We've sent you a verification link to confirm your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Mail className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3 text-sm">Next Steps:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Check your inbox (and spam folder)</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>You'll be redirected to sign in</span>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">4.</span>
                <span>Start your journey! 🚀</span>
              </li>
            </ol>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-semibold mb-2">💡 Tips:</p>
            <ul className="space-y-1 text-xs">
              <li>• Check your spam/junk folder if you don't see the email</li>
              <li>• The verification link expires in 24 hours</li>
              <li>• Make sure to use the same browser when clicking the link</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
            variant="outline"
          >
            Go to Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-center text-gray-500">
            Didn't receive the email?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:underline font-medium"
            >
              Try signing up again
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
