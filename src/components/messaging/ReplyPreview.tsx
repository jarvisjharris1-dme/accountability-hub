import { X } from 'lucide-react';
import { Message } from '@/types';

interface ReplyPreviewProps {
  message: Message;
  onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  return (
    <div className="bg-purple-50 border-l-4 border-purple-500 p-3 flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-purple-700 mb-1">
          Replying to {message.sender_name}
        </div>
        <div className="text-sm text-gray-600 truncate">
          {message.message_type === 'voice' ? '🎤 Voice message' : message.content}
        </div>
      </div>
      <button
        onClick={onCancel}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
