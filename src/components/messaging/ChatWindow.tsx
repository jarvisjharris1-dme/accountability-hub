import { useState, useEffect, useRef } from 'react';
import { Message, Group, GroupMember } from '@/types';
import { MessageBubble } from './MessageBubble';
import { VoiceRecorder } from './VoiceRecorder';
import { ReplyPreview } from './ReplyPreview';
import { PinnedMessagesSection } from './PinnedMessagesSection';
import { GroupChatHeader } from './GroupChatHeader';
import { MentionAutocomplete } from './MentionAutocomplete';
import { GroupSettingsDialog } from './GroupSettingsDialog';
import { MediaGallery } from './MediaGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ChatWindowProps {
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  groupId?: string;
  highlightMessageId?: string;
  searchQuery?: string;
}

export function ChatWindow({ recipientId, recipientName, recipientAvatar, groupId, highlightMessageId, searchQuery }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadMessages();
    if (groupId) {
      loadGroupData();
    }
  }, [recipientId, groupId, user?.id]);

  const loadGroupData = async () => {
    if (!groupId) return;
    
    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupData) setGroup(groupData);

    const { data: membersData } = await supabase
      .from('group_members')
      .select('*, profiles(full_name, avatar_url)')
      .eq('group_id', groupId);
    
    if (membersData) setMembers(membersData);
  };

  const loadMessages = async () => {
    let query = supabase.from('messages').select('*');
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    } else if (recipientId) {
      query = query.or(`and(sender_id.eq.${user?.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user?.id})`);
    }
    
    const { data } = await query.order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const detectMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    const lastWord = value.split(' ').pop() || '';
    if (lastWord.startsWith('@') && groupId) {
      setShowMentions(true);
      setMentionQuery(lastWord.substring(1));
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (userName: string) => {
    const words = newMessage.split(' ');
    words[words.length - 1] = `@${userName} `;
    setNewMessage(words.join(' '));
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const mentions = groupId ? detectMentions(newMessage) : [];

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: groupId ? null : recipientId,
      group_id: groupId || null,
      content: newMessage.trim(),
      mentions,
      reply_to_message_id: replyingTo?.id || null,
    });

    if (!error) {
      setNewMessage('');
      setReplyingTo(null);
      loadMessages();
    }
  };

  const startVoiceCall = () => {
    alert('Voice call feature coming soon with Twilio integration');
  };

  return (
    <div className="flex flex-col h-full">
      {groupId && group ? (
        <GroupChatHeader
          group={group}
          members={members}
          onSettingsClick={() => setShowSettings(true)}
          onMediaClick={() => setShowMediaGallery(true)}
          onVoiceCallClick={startVoiceCall}
        />
      ) : (
        <div className="p-4 border-b bg-white flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            {isTyping && <p className="text-xs text-gray-500">typing...</p>}
          </div>
          <Button size="icon" variant="ghost" onClick={startVoiceCall}>
            <Phone className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id}
            message={msg} 
            isOwn={msg.sender_id === user?.id}
            searchQuery={searchQuery}
            onAddReaction={() => {}}
            onRemoveReaction={() => {}}
            onReply={setReplyingTo}
            onNavigateToReply={() => {}}
            onPin={() => {}}
            onUnpin={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isRecording ? (
        <VoiceRecorder 
          onSend={async () => {}}
          onCancel={() => setIsRecording(false)}
        />
      ) : (
        <form onSubmit={sendMessage} className="p-4 border-t bg-white relative">
          {replyingTo && (
            <ReplyPreview 
              message={replyingTo} 
              onCancel={() => setReplyingTo(null)} 
            />
          )}
          {showMentions && groupId && (
            <MentionAutocomplete
              members={members}
              query={mentionQuery}
              onSelect={handleMentionSelect}
              onClose={() => setShowMentions(false)}
            />
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder={groupId ? "Type a message... (use @ to mention)" : "Type a message..."}
              className="flex-1"
            />
            <Button type="button" size="icon" variant="outline" onClick={() => setIsRecording(true)}>
              <Mic className="w-4 h-4" />
            </Button>
            <Button type="submit" size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {showSettings && groupId && (
        <GroupSettingsDialog
          group={group!}
          onClose={() => setShowSettings(false)}
          onUpdate={loadGroupData}
        />
      )}

      {showMediaGallery && groupId && (
        <MediaGallery
          groupId={groupId}
          onClose={() => setShowMediaGallery(false)}
        />
      )}
    </div>
  );
}
