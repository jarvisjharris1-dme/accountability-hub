import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CreateGroupDialog } from './CreateGroupDialog';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isGroup: boolean;
  memberCount?: number;
}

interface ConversationListProps {
  onSelectConversation: (id: string, name: string, avatar?: string, isGroup?: boolean) => void;
  selectedId?: string;
}

export function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  const loadConversations = async () => {
    if (!user?.id) return;

    // Load 1-on-1 conversations
    const { data: messages } = await supabase
      .from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name, avatar)')  // ✅ FIXED: Changed avatar_url to avatar
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Load group conversations
    const { data: groupMembers } = await supabase
      .from('group_members')
      .select('*, groups(*)')
      .eq('user_id', user.id);

    const conversationMap = new Map<string, Conversation>();

    // Process 1-on-1 messages
    messages?.forEach(msg => {
      const isOwn = msg.sender_id === user.id;
      const partnerId = isOwn ? msg.recipient_id : msg.sender_id;
      
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          id: partnerId,
          name: msg.profiles?.full_name || 'Unknown',
          avatar: msg.profiles?.avatar,  // ✅ FIXED: Changed avatar_url to avatar
          lastMessage: msg.content,
          timestamp: msg.created_at,
          unreadCount: 0,
          isGroup: false,
        });
      }
    });

    // Process group conversations
    groupMembers?.forEach(gm => {
      if (gm.groups) {
        conversationMap.set(gm.groups.id, {
          id: gm.groups.id,
          name: gm.groups.name,
          avatar: gm.groups.avatar_url,  // Note: This might also need to be changed if groups table uses 'avatar'
          lastMessage: 'Group conversation',
          timestamp: gm.groups.created_at,
          unreadCount: 0,
          isGroup: true,
          memberCount: 0,
        });
      }
    });

    setConversations(Array.from(conversationMap.values()));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Button size="sm" onClick={() => setShowCreateGroup(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Group
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id, conv.name, conv.avatar, conv.isGroup)}
            className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors ${
              selectedId === conv.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative">
              <Avatar>
                <AvatarImage src={conv.avatar} />
                <AvatarFallback>{conv.name[0]}</AvatarFallback>
              </Avatar>
              {conv.isGroup && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Users className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm">{conv.name}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(conv.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              {conv.isGroup && conv.memberCount && (
                <p className="text-xs text-gray-500">{conv.memberCount} members</p>
              )}
            </div>
            {conv.unreadCount > 0 && (
              <Badge variant="default" className="ml-2">{conv.unreadCount}</Badge>
            )}
          </button>
        ))}
      </div>

      {showCreateGroup && (
        <CreateGroupDialog
          onClose={() => setShowCreateGroup(false)}
          onCreated={() => {
            setShowCreateGroup(false);
            loadConversations();
          }}
        />
      )}
    </div>
  );
}
