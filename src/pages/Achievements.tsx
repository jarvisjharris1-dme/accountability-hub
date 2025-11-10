import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BadgeCard } from '@/components/achievements/BadgeCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  category: string;
  points: number;
  earned?: boolean;
  earned_at?: string;
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (achError) throw achError;

      const { data: userAchievements, error: userError } = await supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user.id);

      if (userError) throw userError;

      const earnedMap = new Map(userAchievements?.map(ua => [ua.achievement_id, ua.earned_at]) || []);
      
      const enriched = allAchievements?.map(ach => ({
        ...ach,
        earned: earnedMap.has(ach.id),
        earned_at: earnedMap.get(ach.id)
      })) || [];

      setAchievements(enriched);
      const points = enriched.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);
      setTotalPoints(points);
    } catch (error: any) {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'goals', 'streaks', 'social', 'journal'];
  const filtered = (cat: string) => cat === 'all' ? achievements : achievements.filter(a => a.category === cat);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Achievements
        </h1>
        <p className="text-gray-600">Track your progress and earn badges</p>
      </div>

      <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{totalPoints} Points</h2>
            <p className="text-gray-600">{achievements.filter(a => a.earned).length} of {achievements.length} badges earned</p>
          </div>
          <TrendingUp className="w-12 h-12 text-purple-500" />
        </div>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">{cat}</TabsTrigger>
          ))}
        </TabsList>
        {categories.map(cat => (
          <TabsContent key={cat} value={cat}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered(cat).map(ach => (
                <BadgeCard key={ach.id} {...ach} badgeIcon={ach.badge_icon} earnedAt={ach.earned_at} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
