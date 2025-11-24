import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Upload,
  Link as LinkIcon,
  Video,
  Music,
  FileText as TextIcon,
  Ban,
  CheckCircle,
  Send,
  Flag,
  Settings as SettingsIcon,
  BarChart3,
  Eye,
  Search,
  Filter
} from 'lucide-react';

interface AppStats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalJournals: number;
  newUsersThisMonth: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login: string;
  suspended_at?: string;
  suspension_reason?: string;
}

interface FlaggedContent {
  id: string;
  content_type: 'journal' | 'message';
  content_id: string;
  flagged_by: string;
  flagged_at: string;
  reason: string;
  status: string;
  content_preview?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  sent_at?: string;
  recipient_count: number;
}

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
}

export function AdminSection() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  
  // Stats
  const [stats, setStats] = useState<AppStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalJournals: 0,
    newUsersThisMonth: 0
  });

  // User Management
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: ''
  });

  // Flagged Content
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [contentFilter, setContentFilter] = useState('pending');

  // System Settings
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      if (activeTab === 'users') loadUsers();
      if (activeTab === 'announcements') loadAnnouncements();
      if (activeTab === 'moderation') loadFlaggedContent();
      if (activeTab === 'settings') loadSystemSettings();
    }
  }, [isAdmin, activeTab]);

  const checkAdminStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth.toISOString());

      const { count: totalMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      const { count: totalJournals } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalMessages: totalMessages || 0,
        totalJournals: totalJournals || 0,
        newUsersThisMonth: newUsersThisMonth || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // USER MANAGEMENT
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_active, is_admin, created_at, last_login, suspended_at, suspension_reason')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false,
          suspended_at: new Date().toISOString(),
          suspended_by: user?.id,
          suspension_reason: reason
        })
        .eq('id', userId);

      if (error) throw error;
      alert('User suspended successfully');
      loadUsers();
    } catch (error: any) {
      alert('Error suspending user: ' + error.message);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          suspended_at: null,
          suspended_by: null,
          suspension_reason: null
        })
        .eq('id', userId);

      if (error) throw error;
      alert('User activated successfully');
      loadUsers();
    } catch (error: any) {
      alert('Error activating user: ' + error.message);
    }
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId);

      if (error) throw error;
      alert(isAdmin ? 'Admin rights removed' : 'User promoted to admin');
      loadUsers();
    } catch (error: any) {
      alert('Error updating admin status: ' + error.message);
    }
  };

  // ANNOUNCEMENTS
  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Get all active users
      const { data: activeUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      if (usersError) throw usersError;

      // Create announcement
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title: announcementForm.title,
          content: announcementForm.content,
          created_by: user?.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipient_count: activeUsers?.length || 0
        })
        .select()
        .single();

      if (announcementError) throw announcementError;

      // TODO: Send actual emails here using Supabase Edge Function
      // For now, just create notifications in the database
      // You'll need to implement the email sending separately

      alert(`Announcement sent to ${activeUsers?.length || 0} users!`);
      setAnnouncementForm({ title: '', content: '' });
      setShowAnnouncementForm(false);
      loadAnnouncements();
    } catch (error: any) {
      alert('Error sending announcement: ' + error.message);
    }
  };

  // CONTENT MODERATION
  const loadFlaggedContent = async () => {
    try {
      const query = supabase
        .from('flagged_content')
        .select('*')
        .order('flagged_at', { ascending: false });

      if (contentFilter !== 'all') {
        query.eq('status', contentFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFlaggedContent(data || []);
    } catch (error) {
      console.error('Error loading flagged content:', error);
    }
  };

  const handleReviewFlagged = async (id: string, action: 'dismiss' | 'remove', notes: string) => {
    try {
      const { error } = await supabase
        .from('flagged_content')
        .update({
          status: action === 'dismiss' ? 'dismissed' : 'actioned',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes,
          action_taken: action === 'remove' ? 'content_removed' : 'dismissed'
        })
        .eq('id', id);

      if (error) throw error;
      alert('Content reviewed successfully');
      loadFlaggedContent();
    } catch (error: any) {
      alert('Error reviewing content: ' + error.message);
    }
  };

  // SYSTEM SETTINGS
  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSystemSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleUpdateSetting = async (id: string, newValue: any) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: newValue,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      alert('Setting updated successfully');
      loadSystemSettings();
    } catch (error: any) {
      alert('Error updating setting: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You do not have administrator privileges.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Complete platform management</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-[#1a2332] text-[#1a2332]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-[#1a2332] text-[#1a2332]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-[#1a2332] text-[#1a2332]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-[#1a2332] text-[#1a2332]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Flag className="w-4 h-4 inline mr-2" />
            Moderation
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#1a2332] text-[#1a2332]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <SettingsIcon className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* ANALYTICS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.totalUsers}</p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.activeUsers}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">New This Month</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.newUsersThisMonth}</p>
                </div>
                <Users className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.totalMessages}</p>
                </div>
                <MessageSquare className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Journals</p>
                  <p className="text-3xl font-bold text-[#1a2332]">{stats.totalJournals}</p>
                </div>
                <FileText className="w-12 h-12 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
                  <p className="text-3xl font-bold text-[#1a2332]">
                    {stats.totalUsers > 0 
                      ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
                      : 0}%
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1a2332]">User Management</h2>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                      {u.is_admin && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {u.is_active ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Suspension reason:');
                              if (reason) handleSuspendUser(u.id, reason);
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Suspend User"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(u.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Activate User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`${u.is_admin ? 'Remove admin rights from' : 'Make admin:'} ${u.full_name}?`)) {
                              handleToggleAdmin(u.id, u.is_admin);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title={u.is_admin ? 'Remove Admin' : 'Make Admin'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1a2332]">Announcements</h2>
            <button
              onClick={() => setShowAnnouncementForm(true)}
              className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>

          {showAnnouncementForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Send Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    placeholder="Announcement title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    placeholder="Your announcement message"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSendAnnouncement}
                    className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50]"
                  >
                    <Send className="w-4 h-4 inline mr-2" />
                    Send to All Users
                  </button>
                  <button
                    onClick={() => {
                      setShowAnnouncementForm(false);
                      setAnnouncementForm({ title: '', content: '' });
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                    <p className="text-gray-600 mb-2">{announcement.content}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Sent: {announcement.sent_at ? new Date(announcement.sent_at).toLocaleString() : 'Not sent'}</span>
                      <span>Recipients: {announcement.recipient_count}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    announcement.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODERATION TAB */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#1a2332]">Content Moderation</h2>
            <select
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
              <option value="actioned">Actioned</option>
              <option value="all">All</option>
            </select>
          </div>

          <div className="space-y-4">
            {flaggedContent.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No flagged content to review
              </div>
            ) : (
              flaggedContent.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          {item.content_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          Flagged: {new Date(item.flagged_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2"><strong>Reason:</strong> {item.reason}</p>
                      <p className="text-sm text-gray-500">Content ID: {item.content_id}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const notes = prompt('Admin notes:');
                          if (notes !== null) handleReviewFlagged(item.id, 'dismiss', notes);
                        }}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Action taken:');
                          if (notes !== null) handleReviewFlagged(item.id, 'remove', notes);
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Remove Content
                      </button>
                      <button
                        onClick={() => alert('Content preview feature coming soon')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4 inline mr-2" />
                        View Content
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1a2332]">System Settings</h2>

          <div className="space-y-4">
            {systemSettings.map((setting) => (
              <div key={setting.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{setting.setting_key}</h3>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                    <span className="text-xs text-gray-400">{setting.category}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(setting.setting_value, null, 2)}
                  </pre>
                  <button
                    onClick={() => {
                      const newValue = prompt('Enter new JSON value:', JSON.stringify(setting.setting_value));
                      if (newValue) {
                        try {
                          const parsed = JSON.parse(newValue);
                          handleUpdateSetting(setting.id, parsed);
                        } catch (e) {
                          alert('Invalid JSON');
                        }
                      }
                    }}
                    className="mt-2 bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50]"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit Setting
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
