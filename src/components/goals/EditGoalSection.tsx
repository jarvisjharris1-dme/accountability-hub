import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Pencil, Save, X } from 'lucide-react';

interface EditGoalSectionProps {
  goal: any;
  onUpdate: () => void;
}

export function EditGoalSection({ goal, onUpdate }: EditGoalSectionProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || '');
  const [category, setCategory] = useState(goal.category);
  const [deadline, setDeadline] = useState(goal.deadline || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('goals')
        .update({ title, description, category, deadline })
        .eq('id', goal.id);
      
      if (error) throw error;
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold">{goal.title}</h3>
            <p className="text-muted-foreground mt-2">{goal.description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="health">Health & Fitness</SelectItem>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="relationships">Relationships</SelectItem>
              <SelectItem value="personal">Personal Growth</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Deadline</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="outline" onClick={() => setEditing(false)}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
