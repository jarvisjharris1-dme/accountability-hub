import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  bgColor = 'bg-white' 
}) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-md border border-gray-100`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[#d4a574]">
          {icon}
        </div>
        <span className="text-sm text-gray-600 font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold text-[#1a2332]">
        {value}
      </div>
    </div>
  );
};
