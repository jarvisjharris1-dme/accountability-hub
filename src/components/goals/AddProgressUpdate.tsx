import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

interface AddProgressUpdateProps {
  goalId: string;
  currentProgress: number;
  onUpdate: () => void;
}

export function AddProgressUpdate({ goalId, currentProgress, onUpdate }: AddProgressUpdateProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!notes.trim()) return;
    
    setAdding(true);
    try {
      const { error } = await supabase
        .from('goal_updates')
        .insert({
          goal_id: goalId,
          user_id: user?.id,
          notes,
          progress_value: currentProgress
        });
      
      if (error) throw error;
      setNotes('');
      onUpdate();
    } catch (error) {
      console.error('Error adding update:', error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Add Progress Update</Label>
      <Textarea
        placeholder="Share your progress, challenges, or wins..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
      />
      <Button onClick={handleAdd} disabled={adding || !notes.trim()}>
        <Plus className="h-4 w-4 mr-2" />
        Add Update
      </Button>
    </div>
  );
}
