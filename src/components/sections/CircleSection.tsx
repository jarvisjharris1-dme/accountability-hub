import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Users, MessageCircle, Calendar, Plus } from 'lucide-react';
import { CircleChat } from './CircleChat';
import { CheckIns } from './CheckIns';

interface CircleMember {
  id: string;
  member_id: string;
  full_name: string;
  avatar: string;
  status: string;
  joined_at: string;
}

export function CircleSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'chat' | 'checkins'>('members');
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [isCircleOwner, setIsCircleOwner] = useState(false);

  useEffect(() => {
    loadCircleMembers();
  }, [user]);

  const loadCircleMembers = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Load circle members (simplified query without status filter)
      const { data: membersData, error: membersError } = await supabase
        .from('circle_members')
        .select('id, member_id, joined_at')
        .eq('user_id', user.id);

      if (membersError) throw membersError;

      // Load profile info for each member
      if (membersData && membersData.length > 0) {
        const memberIds = membersData.map(m => m.member_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar')
          .in('id', memberIds);

        if (profilesError) throw profilesError;

        // Combine the data
        const formattedMembers = membersData.map(m => {
          const profile = profilesData?.find(p => p.id === m.member_id);
          return {
            id: m.id,
            member_id: m.member_id,
            full_name: profile?.full_name || 'Unknown User',
            avatar: profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.member_id}`,
            status: 'active', // Default to active
            joined_at: m.joined_at || new Date().toISOString()
          };
        });

        setMembers(formattedMembers);
      } else {
        setMembers([]);
      }

      setIsCircleOwner(true); // User owns their circle
    } catch (error) {
      console.error('Error loading circle members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!user?.id || !inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    try {
      setInviting(true);

      // Find user by email
      const { data: inviteeProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', inviteEmail.trim().toLowerCase())
        .maybeSingle(); // ✅ FIXED: Changed from .single() to .maybeSingle()

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        alert('Error looking up user: ' + profileError.message);
        return;
      }

      if (!inviteeProfile) {
        alert('User not found. Please make sure they have an account.');
        return;
      }

      // Check if already in circle
      const { data: existing } = await supabase
        .from('circle_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('member_id', inviteeProfile.id)
        .maybeSingle(); // ✅ FIXED: Changed from .single() to .maybeSingle()

      if (existing) {
        alert('This user is already in your circle');
        return;
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from('circle_invitations')
        .insert({
          inviter_id: user.id,
          invitee_id: inviteeProfile.id,
          recipient_email: inviteEmail.trim().toLowerCase()
        });

      if (inviteError) throw inviteError;

      alert('Invitation sent successfully!');
      setInviteEmail('');
    } catch (error: any) {
      console.error('Error inviting member:', error);
      alert('Error sending invitation: ' + error.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from your circle?')) return;

    try {
      const { error } = await supabase
        .from('circle_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      alert('Member removed from circle');
      loadCircleMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      alert('Error removing member: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading circle...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-[#1a2332] border-b-2 border-[#1a2332]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-[#1a2332] border-b-2 border-[#1a2332]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('checkins')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'checkins'
                ? 'text-[#1a2332] border-b-2 border-[#1a2332]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Check-Ins
          </button>
        </div>

        <div className="p-6">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Invite Member */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-[#1a2332] mb-3">Invite to Circle</h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                  <button
                    onClick={handleInviteMember}
                    disabled={inviting}
                    className="bg-[#1a2332] text-white px-6 py-2 rounded-md hover:bg-[#2d3e50] disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {inviting ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
              </div>

              {/* Members List */}
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Members Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Start building your circle by inviting members above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={member.avatar}
                          alt={member.full_name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {member.full_name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="w-full text-sm text-red-600 hover:text-red-800 py-2 border border-red-200 rounded hover:bg-red-50"
                      >
                        Remove from Circle
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <CircleChat 
              circleId={user?.id || ''} 
              circleName="My Circle"
            />
          )}

          {/* Check-Ins Tab */}
          {activeTab === 'checkins' && (
            <CheckIns 
              circleId={user?.id || ''} 
              isOwner={isCircleOwner}
            />
          )}
        </div>
      </div>
    </div>
  );
}
