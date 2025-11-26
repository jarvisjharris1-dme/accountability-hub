import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Users, 
  Award, 
  Flame,
  Calendar,
  MessageCircle,
  CheckCircle,
  Plus,
  AlertCircle,
  Heart,
  Zap,
  ArrowRight,
  Bell,
  Trophy,
  BarChart3,
  Activity,
  Clock,
  Sparkles,
  LifeBuoy
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  journalStreak: number;
  journalThisWeek: number;
  totalJournals: number;
  activeGoals: number;
  completedGoals: number;
  totalBadges: number;
  circleMessages: number;
  workshopsCompleted: number;
  accountabilityScore: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  target_date: string;
}

interface RecentActivity {
  type: 'journal' | 'goal' | 'badge' | 'circle';
  message: string;
  time: string;
}

const STAGES = [
  { name: 'Awareness', color: 'blue', progress: 0 },
  { name: 'Acceptance', color: 'purple', progress: 0 },
  { name: 'Accountability', color: 'green', progress: 0 },
  { name: 'Action', color: 'orange', progress: 0 },
  { name: 'Achievement', color: 'red', progress: 0 },
  { name: 'Advocacy', color: 'pink', progress: 0 },
  { name: 'Abundance', color: 'yellow', progress: 0 }
];

interface DashboardSectionProps {
  onTabChange?: (tab: string) => void;
}

