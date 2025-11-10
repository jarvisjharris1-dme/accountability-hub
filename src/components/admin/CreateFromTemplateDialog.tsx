import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface CreateFromTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
  onCreateWorkshop: (data: any) => void;
}

export function CreateFromTemplateDialog({ open, onOpenChange, template, onCreateWorkshop }: CreateFromTemplateDialogProps) {
  const [title, setTitle] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [customizeModules, setCustomizeModules] = useState(false);

  const handleCreate = () => {
    const workshopData = {
      title,
      description,
      status: 'draft',
      template_id: template.id,
      config: customizeModules ? template.config : template.config,
    };
    onCreateWorkshop(workshopData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Workshop from Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Workshop Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="customize">Customize modules after creation</Label>
            <Switch id="customize" checked={customizeModules} onCheckedChange={setCustomizeModules} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Workshop</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
