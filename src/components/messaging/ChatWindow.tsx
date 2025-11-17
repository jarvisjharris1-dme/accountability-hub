
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
      .select('*, profiles(full_name, avatar)')
      .eq('group_id', groupId);
    
    if (membersData) setMembers(membersData);
  };

  const loadMessages = async () => {
    if (!user) return;
    
    let query = supabase.from('messages').select('*');
    
    if (groupId) {
      query = query.eq('group_id', groupId);
    } else if (recipientId) {
      query = query.or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
    } else if (data) {
      setMessages(data);
    }
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

    // Build message data with ALL required fields
    const messageData: any = {
      sender_id: user.id,
      content: newMessage.trim(),
      topic: 'chat',        // REQUIRED - no default
      extension: 'text',    // REQUIRED - no default
    };

    // Add optional fields
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
      loadMessages();
    } else {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
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
          onSettingsClick=
