import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';

interface EmailTemplateEditorProps {
  open: boolean;
  onClose: () => void;
  template?: any;
  onSave: (template: any) => void;
}

export function EmailTemplateEditor({ open, onClose, template, onSave }: EmailTemplateEditorProps) {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [body, setBody] = useState(template?.body || '');
  const [category, setCategory] = useState(template?.category || 'custom');
  const [variables, setVariables] = useState<string[]>(template?.variables || []);
  const [newVar, setNewVar] = useState('');

  const addVariable = () => {
    if (newVar && !variables.includes(newVar)) {
      setVariables([...variables, newVar]);
      setNewVar('');
    }
  };

  const removeVariable = (v: string) => {
    setVariables(variables.filter(x => x !== v));
  };

  const insertVariable = (v: string) => {
    setBody(body + `{{${v}}}`);
  };

  const handleSave = () => {
    onSave({ id: template?.id, name, subject, body, category, variables });
    onClose();
  };

  const previewContent = () => {
    let previewBody = body;
    variables.forEach(v => {
      previewBody = previewBody.replace(new RegExp(`{{${v}}}`, 'g'), `[${v.toUpperCase()}]`);
    });
    return previewBody;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit' : 'Create'} Email Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Template Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="password_reset">Password Reset</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div>
            <Label>Variables</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                placeholder="Add variable (e.g., name)" 
                value={newVar} 
                onChange={(e) => setNewVar(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addVariable()}
              />
              <Button onClick={addVariable}>Add</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {variables.map(v => (
                <Badge key={v} className="cursor-pointer" onClick={() => insertVariable(v)}>
                  {`{{${v}}}`}
                  <X className="h-3 w-3 ml-1" onClick={(e) => { e.stopPropagation(); removeVariable(v); }} />
                </Badge>
              ))}
            </div>
          </div>

          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Email body..."
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="border rounded p-4 min-h-[300px] whitespace-pre-wrap">
                {previewContent()}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Template</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
