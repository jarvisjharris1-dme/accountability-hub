import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Check, X, Clock } from 'lucide-react';

interface CircleInvitation {
  id: string;
  inviter_id: string;
  inviter_name: string;
  inviter_avatar: string;
  message: string | null;
  created_at: string;
  expires_at: string;
}

export function PendingInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<CircleInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadInvitations();
      
      // Subscribe to new invitations
      const subscription = supabase
        .channel('circle_invitations')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'circle_invitations',
            filter: `invitee_id=eq.${user.id}`
          },
          () => {
            loadInvitations();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadInvitations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get pending invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('circle_invitations')
        .select('id, inviter_id, message, created_at, expires_at')
        .eq('invitee_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (invitationsError) throw invitationsError;

      if (invitationsData && invitationsData.length > 0) {
        // Get inviter profiles
        const inviterIds = invitationsData.map(i => i.inviter_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar')
          .in('id', inviterIds);

        if (profilesError) throw profilesError;

        // Combine data
        const formattedInvitations = invitationsData.map(inv => {
          const profile = profilesData?.find(p => p.id === inv.inviter_id);
          return {
            id: inv.id,
            inviter_id: inv.inviter_id,
            inviter_name: profile?.full_name || 'Unknown User',
            inviter_avatar: profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${inv.inviter_id}`,
            message: inv.message,
            created_at: inv.created_at,
            expires_at: inv.expires_at
          };
        });

        setInvitations(formattedInvitations);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (invitationId: string, accept: boolean) => {
    try {
      setResponding(invitationId);

      const { data, error } = await supabase.rpc('handle_circle_invitation_response', {
        invitation_id: invitationId,
        accept: accept
      });

      if (error) throw error;

      if (data?.success) {
        alert(accept ? '🎉 You joined the circle!' : 'Invitation declined');
        loadInvitations();
      } else {
        alert('Error: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error responding to invitation:', error);
      alert('Error: ' + error.message);
    } finally {
      setResponding(null);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2332]"></div>
      </div>
    );
  };

  if (invitations.length === 0) {
    return null; // Don't show anything if no invitations
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-[#1a2332]">
          Pending Circle Invitations ({invitations.length})
        </h3>
      </div>

      <div className="space-y-4">
        {invitations.map((invitation) => {
          const expired = isExpired(invitation.expires_at);
          
          return (
            <div
              key={invitation.id}
              className={`bg-white rounded-lg p-4 shadow-sm border ${
                expired ? 'border-gray-300 opacity-75' : 'border-blue-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <img
                  src={invitation.inviter_avatar}
                  alt={invitation.inviter_name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 mb-1">
                    <span className="font-semibold">{invitation.inviter_name}</span>
                    {' '}invited you to join their accountability circle
                  </p>

                  {invitation.message && (
                    <div className="bg-gray-50 rounded p-2 mb-2 text-sm text-gray-700 italic">
                      "{invitation.message}"
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </span>
                    {expired ? (
                      <span className="flex items-center gap-1 text-red-600">
                        <Clock className="w-3 h-3" />
                        Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!expired && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleResponse(invitation.id, true)}
                      disabled={responding === invitation.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(invitation.id, false)}
                      disabled={responding === invitation.id}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}

                {expired && (
                  <div className="text-sm text-gray-500 italic">
                    This invitation has expired
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
