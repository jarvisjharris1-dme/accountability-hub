import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FlaggedContent {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description?: string;
  status: string;
  created_at: string;
  reporter_name: string;
}

interface ContentModerationProps {
  flaggedItems: FlaggedContent[];
  onUpdate: () => void;
}

export const ContentModeration: React.FC<ContentModerationProps> = ({ flaggedItems, onUpdate }) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const resolveFlag = async (id: string, status: 'resolved' | 'dismissed') => {
    setLoading(id);
    try {
      const { error } = await supabase
        .from('flagged_content')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          resolution_notes: notes[id] || null,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Content ${status} successfully`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update content status');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {flaggedItems.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{item.content_type}</Badge>
                <Badge variant={item.status === 'pending' ? 'destructive' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
              <p className="text-sm font-medium mb-1">Reason: {item.reason}</p>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Reported by {item.reporter_name} on {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {item.status === 'pending' && (
            <div className="space-y-2">
              <Textarea
                placeholder="Resolution notes (optional)"
                value={notes[item.id] || ''}
                onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => resolveFlag(item.id, 'resolved')}
                  disabled={loading === item.id}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resolveFlag(item.id, 'dismissed')}
                  disabled={loading === item.id}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
