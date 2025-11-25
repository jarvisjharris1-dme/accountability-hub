import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Loader, MessageCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  circle_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

interface CircleChatProps {
  circleId: string;
  circleName?: string;
}

export function CircleChat({ circleId, circleName }: CircleChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    setupRealtimeSubscription();
  }, [circleId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // Load messages first
      const { data: messagesData, error: messagesError } = await supabase
        .from('circle_chat_messages')
        .select('*')
        .eq('circle_id', circleId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (messagesError) throw messagesError;

      // Load sender info for all unique senders
      if (messagesData && messagesData.length > 0) {
        const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar')
          .in('id', senderIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const formattedMessages = messagesData.map(msg => {
          const sender = profilesData?.find(p => p.id === msg.sender_id);
          return {
            id: msg.id,
            circle_id: msg.circle_id,
            sender_id: msg.sender_id,
            message: msg.message,
            created_at: msg.created_at,
            sender_name: sender?.full_name || 'Unknown User',
            sender_avatar: sender?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`
          };
        });

        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`circle-chat-${circleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'circle_chat_messages',
          filter: `circle_id=eq.${circleId}`
        },
        async (payload) => {
          // Load sender info for new message
          const { data: senderData } = await supabase
            .from('profiles')
            .select('full_name, avatar')
            .eq('id', payload.new.sender_id)
            .single();

          const newMsg: ChatMessage = {
            id: payload.new.id,
            circle_id: payload.new.circle_id,
            sender_id: payload.new.sender_id,
            message: payload.new.message,
            created_at: payload.new.created_at,
            sender_name: senderData?.full_name || 'Unknown User',
            sender_avatar: senderData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.sender_id}`
          };

          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user?.id) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('circle_chat_messages')
        .insert({
          circle_id: circleId,
          sender_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const isOwnMessage = (senderId: string) => senderId === user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#1a2332] mx-auto mb-2" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b bg-gradient-to-r from-[#1a2332] to-[#2d3e50] text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">{circleName || 'Circle Chat'}</h3>
            <p className="text-sm text-gray-300">Stay connected with your circle</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
            <p className="text-gray-500 max-w-md">
              Start the conversation! Share your progress, ask for support, or just say hello.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${isOwnMessage(msg.sender_id) ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={msg.sender_avatar}
                    alt={msg.sender_name}
                    className="w-8 h-8 rounded-full"
                  />
                </div>

                {/* Message */}
                <div className={`flex flex-col ${isOwnMessage(msg.sender_id) ? 'items-end' : 'items-start'} max-w-md`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {isOwnMessage(msg.sender_id) ? 'You' : msg.sender_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage(msg.sender_id)
                        ? 'bg-[#1a2332] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332] disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-[#1a2332] text-white px-6 py-2 rounded-lg hover:bg-[#2d3e50] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
