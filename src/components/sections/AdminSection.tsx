import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Trash2, 
  Search, 
  Shield,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Crown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newThisWeek: number;
  totalAdmins: number;
}

export function AdminSection() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    newThisWeek: 0,
    totalAdmins: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [admins, setAdmins] = useState<string[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, [currentUser]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadAdmins();
      loadStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const checkAdminStatus = async () => {
    if (!currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', currentUser.id)
        .single();

      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get all profiles with user info
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Get auth users info
      const userList: User[] = profiles?.map(profile => ({
        id: profile.id,
        email: profile.email || 'No email',
        full_name: profile.full_name || 'Unknown',
        created_at: profile.created_at,
        last_sign_in_at: profile.updated_at || profile.created_at,
        email_confirmed_at: profile.created_at
      })) || [];

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id');

      if (!error && data) {
        setAdmins(data.map(a => a.user_id));
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Total users
      const { count: totalCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Users from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Active users (logged in last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', monthAgo.toISOString());

      // Total admins
      const { count: adminCount } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalCount || 0,
        activeUsers: activeCount || 0,
        newThisWeek: newCount || 0,
        totalAdmins: adminCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    // Prevent self-deletion
    if (userId === currentUser?.id) {
      alert('❌ You cannot delete your own account!');
      return;
    }

    // Confirm deletion
    const confirmed = window.confirm(
      `⚠️ Delete user "${userName}"?\n\nThis will permanently delete:\n• Profile\n• Journal entries\n• Goals\n• Circle memberships\n• All user data\n\nThis cannot be undone!`
    );

    if (!confirmed) return;

    try {
      // Call secure RPC function
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });

      if (error) throw error;

      if (data && data.success) {
        alert('✅ User deleted successfully!');
        // Reload users
        loadUsers();
        loadStats();
      } else {
        alert('❌ Error: ' + (data?.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('❌ Error deleting user: ' + error.message);
    }
  };

  const toggleAdmin = async (userId: string, userName: string, isCurrentlyAdmin: boolean) => {
    // Prevent removing own admin
    if (userId === currentUser?.id && isCurrentlyAdmin) {
      alert('❌ You cannot remove your own admin privileges!');
      return;
    }

    const action = isCurrentlyAdmin ? 'remove admin from' : 'make admin';
    const confirmed = window.confirm(`${action.toUpperCase()} "${userName}"?`);

    if (!confirmed) return;

    try {
      if (isCurrentlyAdmin) {
        // Remove admin
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        alert('✅ Admin privileges removed!');
      } else {
        // Add admin
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: userId });

        if (error) throw error;
        alert('✅ User is now an admin!');
      }

      loadAdmins();
    } catch (error: any) {
      console.error('Error toggling admin:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-gray-300">Manage users and platform settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
              <p className="text-sm text-gray-600">Active (30d)</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <UserX className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats.newThisWeek}</p>
              <p className="text-sm text-gray-600">New This Week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalAdmins}</p>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
            />
          </div>
          <button
            onClick={loadUsers}
            className="px-4 py-2 bg-[#1a2332] text-white rounded-lg hover:bg-[#2d3e50] font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">All Users ({filteredUsers.length})</h2>
        </div>

        <div className="divide-y">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found
            </div>
          ) : (
            filteredUsers.map(user => {
              const userIsAdmin = admins.includes(user.id);
              const isCurrentUser = user.id === currentUser?.id;

              return (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{user.full_name}</h3>
                        {userIsAdmin && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </div>
                        {user.last_sign_in_at && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Last active {formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAdmin(user.id, user.full_name, userIsAdmin)}
                        disabled={isCurrentUser && userIsAdmin}
                        className={`px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                          userIsAdmin
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <Crown className="w-4 h-4" />
                        {userIsAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                        disabled={isCurrentUser}
                        className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-red-900 mb-1">⚠️ Admin Actions</p>
            <p className="text-red-800">
              User deletion is permanent and cannot be undone. All user data including journals, goals, and circle memberships will be deleted. Use with caution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
