import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, Calendar } from 'lucide-react';

interface Circle {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  member_count: number;
  message_count: number;
  creator_name: string;
}

interface CircleManagementTableProps {
  circles: Circle[];
}

export const CircleManagementTable: React.FC<CircleManagementTableProps> = ({ circles }) => {
  return (
    <div className="grid gap-4">
      {circles.map((circle) => (
        <Card key={circle.id} className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{circle.name}</h3>
              <p className="text-sm text-muted-foreground">Created by {circle.creator_name}</p>
            </div>
            <Badge variant="secondary">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(circle.created_at).toLocaleDateString()}
            </Badge>
          </div>
          {circle.description && (
            <p className="text-sm text-muted-foreground mb-3">{circle.description}</p>
          )}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span>{circle.member_count} members</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>{circle.message_count} messages</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
