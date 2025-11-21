import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Ensure these paths exist in your repo structure
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CircleMemberCard } from '@/components/ui/CircleMemberCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus } from 'lucide-react';

interface CircleMember {
  id: string;
  member_id: string;
  member_name: string;
  member_avatar?: string;
  streak_days: number;
}

interface PendingInvite {
  id: string;
  inviter_id: string;
  sender_name: string;
  message: string;
}

// Helper for safely extracting error messages
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export function CircleSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadMembers();
      loadPendingInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadMembers = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('circle_members')
        .select('id, member_id, profiles!circle_members_member_id_fkey(full_name, avatar, streak_days)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading circle members:', error);
      } else if (data) {
        const formattedMembers = data.map((item: any) => ({
          id: item.id,
          member_id: item.member_id,
          // Handle case where profiles might be an array or object depending on Supabase generation
          member_name: Array.isArray(item.profiles) 
            ? item.profiles[0]?.full_name 
            : item.profiles?.full_name || 'Unknown',
          member_avatar: Array.isArray(item.profiles)
            ? item.profiles[0]?.avatar
            : item.profiles?.avatar,
          streak_days: Array.isArray(item.profiles)
            ? item.profiles[0]?.streak_days
            : item.profiles?.streak_days || 0
        }));
        setMembers(formattedMembers);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvitations = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('circle_invitations')
        .select('*, inviter:profiles!circle_invitations_inviter_id_fkey(full_name)')
        .eq('invitee_email', user.email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invitations:', error);
      } else if (data) {
        setPendingInvites(data.map((inv: any) => ({
          id: inv.id,
          inviter_id: inv.inviter_id,
          sender_name: inv.inviter?.full_name || 'Someone',
          message: inv.message || 'Join my accountability circle!'
        })));
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user?.id) return;

    try {
      const { error } = await supabase
        .from('circle_invitations')
        .insert({
          inviter_id: user.id,
          invitee_email: inviteEmail.trim(),
          message: inviteMessage.trim() || 'Join my accountability circle!',
          status: 'pending'
        });

      if (error) throw error;

      alert('Invitation sent successfully!');
      setInviteEmail('');
      setInviteMessage('');
      setShowInviteForm(false);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      console.error('Error sending invitation:', msg);
      alert('Error sending invitation: ' + msg);
    }
  };

  const handleAcceptInvite = async (invitationId: string, inviterId: string) => {
    if (!user?.id) return;

    setPendingInvites(prev => prev.filter(inv => inv.id !== invitationId));

    try {
      await supabase
        .from('circle_invitations')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      await supabase
        .from('circle_members')
        .insert({
          user_id: user.id,
          member_id: inviterId
        });

      await supabase
        .from('circle_members')
        .insert({
          user_id: inviterId,
          member_id: user.id
        });

      await loadMembers();
      
      alert('Invitation accepted! You are now connected.');
    } catch (error: unknown) {
      console.error('Error in database operations:', error);
      await loadMembers();
      
      const msg = getErrorMessage(error);
      // Check for duplicate key error code explicitly
      // '23505' is the Postgres code for unique_violation
      const isDuplicate = msg.includes('duplicate') || (error as any)?.code === '23505';

      if (!isDuplicate) {
        alert('Invitation accepted, but there was an issue: ' + msg);
      } else {
        alert('Invitation accepted!');
      }
    }
  };

  const handleDeclineInvite = async (invitationId: string) => {
    setPendingInvites(prev => prev.filter(inv => inv.id !== invitationId));

    try {
      await supabase
        .from('circle_invitations')
        .update({ 
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      alert('Invitation declined.');
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      console.error('Error declining invitation:', msg);
      alert('Invitation declined (but error updating database): ' + msg);
    }
  };

  const handleMessage = (memberId: string) => {
    sessionStorage.setItem('autoSelectMemberId', memberId);
    navigate('/', { state: { tab: 'messages' } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your circle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations Section */}
      {pendingInvites.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-[#1a2332] mb-4">Pending Invitations</h3>
          <div className="space-y-3">
            {pendingInvites.map(inv => (
              <div 
                key={inv.id} 
                className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="font-medium text-[#1a2332]">
                    {inv.sender_name} invited you to their circle
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{inv.message}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAcceptInvite(inv.id, inv.inviter_id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleDeclineInvite(inv.id)}
                    variant="outline"
                    className="text-gray-700 hover:bg-gray-100"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Circle Section */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#1a2332]">My Accountability Circle</h2>
            <p className="text-gray-600 mt-1">
              Connect with 2-3 trusted men who will support your journey.
            </p>
          </div>
          <Button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-[#1a2332] hover:bg-[#2d3e50] text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <Textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Join my accountability circle and let's grow together!"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#1a2332] hover:bg-[#2d3e50] text-white">
                  Send Invitation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail('');
                    setInviteMessage('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Circle Members */}
        {members.length > 0 ? (
          <div className="space-y-4">
            {members.map(member => (
              <CircleMemberCard 
                key={member.id} 
                member={member} 
                onMessage={handleMessage} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-lg font-medium mb-2">
              No circle members yet
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Start building your accountability circle by inviting trusted friends.
            </p>
            <Button
              onClick={() => setShowInviteForm(true)}
              className="bg-[#1a2332] hover:bg-[#2d3e50] text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Your First Member
            </Button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-[#1a2332] mb-3">About Your Circle</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Accountability:</strong> Your circle members can see your check-ins and progress.
          </p>
          <p>
            <strong>Support:</strong> Message your circle members directly for encouragement and advice.
          </p>
          <p>
            <strong>Growth:</strong> Track each other's streaks and celebrate wins together.
          </p>
        </div>
      </div>
    </div>
  );
}
