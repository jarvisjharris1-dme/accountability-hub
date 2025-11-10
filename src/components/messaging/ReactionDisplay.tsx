import { useState } from 'react';
import { MessageReaction } from '@/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ReactionDisplayProps {
  reactions: MessageReaction[];
  onReactionClick: (emoji: string) => void;
}

export function ReactionDisplay({ reactions, onReactionClick }: ReactionDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
        <Popover key={emoji} open={showDetails} onOpenChange={setShowDetails}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs rounded-full"
              onClick={() => onReactionClick(emoji)}
            >
              <span className="mr-1">{emoji}</span>
              <span>{reactionList.length}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Reacted with {emoji}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {reactionList.map((reaction) => (
                  <div key={reaction.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reaction.user_avatar} />
                      <AvatarFallback>{reaction.user_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{reaction.user_name}</span>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
