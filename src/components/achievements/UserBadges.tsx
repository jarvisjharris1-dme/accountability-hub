import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Badge {
  id: string;
  name: string;
  badge_icon: string;
  earned_at: string;
}

interface UserBadgesProps {
  userId: string;
}

export function UserBadges({ userId }: UserBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at, achievements(name, badge_icon)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
      .limit(6);

    if (data) {
      setBadges(data.map(d => ({
        id: d.achievement_id,
        name: (d.achievements as any)?.name || '',
        badge_icon: (d.achievements as any)?.badge_icon || '',
        earned_at: d.earned_at
      })));
    }
  };

  if (badges.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Recent Badges
        </h3>
        <button 
          onClick={() => navigate('/achievements')}
          className="text-sm text-blue-600 hover:underline"
        >
          View All
        </button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {badges.map(badge => (
          <div key={badge.id} className="text-3xl" title={badge.name}>
            {badge.badge_icon}
          </div>
        ))}
      </div>
    </Card>
  );
}
