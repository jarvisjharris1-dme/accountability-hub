import React from 'react';

interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  lastActive: string;
  status: 'active' | 'away';
  streak: number;
}

interface CircleMemberCardProps {
  member: CircleMember;
  onMessage: (memberId: string) => void;
}

export const CircleMemberCard: React.FC<CircleMemberCardProps> = ({ member, onMessage }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img 
            src={member.avatar} 
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#d4a574]"
          />
          <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#1a2332] text-lg">{member.name}</h3>
          <p className="text-sm text-gray-500">
            {member.status === 'active' ? 'Active today' : `Last active: ${member.lastActive}`}
          </p>
          <p className="text-xs text-[#d4a574] font-medium mt-1">
            {member.streak} day streak
          </p>
        </div>
        <button
          onClick={() => onMessage(member.id)}
          className="px-4 py-2 bg-[#d4a574] text-white rounded-lg hover:bg-[#c49564] transition-colors text-sm font-medium"
        >
          Message
        </button>
      </div>
    </div>
  );
};
