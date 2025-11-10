import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface EditMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentContent: string;
  onSave: (newContent: string) => void;
}

export function EditMessageDialog({ open, onOpenChange, currentContent, onSave }: EditMessageDialogProps) {
  const [content, setContent] = useState(currentContent);

  const handleSave = () => {
    if (content.trim() && content !== currentContent) {
      onSave(content.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
          placeholder="Edit your message..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!content.trim() || content === currentContent}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
