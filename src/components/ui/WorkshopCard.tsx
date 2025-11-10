import React from 'react';
import { Workshop } from '../../types';

interface WorkshopCardProps {
  workshop: Workshop;
  onClick: (id: string) => void;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, onClick }) => {
  const typeIcons = {
    article: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    voice: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    video: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div 
      onClick={() => onClick(workshop.id)}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={workshop.image} 
          alt={workshop.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {workshop.completed && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Completed
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-[#d4a574]">
          {typeIcons[workshop.type]}
          <span className="text-xs font-medium uppercase">{workshop.type}</span>
          {workshop.duration && <span className="text-xs text-gray-500">• {workshop.duration}</span>}
        </div>
        <h3 className="font-semibold text-[#1a2332] text-lg line-clamp-2">{workshop.title}</h3>
      </div>
    </div>
  );
};
