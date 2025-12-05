// CircleSection.tsx - Fixed to work WITHOUT user_id in circle_chat_messages
// This version queries by circle membership instead

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  UserPlus, 
  Send, 
  X, 
  MessageCircle, 
  Users, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function CircleSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'checkins' | 'support'>('members');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Data State
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Chat State
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Check-in State
  const [checkInText, setCheckInText] = useState('');
  const [checkInMood, setCheckInMood] = useState<'great' | 'good' | 'okay' | 'struggling' | null>(null);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  
  // Support Request State
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportCategory, setSupportCategory] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [submittingSupportRequest, setSubmittingSupportRequest] = useState(false);

  // Load profiles separately
  const loadProfiles = async (userIds: string[]) => {
    if (!userIds.length) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar, city, state')
        .in('id', userIds);

      if (error) {
        console.error('Error loading profiles:', error);
        return;
      }

      const profileMap: Record<string, any> = {};
      data?.forEach((profile) => {
        profileMap[profile.id] = profile;
      });
      setProfiles(prev => ({ ...prev, ...profileMap }));
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };

  // Load circle members
  const loadCircleMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      
      setCircleMembers(data || []);
      
      // Load profiles for members
      if (data && data.length > 0) {
        const memberIds = data.map(m => m.member_id);
        await loadProfiles(memberIds);
      }
    } catch (error: any) {
      console.error('Error loading circle members:', error);
    }
  };

  // Load messages - UPDATED to work without user_id
  const loadMessages = async () => {
    try {
      // Get all member IDs in the circle
      const memberIds = circleMembers.map(m => m.member_id);
      const allUserIds = [user?.id, ...memberIds].filter(Boolean);
      
      if (allUserIds.length === 0) {
        setMessages([]);
        return;
      }

      // Query messages from anyone in the circle
      const { data, error } = await supabase
        .from('circle_chat_messages')
        .select('*')
        .in('sender_id', allUserIds)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setMessages(data || []);
      
      // Load profiles for senders
      if (data && data.length > 0) {
        const senderIds = [...new Set(data.map(m => m.sender_id))];
        await loadProfiles(senderIds);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  // Load check-ins
  const loadCheckIns = async () => {
    if (!circleMembers || circleMembers.length === 0) {
      setCheckIns([]);
      return;
    }
    
    try {
      const memberIds = circleMembers.map(m => m.member_id);
      const allUserIds = [user?.id, ...memberIds];
      
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .in('user_id', allUserIds)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setCheckIns(data || []);
      
      // Load profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        await loadProfiles(userIds);
      }
    } catch (error: any) {
      console.error('Error loading check-ins:', error);
    }
  };

  // Load support requests
  const loadSupportRequests = async () => {
    if (!circleMembers || circleMembers.length === 0) {
      setSupportRequests([]);
      return;
    }
    
    try {
      const memberIds = circleMembers.map(m => m.member_id);
      
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .in('user_id', memberIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSupportRequests(data || []);
      
      // Load profiles
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(s => s.user_id))];
        await loadProfiles(userIds);
      }
    } catch (error: any) {
      console.error('Error loading support requests:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      loadCircleMembers().finally(() => setLoading(false));
    }
  }, [user?.id]);

  // Load tab-specific data
  useEffect(() => {
    if (!user?.id) return;
    
    if (activeTab === 'chat') {
      loadMessages();
    } else if (activeTab === 'checkins') {
      loadCheckIns();
    } else if (activeTab === 'support') {
      loadSupportRequests();
    }
  }, [activeTab, circleMembers]);

  // Auto-refresh
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      if (activeTab === 'members') {
        loadCircleMembers();
      } else if (activeTab === 'chat') {
        loadMessages();
      } else if (activeTab === 'checkins') {
        loadCheckIns();
      } else if (activeTab === 'support') {
        loadSupportRequests();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab, user?.id, circleMembers]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Helper to get profile
  const getProfile = (userId: string) => {
    return profiles[userId] || {
      full_name: 'Unknown User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      city: '',
      state: ''
    };
  };

  // Send Invitation
  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !user?.id) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('circle_invitations')
        .insert({
          inviter_id: user.id,
          invitee_email: inviteEmail.trim(),
          message: inviteMessage.trim() || null,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      alert('✅ Invitation sent!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteMessage('');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  // Send Chat Message - UPDATED to work without user_id
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    setSendingMessage(true);
    try {
      // Insert message with only sender_id (no user_id)
      const { error } = await supabase
        .from('circle_chat_messages')
        .insert({
          sender_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewMessage('');
      await loadMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Submit Check-in
  const handleSubmitCheckIn = async () => {
    if (!checkInText.trim() || !checkInMood || !user?.id) return;

    setSubmittingCheckIn(true);
    try {
      const { error } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          content: checkInText.trim(),
          mood: checkInMood,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('✅ Check-in submitted!');
      setCheckInText('');
      setCheckInMood(null);
      await loadCheckIns();
    } catch (error: any) {
      console.error('Error submitting check-in:', error);
      alert('Failed to submit check-in: ' + error.message);
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  // Submit Support Request
  const handleSubmitSupportRequest = async () => {
    if (!supportCategory || !supportMessage.trim() || !user?.id) return;

    setSubmittingSupportRequest(true);
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: user.id,
          category: supportCategory,
          message: supportMessage.trim(),
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('✅ Support request sent!');
      setShowSupportModal(false);
      setSupportCategory('');
      setSupportMessage('');
      await loadSupportRequests();
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      alert('Failed to submit support request: ' + error.message);
    } finally {
      setSubmittingSupportRequest(false);
    }
  };

  // Mood emoji helper
  const getMoodEmoji = (mood: string) => {
    const moods: Record<string, string> = {
      great: '😄',
      good: '🙂',
      okay: '😐',
      struggling: '😔'
    };
    return moods[mood] || '🙂';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Accountability Circle</h1>
            <p className="text-gray-300">
              Build meaningful connections and stay accountable together
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              Need Support?
            </button>
            
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-white text-[#1a2332] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Invite to Circle
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-[#1a2332] mb-1">{circleMembers.length}</div>
          <div className="text-sm text-gray-600">Circle Members</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-[#1a2332] mb-1">{messages.length}</div>
          <div className="text-sm text-gray-600">Messages</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-[#1a2332] mb-1">{checkIns.length}</div>
          <div className="text-sm text-gray-600">Check-ins</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-[#1a2332] mb-1">{supportRequests.length}</div>
          <div className="text-sm text-gray-600">Support Requests</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'members'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Members ({circleMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('checkins')}
              className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'checkins'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Check-ins
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'support'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Support
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {circleMembers.length > 0 ? (
                circleMembers.map((member) => {
                  const profile = getProfile(member.member_id);
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.full_name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{profile.full_name}</h4>
                        <p className="text-sm text-gray-600">
                          {profile.city && profile.state
                            ? `${profile.city}, ${profile.state}`
                            : 'Location not set'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start building your accountability circle
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 bg-[#1a2332] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3e50]"
                  >
                    <UserPlus className="w-5 h-5" />
                    Invite Your First Member
                  </button>
                </div>
              )}
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="h-96 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const sender = getProfile(message.sender_id);
                    return (
                      <div key={message.id} className="flex items-start gap-3">
                        <img
                          src={sender.avatar}
                          alt={sender.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-gray-900">{sender.full_name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1">{message.content}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={sendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-[#1a2332] text-white px-6 py-3 rounded-lg hover:bg-[#2d3e50] disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* CHECK-INS TAB */}
          {activeTab === 'checkins' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">How are you doing today?</h3>
                
                <div className="flex gap-3 flex-wrap">
                  {(['great', 'good', 'okay', 'struggling'] as const).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setCheckInMood(mood)}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        checkInMood === mood
                          ? 'bg-[#1a2332] text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {getMoodEmoji(mood)} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </button>
                  ))}
                </div>

                <textarea
                  value={checkInText}
                  onChange={(e) => setCheckInText(e.target.value)}
                  placeholder="Share what's on your mind..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={submittingCheckIn}
                />

                <button
                  onClick={handleSubmitCheckIn}
                  disabled={!checkInText.trim() || !checkInMood || submittingCheckIn}
                  className="w-full bg-[#1a2332] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3e50] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingCheckIn ? 'Submitting...' : 'Submit Check-in'}
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Recent Check-ins</h3>
                {checkIns.length > 0 ? (
                  checkIns.map((checkIn) => {
                    const profile = getProfile(checkIn.user_id);
                    return (
                      <div key={checkIn.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={profile.avatar}
                            alt={profile.full_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{profile.full_name}</span>
                              <span className="text-2xl">{getMoodEmoji(checkIn.mood)}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(checkIn.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{checkIn.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No check-ins yet. Be the first to share!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div className="space-y-4">
              {supportRequests.length > 0 ? (
                supportRequests.map((request) => {
                  const profile = getProfile(request.user_id);
                  return (
                    <div key={request.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={profile.avatar}
                          alt={profile.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{profile.full_name}</span>
                            <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded-full">
                              {request.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(request.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{request.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No active support requests
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Invite to Your Circle</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={sending}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personal Message (Optional)</label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hey! I'd love for you to join my accountability circle..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={sending}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>They'll receive:</strong><br />
                  • Email invitation<br />
                  • In-app notification<br />
                  • Link to join
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvitation}
                  disabled={!inviteEmail.trim() || sending}
                  className="flex-1 px-4 py-3 bg-[#1a2332] text-white rounded-lg hover:bg-[#2d3e50] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? 'Sending...' : 'Send Invitation'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Request Support</h2>
              <button onClick={() => setShowSupportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={supportCategory}
                  onChange={(e) => setSupportCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={submittingSupportRequest}
                >
                  <option value="">Select a category</option>
                  <option value="motivation">Need Motivation</option>
                  <option value="accountability">Breaking Commitment</option>
                  <option value="advice">Need Advice</option>
                  <option value="struggle">Personal Struggle</option>
                  <option value="celebration">Want to Celebrate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Tell your circle what you need..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={submittingSupportRequest}
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Your circle will be notified immediately.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSupportModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={submittingSupportRequest}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitSupportRequest}
                  disabled={!supportCategory || !supportMessage.trim() || submittingSupportRequest}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingSupportRequest ? 'Sending...' : 'Send Request'}
                  <AlertCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

