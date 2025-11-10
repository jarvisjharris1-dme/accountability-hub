import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, TrendingUp } from 'lucide-react';

interface WorkshopStats {
  workshop_id: string;
  workshop_title: string;
  total_completions: number;
  unique_users: number;
  completion_rate: number;
}

interface WorkshopMonitoringProps {
  stats: WorkshopStats[];
  totalUsers: number;
}

export const WorkshopMonitoring: React.FC<WorkshopMonitoringProps> = ({ stats, totalUsers }) => {
  return (
    <div className="grid gap-4">
      {stats.map((workshop) => {
        const completionPercentage = (workshop.unique_users / totalUsers) * 100;
        
        return (
          <Card key={workshop.workshop_id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{workshop.workshop_title}</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{completionPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={completionPercentage} />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span>{workshop.unique_users} users completed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>{workshop.total_completions} total completions</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
