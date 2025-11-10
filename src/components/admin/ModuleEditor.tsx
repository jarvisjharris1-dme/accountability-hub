import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Save, X } from 'lucide-react';
import { ContentItemEditor } from './ContentItemEditor';

interface ModuleEditorProps {
  module: any;
  onSave: (module: any) => void;
  onCancel: () => void;
}

export function ModuleEditor({ module, onSave, onCancel }: ModuleEditorProps) {
  const [editData, setEditData] = useState(module);
  const [editingContent, setEditingContent] = useState<any>(null);

  const addContent = () => {
    setEditingContent({
      id: Date.now().toString(),
      title: '',
      content_type: 'text',
      order_index: editData.content?.length || 0,
      content: {}
    });
  };

  const saveContent = (content: any) => {
    const items = editData.content || [];
    const index = items.findIndex((c: any) => c.id === content.id);
    
    if (index >= 0) {
      items[index] = content;
    } else {
      items.push(content);
    }
    
    setEditData({ ...editData, content: items });
    setEditingContent(null);
  };

  if (editingContent) {
    return (
      <ContentItemEditor
        content={editingContent}
        onSave={saveContent}
        onCancel={() => setEditingContent(null)}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Module</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Module Title</Label>
          <Input
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Content Items</Label>
            <Button size="sm" onClick={addContent}>
              <Plus className="h-4 w-4 mr-1" />
              Add Content
            </Button>
          </div>
          <div className="space-y-2">
            {editData.content?.map((item: any) => (
              <div key={item.id} className="p-3 border rounded">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.content_type}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSave(editData)}>
            <Save className="mr-2 h-4 w-4" />
            Save Module
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
