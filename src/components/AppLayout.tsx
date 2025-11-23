import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHero } from './sections/DashboardHero';
import { DashboardStats } from './sections/DashboardStats';
import { EmergencyButton } from './ui/EmergencyButton';
import { EmergencyModal } from './modals/EmergencyModal';
import { JournalSection } from './sections/JournalSection';
import { CircleSection } from './sections/CircleSection';
import { WorkshopSection } from './sections/WorkshopSection';
import { ProfileSection } from './sections/ProfileSection';
import { MessagingSection } from './sections/MessagingSection';
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [circleSize, setCircleSize] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const { user: authUser } = useAuth();

  const handleTabChange = (tab: string) => {
    // External pages - navigate to their routes
    if (tab === 'analytics') {
      navigate('/analytics');
    } else if (tab === 'goals') {
      navigate('/goals');
    } else if (tab === 'notifications') {
      navigate('/notifications');
    } else if (tab === 'achievements') {
      navigate('/achievements');
    } else {
      setActiveTab(tab);
    }
  };

  useEffect(() => {
    loadUserProfile();
    updateCircleActivity();
    loadCircleSize();
    loadJournalCount();
  }, [authUser]);

  const loadUserProfile = async () => {
    if (!authUser?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      if (data) {
        setUser(data as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCircleSize = async () => {
    if (!authUser?.id) return;

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
    if (!authUser?.id) return;

    try {
      const { count } = await supabase
        .from('journal_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);

      setJournalCount(count || 0);
    } catch (error) {
      console.error('Error loading journal count:', error);
    }
  };

  const updateCircleActivity = async () => {
    if (!authUser?.id) return;

    try {
      await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString() 
        })
        .eq('id', authUser.id);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2332] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (children) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmailVerificationBanner />
        <NotificationPermissionBanner />
        
        <div className="pb-20">
          {children}
        </div>

        <EmergencyButton onClick={() => setShowEmergencyModal(true)} />
        {showEmergencyModal && (
          <EmergencyModal onClose={() => setShowEmergencyModal(false)} />
        )}

        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmailVerificationBanner />
      <NotificationPermissionBanner />
      
      <div className="pb-20">
        {activeTab === 'dashboard' && (
          <>
            {user && <DashboardHero user={user} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <DashboardStats 
                circleSize={circleSize} 
                journalCount={journalCount}
              />
            </div>
          </>
        )}
        
        {activeTab === 'journal' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <JournalSection />
          </div>
        )}
        
        {activeTab === 'circle' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <CircleSection />
          </div>
        )}
        
        {activeTab === 'workshop' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <WorkshopSection />
          </div>
        )}
        
        {activeTab === 'messages' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <MessagingSection />
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileSection />
          </div>
        )}
      </div>

      <EmergencyButton onClick={() => setShowEmergencyModal(true)} />
      {showEmergencyModal && (
        <EmergencyModal onClose={() => setShowEmergencyModal(false)} />
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default AppLayout;
