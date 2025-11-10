import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (intervals: number[]) => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([15, 30, 60, 120]);
  const { user } = useAuth();


  if (!isOpen) return null;

  const intervalOptions = [
    { value: 15, label: '15 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 4320, label: '3 days' }
  ];

  const toggleInterval = (value: number) => {
    setSelectedIntervals(prev => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value].sort((a, b) => a - b)
    );
  };

  const sendEmergencyNotifications = async () => {
    if (!user) return;

    const { data: circleMembers } = await supabase
      .from('circle_members')
      .select('member_id')
      .eq('user_id', user.id);

    if (circleMembers) {
      for (const member of circleMembers) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            userId: member.member_id,
            title: 'Emergency Alert',
            body: 'A circle member needs support right now!',
            data: { type: 'emergency', url: '/messages' }
          }
        });
      }
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-[#1a2332] mb-4">Emergency Support</h2>
        <p className="text-gray-600 mb-6">
          Your circle will be notified immediately. Select when you'd like check-in reminders:
        </p>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          {intervalOptions.map(option => (
            <button
              key={option.value}
              onClick={() => toggleInterval(option.value)}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedIntervals.includes(option.value)
                  ? 'bg-[#d4a574] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await sendEmergencyNotifications();
              onConfirm(selectedIntervals);
              onClose();
            }}
            className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Activate Support
          </button>
        </div>

      </div>
    </div>
  );
};
