import { GroupMember } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MentionAutocompleteProps {
  members: GroupMember[];
  query: string;
  onSelect: (userId: string, userName: string) => void;
  position: { top: number; left: number };
}

export function MentionAutocomplete({ members, query, onSelect, position }: MentionAutocompleteProps) {
  const filtered = members.filter(m => 
    m.user_name?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  if (filtered.length === 0) return null;

  return (
    <div 
      className="absolute bg-white border rounded-lg shadow-lg p-2 z-50 w-64"
      style={{ top: position.top, left: position.left }}
    >
      {filtered.map(member => (
        <button
          key={member.user_id}
          onClick={() => onSelect(member.user_id, member.user_name || 'User')}
          className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={member.user_avatar} />
            <AvatarFallback>{member.user_name?.[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{member.user_name}</span>
        </button>
      ))}
    </div>
  );
}
