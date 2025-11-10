import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface ContentItemEditorProps {
  content: any;
  onSave: (content: any) => void;
  onCancel: () => void;
}

export function ContentItemEditor({ content, onSave, onCancel }: ContentItemEditorProps) {
  const [editData, setEditData] = useState(content);

  const renderContentEditor = () => {
    switch (editData.content_type) {
      case 'video':
        return (
          <div>
            <Label>Video URL</Label>
            <Input
              value={editData.content.url || ''}
              onChange={(e) => setEditData({
                ...editData,
                content: { ...editData.content, url: e.target.value }
              })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        );
      
      case 'text':
        return (
          <div>
            <Label>Content</Label>
            <Textarea
              value={editData.content.text || ''}
              onChange={(e) => setEditData({
                ...editData,
                content: { ...editData.content, text: e.target.value }
              })}
              rows={6}
            />
          </div>
        );
      
      case 'quiz':
        return (
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={editData.content.question || ''}
                onChange={(e) => setEditData({
                  ...editData,
                  content: { ...editData.content, question: e.target.value }
                })}
              />
            </div>
            <div>
              <Label>Options (one per line)</Label>
              <Textarea
                value={editData.content.options?.join('\n') || ''}
                onChange={(e) => setEditData({
                  ...editData,
                  content: { ...editData.content, options: e.target.value.split('\n') }
                })}
                rows={4}
              />
            </div>
            <div>
              <Label>Correct Answer Index (0-based)</Label>
              <Input
                type="number"
                value={editData.content.correctAnswer || 0}
                onChange={(e) => setEditData({
                  ...editData,
                  content: { ...editData.content, correctAnswer: parseInt(e.target.value) }
                })}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Content Item</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Title</Label>
          <Input
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          />
        </div>

        <div>
          <Label>Content Type</Label>
          <Select
            value={editData.content_type}
            onValueChange={(v) => setEditData({ ...editData, content_type: v, content: {} })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="exercise">Exercise</SelectItem>
              <SelectItem value="reflection">Reflection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderContentEditor()}

        <div className="flex gap-2">
          <Button onClick={() => onSave(editData)}>
            <Save className="mr-2 h-4 w-4" />
            Save
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
