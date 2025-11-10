import React, { useState } from 'react';
import { WorkshopCard } from '../ui/WorkshopCard';
import { Workshop } from '../../types';

const allWorkshops: Workshop[] = [
  {
    id: '1',
    title: 'Building Financial Discipline',
    type: 'article',
    category: 'financial',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046216185_62841db2.webp',
    completed: false
  },
  {
    id: '2',
    title: 'Being Present for Your Kids',
    type: 'voice',
    duration: '8 min',
    category: 'children',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046217917_6ecd1248.webp',
    completed: false
  },
  {
    id: '3',
    title: 'Overcoming Addiction: First Steps',
    type: 'article',
    category: 'alcohol',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046219625_741af1ba.webp',
    completed: true
  },
  {
    id: '4',
    title: 'Healthy Relationship Communication',
    type: 'voice',
    duration: '12 min',
    category: 'relationship',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046221367_60d78191.webp',
    completed: false
  },
  {
    id: '5',
    title: 'Managing Stress Without Substances',
    type: 'article',
    category: 'drugs',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046223109_531ce6a5.webp',
    completed: false
  },
  {
    id: '6',
    title: 'Creating Meaningful Traditions',
    type: 'voice',
    duration: '6 min',
    category: 'important_dates',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046224862_48c16ee2.webp',
    completed: false
  }
];

export const WorkshopSection: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const [workshops] = useState(allWorkshops);

  const filteredWorkshops = filter === 'all' 
    ? workshops 
    : workshops.filter(w => w.type === filter);

  const handleWorkshopClick = (id: string) => {
    alert(`Opening workshop ${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#1a2332] mb-4">Growth Workshops</h2>
        
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {['all', 'article', 'voice', 'video'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-[#d4a574] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map(workshop => (
            <WorkshopCard key={workshop.id} workshop={workshop} onClick={handleWorkshopClick} />
          ))}
        </div>
      </div>
    </div>
  );
};
