import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  completed_at?: string;
}

interface MilestoneItemProps {
  milestone: Milestone;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function MilestoneItem({ milestone, onToggle, onDelete }: MilestoneItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={milestone.completed}
        onCheckedChange={(checked) => onToggle(milestone.id, checked as boolean)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <h4 className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
          {milestone.title}
        </h4>
        {milestone.description && (
          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
        )}
        {milestone.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3" />
            <span>Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(milestone.id)}
        className="h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
