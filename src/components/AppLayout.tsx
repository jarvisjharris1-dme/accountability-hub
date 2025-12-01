import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardSection } from './sections/DashboardSection';
import { JournalSection } from './sections/JournalSection';
import { CircleSection } from './sections/CircleSection';
import { WorkshopViewer } from './sections/WorkshopViewer';
import { ProfileSection } from './sections/ProfileSection';
import { MessagingSection } from './sections/MessagingSection';
import { AdminSection } from './sections/AdminSection';
import { GoalTracker } from './sections/GoalTracker';
import NotificationSettings from './sections/NotificationSettings';
import NotificationPermissionBanner from './ui/NotificationPermissionBanner';
import { EmailVerificationBanner } from './ui/EmailVerificationBanner';
import { NotificationBell } from './NotificationBell';
import { BottomNav } from './navigation/BottomNav';
import { PWAInstallPrompt } from './ui/PWAInstallPrompt';
import { UserProfile, AccountabilityArea } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LifeBuoy } from 'lucide-react';

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [circleSize, setCircleSize] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const { user: authUser } = useAuth();

  // Support system state (global)
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportType, setSupportType] = useState('');
  const [supportMessage, setSupportMessage] = useState('');

  const handleTabChange = (tab: string) => {
    // External pages - navigate to their routes
    if (tab === 'analytics') {
      navigate('/analytics');
   
    } else if (tab === 'notifications') {
      navigate('/notifications');
    } else if (tab === 'achievements') {
      navigate('/achievements');
    } else {
      // Internal tabs - navigate back to home if on external page
      if (window.location.pathname !== '/') {
        navigate('/');
        // Small delay to ensure navigation completes before setting tab
        setTimeout(() => setActiveTab(tab), 50);
      } else {
        setActiveTab(tab);
      }
    }
  };

  useEffect(() => {
    loadUserProfile();
    updateCircleActivity();
    loadCircleSize();
    loadJournalCount();
  }, [authUser]);

  // Handle navigation state (e.g., from Circle to Messages)
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location]);

  const updateCircleActivity = async () => {
    if (!authUser) return;
    try {
      await supabase.rpc('update_circle_member_activity');
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  const loadCircleSize = async () => {
    if (!authUser) return;
    try {
      const { count } = await supabase
        .from('circle_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      setCircleSize(count || 0);
    } catch (error) {
      console.error('Error loading circle size:', error);
    }
  };

  const loadJournalCount = async () => {
    if (!authUser) return;
    try {
      const { count, error } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      
      if (error) throw error;
      setJournalCount(count || 0);
    } catch (error) {
      console.error('Error loading journal count:', error);
      setJournalCount(0);
    }
  };

  const loadUserProfile = async () => {
    if (!authUser) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          name: data.full_name || 'New User',
          age: data.age || 0,
          location: data.location || '',
          city: data.city || '',
          state: data.state || '',
          zipcode: data.zipcode || '',
          sex: data.sex || '',
          ethnicity: data.ethnicity || '',
          familyStatus: data.family_status || '',
          accountabilityAreas: (data.accountability_areas || []) as AccountabilityArea[],
          avatar: data.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authUser.id,
          streakDays: data.streak_days || 0,
          joinedDate: data.joined_date || new Date().toISOString(),
          phone_number: data.phone_number || '',
          phone_verified: data.phone_verified || false
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleSupportSubmit = async () => {
    if (!authUser || !supportType) {
      alert('Please select a support type');
      return;
    }

    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: authUser.id,
          support_type: supportType,
          message: supportMessage || null,
          status: 'active'
        });

      if (error) throw error;

      // Success
      setShowSupportModal(false);
      setSupportType('');
      setSupportMessage('');
      alert('✅ Support alert sent to your circle! 💪');
    } catch (error) {
      console.error('Error sending support request:', error);
      alert('❌ Error sending support request. Please try again.');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    // If children are provided, render them instead of internal routing
    if (children) {
      return children;
    }

    // Otherwise use internal routing
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection onTabChange={handleTabChange} />;
      case 'journal':
        return <JournalSection />;
      case 'circle':
        return <CircleSection />;
      case 'workshop':
        return <WorkshopViewer />;
      case 'goals':
        return <GoalTracker />;
      case 'profile':
        return <ProfileSection user={user} onUpdate={handleProfileUpdate} />;
      case 'admin':
        return <AdminSection />;
      default:
        return <DashboardSection onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with Logo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/6906b08a650ee0590aaf4bb4_1762183406403_6827ce42.png" 
            alt="Accountable" 
            className="h-16 w-auto"
          />
        <div className="flex items-center gap-4">
  <NotificationBell />  {/* ✅ ADD THIS LINE */}
  {user && (
    <button
      onClick={() => handleTabChange('profile')}
      className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
    >
      <img 
        src={user.avatar} 
        alt={user.name} 
        className="h-10 w-10 rounded-full border-2 border-gray-200"
      />
      <span className="text-sm font-medium text-gray-700 hidden sm:block">
        {user.name}
      </span>
    </button>
  )}
</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <NotificationPermissionBanner />
        {authUser && !authUser.email_confirmed_at && authUser.email && (
          <EmailVerificationBanner email={authUser.email} />
        )}
        {renderContent()}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Global Support Button - Fixed Position (Shows on ALL pages) */}
      <button
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-24 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-110 z-40 flex items-center gap-2"
      >
        <LifeBuoy className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Need Support?</span>
      </button>

      {/* Global Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-600 rounded-full p-3">
                <LifeBuoy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Need Accountability Support?</h3>
                <p className="text-gray-600">Your circle is here for you</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you need help with?
                </label>
                <select
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select a category...</option>
                  <option value="goals">Struggling with goals</option>
                  <option value="motivation">Need motivation</option>
                  <option value="setback">Facing a setback</option>
                  <option value="emotional">Emotional support</option>
                  <option value="encouragement">Need encouragement</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Share what's on your mind..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 Your circle members will be notified and can offer support and encouragement.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSupportModal(false);
                    setSupportType('');
                    setSupportMessage('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSupportSubmit}
                  disabled={!supportType}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Alert to Circle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default AppLayout;

