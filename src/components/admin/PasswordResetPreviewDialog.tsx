import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PasswordResetEmailTemplate } from '@/components/email/PasswordResetEmailTemplate';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Copy, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordResetPreviewDialog({ open, onOpenChange }: PasswordResetPreviewDialogProps) {
  const [userName, setUserName] = useState('John Doe');
  const [resetLink, setResetLink] = useState('https://yourapp.com/reset-password?token=abc123');
  const [expiryHours, setExpiryHours] = useState('24');
  const { toast } = useToast();

  const copyHtml = () => {
    const html = renderToString(
      <PasswordResetEmailTemplate 
        userName={userName} 
        resetLink={resetLink} 
        expiryHours={parseInt(expiryHours)} 
      />
    );
    navigator.clipboard.writeText(html);
    toast({ title: 'HTML copied to clipboard' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Password Reset Email Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>User Name</Label>
            <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div>
            <Label>Reset Link</Label>
            <Input value={resetLink} onChange={(e) => setResetLink(e.target.value)} />
          </div>
          <div>
            <Label>Expiry (hours)</Label>
            <Input type="number" value={expiryHours} onChange={(e) => setExpiryHours(e.target.value)} />
          </div>
        </div>

        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview">Visual Preview</TabsTrigger>
            <TabsTrigger value="html">HTML Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="border rounded-lg p-4 bg-gray-50">
            <PasswordResetEmailTemplate 
              userName={userName} 
              resetLink={resetLink} 
              expiryHours={parseInt(expiryHours)} 
            />
          </TabsContent>
          
          <TabsContent value="html">
            <div className="relative">
              <Button 
                size="sm" 
                className="absolute top-2 right-2 z-10" 
                onClick={copyHtml}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy HTML
              </Button>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                {renderToString(
                  <PasswordResetEmailTemplate 
                    userName={userName} 
                    resetLink={resetLink} 
                    expiryHours={parseInt(expiryHours)} 
                  />
                )}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
