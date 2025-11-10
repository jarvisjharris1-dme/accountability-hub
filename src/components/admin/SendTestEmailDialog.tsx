import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SendTestEmailDialogProps {
  open: boolean;
  onClose: () => void;
  template: any;
}

export function SendTestEmailDialog({ open, onClose, template }: SendTestEmailDialogProps) {
  const [email, setEmail] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-template-email', {
        body: {
          templateId: template.id,
          to: email,
          variables: variableValues
        }
      });

      if (error) throw error;

      toast.success('Test email sent successfully!');
      onClose();
    } catch (error: any) {
      toast.error('Failed to send test email: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Recipient Email</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          {template?.variables?.map((v: string) => (
            <div key={v}>
              <Label>{v}</Label>
              <Input 
                value={variableValues[v] || ''} 
                onChange={(e) => setVariableValues({ ...variableValues, [v]: e.target.value })}
                placeholder={`Enter value for {{${v}}}`}
              />
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
