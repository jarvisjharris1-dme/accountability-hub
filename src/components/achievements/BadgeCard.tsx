import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface BadgeCardProps {
  name: string;
  description: string;
  badgeIcon: string;
  category: string;
  points: number;
  earned?: boolean;
  earnedAt?: string;
}

export function BadgeCard({ name, description, badgeIcon, category, points, earned, earnedAt }: BadgeCardProps) {
  return (
    <Card className={`p-4 ${earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' : 'bg-gray-50 opacity-60'}`}>
      <div className="flex flex-col items-center text-center space-y-2">
        <div className={`text-6xl ${!earned && 'grayscale opacity-40'}`}>
          {earned ? badgeIcon : <Lock className="w-12 h-12 text-gray-400" />}
        </div>
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex gap-2 flex-wrap justify-center">
          <Badge variant="outline" className="text-xs">{category}</Badge>
          <Badge variant="secondary" className="text-xs">{points} pts</Badge>
        </div>
        {earned && earnedAt && (
          <p className="text-xs text-gray-500">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}
