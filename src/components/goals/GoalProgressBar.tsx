import { Progress } from '@/components/ui/progress';

interface GoalProgressBarProps {
  progress: number;
  showLabel?: boolean;
}

export function GoalProgressBar({ progress, showLabel = true }: GoalProgressBarProps) {
  const getProgressColor = (value: number) => {
    if (value >= 75) return 'bg-green-500';
    if (value >= 50) return 'bg-blue-500';
    if (value >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className={`font-semibold ${progress === 100 ? 'text-green-600' : 'text-foreground'}`}>
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
}
