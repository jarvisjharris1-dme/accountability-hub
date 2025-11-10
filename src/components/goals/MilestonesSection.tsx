import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { checkAndAwardAchievements } from '@/utils/achievementChecker';
import { useAuth } from '@/contexts/AuthContext';


interface MilestonesSectionProps {
  goalId: string;
  onProgressUpdate: () => void;
}

export function MilestonesSection({ goalId, onProgressUpdate }: MilestonesSectionProps) {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchMilestones = async () => {
    const { data } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at');
    setMilestones(data || []);
  };

  useEffect(() => {
    fetchMilestones();
  }, [goalId]);

  const handleAdd = async () => {
    if (!newMilestone.trim()) return;
    setAdding(true);
    try {
      const { error } = await supabase
        .from('goal_milestones')
        .insert({ goal_id: goalId, title: newMilestone, completed: false });
      if (error) throw error;
      setNewMilestone('');
      await fetchMilestones();
      await updateGoalProgress();
    } finally {
      setAdding(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await supabase.from('goal_milestones').update({ completed: !completed }).eq('id', id);
    await fetchMilestones();
    await updateGoalProgress();
  };

  const deleteMilestone = async (id: string) => {
    await supabase.from('goal_milestones').delete().eq('id', id);
    await fetchMilestones();
    await updateGoalProgress();
  };

  const updateGoalProgress = async () => {
    const completed = milestones.filter(m => m.completed).length;
    const total = milestones.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    await supabase.from('goals').update({ progress }).eq('id', goalId);
    onProgressUpdate();
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">Milestones</Label>
      <div className="space-y-2">
        {milestones.map((m) => (
          <div key={m.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted">
            <Checkbox checked={m.completed} onCheckedChange={() => toggleComplete(m.id, m.completed)} />
            <span className={m.completed ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>{m.title}</span>
            <Button variant="ghost" size="sm" onClick={() => deleteMilestone(m.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="New milestone..." value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} />
        <Button onClick={handleAdd} disabled={adding}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
