import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  Crown,
  Trash2,
  Search,
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Book,
  Settings,
  Plus,
  Edit
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_admin: boolean;
}

interface Workshop {
  id: string;
  title: string;
  description: string;
  stage: string;
  content: string;
  video_url: string | null;
  duration_minutes: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export function AdminSection() {
  const { user: authUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newThisWeek: 0,
    totalAdmins: 0
  });

  // Workshop Admin state
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    stage: 'Awareness',
    content: '',
    video_url: '',
    duration_minutes: 30,
    order_index: 0,
    is_published: false
  });

  // Site Admin state
  const [activeTab, setActiveTab] = useState<'users' | 'workshops' | 'site'>('users');
  const [siteSettings, setSiteSettings] = useState({
    site_name: 'Discovering Me',
    support_email: 'support@discoveringme.app',
    max_circle_size: 10,
    enable_workshops: true,
    enable_goals: true,
    maintenance_mode: false
  });

  useEffect(() => {
    checkAdminStatus();
  }, [authUser]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadStats();
      loadWorkshops();
      loadSiteSettings();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!authUser) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
      }

      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get profiles with emails from auth.users view (if available)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get admin users
      const { data: adminsData } = await supabase
        .from('admin_users')
        .select('user_id');

      const adminIds = new Set(adminsData?.map(a => a.user_id) || []);

      const combinedUsers: User[] = profilesData?.map(profile => ({
        id: profile.id,
        email: profile.email || 'No email',
        full_name: profile.full_name || 'No name',
        created_at: profile.created_at,
        is_admin: adminIds.has(profile.id)
      })) || [];

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: newThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: totalAdmins } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: totalUsers || 0, // Simplified - can't get from auth.users
        newThisWeek: newThisWeek || 0,
        totalAdmins: totalAdmins || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setWorkshops(data || []);
    } catch (error) {
      console.error('Error loading workshops:', error);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSiteSettings({
          site_name: data.site_name,
          support_email: data.support_email,
          max_circle_size: data.max_circle_size,
          enable_workshops: data.enable_workshops,
          enable_goals: data.enable_goals,
          maintenance_mode: data.maintenance_mode
        });
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === authUser?.id) {
      alert('You cannot delete yourself!');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this user? This action cannot be undone and will delete all their data.'
    );

    if (!confirmed) return;

    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId
      });

      if (error) throw error;

      if (data?.success) {
        alert('✅ User deleted successfully');
        loadUsers();
        loadStats();
      } else {
        alert(`❌ Error: ${data?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Error deleting user. Check console for details.');
    }
  };

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    if (userId === authUser?.id) {
      alert('You cannot change your own admin status!');
      return;
    }

    try {
      if (currentlyAdmin) {
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
        alert('✅ Admin privileges removed');
      } else {
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: userId });

        if (error) throw error;
        alert('✅ Admin privileges granted');
      }

      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Error toggling admin:', error);
      alert('❌ Error updating admin status');
    }
  };

  const saveWorkshop = async () => {
    try {
      if (editingWorkshop) {
        const { error } = await supabase
          .from('workshops')
          .update(workshopForm)
          .eq('id', editingWorkshop.id);

        if (error) throw error;
        alert('✅ Workshop updated successfully');
      } else {
        const { error } = await supabase
          .from('workshops')
          .insert(workshopForm);

        if (error) throw error;
        alert('✅ Workshop created successfully');
      }

      setShowWorkshopModal(false);
      setEditingWorkshop(null);
      setWorkshopForm({
        title: '',
        description: '',
        stage: 'Awareness',
        content: '',
        video_url: '',
        duration_minutes: 30,
        order_index: 0,
        is_published: false
      });
      loadWorkshops();
    } catch (error) {
      console.error('Error saving workshop:', error);
      alert('❌ Error saving workshop');
    }
  };

  const deleteWorkshop = async (workshopId: string) => {
    if (!window.confirm('Are you sure you want to delete this workshop?')) return;

    try {
      const { error } = await supabase
        .from('workshops')
        .delete()
        .eq('id', workshopId);

      if (error) throw error;
      alert('✅ Workshop deleted');
      loadWorkshops();
    } catch (error) {
      console.error('Error deleting workshop:', error);
      alert('❌ Error deleting workshop');
    }
  };

  const saveSiteSettings = async () => {
    try {
      // Try to update existing settings first
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update(siteSettings)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert(siteSettings);

        if (error) throw error;
      }

      alert('✅ Site settings saved successfully');
    } catch (error) {
      console.error('Error saving site settings:', error);
      alert('❌ Error saving site settings');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">
            You do not have administrator privileges to access this section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] p-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Admin Dashboard
          </h1>
          <p className="text-gray-300 mt-2">Manage users, workshops, and site settings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-[#1a2332] text-[#1a2332]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'workshops'
                  ? 'border-[#1a2332] text-[#1a2332]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Book className="w-5 h-5 inline mr-2" />
              Workshop Admin
            </button>
            <button
              onClick={() => setActiveTab('site')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'site'
                  ? 'border-[#1a2332] text-[#1a2332]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-5 h-5 inline mr-2" />
              Site Admin
            </button>
          </div>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Users</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-900">{stats.activeUsers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">New This Week</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.newThisWeek}</p>
                  </div>
                  <UserX className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Total Admins</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.totalAdmins}</p>
                  </div>
                  <Crown className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Warning Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Warning: Admin actions are permanent
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Deleting a user will remove all their data including journal entries, goals, and circle connections. This cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                        {user.is_admin && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {user.id === authUser?.id && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAdmin(user.id, user.is_admin)}
                        disabled={user.id === authUser?.id}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          user.is_admin
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={user.id === authUser?.id}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No users found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workshop Admin Tab */}
        {activeTab === 'workshops' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Workshop Management</h2>
              <button
                onClick={() => {
                  setEditingWorkshop(null);
                  setWorkshopForm({
                    title: '',
                    description: '',
                    stage: 'Awareness',
                    content: '',
                    video_url: '',
                    duration_minutes: 30,
                    order_index: workshops.length,
                    is_published: false
                  });
                  setShowWorkshopModal(true);
                }}
                className="bg-[#1a2332] text-white px-4 py-2 rounded-lg hover:bg-[#2d3e50] flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Workshop
              </button>
            </div>

            <div className="space-y-4">
              {workshops.map(workshop => (
                <div key={workshop.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{workshop.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          workshop.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {workshop.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {workshop.stage}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{workshop.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{workshop.duration_minutes} minutes</span>
                        <span>Order: {workshop.order_index}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingWorkshop(workshop);
                          setWorkshopForm({
                            title: workshop.title,
                            description: workshop.description,
                            stage: workshop.stage,
                            content: workshop.content,
                            video_url: workshop.video_url || '',
                            duration_minutes: workshop.duration_minutes,
                            order_index: workshop.order_index,
                            is_published: workshop.is_published
                          });
                          setShowWorkshopModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteWorkshop(workshop.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {workshops.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No workshops created yet. Click "Add Workshop" to create your first one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Site Admin Tab */}
        {activeTab === 'site' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h2>
            
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={siteSettings.site_name}
                  onChange={(e) => setSiteSettings({...siteSettings, site_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={siteSettings.support_email}
                  onChange={(e) => setSiteSettings({...siteSettings, support_email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Circle Size
                </label>
                <input
                  type="number"
                  value={siteSettings.max_circle_size}
                  onChange={(e) => setSiteSettings({...siteSettings, max_circle_size: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteSettings.enable_workshops}
                    onChange={(e) => setSiteSettings({...siteSettings, enable_workshops: e.target.checked})}
                    className="w-5 h-5 text-[#1a2332] rounded focus:ring-2 focus:ring-[#1a2332]"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Workshops</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteSettings.enable_goals}
                    onChange={(e) => setSiteSettings({...siteSettings, enable_goals: e.target.checked})}
                    className="w-5 h-5 text-[#1a2332] rounded focus:ring-2 focus:ring-[#1a2332]"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Goals</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={siteSettings.maintenance_mode}
                    onChange={(e) => setSiteSettings({...siteSettings, maintenance_mode: e.target.checked})}
                    className="w-5 h-5 text-[#1a2332] rounded focus:ring-2 focus:ring-[#1a2332]"
                  />
                  <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                </label>
              </div>

              <button
                onClick={saveSiteSettings}
                className="bg-[#1a2332] text-white px-6 py-3 rounded-lg hover:bg-[#2d3e50] font-semibold"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workshop Modal */}
      {showWorkshopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-6">
              {editingWorkshop ? 'Edit Workshop' : 'Create Workshop'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={workshopForm.title}
                  onChange={(e) => setWorkshopForm({...workshopForm, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={workshopForm.description}
                  onChange={(e) => setWorkshopForm({...workshopForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stage</label>
                <select
                  value={workshopForm.stage}
                  onChange={(e) => setWorkshopForm({...workshopForm, stage: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                >
                  <option value="Awareness">Awareness</option>
                  <option value="Acceptance">Acceptance</option>
                  <option value="Accountability">Accountability</option>
                  <option value="Action">Action</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Advocacy">Advocacy</option>
                  <option value="Abundance">Abundance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
                <textarea
                  value={workshopForm.content}
                  onChange={(e) => setWorkshopForm({...workshopForm, content: e.target.value})}
                  rows={10}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332] font-mono text-sm"
                  placeholder="Use markdown for formatting..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Video URL (Optional)</label>
                <input
                  type="text"
                  value={workshopForm.video_url}
                  onChange={(e) => setWorkshopForm({...workshopForm, video_url: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={workshopForm.duration_minutes}
                    onChange={(e) => setWorkshopForm({...workshopForm, duration_minutes: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order Index</label>
                  <input
                    type="number"
                    value={workshopForm.order_index}
                    onChange={(e) => setWorkshopForm({...workshopForm, order_index: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={workshopForm.is_published}
                  onChange={(e) => setWorkshopForm({...workshopForm, is_published: e.target.checked})}
                  className="w-5 h-5 text-[#1a2332] rounded"
                />
                <span className="text-sm font-medium">Published (visible to users)</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowWorkshopModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWorkshop}
                  className="flex-1 px-4 py-2 bg-[#1a2332] text-white rounded-lg hover:bg-[#2d3e50]"
                >
                  {editingWorkshop ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
