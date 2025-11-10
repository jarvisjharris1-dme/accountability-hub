import React, { useState } from 'react';

interface EmergencyButtonProps {
  onTrigger: () => void;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onTrigger }) => {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = () => {
    setIsPulsing(true);
    onTrigger();
    setTimeout(() => setIsPulsing(false), 1000);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-6 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
        isPulsing ? 'animate-pulse' : ''
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>I Need Accountability</span>
      </div>
    </button>
  );
};
