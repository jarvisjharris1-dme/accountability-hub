import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoalTracker } from '../components/sections/GoalTracker';
import { BottomNav } from '../components/navigation/BottomNav';
import { useAuth } from '@/contexts/AuthContext';

export default function Goals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab] = useState('goals');

  const handleTabChange = (tab: string) => {
    if (tab === 'analytics') {
      navigate('/analytics');
    } else if (tab === 'notifications') {
      navigate('/notifications');
    } else if (tab === 'achievements') {
      navigate('/achievements');
    } else if (tab === 'goals') {
      // Already on goals, do nothing
      return;
    } else {
      // Navigate back to home for internal tabs
      navigate('/', { state: { tab } });
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
            className="h-10 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
          {user && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <GoalTracker />
      </div>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
