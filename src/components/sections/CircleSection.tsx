// CircleSection.tsx - Complete with Invite Feature
// Add this to your CircleSection component

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { UserPlus, Send, X, MessageCircle, Users } from 'lucide-react';

export function CircleSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'chat'>('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Load circle members
  useEffect(() => {
    if (user?.id) {
      loadCircleMembers();
    }
  }, [user]);

  const loadCircleMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          *,
          member:profiles!member_id(id, full_name, avatar, city, state)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setCircleMembers(data || []);
    } catch (error) {
      console.error('Error loading circle members:', error);
    }
  };

  // Send invitation
  const handleSendInvitation = async () => {
    if (!inviteEmail.trim() || !user?.id) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('circle_invitations')
        .insert({
          inviter_id: user.id,
          invitee_email: inviteEmail.trim(),
          message: inviteMessage.trim() || null,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      alert('✅ Invitation sent! They will receive an email with your invitation.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Accountability Circle</h1>
            <p className="text-gray-300">
              Build meaningful connections and stay accountable together
            </p>
          </div>
          
          {/* ✅ PROMINENT INVITE BUTTON */}
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-white text-[#1a2332] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
          >
            <UserPlus className="w-5 h-5" />
            Invite to Circle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-[#1a2332] mb-1">
            {circleMembers.length}
          </div>
          <div className="text-sm text-gray-600">Circle Members</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-3xl font-bold text-[#1a2332] mb-1">
            {messages.length}
          </div>
          <div className="text-sm text-gray-600">Messages Sent</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
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
              className={`flex items-center gap-2 px-6 py-3 font-medium ${
                activeTab === 'chat'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'members' && (
            <div className="space-y-4">
              {circleMembers.length > 0 ? (
                circleMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={member.member?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.member_id}`}
                      alt={member.member?.full_name || 'Member'}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {member.member?.full_name || 'Unknown Member'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {member.member?.city && member.member?.state
                          ? `${member.member.city}, ${member.member.state}`
                          : 'Location not set'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No members yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start building your accountability circle by inviting people you trust
                  </p>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 bg-[#1a2332] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3e50] transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    Invite Your First Member
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                Chat feature coming soon!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ INVITE MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Invite to Your Circle
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={sending}
                />
              </div>

              {/* Personal Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hey! I'd love for you to join my accountability circle..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  disabled={sending}
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>They'll receive:</strong>
                  <br />
                  • Email invitation with your personal message
                  • In-app notification
                  • Link to accept and join your circle
                </p>
              </div>

              {/* Action Buttons */}
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
                  className="flex-1 px-4 py-3 bg-[#1a2332] text-white rounded-lg hover:bg-[#2d3e50] font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
