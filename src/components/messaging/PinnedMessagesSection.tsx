import { Message } from '@/types';
import { Pin, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PinnedMessagesSectionProps {
  pinnedMessages: Message[];
  onUnpin: (messageId: string) => void;
  onNavigate: (messageId: string) => void;
}

export function PinnedMessagesSection({ pinnedMessages, onUnpin, onNavigate }: PinnedMessagesSectionProps) {
  if (pinnedMessages.length === 0) return null;

  return (
    <div className="border-b bg-amber-50 dark:bg-amber-950/20 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Pin className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
          Pinned Messages ({pinnedMessages.length})
        </span>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {pinnedMessages.map((msg) => (
          <Card key={msg.id} className="p-2 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => onNavigate(msg.id)}>
            <div className="flex items-start gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={msg.sender_avatar} />
                <AvatarFallback>{msg.sender_name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{msg.sender_name}</span>
                  {msg.message_type === 'voice' && <Badge variant="secondary" className="text-xs">Voice</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{msg.content || 'Voice message'}</p>
                {msg.pin_note && <p className="text-xs text-amber-700 dark:text-amber-400 italic mt-1">{msg.pin_note}</p>}
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); onUnpin(msg.id); }}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
