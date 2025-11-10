import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GoalProgressBar } from './GoalProgressBar';
import { Calendar, Target, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  deadline?: string;
  status: string;
  progress: number;
  partner_count?: number;
  milestone_count?: number;
}

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      health: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      career: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      finance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      relationships: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{goal.title}</CardTitle>
          <Badge className={getCategoryColor(goal.category)}>{goal.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
        )}
        <GoalProgressBar progress={goal.progress} />
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {goal.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(goal.deadline), 'MMM d, yyyy')}</span>
            </div>
          )}
          {goal.milestone_count !== undefined && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{goal.milestone_count} milestones</span>
            </div>
          )}
          {goal.partner_count !== undefined && goal.partner_count > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{goal.partner_count} partners</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
