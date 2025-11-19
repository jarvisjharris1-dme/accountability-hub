import { useState, useEffect, useRef, useCallback } from 'react';
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

interface MessageInsert {
  sender_id: string;
  content: string;
  recipient_id?: string;
  group_id?: string;
  reply_to_message_id?: string;
}

export function ChatWindow({ 
  recipientId, 
  recipientName, 
  recipientAvatar, 
  groupId, 
  highlightMessageId, 
  searchQuery 
}: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldScrollRef = useRef(true);

  const scrollToBottom = useCallback((force = false) => {
    if (force || shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Auto-scroll if within 100px of bottom
    shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  const scrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-message');
      setTimeout(() => element.classList.remove('highlight-message'), 2000);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!user) return;
    
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(full_name, avatar)
      `);
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    } else if (recipientId) {
      query = query.or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
      );
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
    } else if (data) {
      // Transform data to flatten profile info for MessageBubble
      const transformedMessages = data.map(msg => ({
        ...msg,
        sender_name: msg.sender?.full_name || 'Unknown',
        sender_avatar: msg.sender?.avatar || '',
      }));
      setMessages(transformedMessages);
    }
  }, [user, groupId, recipientId]);

  const loadGroupData = useCallback(async () => {
    if (!groupId) return;
    
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (groupError) {
      console.error('Error loading group:', groupError);
    } else if (groupData) {
      setGroup(groupData);
    }

    const { data: membersData, error: membersError } = await supabase
      .from('group_members')
      .select('*, profiles(full_name, avatar)')
      .eq('group_id', groupId);
    
    if (membersError) {
      console.error('Error loading members:', membersError);
    } else if (membersData) {
      setMembers(membersData);
    }
  }, [groupId]);

  // Load initial data
  useEffect(() => {
    loadMessages();
    if (groupId) {
      loadGroupData();
    }
  }, [loadMessages, loadGroupData, groupId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channelFilter = groupId 
      ? `group_id=eq.${groupId}`
      : recipientId 
        ? `or(and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id}))`
        : null;

    if (!channelFilter) return;

    const channel = supabase
      .channel(`messages-${groupId || recipientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: channelFilter
        },
        () => {
          // Reload messages to get joined profile data
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, groupId, recipientId, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle highlight message on mount
  useEffect(() => {
    if (highlightMessageId && messages.length > 0) {
      setTimeout(() => scrollToMessage(highlightMessageId), 100);
    }
  }, [highlightMessageId, messages, scrollToMessage]);

  // Filter messages by search query
  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

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

    const messageData: MessageInsert = {
      sender_id: user.id,
      content: newMessage.trim(),
    };

    if (recipientId) {
      messageData.recipient_id = recipientId;
    }
    if (groupId) {
      messageData.group_id = groupId;
    }
    if (replyingTo?.id) {
      messageData.reply_to_message_id = replyingTo.id;
    }

    const { error } = await supabase.from('messages').insert(messageData);

    if (!error) {
      setNewMessage('');
      setReplyingTo(null);
      shouldScrollRef.current = true;
      scrollToBottom(true);
    } else {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    }
  };

  const handleVoiceRecording = (audioBlob: Blob) => {
    // Handle voice recording upload
    console.log('Voice recording received:', audioBlob);
    setIsRecording(false);
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji
      });
    
    if (error) {
      console.error('Error adding reaction:', error);
    } else {
      loadMessages();
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);
    
    if (error) {
      console.error('Error removing reaction:', error);
    } else {
      loadMessages();
    }
  };

  const handlePinMessage = async (messageId: string, note?: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: true, pin_note: note })
      .eq('id', messageId);
    
    if (error) {
      console.error('Error pinning message:', error);
    } else {
      loadMessages();
    }
  };

  const handleUnpinMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_pinned: false, pin_note: null })
      .eq('id', messageId);
    
    if (error) {
      console.error('Error unpinning message:', error);
    } else {
      loadMessages();
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ 
        content: newContent, 
        edited_at: new Date().toISOString() 
      })
      .eq('id', messageId);
    
    if (error) {
      console.error('Error editing message:', error);
    } else {
      loadMessages();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
    
    if (error) {
      console.error('Error deleting message:', error);
    } else {
      loadMessages();
    }
  };

  const startVoiceCall = () => {
    alert('Voice call feature coming soon with Twilio integration');
  };

  const pinnedMessages = messages.filter(msg => msg.is_pinned);

  if (!recipientId && !groupId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a conversation to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {groupId && group ? (
        <GroupChatHeader
          group={group}
          members={members}
          onSettingsClick={() => setShowSettings(true)}
          onMediaClick={() => setShowMediaGallery(true)}
          onCallClick={startVoiceCall}
        />
      ) : (
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {recipientAvatar && (
              <img 
                src={recipientAvatar} 
                alt={recipientName} 
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <h2 className="font-semibold">{recipientName}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={startVoiceCall}>
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <PinnedMessagesSection 
          messages={pinnedMessages} 
          onMessageClick={scrollToMessage}
        />
      )}

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {filteredMessages.map((message) => (
          <div key={message.id} id={`message-${message.id}`}>
            <MessageBubble
              message={message}
              isOwn={message.sender_id === user?.id}
              searchQuery={searchQuery}
              onReply={() => setReplyingTo(message)}
              onAddReaction={(messageId, emoji) => handleAddReaction(messageId, emoji)}
              onRemoveReaction={(messageId, emoji) => handleRemoveReaction(messageId, emoji)}
              onPin={(messageId, note) => handlePinMessage(messageId, note)}
              onUnpin={(messageId) => handleUnpinMessage(messageId)}
              onEdit={(messageId, newContent) => handleEditMessage(messageId, newContent)}
              onDelete={(messageId) => handleDeleteMessage(messageId)}
              onNavigateToReply={scrollToMessage}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <ReplyPreview 
          message={replyingTo} 
          onCancel={() => setReplyingTo(null)} 
        />
      )}

      {/* Mention Autocomplete */}
      {showMentions && (
        <MentionAutocomplete
          members={members}
          query={mentionQuery}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentions(false)}
        />
      )}

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <VoiceRecorder 
              onComplete={handleVoiceRecording}
              onCancel={() => setIsRecording(false)}
            />
          ) : (
            <>
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon"
                onClick={() => setIsRecording(true)}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </form>

      {/* Dialogs */}
      {showSettings && group && (
        <GroupSettingsDialog
          group={group}
          members={members}
          open={showSettings}
          onOpenChange={setShowSettings}
          onUpdate={loadGroupData}
        />
      )}

      {showMediaGallery && (
        <MediaGallery
          messages={messages}
          open={showMediaGallery}
          onOpenChange={setShowMediaGallery}
        />
      )}
    </div>
  );
}
