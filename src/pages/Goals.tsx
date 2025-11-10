import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalDetailDialog } from '@/components/goals/GoalDetailDialog';
import { CelebrationAnimation } from '@/components/goals/CelebrationAnimation';
import { VerifiedOnlyFeature } from '@/components/VerifiedOnlyFeature';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user, filterStatus, filterCategory]);

  const handleGoalClick = (goal: any) => {
    setSelectedGoalId(goal.id);
    setDetailDialogOpen(true);
  };


  return (
    <div className="container mx-auto p-4 pb-20 max-w-6xl">
      <CelebrationAnimation show={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Set and track your SMART goals</p>
        </div>
        <VerifiedOnlyFeature featureName="goal creation">
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </VerifiedOnlyFeature>
      </div>


      <div className="flex gap-4 mb-6">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="health">Health & Fitness</SelectItem>
            <SelectItem value="career">Career</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="relationships">Relationships</SelectItem>
            <SelectItem value="personal">Personal Growth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No goals yet. Create your first goal!</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onClick={() => handleGoalClick(goal)} />
          ))}
        </div>
      )}
      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchGoals}
      />

      <GoalDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        goalId={selectedGoalId}
        onUpdate={fetchGoals}
      />
    </div>
  );
}
