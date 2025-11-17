import React, { useState, useEffect } from 'react';
import { CircleMemberCard } from '../ui/CircleMemberCard';
import { VerifiedOnlyFeature } from '../VerifiedOnlyFeature';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';


interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  lastActive: string;
  status: 'active' | 'away';
  streak: number;
}

interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  message: string;
  created_at: string;
  sender_name: string;
}

export const CircleSection: React.FC = () => {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCircleMembers();
      loadPendingInvitations();
    }
  }, [user]);

  const loadCircleMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select(`
          id,
          member_id,
          last_active,
          profiles!circle_members_member_id_fkey (
            full_name,
            avatar,
            streak_days
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const formattedMembers = data?.map((item: any) => ({
        id: item.member_id,
        name: item.profiles?.full_name || 'Anonymous',
        avatar: item.profiles?.avatar || '',
        lastActive: new Date(item.last_active).toLocaleDateString(),
        status: isRecent(item.last_active) ? 'active' : 'away',
        streak: item.profiles?.streak_days || 0
      })) || [];

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error loading circle members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('circle_invitations')
        .select(`
          id,
          inviter_id,
          invitee_email,
          message,
          created_at,
          profiles!circle_invitations_inviter_id_fkey (full_name)
        `)
        .eq('invitee_email', user?.email)
        .eq('status', 'pending');

      if (error) throw error;

      const formatted = data?.map((inv: any) => ({
        id: inv.id,
        inviter_id: inv.inviter_id,
        invitee_email: inv.invitee_email,
        message: inv.message,
        created_at: inv.created_at,
        sender_name: inv.profiles?.full_name || 'Someone'
      })) || [];

      setPendingInvites(formatted);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const isRecent = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      const { error } = await supabase
        .from('circle_invitations')
        .insert({
          inviter_id: user?.id,
          invitee_email: inviteEmail.trim(),
          recipient_email: inviteEmail.trim(), // Same as invitee_email
          message: inviteMessage.trim() || 'Join my accountability circle!',
          status: 'pending'
        });

      if (error) throw error;

      alert(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteMessage('');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      alert('Error sending invitation: ' + error.message);
    }
  };


  const handleAcceptInvite = async (invitationId: string, inviterId: string) => {
    try {
      await supabase.from('circle_invitations').update({ 
        status: 'accepted',
        invitee_id: user?.id,
        responded_at: new Date().toISOString()
      }).eq('id', invitationId);

      await supabase.from('circle_members').insert([
        { user_id: inviterId, member_id: user?.id },
        { user_id: user?.id, member_id: inviterId }
      ]);

      loadCircleMembers();
      loadPendingInvitations();
      alert('Invitation accepted! You are now connected.');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      alert('Error accepting invitation: ' + error.message);
    }
  };

  const handleDeclineInvite = async (invitationId: string) => {
    try {
      await supabase.from('circle_invitations')
        .update({ 
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      loadPendingInvitations();
      alert('Invitation declined.');
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      alert('Error declining invitation: ' + error.message);
    }
  };

  const handleMessage = (memberId: string) => {
    alert(`Messaging feature coming soon for member ${memberId}`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading circle...</div>;
  }

  return (
    <div className="space-y-6">
      {pendingInvites.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-[#1a2332] mb-4">Pending Invitations</h3>
          {pendingInvites.map(inv => (
            <div key={inv.id} className="bg-white p-4 rounded-lg mb-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{inv.sender_name} invited you</p>
                <p className="text-sm text-gray-600">{inv.message}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptInvite(inv.id, inv.inviter_id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineInvite(inv.id)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#1a2332] mb-4">My Accountability Circle</h2>
        <p className="text-gray-600 mb-6">
          Connect with 2-3 trusted men who will support your journey.
        </p>

        {members.length > 0 ? (
          <div className="space-y-4 mb-6">
            {members.map(member => (
              <CircleMemberCard key={member.id} member={member} onMessage={handleMessage} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No circle members yet. Invite someone below!</p>
        )}

        <VerifiedOnlyFeature featureName="circle invitations">
          {members.length < 3 && (
            <form onSubmit={handleInvite} className="border-t pt-6">
              <h3 className="font-semibold text-[#1a2332] mb-3">Invite a Member</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4a574]"
                  required
                />
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Personal message (optional)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4a574]"
                  rows={2}
                />
                <button
                  type="submit"
                  className="w-full px-6 py-2 bg-[#d4a574] text-white rounded-lg font-medium hover:bg-[#c49564]"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          )}
        </VerifiedOnlyFeature>

      </div>
    </div>
  );
};
