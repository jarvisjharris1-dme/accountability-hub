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
import { BottomNav } from './navigation/BottomNav';
import { UserProfile, AccountabilityArea } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/6906b08a650ee0590aaf4bb4_1762183406403_6827ce42.png" 
            alt="Accountable" 
            className="h-10 w-auto"
          />
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user.name}
                </span>
              </div>
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
    </div>
  );
};

export default AppLayout;
