import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function SMSTwoFactorSetup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendOTP = async () => {
    if (!user || !phoneNumber) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phoneNumber, userId: user.id }
      });

      if (error) throw error;

      toast({
        title: 'Code sent',
        description: 'Check your phone for the verification code'
      });
      setStep('verify');
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

  const verifyAndEnable = async () => {
    if (!user || !phoneNumber || !otpCode) return;

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.functions.invoke('verify-phone-otp', {
        body: { phoneNumber, otpCode, userId: user.id }
      });

      if (verifyError) throw verifyError;

      // Enable SMS 2FA
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ sms_2fa_enabled: true })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'SMS 2FA enabled',
        description: 'Two-factor authentication via SMS is now active'
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          SMS Two-Factor Authentication
        </CardTitle>
        <CardDescription>Add an extra layer of security with SMS verification</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="sms-phone">Phone Number</Label>
              <Input
                id="sms-phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button onClick={sendOTP} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Verification Code
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="sms-otp">Verification Code</Label>
              <Input
                id="sms-otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <Button onClick={verifyAndEnable} disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enable SMS 2FA
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
