import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Calendar,
  TrendingUp,
  Smile,
  Heart,
  Meh,
  Frown,
  AlertCircle,
  Target,
  Award,
  Users,
  Eye,
  EyeOff,
  Flame,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  stage: string;
  prompt: string;
  content: string;
  wins: string;
  challenges: string;
  gratitude: string;
  mood: 'great' | 'good' | 'okay' | 'struggling' | 'crisis';
  goal_id?: string;
  shared_with_circle: boolean;
  created_at: string;
  updated_at: string;
}

interface Goal {
  id: string;
  title: string;
}

const STAGES = [
  { value: 'awareness', label: 'Awareness', color: 'blue', prompt: 'What did you discover about yourself today?' },
  { value: 'acceptance', label: 'Acceptance', color: 'purple', prompt: 'What truth did you embrace today?' },
  { value: 'accountability', label: 'Accountability', color: 'green', prompt: 'What did you take ownership of today?' },
  { value: 'action', label: 'Action', color: 'orange', prompt: 'What concrete step did you take toward your goals?' },
  { value: 'achievement', label: 'Achievement', color: 'red', prompt: 'What milestone did you reach today?' },
  { value: 'advocacy', label: 'Advocacy', color: 'pink', prompt: 'How did you support or encourage someone today?' },
  { value: 'abundance', label: 'Abundance', color: 'yellow', prompt: 'What abundance do you see in your life right now?' }
];

const MOODS = [
  { value: 'great', label: 'Great', icon: Smile, color: 'green' },
  { value: 'good', label: 'Good', icon: Heart, color: 'blue' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'yellow' },
  { value: 'struggling', label: 'Struggling', icon: Frown, color: 'orange' },
  { value: 'crisis', label: 'Crisis', icon: AlertCircle, color: 'red' }
];

