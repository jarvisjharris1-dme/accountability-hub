import React from 'react';
import { UserProfile } from '../../types';

interface DashboardHeroProps {
  user: UserProfile;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({ user }) => {
  return (
    <div 
      className="relative h-64 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-[#1a2332] to-[#2d3e50]"
      style={{
        backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046204398_4c61748b.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a2332]/90 to-[#1a2332]/70" />
      <div className="relative h-full flex flex-col justify-center px-8">
        <div className="flex items-center gap-4 mb-4">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-[#d4a574] object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-300">Keep pushing forward. You're doing great.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
