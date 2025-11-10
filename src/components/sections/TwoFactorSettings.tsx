import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup';
import { Shield, Key } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export function TwoFactorSettings() {
  const [enabled, setEnabled] = useState(false);
  const [backupCodesCount, setBackupCodesCount] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('two_factor_enabled, backup_codes')
        .eq('id', user.id)
        .single();

      if (data) {
        setEnabled(data.two_factor_enabled || false);
        setBackupCodesCount(data.backup_codes?.length || 0);
      }
    } catch (error: any) {
      console.error('Error loading 2FA settings:', error);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: false, two_factor_secret: null, backup_codes: null })
        .eq('id', user.id);

      if (error) throw error;

      setEnabled(false);
      setBackupCodesCount(0);
      toast({ title: 'Success', description: '2FA has been disabled' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setShowDisableDialog(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
            <Badge variant={enabled ? 'default' : 'secondary'}>
              {enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Two-factor authentication adds an additional layer of security by requiring a code from your authenticator app when you sign in.
          </p>
          
          {enabled && (
            <div className="flex items-center gap-2 text-sm">
              <Key className="w-4 h-4" />
              <span>{backupCodesCount} backup codes remaining</span>
            </div>
          )}

          <div className="flex gap-2">
            {!enabled ? (
              <Button onClick={() => setShowSetup(true)}>Enable 2FA</Button>
            ) : (
              <Button onClick={() => setShowDisableDialog(true)} variant="destructive" disabled={loading}>
                Disable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <TwoFactorSetup
        open={showSetup}
        onClose={() => setShowSetup(false)}
        onSuccess={() => {
          loadSettings();
          toast({ title: 'Success', description: '2FA has been enabled' });
        }}
      />

      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Two-Factor Authentication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make your account less secure. You can always enable it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisable}>Disable</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}