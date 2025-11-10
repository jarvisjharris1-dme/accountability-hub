import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface TwoFactorVerificationProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerification({ userId, onSuccess, onCancel }: TwoFactorVerificationProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('two_factor_secret, backup_codes')
        .eq('id', userId)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error } = await supabase.functions.invoke('verify-2fa-code', {
        body: { 
          code, 
          secret: profile.two_factor_secret, 
          backupCodes: profile.backup_codes 
        }
      });

      if (error) throw error;

      if (!data.valid) {
        toast({ title: 'Invalid code', description: 'Please try again', variant: 'destructive' });
        return;
      }

      if (data.usedBackupCode) {
        const updatedCodes = profile.backup_codes.filter((c: string) => c !== code);
        await supabase.from('profiles').update({ backup_codes: updatedCodes }).eq('id', userId);
        toast({ title: 'Backup code used', description: 'This code cannot be used again' });
      }

      onSuccess();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Authentication Code</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="flex-1">
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
          <Button onClick={onCancel} variant="outline">Cancel</Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Lost your device? Use a backup code instead
        </p>
      </CardContent>
    </Card>
  );
}