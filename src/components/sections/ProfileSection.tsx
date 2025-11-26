import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Instagram,
  Linkedin,
  Globe,
  MapPin
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  interests: string[];
  instagram: string;
  linkedin: string;
  website: string;
  visibility: 'public' | 'circle' | 'private';
  gender: string;
  marital_status: string;
  date_of_birth: string;
  zip_code: string;
  ethnicity: string;
}

interface NotificationSettings {
  email_workshops: boolean;
  email_goals: boolean;
  email_circle: boolean;
  email_checkins: boolean;
  email_weekly_summary: boolean;
  push_enabled: boolean;
}

export function ProfileSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<Profile>({
    id: '',
    full_name: '',
    bio: '',
    avatar_url: '',
    location: '',
    interests: [],
    instagram: '',
    linkedin: '',
    website: '',
    visibility: 'circle',
    gender: '',
    marital_status: '',
    date_of_birth: '',
    zip_code: '',
    ethnicity: ''
  });

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_workshops: true,
    email_goals: true,
    email_circle: true,
    email_checkins: true,
    email_weekly_summary: true,
    push_enabled: false
  });

  // Account settings state
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results

      if (error) throw error;
      
      if (data) {
        // Profile exists - load it
        setProfile({
          id: data.id,
          full_name: data.full_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          location: data.location || '',
          interests: data.interests || [],
          instagram: data.instagram || '',
          linkedin: data.linkedin || '',
          website: data.website || '',
          visibility: data.visibility || 'circle',
          gender: data.gender || '',
          marital_status: data.marital_status || '',
          date_of_birth: data.date_of_birth || '',
          zip_code: data.zip_code || '',
          ethnicity: data.ethnicity || ''
        });
      } else {
        // Profile doesn't exist yet - keep default state
        console.log('No profile found, using defaults');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          interests: profile.interests,
          instagram: profile.instagram,
          linkedin: profile.linkedin,
          website: profile.website,
          visibility: profile.visibility,
          gender: profile.gender,
          marital_status: profile.marital_status,
          date_of_birth: profile.date_of_birth || null,
          zip_code: profile.zip_code,
          ethnicity: profile.ethnicity,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('Profile updated successfully! ✅');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...notifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      alert('Notification settings saved! ✅');
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const changeEmail = async () => {
    if (!newEmail.trim()) {
      alert('Please enter a new email address');
      return;
    }

    if (!newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      alert('Email change requested! Please check your new email to confirm. 📧');
      setNewEmail('');
    } catch (error: any) {
      console.error('Error changing email:', error);
      alert('Error changing email: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('Password changed successfully! ✅');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert('Error changing password: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    try {
      setSaving(true);

      // Delete user data (cascading deletes will handle related records)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Sign out
      await supabase.auth.signOut();

      alert('Account deleted. We\'re sorry to see you go. 👋');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert('Error deleting account: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3e50] rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-gray-300">Manage your profile, notifications, and account</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell className="w-5 h-5 inline-block mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'account'
                  ? 'border-b-2 border-[#1a2332] text-[#1a2332]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-5 h-5 inline-block mr-2" />
              Account
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            {profile.full_name && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Viewing your current profile information
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, State/Country"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            {/* Demographics Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Demographics (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This information helps us better understand our community and personalize your experience.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Marital Status</label>
                  <select
                    value={profile.marital_status}
                    onChange={(e) => setProfile({ ...profile, marital_status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                    <option value="separated">Separated</option>
                    <option value="partnered">Partnered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.date_of_birth}
                    onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used to calculate age and provide age-appropriate content</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={profile.zip_code}
                    onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
                    placeholder="12345"
                    maxLength={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Helps us connect you with local resources</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Ethnicity</label>
                  <select
                    value={profile.ethnicity}
                    onChange={(e) => setProfile({ ...profile, ethnicity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="african-american">African American/Black</option>
                    <option value="asian">Asian</option>
                    <option value="caucasian">Caucasian/White</option>
                    <option value="hispanic-latino">Hispanic/Latino</option>
                    <option value="middle-eastern">Middle Eastern</option>
                    <option value="native-american">Native American</option>
                    <option value="pacific-islander">Pacific Islander</option>
                    <option value="mixed">Mixed/Multiracial</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  🔒 Your demographic information is private and will never be shared publicly. It's used only for platform analytics and personalization.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interests (comma-separated)</label>
              <input
                type="text"
                value={profile.interests.join(', ')}
                onChange={(e) => setProfile({ ...profile, interests: e.target.value.split(',').map(i => i.trim()) })}
                placeholder="e.g., Fitness, Reading, Entrepreneurship"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={profile.instagram}
                  onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                  placeholder="@username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://yoursite.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Profile Visibility</label>
              <select
                value={profile.visibility}
                onChange={(e) => setProfile({ ...profile, visibility: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
              >
                <option value="circle">Circle Only - Only circle members can view</option>
                <option value="private">Private - Only you can view</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                {profile.visibility === 'circle' 
                  ? '👥 Your circle members can see your profile' 
                  : '🔒 Your profile is completely private'}
              </p>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full bg-[#1a2332] text-white py-3 rounded-lg hover:bg-[#2d3e50] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Control what notifications you receive via email
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Workshop Updates</p>
                  <p className="text-sm text-gray-600">Get notified when new workshops are available</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_workshops}
                  onChange={(e) => setNotifications({ ...notifications, email_workshops: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Goal Reminders</p>
                  <p className="text-sm text-gray-600">Reminders about your goals and milestones</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_goals}
                  onChange={(e) => setNotifications({ ...notifications, email_goals: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Circle Activity</p>
                  <p className="text-sm text-gray-600">New messages and updates from your circle</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_circle}
                  onChange={(e) => setNotifications({ ...notifications, email_circle: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Check-In Reminders</p>
                  <p className="text-sm text-gray-600">Reminders to complete scheduled check-ins</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_checkins}
                  onChange={(e) => setNotifications({ ...notifications, email_checkins: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-gray-600">Your weekly progress summary every Sunday</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email_weekly_summary}
                  onChange={(e) => setNotifications({ ...notifications, email_weekly_summary: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-50">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Coming soon - browser push notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.push_enabled}
                  disabled
                  className="w-5 h-5"
                />
              </div>
            </div>

            <button
              onClick={saveNotificationSettings}
              disabled={saving}
              className="w-full bg-[#1a2332] text-white py-3 rounded-lg hover:bg-[#2d3e50] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </button>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="p-6 space-y-8">
            {/* Change Email */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Change Email
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new.email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>
                <button
                  onClick={changeEmail}
                  disabled={saving}
                  className="bg-[#1a2332] text-white px-6 py-2 rounded-lg hover:bg-[#2d3e50] font-semibold disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Email'}
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2332]"
                  />
                </div>
                <button
                  onClick={changePassword}
                  disabled={saving}
                  className="bg-[#1a2332] text-white px-6 py-2 rounded-lg hover:bg-[#2d3e50] font-semibold disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            {/* Delete Account */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              
              {!showDeleteConfirm ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 mb-4">
                    Once you delete your account, there is no going back. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-red-900 mb-2">Are you absolutely sure?</p>
                      <p className="text-sm text-red-800 mb-4">
                        This will permanently delete your account, all your data, journal entries, goals, and circle connections. This action cannot be undone.
                      </p>
                      <p className="text-sm font-medium mb-2">Type <span className="font-mono bg-red-200 px-2 py-1 rounded">DELETE MY ACCOUNT</span> to confirm:</p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type here to confirm"
                        className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={deleteAccount}
                          disabled={saving || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {saving ? 'Deleting...' : 'Yes, Delete Forever'}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
