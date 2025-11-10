import { Button } from '@/components/ui/button';

interface ReactionPickerProps {
  onSelectReaction: (emoji: string) => void;
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function ReactionPicker({ onSelectReaction }: ReactionPickerProps) {
  return (
    <div className="flex gap-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {REACTIONS.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="text-2xl hover:scale-125 transition-transform"
          onClick={() => onSelectReaction(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );
}
