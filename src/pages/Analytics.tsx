import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { JournalTrendsChart } from '@/components/analytics/JournalTrendsChart';
import { CircleActivityHeatmap } from '@/components/analytics/CircleActivityHeatmap';
import { WorkshopProgressChart } from '@/components/analytics/WorkshopProgressChart';
import { StreakPatternChart } from '@/components/analytics/StreakPatternChart';
import { AccountabilityAreasChart } from '@/components/analytics/AccountabilityAreasChart';
import { PeerComparisonChart } from '@/components/analytics/PeerComparisonChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, BookOpen, Target } from 'lucide-react';

function AnalyticsContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    totalWorkshops: 0,
    circleActivity: 0,
    totalGoals: 0,
    completedGoals: 0,
    goalCompletionRate: 0
  });

  // Mock data for charts
  const journalTrendsData = [
    { date: 'Mon', entries: 2, mood: 7 },
    { date: 'Tue', entries: 1, mood: 6 },
    { date: 'Wed', entries: 3, mood: 8 },
    { date: 'Thu', entries: 2, mood: 7 },
    { date: 'Fri', entries: 4, mood: 9 },
    { date: 'Sat', entries: 1, mood: 6 },
    { date: 'Sun', entries: 2, mood: 8 }
  ];

  const heatmapData = Array.from({ length: 7 * 24 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(i / 24)],
    hour: i % 24,
    value: Math.floor(Math.random() * 20)
  }));

  const workshopData = [
    { name: 'Mindfulness', completed: 8, inProgress: 2, notStarted: 1 },
    { name: 'Goal Setting', completed: 6, inProgress: 3, notStarted: 2 },
    { name: 'Communication', completed: 5, inProgress: 4, notStarted: 2 }
  ];

  const streakData = [
    { date: 'Week 1', journalStreak: 5, messageStreak: 12, workshopStreak: 2 },
    { date: 'Week 2', journalStreak: 7, messageStreak: 15, workshopStreak: 3 },
    { date: 'Week 3', journalStreak: 6, messageStreak: 18, workshopStreak: 4 },
    { date: 'Week 4', journalStreak: 8, messageStreak: 20, workshopStreak: 5 }
  ];

  const areasData = [
    { area: 'Health & Fitness', count: 45 },
    { area: 'Career Growth', count: 38 },
    { area: 'Relationships', count: 32 },
    { area: 'Mental Health', count: 28 },
    { area: 'Finance', count: 22 }
  ];

  const peerData = [
    { metric: 'Journal Entries', you: 85, circleAvg: 70 },
    { metric: 'Messages Sent', you: 92, circleAvg: 80 },
    { metric: 'Workshops', you: 75, circleAvg: 85 },
    { metric: 'Streak Days', you: 88, circleAvg: 75 },
    { metric: 'Circle Engagement', you: 80, circleAvg: 78 }
  ];

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [entriesRes, streaksRes, workshopsRes] = await Promise.all([
        supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('user_streaks').select('*').eq('user_id', user.id).order('streak_date', { ascending: false }).limit(30),
        supabase.from('workshop_completions').select('id', { count: 'exact' }).eq('user_id', user.id)
      ]);

      setStats({
        totalEntries: entriesRes.count || 0,
        currentStreak: calculateStreak(streaksRes.data || []),
        totalWorkshops: workshopsRes.count || 0,
        circleActivity: 0,
        totalGoals: 0,
        completedGoals: 0,
        goalCompletionRate: 0
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (streaks: any[]) => {
    if (!streaks.length) return 0;
    let streak = 0;
    const today = new Date();
    for (const s of streaks) {
      const date = new Date(s.streak_date);
      const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === streak) streak++;
      else break;
    }
    return streak;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading analytics...</div>;
  }

  return (
    <div className="container mx-auto p-4 pb-20 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Workshops</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkshops}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Circle Activity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.circleActivity}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <JournalTrendsChart data={journalTrendsData} />
          <StreakPatternChart data={streakData} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <CircleActivityHeatmap data={heatmapData} />
          <AccountabilityAreasChart data={areasData} />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <WorkshopProgressChart data={workshopData} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <PeerComparisonChart data={peerData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Analytics() {
  return (
    <AppProvider>
      <AppLayout>
        <AnalyticsContent />
      </AppLayout>
    </AppProvider>
  );
}
