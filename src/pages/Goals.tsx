import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Target,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Calendar,
  TrendingUp,
  Flag,
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  target_date: string;
  status: 'active' | 'completed' | 'abandoned' | 'on_hold';
  priority: 'low' | 'medium' | 'high';
  progress_percentage: number;
  is_public: boolean;
  created_at: string;
  completed_at?: string;
}

interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description: string;
  target_date: string;
  completed: boolean;
  completed_at?: string;
  order_index: number;
}

const CATEGORIES = [
  { id: 'personal', name: 'Personal', color: 'blue' },
  { id: 'professional', name: 'Professional', color: 'purple' },
  { id: 'health', name: 'Health', color: 'green' },
  { id: 'relationships', name: 'Relationships', color: 'pink' },
  { id: 'financial', name: 'Financial', color: 'yellow' },
  { id: 'spiritual', name: 'Spiritual', color: 'indigo' },
  { id: 'other', name: 'Other', color: 'gray' }
];

export function GoalTracker() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [loading, setLoading] = useState(true);

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'personal',
    target_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    is_public: false
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    target_date: ''
  });

  useEffect(() => {
    loadGoals();
  }, [user, filterStatus]);

  useEffect(() => {
    if (selectedGoal) {
      loadMilestones(selectedGoal.id);
    }
  }, [selectedGoal]);

  const loadGoals = async () => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (goalId: string) => {
    try {
      const { data, error } = await supabase
        .from('goal_milestones')
        .select('*')
        .eq('goal_id', goalId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  const handleSaveGoal = async () => {
    if (!user?.id || !goalForm.title.trim()) {
      alert('Please enter a goal title');
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goalForm.title,
          description: goalForm.description,
          category: goalForm.category,
          target_date: goalForm.target_date || null,
          priority: goalForm.priority,
          is_public: goalForm.is_public,
          status: 'active',
          progress_percentage: 0
        });

      if (error) throw error;

      alert('Goal created successfully!');
      setGoalForm({
        title: '',
        description: '',
        category: 'personal',
        target_date: '',
        priority: 'medium',
        is_public: false
      });
      setShowAddGoal(false);
      loadGoals();
    } catch (error: any) {
      console.error('Error saving goal:', error);
      alert('Error saving goal: ' + error.message);
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const updates: any = { progress_percentage: newProgress };
      
      if (newProgress === 100) {
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId);

      if (error) throw error;
      loadGoals();
      
      if (newProgress === 100) {
        alert('🎉 Goal completed! Congratulations!');
      }
    } catch (error: any) {
      console.error('Error updating progress:', error);
      alert('Error updating progress: ' + error.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      alert('Goal deleted successfully');
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
      }
      loadGoals();
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      alert('Error deleting goal: ' + error.message);
    }
  };

  const handleAddMilestone = async () => {
    if (!selectedGoal || !milestoneForm.title.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    try {
      const { error } = await supabase
        .from('goal_milestones')
        .insert({
          goal_id: selectedGoal.id,
          title: milestoneForm.title,
          description: milestoneForm.description,
          target_date: milestoneForm.target_date || null,
          order_index: milestones.length,
          completed: false
        });

      if (error) throw error;

      alert('Milestone added!');
      setMilestoneForm({ title: '', description: '', target_date: '' });
      setShowAddMilestone(false);
      loadMilestones(selectedGoal.id);
    } catch (error: any) {
      console.error('Error adding milestone:', error);
      alert('Error adding milestone: ' + error.message);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      const updates: any = { 
        completed: !completed 
      };
      
      if (!completed) {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from('goal_milestones')
        .update(updates)
        .eq('id', milestoneId);

      if (error) throw error;
      
      if (selectedGoal) {
        loadMilestones(selectedGoal.id);
        
        // Update goal progress based on completed milestones
        const completedCount = milestones.filter(m => m.id === milestoneId ? !completed : m.completed).length;
        const totalCount = milestones.length;
        const newProgress = Math.round((completedCount / totalCount) * 100);
        
        handleUpdateGoalProgress(selectedGoal.id, newProgress);
      }
    } catch (error: any) {
      console.error('Error toggling milestone:', error);
      alert('Error updating milestone: ' + error.message);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getCategoryColor = (category: string) => {
    return CATEGORIES.find(c => c.id === category)?.color || 'gray';
  };

  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Goal Tracker</h1>
        <p className="text-gray-300">Set goals, track progress, achieve greatness</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Goals</p>
              <p className="text-3xl font-bold text-[#1a2332]">{activeGoals}</p>
            </div>
            <Target className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-[#1a2332]">{completedGoals}</p>
            </div>
            <Check className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
              <p className="text-3xl font-bold text-[#1a2332]">{totalProgress}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'active'
                ? 'bg-[#1a2332] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'completed'
                ? 'bg-[#1a2332] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'all'
                ? 'bg-[#1a2332] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
        </div>

        <button
          onClick={() => setShowAddGoal(true)}
          className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Goal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Goal Title *</label>
              <input
                type="text"
                value={goalForm.title}
                onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                placeholder="e.g., Run a marathon"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                placeholder="Why is this goal important to you?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={goalForm.category}
                  onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={goalForm.priority}
                  onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Date</label>
                <input
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={goalForm.is_public}
                onChange={(e) => setGoalForm({ ...goalForm, is_public: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_public" className="text-sm text-gray-700">
                Make this goal visible to my circle
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveGoal}
                className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50]"
              >
                Create Goal
              </button>
              <button
                onClick={() => {
                  setShowAddGoal(false);
                  setGoalForm({
                    title: '',
                    description: '',
                    category: 'personal',
                    target_date: '',
                    priority: 'medium',
                    is_public: false
                  });
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Goals Yet</h3>
          <p className="text-gray-500 mb-4">Start your journey by setting your first goal!</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-[#1a2332] text-white px-6 py-3 rounded-lg hover:bg-[#2d3e50]"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded bg-${getCategoryColor(goal.category)}-100 text-${getCategoryColor(goal.category)}-800`}>
                        {CATEGORIES.find(c => c.id === goal.category)?.name}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded bg-${getPriorityColor(goal.priority)}-100 text-${getPriorityColor(goal.priority)}-800`}>
                        {goal.priority}
                      </span>
                      {goal.is_public && (
                        <Users className="w-4 h-4 text-gray-400" title="Shared with circle" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-[#1a2332] mb-2">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                    {goal.target_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{goal.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#1a2332] h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedGoal(goal)}
                    className="flex-1 bg-[#1a2332] text-white py-2 rounded-lg hover:bg-[#2d3e50] flex items-center justify-center gap-2"
                  >
                    {selectedGoal?.id === goal.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {selectedGoal?.id === goal.id ? 'Hide' : 'Manage'} Milestones
                  </button>
                  {goal.status === 'active' && goal.progress_percentage < 100 && (
                    <button
                      onClick={() => handleUpdateGoalProgress(goal.id, 100)}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Complete
                    </button>
                  )}
                </div>

                {/* Milestones Section */}
                {selectedGoal?.id === goal.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">Milestones</h4>
                      <button
                        onClick={() => setShowAddMilestone(true)}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </button>
                    </div>

                    {showAddMilestone && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          value={milestoneForm.title}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                          placeholder="Milestone title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddMilestone}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddMilestone(false);
                              setMilestoneForm({ title: '', description: '', target_date: '' });
                            }}
                            className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                        >
                          <button
                            onClick={() => handleToggleMilestone(milestone.id, milestone.completed)}
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                              milestone.completed
                                ? 'bg-green-600 border-green-600'
                                : 'border-gray-300 hover:border-green-600'
                            }`}
                          >
                            {milestone.completed && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`text-sm flex-1 ${
                            milestone.completed ? 'line-through text-gray-400' : 'text-gray-700'
                          }`}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                      {milestones.length === 0 && !showAddMilestone && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          No milestones yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
