import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserPhoneStatus {
  id: string;
  email: string;
  phone_number: string | null;
  phone_verified: boolean;
}

interface ManualPhoneVerifyDialogProps {
  user: UserPhoneStatus;
  open: boolean;
  onClose: () => void;
}

export function ManualPhoneVerifyDialog({ user, open, onClose }: ManualPhoneVerifyDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ phone_verified: true })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to verify phone');
    } else {
      toast.success('Phone verified successfully');
      onClose();
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ phone_verified: false })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to reset verification');
    } else {
      toast.success('Phone verification reset');
      onClose();
    }
    setLoading(false);
  };

  const handleRemovePhone = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ phone_number: null, phone_verified: false })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to remove phone');
    } else {
      toast.success('Phone number removed');
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Phone Verification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">User Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Phone Number</p>
            <p className="font-medium">{user.phone_number}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Current Status</p>
            <div className="mt-1">
              {user.phone_verified ? (
                <Alert className="border-green-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>Phone is verified</AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-yellow-600">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>Phone is not verified</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!user.phone_verified && (
            <Button onClick={handleVerify} disabled={loading} className="w-full sm:w-auto">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Phone
            </Button>
          )}
          {user.phone_verified && (
            <Button onClick={handleReset} disabled={loading} variant="outline" className="w-full sm:w-auto">
              <XCircle className="w-4 h-4 mr-2" />
              Reset Verification
            </Button>
          )}
          <Button onClick={handleRemovePhone} disabled={loading} variant="destructive" className="w-full sm:w-auto">
            Remove Phone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
