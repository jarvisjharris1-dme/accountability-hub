import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
  onUseTemplate: () => void;
}

export function TemplatePreviewDialog({ open, onOpenChange, template, onUseTemplate }: TemplatePreviewDialogProps) {
  if (!template) return null;

  const config = template.config || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            <div>
              <Badge>{template.category}</Badge>
            </div>
            
            {config.modules && (
              <div>
                <h3 className="font-semibold mb-2">Modules ({config.modules.length})</h3>
                <div className="space-y-2">
                  {config.modules.map((module: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{module.title}</h4>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onUseTemplate}>
            <Copy className="h-4 w-4 mr-2" /> Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
