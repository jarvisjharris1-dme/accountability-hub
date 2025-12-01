// CircleSection.tsx - Chat Tab with Auto-Updates
// Using CORRECT table name: circle_chat_messages

import { useState } from 'react';
import { useRealtimePolling } from '@/hooks/useRealtimePolling';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Send } from 'lucide-react';

export function CircleSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  // ✅ Auto-updating chat messages (correct table name)
  const { 
    data: messages, 
    loading: messagesLoading, 
    reload: reloadMessages,
    isPolling 
  } = useRealtimePolling(
    () => supabase
      .from('circle_chat_messages')  // ✅ CORRECT
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    { 
      table: 'circle_chat_messages',  // ✅ CORRECT
      pollInterval: 5000,
      enabled: activeTab === 'chat'
    }
  );

  // ✅ Auto-updating circle members
  const { 
    data: circleMembers, 
    reload: reloadMembers 
  } = useRealtimePolling(
    () => supabase
      .from('circle_members')
      .select(`
        *,
        member:profiles!member_id(id, full_name, avatar, city, state)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: false }),
    { 
      table: 'circle_members',
      pollInterval: 15000,
      enabled: activeTab === 'members'
    }
  );

  // ✅ Send message function
  const handleSendMessage = async () => {
    if (!messageContent.trim() || !user?.id) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('circle_chat_messages')  // ✅ CORRECT
        .insert({
          user_id: user.id,
          sender_id: user.id,
          content: messageContent.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessageContent('');
      
      // ✅ Reload messages immediately after sending
      reloadMessages();
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">My Accountability Circle</h1>
        <p className="text-gray-300">
          Build meaningful connections and stay accountable together
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'members'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Members ({circleMembers?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'chat'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chat
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {/* Polling indicator */}
              {isPolling && (
                <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full w-fit">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  Auto-updating every 5 seconds
                </div>
              )}

              {/* Messages */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2332] mx-auto"></div>
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <img
                        src={message.sender?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={message.sender?.full_name || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-gray-900">
                            {message.sender?.full_name || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 pt-4 border-t">
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !messageContent.trim()}
                  className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {circleMembers && circleMembers.length > 0 ? (
                circleMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={member.member?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt={member.member?.full_name || 'Member'}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {member.member?.full_name || 'Unknown'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {member.member?.city && member.member?.state
                          ? `${member.member.city}, ${member.member.state}`
                          : 'Location not set'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No members in your circle yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
