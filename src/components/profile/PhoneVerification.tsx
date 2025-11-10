import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, Phone, Check } from 'lucide-react';

interface PhoneVerificationProps {
  userId: string;
  currentPhone?: string;
  isVerified?: boolean;
  onVerified?: () => void;
}

export function PhoneVerification({ userId, currentPhone, isVerified, onVerified }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || '');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>(currentPhone && !isVerified ? 'otp' : 'phone');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendVerification = async () => {
    if (!phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid phone number with country code',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phoneNumber, userId }
      });

      if (error) throw error;

      toast({
        title: 'Verification code sent',
        description: 'Check your phone for the verification code'
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: 'Failed to send code',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter the 6-digit code',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-phone-otp', {
        body: { phoneNumber, otpCode, userId }
      });

      if (error) throw error;

      toast({
        title: 'Phone verified!',
        description: 'Your phone number has been verified successfully'
      });
      onVerified?.();
    } catch (error: any) {
      toast({
        title: 'Verification failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number
          </CardTitle>
          <CardDescription>Your phone number is verified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span className="font-medium">{currentPhone}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Verify Phone Number
        </CardTitle>
        <CardDescription>
          {step === 'phone' ? 'Add your phone number' : 'Enter the verification code'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button onClick={sendVerification} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={verifyOtp} disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
              <Button onClick={sendVerification} variant="outline" disabled={loading}>
                Resend
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