export function JournalSection() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [streak, setStreak] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    stage: 'awareness',
    content: '',
    wins: '',
    challenges: '',
    gratitude: '',
    mood: 'good' as 'great' | 'good' | 'okay' | 'struggling' | 'crisis',
    goal_id: '',
    shared_with_circle: false
  });

  useEffect(() => {
    loadEntries();
    loadGoals();
    calculateStreak();
  }, [user]);

  const loadEntries = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('id, title')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const calculateStreak = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(365);

      if (error) throw error;

      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const dates = data?.map(e => e.date) || [];

      if (dates.includes(today)) {
        currentStreak = 1;
        let checkDate = new Date();
        
        for (let i = 1; i < dates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const dateStr = checkDate.toISOString().split('T')[0];
          
          if (dates.includes(dateStr)) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      setStreak(currentStreak);
    } catch (error) {
      console.error('Error calculating streak:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !formData.content.trim()) {
      alert('Please write something in your journal entry');
      return;
    }

    try {
      const stage = STAGES.find(s => s.value === formData.stage);
      
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          stage: formData.stage,
          prompt: stage?.prompt || '',
          content: formData.content,
          wins: formData.wins,
          challenges: formData.challenges,
          gratitude: formData.gratitude,
          mood: formData.mood,
          goal_id: formData.goal_id || null,
          shared_with_circle: formData.shared_with_circle
        });

      if (error) throw error;

      alert('Journal entry saved! 🎉');
      setFormData({
        stage: 'awareness',
        content: '',
        wins: '',
        challenges: '',
        gratitude: '',
        mood: 'good',
        goal_id: '',
        shared_with_circle: false
      });
      setShowForm(false);
      loadEntries();
      calculateStreak();
    } catch (error: any) {
      console.error('Error saving entry:', error);
      alert('Error saving entry: ' + error.message);
    }
  };

  const getMoodIcon = (mood: string) => {
    const moodData = MOODS.find(m => m.value === mood);
    if (!moodData) return null;
    const Icon = moodData.icon;
    return <Icon className={`w-5 h-5 text-${moodData.color}-600`} />;
  };

  const getStageColor = (stage: string) => {
    const stageData = STAGES.find(s => s.value === stage);
    return stageData?.color || 'gray';
  };

  const filteredEntries = entries.filter(entry => {
    const matchesStage = filterStage === 'all' || entry.stage === filterStage;
    const matchesSearch = searchTerm === '' || 
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.wins?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.challenges?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStage && matchesSearch;
  });

  const currentPrompt = STAGES.find(s => s.value === formData.stage)?.prompt || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Journal</h1>
            <p className="text-gray-300">Reflect, grow, and track your journey</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-[#1a2332] px-6 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-gray-300">Current Streak</p>
                <p className="text-2xl font-bold">{streak} days</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Total Entries</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">This Month</p>
                <p className="text-2xl font-bold">
                  {entries.filter(e => {
                    const entryDate = new Date(e.date);
                    const now = new Date();
                    return entryDate.getMonth() === now.getMonth() && 
                           entryDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#1a2332]">New Journal Entry</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Stage Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              >
                {STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
              <p className="text-sm text-gray-600 mt-2 italic">"{currentPrompt}"</p>
            </div>

            {/* Main Entry */}
            <div>
              <label className="block text-sm font-medium mb-2">Journal Entry *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your thoughts, reflections, and insights..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            {/* Wins & Challenges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-600" />
                  Today's Wins
                </label>
                <textarea
                  value={formData.wins}
                  onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                  placeholder="What went well today?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  Today's Challenges
                </label>
                <textarea
                  value={formData.challenges}
                  onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                  placeholder="What was difficult?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>

            {/* Gratitude */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                Gratitude
              </label>
              <textarea
                value={formData.gratitude}
                onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
                placeholder="What are you grateful for today?"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            {/* Mood & Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => {
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setFormData({ ...formData, mood: mood.value as any })}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                          formData.mood === mood.value
                            ? `border-${mood.color}-500 bg-${mood.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-1 text-${mood.color}-600`} />
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Link to Goal (Optional)
                </label>
                <select
                  value={formData.goal_id}
                  onChange={(e) => setFormData({ ...formData, goal_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                >
                  <option value="">No goal selected</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Share with Circle */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="share-circle"
                checked={formData.shared_with_circle}
                onChange={(e) => setFormData({ ...formData, shared_with_circle: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="share-circle" className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Share this entry with my accountability circle</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#1a2332] text-white py-3 rounded-lg hover:bg-[#2d3e50] font-semibold"
              >
                Save Entry
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
          >
            <option value="all">All Stages</option>
            {STAGES.map(stage => (
              <option key={stage.value} value={stage.value}>{stage.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Entries Yet</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterStage !== 'all' 
              ? 'No entries match your filters. Try adjusting your search.'
              : 'Start your journey by creating your first journal entry!'}
          </p>
          {!searchTerm && filterStage === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#1a2332] text-white px-6 py-3 rounded-lg hover:bg-[#2d3e50]"
            >
              Create First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const stageColor = getStageColor(entry.stage);
            const linkedGoal = goals.find(g => g.id === entry.goal_id);
            
            return (
              <div key={entry.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${stageColor}-100 text-${stageColor}-800`}>
                      {STAGES.find(s => s.value === entry.stage)?.label}
                    </span>
                    {getMoodIcon(entry.mood)}
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    {entry.shared_with_circle && (
                      <span className="flex items-center gap-1 text-xs text-blue-600">
                        <Eye className="w-3 h-3" />
                        Shared
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </span>
                </div>

                {entry.prompt && (
                  <p className="text-sm text-gray-600 italic mb-3">"{entry.prompt}"</p>
                )}

                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{entry.content}</p>

                {(entry.wins || entry.challenges || entry.gratitude) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {entry.wins && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Wins
                        </p>
                        <p className="text-sm text-gray-700">{entry.wins}</p>
                      </div>
                    )}
                    {entry.challenges && (
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <p className="text-xs font-semibold text-orange-800 mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Challenges
                        </p>
                        <p className="text-sm text-gray-700">{entry.challenges}</p>
                      </div>
                    )}
                    {entry.gratitude && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <p className="text-xs font-semibold text-red-800 mb-1 flex items-center gap-1">
                          <Heart className="w-3 h-3" /> Gratitude
                        </p>
                        <p className="text-sm text-gray-700">{entry.gratitude}</p>
                      </div>
                    )}
                  </div>
                )}

                {linkedGoal && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>Linked to goal: <span className="font-medium">{linkedGoal.title}</span></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
