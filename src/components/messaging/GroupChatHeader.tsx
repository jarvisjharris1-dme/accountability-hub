import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, Phone, Image } from 'lucide-react';
import { Group, GroupMember } from '@/types';

interface GroupChatHeaderProps {
  group?: Group;
  recipientName?: string;
  recipientAvatar?: string;
  members?: GroupMember[];
  isTyping: boolean;
  onSettings?: () => void;
  onCall?: () => void;
  onMediaGallery?: () => void;
}

export function GroupChatHeader({ 
  group, 
  recipientName, 
  recipientAvatar, 
  members, 
  isTyping,
  onSettings,
  onCall,
  onMediaGallery 
}: GroupChatHeaderProps) {
  const isGroup = !!group;
  const displayName = group?.name || recipientName || 'Chat';
  
  return (
    <div className="p-4 border-b bg-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={group?.avatar_url || recipientAvatar} />
          <AvatarFallback>{displayName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{displayName}</h3>
          {isGroup && members && (
            <p className="text-xs text-gray-500">{members.length} members</p>
          )}
          {isTyping && <p className="text-xs text-gray-500">typing...</p>}
        </div>
      </div>
      {isGroup && (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={onCall}><Phone className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onMediaGallery}><Image className="w-4 h-4" /></Button>
          <Button size="icon" variant="ghost" onClick={onSettings}><Settings className="w-4 h-4" /></Button>
        </div>
      )}
    </div>
  );
}