export function DashboardSection({ onTabChange }: DashboardSectionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    journalStreak: 0,
    journalThisWeek: 0,
    totalJournals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalBadges: 0,
    circleMessages: 0,
    workshopsCompleted: 0,
    accountabilityScore: 0
  });
  const [recentBadges, setRecentBadges] = useState<Badge[]>([]);
  const [topGoals, setTopGoals] = useState<Goal[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportType, setSupportType] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();
      
      setProfile(profileData);

      // Load journal stats
      const { data: journals, error: journalError } = await supabase
        .from('journal_entries')
        .select('date, created_at')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!journalError && journals) {
        // Calculate streak
        const streak = calculateStreak(journals.map(j => j.date));
        
        // Count this week
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const thisWeek = journals.filter(j => new Date(j.date) >= weekStart).length;

        setStats(prev => ({
          ...prev,
          journalStreak: streak,
          journalThisWeek: thisWeek,
          totalJournals: journals.length
        }));
      }

      // Load goals stats
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (!goalsError && goals) {
        const active = goals.filter(g => g.status === 'active').length;
        const completed = goals.filter(g => g.status === 'completed').length;
        
        // Get top 3 active goals
        const topActiveGoals = goals
          .filter(g => g.status === 'active')
          .slice(0, 3)
          .map(g => ({
            id: g.id,
            title: g.title,
            progress: calculateGoalProgress(g),
            target_date: g.target_date
          }));

        setTopGoals(topActiveGoals);
        setStats(prev => ({ ...prev, activeGoals: active, completedGoals: completed }));
      }

      // Load badges
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(3);

      if (!badgesError && badges) {
        setRecentBadges(badges);
        setStats(prev => ({ ...prev, totalBadges: badges.length }));
      }

      // Load workshops progress
      const { data: progress, error: progressError } = await supabase
        .from('workshop_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true);

      if (!progressError && progress) {
        setStats(prev => ({ ...prev, workshopsCompleted: progress.length }));
      }

      // Calculate accountability score
      const score = calculateAccountabilityScore({
        journalToday: journals?.some(j => j.date === new Date().toISOString().split('T')[0]) ?? false,
        activeGoals: goals?.filter(g => g.status === 'active').length ?? 0,
        completedGoals: goals?.filter(g => g.status === 'completed').length ?? 0,
        journalStreak: calculateStreak(journals?.map(j => j.date) ?? [])
      });

      setStats(prev => ({ ...prev, accountabilityScore: score }));

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (dates: string[]): number => {
    if (!dates.length) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    if (dates.includes(today)) {
      streak = 1;
      let checkDate = new Date();
      
      for (let i = 1; i < dates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (dates.includes(dateStr)) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  const calculateGoalProgress = (goal: any): number => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter((m: any) => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const calculateAccountabilityScore = (data: any): number => {
    let score = 0;
    
    // Journal today (+30 points)
    if (data.journalToday) score += 30;
    
    // Active goals (+20 points)
    if (data.activeGoals > 0) score += 20;
    
    // Journal streak (+2 points per day, max 30)
    score += Math.min(data.journalStreak * 2, 30);
    
    // Completed goals (+5 points each, max 20)
    score += Math.min(data.completedGoals * 5, 20);
    
    return Math.min(score, 100);
  };

  const sendSupportAlert = async () => {
    if (!user?.id || !supportType) {
      alert('Please select what you need help with');
      return;
    }

    try {
      // Save support request
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: user.id,
          support_type: supportType,
          message: supportMessage,
          status: 'active'
        });

      if (error) throw error;

      // TODO: Send notification to circle members
      // This would integrate with your notification system

      alert('Support alert sent to your circle! 💪');
      setShowSupportModal(false);
      setSupportMessage('');
      setSupportType('');
    } catch (error: any) {
      console.error('Error sending support alert:', error);
      alert('Error sending alert: ' + error.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getDailyPrompt = () => {
    const prompts = [
      "What's one thing you can take ownership of today?",
      "How will you show up for yourself today?",
      "What action will move you closer to your goals?",
      "Who can you encourage or support today?",
      "What are you grateful for right now?",
      "What challenge will you face head-on today?",
      "How will you practice accountability today?"
    ];
    return prompts[new Date().getDay()];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Floating Support Button */}
      <button
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-24 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg z-50 flex items-center gap-2 font-semibold transition-all hover:scale-105"
      >
        <LifeBuoy className="w-6 h-6" />
        <span className="hidden md:inline">Need Support?</span>
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {profile?.full_name || 'Friend'}!
            </h1>
            <p className="text-gray-300">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-400">{stats.journalStreak}</div>
            <div className="text-sm text-gray-300">day streak</div>
            <Flame className="w-8 h-8 text-orange-400 mx-auto mt-1" />
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mt-4">
          <p className="text-lg italic">"{getDailyPrompt()}"</p>
        </div>
      </div>

      {/* Accountability Support Card */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-red-600 rounded-full p-3">
            <LifeBuoy className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Need Accountability Support?</h3>
            <p className="text-gray-700 mb-4">
              You're not alone. Your circle is here to support you through challenges and celebrate your wins.
            </p>
            <button
              onClick={() => setShowSupportModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Support Now
            </button>
          </div>
        </div>
      </div>

      {/* Accountability Score */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#1a2332]" />
            Daily Accountability Score
          </h3>
          <span className="text-3xl font-bold text-[#1a2332]">{stats.accountabilityScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full transition-all ${
              stats.accountabilityScore >= 80 ? 'bg-green-500' :
              stats.accountabilityScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${stats.accountabilityScore}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.accountabilityScore >= 80 ? '🔥 Outstanding! You\'re crushing it today!' :
           stats.accountabilityScore >= 50 ? '💪 Good progress! Keep going!' :
           '🌱 Let\'s build momentum together!'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.journalThisWeek}</p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.activeGoals}</p>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalBadges}</p>
              <p className="text-sm text-gray-600">Badges</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.workshopsCompleted}</p>
              <p className="text-sm text-gray-600">Workshops</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Stage Journey Progress */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#1a2332]" />
          Your 7-Stage Journey
        </h3>
        <div className="space-y-3">
          {STAGES.map((stage, index) => (
            <div key={stage.name}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{stage.name}</span>
                <span className="text-sm text-gray-600">{stage.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-${stage.color}-500`}
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              Recent Achievements
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentBadges.map(badge => (
              <div key={badge.id} className="border-2 border-yellow-200 rounded-lg p-4 text-center bg-yellow-50">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-bold">{badge.name}</p>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(badge.earned_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Progress */}
      {topGoals.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              Active Goals
            </h3>
            <button 
              onClick={() => onTabChange?.('goals')}
              className="text-[#1a2332] hover:underline text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {topGoals.map(goal => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <p className="font-medium">{goal.title}</p>
                  <span className="text-sm font-bold text-green-600">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                {goal.target_date && (
                  <p className="text-xs text-gray-500 mt-2">
                    Due: {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => onTabChange?.('journal')}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#1a2332] hover:bg-gray-50 transition-all"
          >
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium">New Journal</span>
          </button>
          <button 
            onClick={() => onTabChange?.('goals')}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#1a2332] hover:bg-gray-50 transition-all"
          >
            <Target className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium">Add Goal</span>
          </button>
          <button 
            onClick={() => onTabChange?.('circle')}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#1a2332] hover:bg-gray-50 transition-all"
          >
            <MessageCircle className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium">Circle Chat</span>
          </button>
          <button 
            onClick={() => onTabChange?.('workshop')}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:border-[#1a2332] hover:bg-gray-50 transition-all"
          >
            <Users className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium">Workshop</span>
          </button>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600 rounded-full p-3">
                <LifeBuoy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">We're Here to Support You</h3>
                <p className="text-gray-600">Your circle is ready to help</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">What do you need help with?</label>
                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select...</option>
                  <option value="goals">Staying on track with goals</option>
                  <option value="motivation">Feeling motivated</option>
                  <option value="setback">Dealing with setback</option>
                  <option value="emotional">Emotional crisis</option>
                  <option value="encouragement">Just need encouragement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message (optional)</label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Share what's on your mind..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💪 Your circle members will be notified and can reach out to support you. You're not alone in this journey.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={sendSupportAlert}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
                >
                  Send Alert to Circle
                </button>
                <button
                  onClick={() => {
                    setShowSupportModal(false);
                    setSupportMessage('');
                    setSupportType('');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
