import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { highlightText, getMessageContext } from '@/utils/highlightText';

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  recipient_id: string;
  recipient_name: string;
}

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  currentUserId: string;
  onSelect: (userId: string) => void;
}

export function SearchResultItem({ result, query, currentUserId, onSelect }: SearchResultItemProps) {
  const isOwn = result.sender_id === currentUserId;
  const otherUserId = isOwn ? result.recipient_id : result.sender_id;
  const otherUserName = isOwn ? result.recipient_name : result.sender_name;
  const otherUserAvatar = result.sender_avatar;

  const context = getMessageContext(result.content, query, 60);
  const highlightedContent = highlightText(context, query);

  const date = new Date(result.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <Card 
      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onSelect(otherUserId)}
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={otherUserAvatar} />
          <AvatarFallback>{otherUserName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <span className="font-semibold text-sm">{otherUserName}</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
          <p 
            className="text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </div>
      </div>
    </Card>
  );
}
