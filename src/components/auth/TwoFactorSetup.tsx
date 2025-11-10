import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Copy, Check } from 'lucide-react';

interface TwoFactorSetupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFactorSetup({ open, onClose, onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && !secret) {
      handleSetup();
    }
  }, [open]);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-2fa');
      if (error) throw error;
      setSecret(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setBackupCodes(data.backupCodes);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa-code', {
        body: { code: verificationCode, secret, backupCodes: [] }
      });
      if (error) throw error;
      if (!data.valid) {
        toast({ title: 'Invalid code', description: 'Please try again', variant: 'destructive' });
        return;
      }
      const { error: updateError } = await supabase.from('profiles').update({
        two_factor_enabled: true,
        two_factor_secret: secret,
        backup_codes: backupCodes
      }).eq('id', (await supabase.auth.getUser()).data.user?.id);
      if (updateError) throw updateError;
      setStep('backup');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>Add an extra layer of security</DialogDescription>
        </DialogHeader>
        {step === 'qr' && qrCodeUrl && (
          <div className="space-y-4">
            <p className="text-sm">Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center p-4 bg-white border rounded">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`} alt="QR Code" />
            </div>
            <p className="text-xs text-muted-foreground">Secret: {secret}</p>
            <Button onClick={() => setStep('verify')} className="w-full">Next</Button>
          </div>
        )}
        {step === 'verify' && (
          <div className="space-y-4">
            <Label>Enter the 6-digit code from your app:</Label>
            <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} />
            <Button onClick={handleVerify} disabled={loading || verificationCode.length !== 6} className="w-full">Verify</Button>
          </div>
        )}
        {step === 'backup' && (
          <div className="space-y-4">
            <p className="text-sm font-semibold">Save these backup codes:</p>
            <div className="bg-muted p-4 rounded space-y-1">
              {backupCodes.map((code, i) => <div key={i} className="font-mono text-sm">{code}</div>)}
            </div>
            <Button onClick={copyBackupCodes} variant="outline" className="w-full">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Codes'}
            </Button>
            <Button onClick={() => { onSuccess(); onClose(); }} className="w-full">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}